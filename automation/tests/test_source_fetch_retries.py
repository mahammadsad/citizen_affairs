import asyncio
from types import SimpleNamespace

import httpx

from app import source_material


class FakeAsyncClient:
    calls = 0

    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url: str):
        type(self).calls += 1
        request = httpx.Request("GET", url)
        if type(self).calls < 3:
            raise httpx.ReadTimeout("official site was temporarily slow", request=request)
        return httpx.Response(
            200,
            request=request,
            headers={"content-type": "text/html; charset=utf-8"},
            text="<html><head><title>Official notice</title></head><body>Recruitment details</body></html>",
        )


def test_official_source_fetch_retries_transient_timeout(monkeypatch):
    FakeAsyncClient.calls = 0
    monkeypatch.setattr(source_material.httpx, "AsyncClient", FakeAsyncClient)

    async def no_sleep(_seconds: float):
        return None

    monkeypatch.setattr(source_material.asyncio, "sleep", no_sleep)
    settings = SimpleNamespace(
        request_timeout_seconds=1,
        max_source_bytes=1_000_000,
        max_source_text_chars=10_000,
        related_source_limit=2,
    )
    fetcher = source_material.OfficialSourceFetcher(settings)

    material = asyncio.run(fetcher.fetch_one("https://ssc.gov.in/recruitment-notice"))

    assert FakeAsyncClient.calls == 3
    assert material.title == "Official notice"
    assert "Recruitment details" in material.text
