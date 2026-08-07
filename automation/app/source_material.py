import asyncio
import re
from dataclasses import dataclass
from html import unescape
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import httpx

from .config import Settings
from .discovery import is_official_url

_RELEVANT_LINK_TERMS = (
    "notification", "notice", "advertisement", "corrigendum", "apply", "application",
    "recruitment", "vacancy", "exam", "result", "admit", "scheme", "guideline",
    "guidelines", "eligibility", "prospectus", "brochure", "details", "download",
)
_FETCH_ATTEMPTS = 3


class _ReadableHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._current_href: str | None = None
        self._current_anchor_text: list[str] = []
        self.text_parts: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.title_parts: list[str] = []
        self._in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lowered = tag.lower()
        if lowered in {"script", "style", "noscript", "svg", "canvas"}:
            self._skip_depth += 1
            return
        if self._skip_depth:
            return
        if lowered == "title":
            self._in_title = True
        if lowered == "a":
            self._current_href = next((value for key, value in attrs if key.lower() == "href" and value), None)
            self._current_anchor_text = []

    def handle_endtag(self, tag: str) -> None:
        lowered = tag.lower()
        if lowered in {"script", "style", "noscript", "svg", "canvas"}:
            if self._skip_depth:
                self._skip_depth -= 1
            return
        if self._skip_depth:
            return
        if lowered == "title":
            self._in_title = False
        if lowered == "a" and self._current_href:
            text = " ".join(" ".join(self._current_anchor_text).split())
            self.links.append((self._current_href, text))
            self._current_href = None
            self._current_anchor_text = []

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        text = " ".join(unescape(data).split())
        if not text:
            return
        self.text_parts.append(text)
        if self._in_title:
            self.title_parts.append(text)
        if self._current_href is not None:
            self._current_anchor_text.append(text)


@dataclass(slots=True)
class SourceMaterial:
    requested_url: str
    final_url: str
    title: str
    content_type: str
    text: str = ""
    binary: bytes | None = None
    related_links: tuple[tuple[str, str], ...] = ()

    @property
    def is_pdf(self) -> bool:
        return self.content_type == "application/pdf"

    def prompt_excerpt(self, max_chars: int) -> str:
        excerpt = self.text[:max_chars].strip()
        return (
            f"SOURCE URL: {self.final_url}\n"
            f"SOURCE TITLE: {self.title or 'Official source'}\n"
            f"CONTENT TYPE: {self.content_type}\n"
            f"EXTRACTED OFFICIAL TEXT:\n{excerpt or '[PDF supplied as an attached official document]'}"
        )


def _content_type(response: httpx.Response) -> str:
    raw = response.headers.get("content-type", "").split(";", 1)[0].strip().lower()
    if raw == "application/pdf" or response.url.path.lower().endswith(".pdf"):
        return "application/pdf"
    if raw in {"text/html", "application/xhtml+xml"} or not raw:
        return "text/html"
    return raw


def _safe_title(value: str, fallback: str) -> str:
    title = " ".join(value.split()).strip()
    return title[:300] if title else fallback[:300]


def _is_relevant_related_link(url: str, anchor_text: str) -> bool:
    haystack = f"{urlparse(url).path} {anchor_text}".casefold()
    return url.lower().endswith(".pdf") or any(term in haystack for term in _RELEVANT_LINK_TERMS)


def _retryable_status(error: httpx.HTTPStatusError) -> bool:
    return 500 <= error.response.status_code < 600


class OfficialSourceFetcher:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def _request(self, url: str) -> httpx.Response:
        last_error: Exception | None = None
        for attempt in range(_FETCH_ATTEMPTS):
            try:
                async with httpx.AsyncClient(
                    timeout=self.settings.request_timeout_seconds,
                    follow_redirects=True,
                    headers={"User-Agent": "CitizenAffairsEditorialBot/1.0 (+https://citizenaffairs.in/)"},
                ) as client:
                    response = await client.get(url)
                response.raise_for_status()
                return response
            except (httpx.TimeoutException, httpx.NetworkError) as error:
                last_error = error
            except httpx.HTTPStatusError as error:
                if not _retryable_status(error):
                    raise
                last_error = error

            if attempt < _FETCH_ATTEMPTS - 1:
                await asyncio.sleep(1.5 * (attempt + 1))

        assert last_error is not None
        raise last_error

    async def fetch_one(self, url: str) -> SourceMaterial:
        if not is_official_url(url):
            raise ValueError("source URL is not on an approved official domain")
        response = await self._request(url)
        final_url = str(response.url)
        if not is_official_url(final_url):
            raise ValueError("official source redirected to a non-official domain")
        if len(response.content) > self.settings.max_source_bytes:
            raise ValueError("official source exceeds the configured size limit")

        content_type = _content_type(response)
        if content_type == "application/pdf":
            return SourceMaterial(
                requested_url=url,
                final_url=final_url,
                title=response.headers.get("content-disposition", "Official PDF")[:300],
                content_type=content_type,
                binary=response.content,
            )

        text = response.text
        if content_type == "text/html":
            parser = _ReadableHtmlParser()
            parser.feed(text)
            readable = re.sub(r"\s+", " ", " ".join(parser.text_parts)).strip()
            title = _safe_title(" ".join(parser.title_parts), urlparse(final_url).hostname or "Official source")
            related: list[tuple[str, str]] = []
            seen: set[str] = set()
            for href, anchor in parser.links:
                absolute = urljoin(final_url, href)
                if absolute in seen or not is_official_url(absolute) or not _is_relevant_related_link(absolute, anchor):
                    continue
                seen.add(absolute)
                related.append((absolute, anchor))
            return SourceMaterial(
                requested_url=url,
                final_url=final_url,
                title=title,
                content_type=content_type,
                text=readable[: self.settings.max_source_text_chars],
                related_links=tuple(related),
            )

        decoded = response.content.decode(response.encoding or "utf-8", errors="replace")
        return SourceMaterial(
            requested_url=url,
            final_url=final_url,
            title=urlparse(final_url).hostname or "Official source",
            content_type=content_type,
            text=decoded[: self.settings.max_source_text_chars],
        )

    async def fetch_bundle(self, url: str) -> list[SourceMaterial]:
        primary = await self.fetch_one(url)
        materials = [primary]
        for related_url, _ in primary.related_links:
            if len(materials) >= self.settings.related_source_limit:
                break
            try:
                material = await self.fetch_one(related_url)
            except (httpx.HTTPError, ValueError):
                continue
            if material.final_url not in {item.final_url for item in materials}:
                materials.append(material)
        return materials
