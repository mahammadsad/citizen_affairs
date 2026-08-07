import asyncio
from pathlib import Path
from types import SimpleNamespace

import httpx

from app.pipeline import AutomationPipeline, repository_root
from app.schemas import TopicCandidate


def candidate(name: str, url: str) -> TopicCandidate:
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
        discovery_evidence=["test"],
        priority_score=80,
        selection_reasons=["test"],
    )


class FakeFetcher:
    async def fetch_bundle(self, url: str):
        if url.endswith("/first"):
            request = httpx.Request("GET", url)
            raise httpx.ReadTimeout("first candidate timed out", request=request)
        return [object()]


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


async def fake_research(topic, _materials):
    return SimpleNamespace(topic=topic)


async def fake_seo(_dossier):
    return SimpleNamespace(url_slug="working-topic")


async def fake_write(_dossier, _seo, _language):
    return SimpleNamespace()


async def fake_fact_check(_dossier, _draft, _materials):
    return SimpleNamespace(review_ready=True, critical_blockers=[])


def test_pipeline_keeps_trying_until_requested_draft_is_created():
    pipeline = AutomationPipeline.__new__(AutomationPipeline)
    pipeline.settings = SimpleNamespace(max_drafts_per_run=1, languages=["en"])
    pipeline.fetcher = FakeFetcher()
    pipeline.drafts = FakeDrafts()
    pipeline.discover_candidates = fake_discover
    pipeline.research = fake_research
    pipeline.seo = fake_seo
    pipeline.write = fake_write
    pipeline.fact_check = fake_fact_check

    result = asyncio.run(pipeline.generate_drafts())

    assert result["processed_topics"] == 2
    assert result["created_topics"] == 1
    assert result["created_count"] == 1
    assert len(result["failures"]) == 1
    assert result["failures"][0]["topic"] == "First recruitment notice"
