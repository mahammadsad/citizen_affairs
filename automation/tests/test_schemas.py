import pytest
from app.schemas import CheckStatus, ClaimEvidence, FactCheckResult, GeneratedDraft


def test_generated_draft_rejects_active_html():
    with pytest.raises(ValueError):
        GeneratedDraft(
            title="A safe public information guide",
            url_slug="safe-guide",
            short_description="A sufficiently detailed description for a draft public guide.",
            body_markdown="Useful text " * 30 + "<script>alert(1)</script>",
            image_filename="safe-guide.webp",
            image_alt_text="A descriptive thumbnail for the safe public guide",
            social_caption="Draft",
            sources_used=["https://example.gov.in/notice"],
        )


def test_critical_unverified_claim_blocks_approval():
    result = FactCheckResult(
        claims=[ClaimEvidence(
            claim_text="Applications close tomorrow",
            claim_category="deadline",
            source_url="https://example.gov.in/notice",
            evidence_summary="The supplied notice does not confirm the date.",
            evidence_level="official",
            verification_result=CheckStatus.unverified,
            confidence="low",
            is_critical=True,
        )],
        checked_for_newer_notification=True,
        checked_for_corrigenda=True,
        model_name="configured-model",
    )
    assert result.approval_blocked is True
    assert result.critical_blockers
