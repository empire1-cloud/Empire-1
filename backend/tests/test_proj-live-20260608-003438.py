import pytest
from httpx import AsyncClient
from backend.server import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.get("/api/proj-live-20260608-003438/health")
        assert resp.status_code == 200
        assert resp.json()["service"] == "proj-live-20260608-003438"
