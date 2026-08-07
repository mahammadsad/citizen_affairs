from pathlib import Path

from app.draft_repository import DraftRepository
from app.schemas import (
    ClaimEvidence,
    DraftFaq,
    FactCheckResult,
    GeneratedDraft,
    ResearchDossier,
    SeoAnalysis,
    SourceEvidence,
    TopicCandidate,
)


def candidate():
    return TopicCandidate(
        normalized_topic="Official recruitment notification for example posts",
        language="en",
        source_url="https://example.gov.in/notice",
        source_authority="Example Government Department",
        category="jobs",
        relevance_scope="national",
        freshness_label="high",
        deadline_urgency="high",
        official_source_available=True,
        priority_score=80,
    )


def dossier(topic):
    return ResearchDossier(
        topic=topic,
        official_sources=[SourceEvidence(
            url="https://example.gov.in/notice",
            title="Official notification",
            publishing_authority="Example Government Department",
            priority=1,
            evidence_level="official",
            evidence_summary="The notification contains the recruitment details.",
        )],
        facts=[],
        important_dates=[],
        official_links=["https://example.gov.in/notice"],
        research_model="test-model",
        confidence="high",
    )


def seo():
    return SeoAnalysis(
        primary_keyword="example recruitment 2026",
        secondary_keywords=["example vacancies"],
        search_intent="Find official recruitment details",
        title_suggestions=["Example Recruitment 2026 Official Notification"],
        heading_structure=["Overview", "Important dates"],
        url_slug="example-recruitment-2026",
        meta_description="Official-source guide to the example recruitment notification, dates, eligibility and application steps.",
        demand_signal="unknown",
    )


def generated_draft():
    return GeneratedDraft(
        title="Example Recruitment 2026: Official Notification Guide",
        url_slug="example-recruitment-2026",
        short_description="A draft guide to the official example recruitment notification, including dates and application information for applicants.",
        seo_title="Example Recruitment 2026: Official Notification Guide",
        seo_description="Official-source guide to the example recruitment notification, dates, eligibility and application steps.",
        portal_category="jobs",
        body_markdown="Applicants should verify every detail on the official notification before applying.\n\n## Important dates\n\nThe official notice is the controlling source.\n\n## How to apply\n\nUse only the official portal linked in the notification. " * 2,
        quick_summary=["Use the official notification as the controlling source.", "Review the application deadline before submitting."],
        faqs=[DraftFaq(question="Where should I apply?", answer="Use only the official application link provided by the issuing authority.")],
        sources_used=["https://example.gov.in/notice"],
    )


def factcheck(ready=True):
    return FactCheckResult(
        claims=[ClaimEvidence(
            claim_text="Use the official notification as the controlling source.",
            claim_category="source",
            source_url="https://example.gov.in/notice",
            evidence_summary="The supplied official source is the notification.",
            evidence_level="official",
            verification_result="confirmed",
            confidence="high",
            is_critical=False,
        )],
        critical_blockers=[] if ready else ["Deadline is not confirmed."],
        checked_for_newer_notification=ready,
        checked_for_corrigenda=ready,
        model_name="fact-model",
    )


def test_rendered_article_is_always_private_draft(tmp_path: Path):
    repo = DraftRepository(tmp_path)
    topic = candidate()
    content = repo.render(
        language="en",
        candidate=topic,
        dossier=dossier(topic),
        seo=seo(),
        draft=generated_draft(),
        factcheck=factcheck(True),
    )
    assert "draft: true" in content
    assert "workflowStatus: draft" in content
    assert "verificationStatus: under-verification" in content
    assert "workflowStatus: published" not in content


def test_blocked_factcheck_marks_verification_failed_but_stays_draft(tmp_path: Path):
    repo = DraftRepository(tmp_path)
    topic = candidate()
    content = repo.render(
        language="en",
        candidate=topic,
        dossier=dossier(topic),
        seo=seo(),
        draft=generated_draft(),
        factcheck=factcheck(False),
    )
    assert "draft: true" in content
    assert "workflowStatus: verification-failed" in content


def test_duplicate_detection_uses_existing_official_source(tmp_path: Path):
    article_dir = tmp_path / "src" / "content" / "articles" / "en"
    article_dir.mkdir(parents=True)
    (article_dir / "existing.md").write_text(
        "---\nurlSlug: existing\ntitle: Existing article\nsourceUrls:\n  - https://example.gov.in/notice\ndraft: true\n---\nBody\n",
        encoding="utf-8",
    )
    assert DraftRepository(tmp_path).is_duplicate(candidate()) is True
