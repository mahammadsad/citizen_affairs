import asyncio

import httpx

from app import discovery


class FakeAsyncClient:
    def __init__(self, *args, **kwargs):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url: str):
        request = httpx.Request("GET", url)
        if "pib.gov.in" in url:
            return httpx.Response(403, request=request)
        html = """
        <html>
          <head><title>Staff Selection Commission</title></head>
          <body>
            <a href="/notice/recruitment-2026">Recruitment notification for 120 posts</a>
          </body>
        </html>
        """
        return httpx.Response(
            200,
            request=request,
            headers={"content-type": "text/html; charset=utf-8"},
            text=html,
        )


def test_discovery_skips_blocked_source_and_continues(monkeypatch):
    monkeypatch.setattr(discovery.httpx, "AsyncClient", FakeAsyncClient)

    candidates = asyncio.run(
        discovery.discover_from_official_feeds(
            [
                "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1",
                "https://ssc.gov.in/",
            ],
            limit=10,
        )
    )

    assert len(candidates) == 1
    assert candidates[0].source_authority == "Staff Selection Commission"
    assert str(candidates[0].source_url).startswith("https://ssc.gov.in/notice/")
    assert "Official listing URL: https://ssc.gov.in/" in candidates[0].discovery_evidence
