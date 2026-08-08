import asyncio
from types import SimpleNamespace

from app.config import Settings
from app.pipeline import AutomationPipeline


def test_bengali_is_the_fail_closed_default_draft_language(monkeypatch):
    monkeypatch.delenv("DRAFT_LANGUAGES", raising=False)
    settings = Settings(
        gemini_api_key="test",
        gemini_research_model="research",
        gemini_writing_model="writing",
        gemini_factcheck_model="factcheck",
    )
    assert settings.languages == ["bn"]


def test_empty_discovery_has_a_distinct_no_candidate_outcome():
    pipeline = AutomationPipeline.__new__(AutomationPipeline)
    pipeline.settings = SimpleNamespace(
        max_drafts_per_run=1,
        max_candidate_attempts_per_run=1,
        topic_processing_timeout_seconds=1,
        languages=["bn"],
    )
    pipeline.discover_candidates = lambda: asyncio.sleep(0, result=[])

    result = asyncio.run(pipeline.generate_drafts())

    assert result["outcome_counts"]["no_eligible_candidate"] == 1
    assert result["outcomes"] == [{"outcome": "no_eligible_candidate"}]
