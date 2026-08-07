import asyncio
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from .clients import GeminiClient, SupabaseRepository, TavilyClient
from .config import Settings
from .discovery import discover_from_official_feeds
from .draft_repository import DraftRepository
from .schemas import FactCheckResult, GeneratedDraft, ResearchDossier, SeoAnalysis, TopicCandidate
from .source_material import OfficialSourceFetcher, SourceMaterial

RESEARCH_SYSTEM = """You are the Citizen Affairs research agent. Use only the supplied captured material from
official Indian government or public-authority sources. Never claim that you browsed outside the supplied evidence.
Never invent facts, dates, links, vacancy counts, eligibility rules, fees, deadlines, document numbers or numeric SEO
metrics. Map every important fact to at least one supplied official source URL, record conflicts and missing information,
and keep uncertain claims explicitly uncertain. Return only evidence-grounded structured data."""

SEO_SYSTEM = """You are the Citizen Affairs SEO analyst. Analyse search intent and useful information architecture,
not keyword stuffing. Search-result snippets, when supplied, are SEO context only and are not factual evidence for the
article. Do not fabricate search volume, difficulty, CPC, competition percentages, traffic estimates or trend
percentages. Prefer precise, human-readable titles and query clusters. Suggest internal links only from the supplied
Citizen Affairs article index."""

WRITING_SYSTEM = """You are the Citizen Affairs drafting agent. Write only from the supplied verified research
dossier. Search/SEO context may shape wording and structure but must never add facts. Use clear Markdown, never raw
active HTML, clickbait, fake urgency, keyword stuffing or repetitive AI filler. Put the practical answer near the top,
use descriptive H2 headings, include official links naturally, and state uncertainty where the dossier does. Include a
short independent-platform disclaimer. This is an unpublished draft for human review. Do not describe it as approved,
officially confirmed or published."""

FACTCHECK_SYSTEM = """You are an independent Citizen Affairs fact checker. Re-check every important draft claim
against the supplied captured official evidence, including dates, numbers, names, qualifications, fees, deadlines,
benefits, vacancies and links. Treat unsupported critical claims as blockers. Check the supplied related evidence for
corrigenda and newer notices; if the supplied evidence is insufficient to make that check, set the corresponding flag
false. Do not approve your own assumptions and do not use general model memory as evidence."""

LANGUAGE_NAMES = {"en": "English", "bn": "Bengali", "hi": "Hindi"}


def idempotency_key(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.encode()).hexdigest()[:24]
    return f"{prefix}:{datetime.now(timezone.utc).date().isoformat()}:{digest}"


def repository_root() -> Path:
    # automation/app/pipeline.py -> repository root
    return Path(__file__).resolve().parents[2]


def _material_prompt(materials: list[SourceMaterial], max_chars: int) -> str:
    return "\n\n--- OFFICIAL SOURCE ---\n".join(
        material.prompt_excerpt(max_chars) for material in materials
    )


def _pdf_attachments(materials: list[SourceMaterial]) -> list[tuple[str, bytes]]:
    return [
        (material.content_type, material.binary)
        for material in materials
        if material.binary is not None and material.is_pdf
    ]


def _allowed_source_urls(materials: list[SourceMaterial]) -> set[str]:
    allowed: set[str] = set()
    for material in materials:
        allowed.add(material.requested_url.rstrip("/"))
        allowed.add(material.final_url.rstrip("/"))
    return allowed


class AutomationPipeline:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.ai = GeminiClient(settings)
        self.search = TavilyClient(settings)
        self.fetcher = OfficialSourceFetcher(settings)
        self.db = SupabaseRepository(settings) if settings.has_supabase else None
        self.drafts = DraftRepository(repository_root())

    async def discover_candidates(self) -> list[TopicCandidate]:
        return await discover_from_official_feeds(self.settings.feeds, self.settings.max_topics_per_run)

    async def discover(self) -> list[dict]:
        candidates = await self.discover_candidates()
        if not self.db:
            return [candidate.model_dump(mode="json") for candidate in candidates]
        saved = []
        for candidate in candidates:
            payload = candidate.model_dump(mode="json")
            payload["idempotency_key"] = idempotency_key(
                "topic", f"{candidate.normalized_topic}:{candidate.source_url}"
            )
            # The current topic table owns its own deduplication contract.
            payload.pop("idempotency_key")
            saved.append(await self.db.insert("topic_candidates", payload))
        return saved

    async def research(self, topic: TopicCandidate, materials: list[SourceMaterial] | None = None) -> ResearchDossier:
        evidence = materials or await self.fetcher.fetch_bundle(str(topic.source_url))
        prompt = (
            f"TOPIC CANDIDATE\n{topic.model_dump_json()}\n\n"
            "The following text/PDF attachments were fetched directly from approved official domains. "
            "Use only these sources.\n\n"
            f"{_material_prompt(evidence, self.settings.max_source_text_chars)}"
        )
        dossier = await self.ai.structured(
            model=self.settings.gemini_research_model,
            system=RESEARCH_SYSTEM,
            prompt=prompt,
            schema=ResearchDossier,
            attachments=_pdf_attachments(evidence),
        )
        assert isinstance(dossier, ResearchDossier)
        allowed = _allowed_source_urls(evidence)
        unexpected = [str(source.url) for source in dossier.official_sources if str(source.url).rstrip("/") not in allowed]
        if unexpected:
            raise ValueError("research output cited an official URL that was not supplied as captured evidence")
        return dossier

    async def seo(self, dossier: ResearchDossier) -> SeoAnalysis:
        serp = await self.search.search(dossier.topic.normalized_topic)
        internal_links = self.drafts.internal_link_context()
        prompt = (
            f"VERIFIED DOSSIER\n{dossier.model_dump_json()}\n\n"
            f"SEARCH-RESULT CONTEXT (SEO ONLY; NOT FACTUAL EVIDENCE)\n{json.dumps(serp, ensure_ascii=False)}\n\n"
            f"EXISTING CITIZEN AFFAIRS ARTICLES FOR INTERNAL LINKS\n{json.dumps(internal_links, ensure_ascii=False)}"
        )
        analysis = await self.ai.structured(
            model=self.settings.gemini_research_model,
            system=SEO_SYSTEM,
            prompt=prompt,
            schema=SeoAnalysis,
        )
        assert isinstance(analysis, SeoAnalysis)
        return analysis

    async def write(self, dossier: ResearchDossier, seo: SeoAnalysis, language: str = "en") -> GeneratedDraft:
        language_name = LANGUAGE_NAMES.get(language, "English")
        prompt = (
            f"TARGET LANGUAGE: {language_name} ({language}). Write the complete draft in this language. "
            "Keep url_slug in lowercase English ASCII and use the supplied SEO slug unless there is a validation issue.\n\n"
            f"VERIFIED DOSSIER\n{dossier.model_dump_json()}\n\nSEO\n{seo.model_dump_json()}"
        )
        draft = await self.ai.structured(
            model=self.settings.gemini_writing_model,
            system=WRITING_SYSTEM,
            prompt=prompt,
            schema=GeneratedDraft,
        )
        assert isinstance(draft, GeneratedDraft)
        # One stable ASCII slug/translation key is used across language versions.
        draft.url_slug = seo.url_slug
        allowed = {str(source.url).rstrip("/") for source in dossier.official_sources}
        unexpected = [str(url) for url in draft.sources_used if str(url).rstrip("/") not in allowed]
        if unexpected:
            raise ValueError("draft cited a source that is not in the verified dossier")
        return draft

    async def fact_check(
        self,
        dossier: ResearchDossier,
        draft: GeneratedDraft,
        materials: list[SourceMaterial] | None = None,
    ) -> FactCheckResult:
        evidence = materials or await self.fetcher.fetch_bundle(str(dossier.topic.source_url))
        prompt = (
            f"DOSSIER\n{dossier.model_dump_json()}\n\nDRAFT\n{draft.model_dump_json()}\n\n"
            f"CAPTURED OFFICIAL EVIDENCE\n{_material_prompt(evidence, self.settings.max_source_text_chars)}"
        )
        result = await self.ai.structured(
            model=self.settings.gemini_factcheck_model,
            system=FACTCHECK_SYSTEM,
            prompt=prompt,
            schema=FactCheckResult,
            attachments=_pdf_attachments(evidence),
        )
        assert isinstance(result, FactCheckResult)
        return result

    async def generate_drafts(self) -> dict:
        candidates = await self.discover_candidates()
        created: list[dict] = []
        skipped_duplicates = 0
        failures: list[dict] = []
        processed_topics = 0
        created_topics = 0
        candidate_attempts = 0
        max_candidate_attempts = getattr(
            self.settings,
            "max_candidate_attempts_per_run",
            max(3, self.settings.max_drafts_per_run),
        )
        topic_timeout_seconds = getattr(self.settings, "topic_processing_timeout_seconds", 360)

        for candidate in candidates:
            if created_topics >= self.settings.max_drafts_per_run:
                break
            if candidate_attempts >= max_candidate_attempts:
                break
            if self.drafts.is_duplicate(candidate):
                skipped_duplicates += 1
                continue

            candidate_attempts += 1
            processed_topics += 1
            try:
                async with asyncio.timeout(topic_timeout_seconds):
                    materials = await self.fetcher.fetch_bundle(str(candidate.source_url))
                    dossier = await self.research(candidate, materials)
                    seo = await self.seo(dossier)
                    topic_created = 0
                    for language in self.settings.languages:
                        path = self.drafts.target_path(language, seo.url_slug)
                        if path.exists():
                            continue
                        draft = await self.write(dossier, seo, language)
                        factcheck = await self.fact_check(dossier, draft, materials)
                        saved_path = self.drafts.save(
                            language=language,
                            candidate=candidate,
                            dossier=dossier,
                            seo=seo,
                            draft=draft,
                            factcheck=factcheck,
                        )
                        if saved_path:
                            topic_created += 1
                            created.append({
                                "path": str(saved_path.relative_to(repository_root())),
                                "language": language,
                                "review_ready": factcheck.review_ready,
                                "critical_blockers": len(factcheck.critical_blockers),
                            })
                    if topic_created == 0:
                        skipped_duplicates += 1
                    else:
                        created_topics += 1
            except Exception as error:  # isolate one bad government page/provider response from the whole run
                failures.append({
                    "topic": candidate.normalized_topic,
                    "source_url": str(candidate.source_url),
                    "error": type(error).__name__,
                })

        return {
            "created": created,
            "created_count": len(created),
            "created_topics": created_topics,
            "processed_topics": processed_topics,
            "candidate_attempts": candidate_attempts,
            "skipped_duplicates": skipped_duplicates,
            "failures": failures,
        }
