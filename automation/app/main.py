import hmac

from fastapi import Depends, FastAPI, Header, HTTPException

from .config import Settings, get_settings
from .pipeline import AutomationPipeline
from .schemas import TopicCandidate

app = FastAPI(title="Citizen Affairs private automation", docs_url=None, redoc_url=None)


def require_webhook(
    x_automation_secret: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> Settings:
    if not settings.automation_webhook_secret:
        raise HTTPException(status_code=503, detail="Automation webhook is not configured")
    expected = settings.automation_webhook_secret.get_secret_value()
    if not x_automation_secret or not hmac.compare_digest(x_automation_secret, expected):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return settings


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "publishes_automatically": False}


@app.post("/v1/topics/discover")
async def discover(settings: Settings = Depends(require_webhook)) -> dict:
    topics = await AutomationPipeline(settings).discover_candidates()
    return {"count": len(topics), "topics": [topic.model_dump(mode="json") for topic in topics]}


@app.post("/v1/research/preview")
async def research_preview(topic: TopicCandidate, settings: Settings = Depends(require_webhook)) -> dict:
    dossier = await AutomationPipeline(settings).research(topic)
    return {"dossier": dossier.model_dump(mode="json"), "requires_human_review": True}


@app.post("/v1/drafts/generate")
async def generate_drafts(settings: Settings = Depends(require_webhook)) -> dict:
    result = await AutomationPipeline(settings).generate_drafts()
    result["publishes_automatically"] = False
    return result
