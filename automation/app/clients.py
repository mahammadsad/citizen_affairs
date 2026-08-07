import asyncio
import base64
import json

import httpx
from pydantic import BaseModel
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

from .config import Settings


class ProviderError(RuntimeError):
    pass


def _provider_error(schema: type[BaseModel], message: str) -> ProviderError:
    """Emit a safe provider diagnostic without logging prompts, keys, or source content."""
    print(f"Gemini {schema.__name__} provider error: {message}", flush=True)
    return ProviderError(message)


class GeminiClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._semaphore = asyncio.Semaphore(settings.api_concurrency)

    @retry(
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError, ProviderError)),
        wait=wait_exponential_jitter(initial=1, max=20),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    async def structured(
        self,
        *,
        model: str,
        system: str,
        prompt: str,
        schema: type[BaseModel],
        attachments: list[tuple[str, bytes]] | None = None,
    ) -> BaseModel:
        endpoint = f"{str(self.settings.gemini_api_base).rstrip('/')}/models/{model}:generateContent"
        parts: list[dict] = [{"text": prompt}]
        for mime_type, attachment in attachments or []:
            parts.append({
                "inlineData": {
                    "mimeType": mime_type,
                    "data": base64.b64encode(attachment).decode("ascii"),
                }
            })
        payload = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": parts}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseJsonSchema": schema.model_json_schema(),
                "temperature": 0.15,
            },
        }
        headers = {"x-goog-api-key": self.settings.gemini_api_key.get_secret_value()}
        async with self._semaphore, httpx.AsyncClient(timeout=self.settings.request_timeout_seconds) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
        if response.status_code == 429 or response.status_code >= 500:
            raise _provider_error(schema, f"temporarily unavailable ({response.status_code})")
        if response.is_error:
            raise _provider_error(schema, f"structured request rejected ({response.status_code})")
        try:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            return schema.model_validate(json.loads(text))
        except (KeyError, IndexError, TypeError, ValueError) as error:
            raise _provider_error(schema, "invalid structured output") from error


class TavilyClient:
    """Optional SERP research used only for SEO/search-intent context, never as factual authority."""

    def __init__(self, settings: Settings) -> None:
        self.key = settings.tavily_api_key.get_secret_value() if settings.tavily_api_key else ""
        self.timeout = settings.request_timeout_seconds
        self.max_results = settings.seo_search_results

    async def search(self, query: str) -> list[dict]:
        if not self.key:
            return []
        payload = {
            "api_key": self.key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": False,
            "include_raw_content": False,
            "max_results": self.max_results,
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post("https://api.tavily.com/search", json=payload)
        if response.is_error:
            return []
        results = response.json().get("results", [])
        cleaned: list[dict] = []
        for result in results[: self.max_results]:
            cleaned.append({
                "title": str(result.get("title", ""))[:300],
                "url": str(result.get("url", ""))[:1000],
                "content": str(result.get("content", ""))[:2000],
            })
        return cleaned


class SupabaseRepository:
    def __init__(self, settings: Settings) -> None:
        if not settings.has_supabase:
            raise RuntimeError("Supabase is not configured")
        assert settings.supabase_url is not None
        assert settings.supabase_secret_key is not None
        self.base = f"{str(settings.supabase_url).rstrip('/')}/rest/v1"
        key = settings.supabase_secret_key.get_secret_value()
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self.timeout = settings.request_timeout_seconds

    async def insert(self, table: str, payload: dict) -> dict:
        if not table.replace("_", "").isalnum():
            raise ValueError("invalid table")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base}/{table}", headers=self.headers, json=payload)
        if response.is_error:
            raise RuntimeError(f"Database write failed for {table} ({response.status_code})")
        rows = response.json()
        return rows[0] if isinstance(rows, list) else rows

    async def update(self, table: str, row_id: str, payload: dict) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.patch(
                f"{self.base}/{table}",
                params={"id": f"eq.{row_id}"},
                headers=self.headers,
                json=payload,
            )
        if response.is_error:
            raise RuntimeError(f"Database update failed for {table} ({response.status_code})")
        rows = response.json()
        return rows[0] if rows else {}
