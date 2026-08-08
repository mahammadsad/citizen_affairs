import asyncio
from pathlib import Path
from types import SimpleNamespace

import httpx

from app.pipeline import AutomationPipeline, repository_root
from app.schemas import TopicCandidate


def candidate(name: str, url: str, discovery_evidence: list[str] | None = None) -> TopicCandidate:
    return TopicCandidate(
        normalized_topic=name,
        language="en",
        source_url=url,
        source_authority="Staff Selection Commission",
        category="jobs",
        relevance_scope="national",
        freshness_label="high",
        deadline_urgency="none",
        official_source_available=True,
        discovery_evidence=discovery_evidence or ["test"],
        priority_score=80,
        selection_reasons=["test"],
    )


class FakeFetcher:
    async def fetch_bundle(self, url: str):
        if url.endswith("/first"):
            request = httpx.Request("GET", url)
            raise httpx.ReadTimeout("first candidate timed out", request=request)
        return [object()]


class AlwaysFailFetcher:
    async def fetch_bundle(self, url: str):
        request = httpx.Request("GET", url)
        raise httpx.ReadTimeout("candidate failed", request=request)


class SlowFetcher:
    async def fetch_bundle(self, _url: str):
        await asyncio.sleep(10)
        return [object()]


class ListingFallbackFetcher:
    def __init__(self):
        self.calls: list[str] = []

    async def fetch_bundle(self, url: str):
        self.calls.append(url)
        if "/whats-new/" in url:
            request = httpx.Request("GET", url)
            raise httpx.ReadTimeout("detail route timed out", request=request)
        return ["captured official listing"]


class FakeDrafts:
    def is_duplicate(self, _candidate):
        return False

    def target_path(self, _language: str, slug: str) -> Path:
        return Path("/tmp/citizen-affairs-test-never-created") / f"{slug}.md"

    def save(self, **_kwargs):
        return repository_root() / "src/content/articles/en/working-topic.md"


async def fake_discover():
    return [
        candidate("First recruitment notice", "https://ssc.gov.in/first"),
        candidate("Second recruitment notice", "https://ssc.gov.in/second"),
    ]


async def discover_four():
    return [
        candidate(f"Recruitment notice {number}", f"https://ssc.gov.in/notice-{number}")
        for number in range(1, 5)
    ]


async def fake_research(topic, _materials):
    return SimpleNamespace(topic=topic)


async def fake_seo(_dossier):
    return SimpleNamespace(url_slug="working-topic")


async def fake_write(_dossier, _seo, _language):
    return SimpleNamespace()


async def fake_fact_check(_dossier, _draft, _materials):
    return SimpleNamespace(review_ready=True, critical_blockers=[])


def pipeline_with(settings, fetcher, discover):
    pipeline = AutomationPipeline.__new__(AutomationPipeline)
    pipeline.settings = settings
    pipeline.fetcher = fetcher
    pipeline.drafts = FakeDrafts()
    pipeline.discover_candidates = discover
    pipeline.research = fake_research
    pipeline.seo = fake_seo
    pipeline.write = fake_write
    pipeline.fact_check = fake_fact_check
    return pipeline


def test_pipeline_keeps_trying_until_requested_draft_is_created():
    pipeline = pipeline_with(
        SimpleNamespace(max_drafts_per_run=1, languages=["en"]),
        FakeFetcher(),
        fake_discover,
    )

    result = asyncio.run(pipeline.generate_drafts())

    assert result["processed_topics"] == 2
    assert result["created_topics"] == 1
    assert result["created_count"] == 1
    assert len(result["failures"]) == 1
    assert result["failures"][0]["topic"] == "First recruitment notice"


def test_pipeline_stops_after_configured_candidate_attempts():
    pipeline = pipeline_with(
        SimpleNamespace(
            max_drafts_per_run=1,
            max_candidate_attempts_per_run=3,
            topic_processing_timeout_seconds=10,
            languages=["en"],
        ),
        AlwaysFailFetcher(),
        discover_four,
    )

    result = asyncio.run(pipeline.generate_drafts())

    assert result["candidate_attempts"] == 3
    assert result["processed_topics"] == 3
    assert result["created_count"] == 0
    assert len(result["failures"]) == 3
    assert result["outcome_counts"]["source_unreachable"] == 3


def test_pipeline_times_out_one_slow_topic_without_hanging_the_run():
    pipeline = pipeline_with(
        SimpleNamespace(
            max_drafts_per_run=1,
            max_candidate_attempts_per_run=1,
            topic_processing_timeout_seconds=0.01,
            languages=["en"],
        ),
        SlowFetcher(),
        fake_discover,
    )

    result = asyncio.run(pipeline.generate_drafts())

    assert result["candidate_attempts"] == 1
    assert result["created_count"] == 0
    assert len(result["failures"]) == 1
    assert result["failures"][0]["error"] == "TimeoutError"
    assert result["failures"][0]["outcome"] == "source_unreachable"


def test_pipeline_uses_official_listing_when_detail_page_times_out():
    fetcher = ListingFallbackFetcher()
    pipeline = AutomationPipeline.__new__(AutomationPipeline)
    pipeline.fetcher = fetcher
    topic = candidate(
        "Written Result: Combined Defence Services Examination (I), 2026",
        "https://www.upsc.gov.in/whats-new/cds-result",
        [
            "Discovered on official source: Union Public Service Commission",
            "Official listing URL: https://www.upsc.gov.in/",
        ],
    )

    materials = asyncio.run(pipeline._fetch_candidate_materials(topic))

    assert materials == ["captured official listing"]
    assert fetcher.calls == [
        "https://www.upsc.gov.in/whats-new/cds-result",
        "https://www.upsc.gov.in/",
    ]
