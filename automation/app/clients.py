import asyncio
import json
import httpx
from pydantic import BaseModel
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter
from .config import Settings


class ProviderError(RuntimeError):
    pass


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
    async def structured(self, *, model: str, system: str, prompt: str, schema: type[BaseModel]) -> BaseModel:
        endpoint = f"{str(self.settings.gemini_api_base).rstrip('/')}/models/{model}:generateContent"
        payload = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
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
            raise ProviderError(f"Gemini temporarily unavailable ({response.status_code})")
        if response.is_error:
            raise ProviderError(f"Gemini rejected the structured request ({response.status_code})")
        try:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            return schema.model_validate(json.loads(text))
        except (KeyError, IndexError, TypeError, ValueError) as error:
            raise ProviderError("Gemini returned invalid structured output") from error


class SupabaseRepository:
    def __init__(self, settings: Settings) -> None:
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
