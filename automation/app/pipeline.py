import hashlib
from datetime import datetime, timezone
from .clients import GeminiClient, SupabaseRepository
from .config import Settings
from .discovery import discover_from_official_feeds
from .schemas import FactCheckResult, GeneratedDraft, ResearchDossier, SeoAnalysis, TopicCandidate

RESEARCH_SYSTEM = """You are the Citizen Affairs research agent. Start with official Indian government sources.
Never invent facts or numeric SEO metrics. Return only evidence-grounded structured data. Record uncertainty."""
SEO_SYSTEM = """You are the Citizen Affairs SEO analyst. Do not fabricate search volume, difficulty, CPC,
competition percentages, or trend percentages. Use qualitative demand labels and cite the supplied evidence."""
WRITING_SYSTEM = """You are the Citizen Affairs drafting agent. Write only from the supplied verified dossier.
Use Markdown, never raw active HTML. State uncertainty and include an independent-platform disclaimer.
This is a draft for human review and must never be described as published or approved."""
FACTCHECK_SYSTEM = """You are an independent Citizen Affairs fact checker. Check every important claim against
mapped source evidence, including dates, numbers, names, qualifications, fees and links. Critical unsupported
claims must block approval. Check for corrigenda and newer official notices."""


def idempotency_key(prefix: str, value: str) -> str:
    digest = hashlib.sha256(value.encode()).hexdigest()[:24]
    return f"{prefix}:{datetime.now(timezone.utc).date().isoformat()}:{digest}"


class AutomationPipeline:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.ai = GeminiClient(settings)
        self.db = SupabaseRepository(settings)

    async def discover(self) -> list[dict]:
        candidates = await discover_from_official_feeds(self.settings.feeds, self.settings.max_topics_per_run)
        saved = []
        for candidate in candidates:
            payload = candidate.model_dump(mode="json")
            payload["idempotency_key"] = idempotency_key("topic", f"{candidate.normalized_topic}:{candidate.source_url}")
            # Topic table deduplicates by normalized title, language and source URL.
            payload.pop("idempotency_key")
            saved.append(await self.db.insert("topic_candidates", payload))
        return saved

    async def research(self, topic: TopicCandidate) -> ResearchDossier:
        return await self.ai.structured(
            model=self.settings.gemini_research_model,
            system=RESEARCH_SYSTEM,
            prompt=f"Research this candidate using official sources first:\n{topic.model_dump_json()}",
            schema=ResearchDossier,
        )

    async def seo(self, dossier: ResearchDossier) -> SeoAnalysis:
        return await self.ai.structured(
            model=self.settings.gemini_research_model,
            system=SEO_SYSTEM,
            prompt=dossier.model_dump_json(),
            schema=SeoAnalysis,
        )

    async def write(self, dossier: ResearchDossier, seo: SeoAnalysis) -> GeneratedDraft:
        return await self.ai.structured(
            model=self.settings.gemini_writing_model,
            system=WRITING_SYSTEM,
            prompt=f"DOSSIER\n{dossier.model_dump_json()}\nSEO\n{seo.model_dump_json()}",
            schema=GeneratedDraft,
        )

    async def fact_check(self, dossier: ResearchDossier, draft: GeneratedDraft) -> FactCheckResult:
        return await self.ai.structured(
            model=self.settings.gemini_factcheck_model,
            system=FACTCHECK_SYSTEM,
            prompt=f"DOSSIER\n{dossier.model_dump_json()}\nDRAFT\n{draft.model_dump_json()}",
            schema=FactCheckResult,
        )
