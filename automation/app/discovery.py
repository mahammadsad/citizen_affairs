from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import feedparser
import httpx

from .schemas import TopicCandidate

OFFICIAL_HOST_SUFFIXES = (
    ".gov.in", ".nic.in", "pib.gov.in", "upsc.gov.in", "ssc.gov.in",
    "nta.ac.in", "cbse.gov.in", "indianrailways.gov.in",
)

TOPIC_KEYWORDS = {
    "jobs": ("recruitment", "vacancy", "vacancies", "posts", "post of", "employment", "apprentice"),
    "exams": ("exam", "examination", "admit card", "answer key", "result", "counselling", "admission"),
    "materials": ("scholarship", "fellowship", "students", "education", "admission"),
    "projects": ("scheme", "benefit", "beneficiary", "pension", "subsidy", "yojana", "financial assistance"),
    "affairs": ("portal", "service", "certificate", "registration", "download", "status", "citizen"),
    "notices": ("notice", "notification", "corrigendum", "deadline", "last date", "extended", "alert"),
}
URGENCY_TERMS = ("last date", "deadline", "closing", "extended", "corrigendum", "urgent")


def is_official_url(value: str) -> bool:
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower()
    if parsed.scheme not in {"http", "https"}:
        return False
    return any(host == suffix.lstrip(".") or host.endswith(suffix) for suffix in OFFICIAL_HOST_SUFFIXES)


def _classify(title: str) -> tuple[str, int, list[str]]:
    lowered = title.casefold()
    scores: dict[str, int] = {}
    reasons: list[str] = []
    for category, keywords in TOPIC_KEYWORDS.items():
        hits = [keyword for keyword in keywords if keyword in lowered]
        if hits:
            scores[category] = len(hits)
            reasons.extend(f"matched {keyword}" for keyword in hits[:2])
    if not scores:
        return "", 0, []
    category = max(scores, key=scores.get)
    score = min(95, 45 + scores[category] * 12 + (15 if any(term in lowered for term in URGENCY_TERMS) else 0))
    return category, score, reasons[:6]


class _ListingLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.current_href: str | None = None
        self.current_text: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.title_parts: list[str] = []
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self.in_title = True
        if tag.lower() == "a":
            self.current_href = next((value for key, value in attrs if key.lower() == "href" and value), None)
            self.current_text = []

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False
        if tag.lower() == "a" and self.current_href:
            title = " ".join(" ".join(self.current_text).split())
            self.links.append((self.current_href, title))
            self.current_href = None
            self.current_text = []

    def handle_data(self, data: str) -> None:
        text = " ".join(data.split())
        if not text:
            return
        if self.in_title:
            self.title_parts.append(text)
        if self.current_href is not None:
            self.current_text.append(text)


def _candidate(title: str, link: str, authority: str) -> TopicCandidate | None:
    normalized = " ".join(title.split())
    category, score, reasons = _classify(normalized)
    if len(normalized) < 8 or not category or not is_official_url(link):
        return None
    urgency = "high" if any(term in normalized.casefold() for term in URGENCY_TERMS) else "none"
    return TopicCandidate(
        normalized_topic=normalized[:300],
        language="en",
        source_url=link,
        source_authority=authority[:200] or "Official source",
        category=category,
        relevance_scope="national",
        freshness_label="high",
        deadline_urgency=urgency,
        official_source_available=True,
        discovery_evidence=[f"Discovered on official source: {authority}"],
        priority_score=score,
        selection_reasons=reasons,
    )


async def discover_from_official_feeds(feed_urls: list[str], limit: int = 20) -> list[TopicCandidate]:
    candidates: list[TopicCandidate] = []
    seen: set[tuple[str, str]] = set()
    async with httpx.AsyncClient(
        timeout=30,
        follow_redirects=True,
        headers={"User-Agent": "CitizenAffairsEditorialBot/1.0 (+https://citizenaffairs.in/)"},
    ) as client:
        for source_url in feed_urls:
            if not is_official_url(source_url):
                continue
            try:
                response = await client.get(source_url)
                response.raise_for_status()
            except httpx.HTTPError:
                # Government portals sometimes block cloud/GitHub runner IPs or are
                # temporarily unavailable. One inaccessible source must not stop
                # discovery from the remaining independent official sources.
                continue

            final_url = str(response.url)
            if not is_official_url(final_url):
                continue

            feed = feedparser.loads(response.content)
            feed_entries = list(feed.entries)
            if feed_entries:
                authority = " ".join(str(feed.feed.get("title", "")).split()) or urlparse(final_url).hostname or "Official source"
                for entry in feed_entries[: max(limit * 3, limit)]:
                    link = urljoin(final_url, entry.get("link", ""))
                    title = " ".join(entry.get("title", "").split())
                    key = (title.casefold(), link)
                    if key in seen:
                        continue
                    item = _candidate(title, link, authority)
                    if item:
                        seen.add(key)
                        candidates.append(item)
                continue

            content_type = response.headers.get("content-type", "").lower()
            if "html" not in content_type and not final_url.lower().endswith(("/", ".html", ".htm")):
                continue
            parser = _ListingLinkParser()
            parser.feed(response.text)
            authority = " ".join(parser.title_parts)[:200] or urlparse(final_url).hostname or "Official source"
            for href, title in parser.links:
                link = urljoin(final_url, href)
                key = (title.casefold(), link)
                if key in seen:
                    continue
                item = _candidate(title, link, authority)
                if item:
                    seen.add(key)
                    candidates.append(item)

    candidates.sort(key=lambda item: item.priority_score, reverse=True)
    return candidates[:limit]
