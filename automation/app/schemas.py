from datetime import datetime, timezone
from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class EvidenceLevel(StrEnum):
    official = "official"
    secondary = "secondary"


class CheckStatus(StrEnum):
    confirmed = "confirmed"
    partially_confirmed = "partially-confirmed"
    unverified = "unverified"
    contradicted = "contradicted"
    outdated = "outdated"


class TopicCandidate(StrictModel):
    normalized_topic: str = Field(min_length=5, max_length=300)
    language: str = Field(pattern="^(en|bn|hi)$")
    source_url: HttpUrl
    source_authority: str = Field(min_length=2, max_length=200)
    category: str = Field(min_length=2, max_length=80)
    relevance_scope: str = Field(pattern="^(national|state|local)$")
    state_or_ut: str | None = None
    freshness_label: str = Field(pattern="^(low|medium|high|breaking)$")
    deadline_urgency: str = Field(pattern="^(none|low|medium|high)$")
    official_source_available: bool
    discovery_evidence: list[str] = Field(default_factory=list, max_length=20)


class SourceEvidence(StrictModel):
    url: HttpUrl
    title: str = Field(min_length=2, max_length=500)
    publishing_authority: str = Field(min_length=2, max_length=300)
    priority: int = Field(ge=1, le=6)
    evidence_level: EvidenceLevel
    publication_date: str | None = None
    document_number: str | None = None
    evidence_summary: str = Field(min_length=2, max_length=2000)


class ImportantFact(StrictModel):
    label: str
    value: str
    source_urls: list[HttpUrl] = Field(min_length=1)
    verified: bool = False


class ResearchDossier(StrictModel):
    topic: TopicCandidate
    official_sources: list[SourceEvidence] = Field(min_length=1)
    secondary_sources: list[SourceEvidence] = Field(default_factory=list)
    facts: list[ImportantFact] = Field(default_factory=list)
    conflicts: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    important_dates: list[ImportantFact] = Field(default_factory=list)
    official_links: list[HttpUrl] = Field(default_factory=list)
    user_questions: list[str] = Field(default_factory=list)
    research_completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    research_model: str
    confidence: str = Field(pattern="^(low|medium|high)$")

    @field_validator("official_sources")
    @classmethod
    def official_sources_are_official(cls, sources: list[SourceEvidence]) -> list[SourceEvidence]:
        if any(source.evidence_level != EvidenceLevel.official for source in sources):
            raise ValueError("official_sources may contain only official evidence")
        return sources


class ClaimEvidence(StrictModel):
    claim_text: str = Field(min_length=2, max_length=3000)
    claim_category: str
    source_url: HttpUrl
    evidence_summary: str = Field(min_length=2, max_length=2000)
    evidence_level: EvidenceLevel
    verification_result: CheckStatus
    confidence: str = Field(pattern="^(low|medium|high)$")
    is_critical: bool = False


class SeoAnalysis(StrictModel):
    primary_keyword: str
    secondary_keywords: list[str] = Field(default_factory=list)
    long_tail_keywords: list[str] = Field(default_factory=list)
    search_intent: str
    keyword_clusters: list[list[str]] = Field(default_factory=list)
    related_questions: list[str] = Field(default_factory=list)
    content_gaps: list[str] = Field(default_factory=list)
    internal_link_suggestions: list[str] = Field(default_factory=list)
    title_suggestions: list[str] = Field(min_length=1)
    heading_structure: list[str] = Field(min_length=1)
    url_slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    meta_description: str = Field(min_length=50, max_length=170)
    demand_signal: str = Field(pattern="^(unknown|low|medium|high)$")
    demand_evidence: list[str] = Field(default_factory=list)
    structured_data_recommendations: list[str] = Field(default_factory=list)


class GeneratedDraft(StrictModel):
    title: str = Field(min_length=8, max_length=180)
    url_slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    short_description: str = Field(min_length=40, max_length=320)
    body_markdown: str = Field(min_length=200)
    image_filename: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*\.webp$")
    image_alt_text: str = Field(min_length=10, max_length=250)
    social_caption: str = Field(max_length=500)
    sources_used: list[HttpUrl] = Field(min_length=1)
    ai_generated: bool = True

    @field_validator("body_markdown")
    @classmethod
    def markdown_must_not_contain_active_html(cls, value: str) -> str:
        lowered = value.lower()
        if any(token in lowered for token in ("<script", "<iframe", "<object", "<embed", "<form")):
            raise ValueError("active HTML is not allowed")
        return value


class FactCheckResult(StrictModel):
    claims: list[ClaimEvidence]
    critical_blockers: list[str] = Field(default_factory=list)
    checked_for_newer_notification: bool
    checked_for_corrigenda: bool
    model_name: str

    @property
    def approval_blocked(self) -> bool:
        return bool(self.critical_blockers) or any(
            claim.is_critical and claim.verification_result in {
                CheckStatus.unverified, CheckStatus.contradicted, CheckStatus.outdated
            }
            for claim in self.claims
        )

    @model_validator(mode="after")
    def critical_failures_are_listed(self) -> "FactCheckResult":
        if self.approval_blocked and not self.critical_blockers:
            self.critical_blockers.append("One or more critical claims are unresolved.")
        return self
