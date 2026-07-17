from urllib.parse import urlparse
import feedparser
import httpx
from .schemas import TopicCandidate

OFFICIAL_HOST_SUFFIXES = (
    ".gov.in", ".nic.in", "pib.gov.in", "upsc.gov.in", "ssc.gov.in",
    "nta.ac.in", "cbse.gov.in", "indianrailways.gov.in",
)


def is_official_url(value: str) -> bool:
    host = (urlparse(value).hostname or "").lower()
    return any(host == suffix.lstrip(".") or host.endswith(suffix) for suffix in OFFICIAL_HOST_SUFFIXES)


async def discover_from_official_feeds(feed_urls: list[str], limit: int = 20) -> list[TopicCandidate]:
    candidates: list[TopicCandidate] = []
    seen: set[tuple[str, str]] = set()
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        for feed_url in feed_urls:
            if not is_official_url(feed_url):
                continue
            response = await client.get(feed_url)
            response.raise_for_status()
            feed = feedparser.loads(response.content)
            authority = feed.feed.get("title", urlparse(feed_url).hostname or "Official source")
            for entry in feed.entries[:limit]:
                link = entry.get("link", "")
                title = " ".join(entry.get("title", "").split())
                key = (title.casefold(), link)
                if len(title) < 5 or not is_official_url(link) or key in seen:
                    continue
                seen.add(key)
                candidates.append(TopicCandidate(
                    normalized_topic=title,
                    language="en",
                    source_url=link,
                    source_authority=authority,
                    category="official-notice",
                    relevance_scope="national",
                    freshness_label="high",
                    deadline_urgency="none",
                    official_source_available=True,
                    discovery_evidence=[f"Published by official feed: {authority}"],
                ))
                if len(candidates) >= limit:
                    return candidates
    return candidates
