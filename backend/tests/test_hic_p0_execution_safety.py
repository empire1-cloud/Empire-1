import json
import sys
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.requests import Request

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from core import engine_context as engine_context_module
from middleware.logging_middleware import ExecutionLoggingMiddleware
from services import execution_logger_db
from app.services import hybrid_engine_runtime


class _InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeExecutionCollection:
    def __init__(self):
        self.docs = []

    async def insert_one(self, doc):
        team_id = doc.get("team_id")
        idem = doc.get("idempotency_key")
        if idem:
            for existing in self.docs:
                if existing.get("team_id") == team_id and existing.get("idempotency_key") == idem:
                    raise execution_logger_db.DuplicateKeyError("duplicate idempotency key")
        stored = dict(doc)
        stored["_id"] = f"log_{len(self.docs) + 1}"
        self.docs.append(stored)
        return _InsertResult(stored["_id"])

    async def find_one(self, query, projection=None):
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                if projection:
                    return {k: v for k, v in doc.items() if projection.get(k, 1)}
                return dict(doc)
        return None

    async def update_one(self, query, update):
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                for key, value in update.get("$set", {}).items():
                    target = doc
                    parts = key.split(".")
                    for part in parts[:-1]:
                        target = target.setdefault(part, {})
                    target[parts[-1]] = value
                return

    async def count_documents(self, query):
        total = 0
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                total += 1
        return total


class FakeReadCollection:
    def __init__(self, docs):
        self.docs = docs

    async def find_one(self, query, projection=None):
        for doc in self.docs:
            if all(doc.get(key) == value for key, value in query.items()):
                return dict(doc)
        return None


class DummySessionContext:
    async def __aenter__(self):
        return None

    async def __aexit__(self, exc_type, exc, tb):
        return False


@pytest.fixture
def fake_execution_store(monkeypatch):
    collection = FakeExecutionCollection()
    monkeypatch.setattr(execution_logger_db, "execution_logs_collection", lambda: collection)
    monkeypatch.setattr(execution_logger_db, "users_collection", lambda: FakeReadCollection([]))
    monkeypatch.setattr(execution_logger_db, "pipelines_collection", lambda: FakeReadCollection([]))
    monkeypatch.setattr(execution_logger_db, "create_audit_log", _fake_audit_log)
    monkeypatch.setattr(hybrid_engine_runtime, "record_execution", _fake_record_execution)
    monkeypatch.setattr(hybrid_engine_runtime, "async_session", lambda: DummySessionContext())
    _FAKE_USAGE_CALLS.clear()
    return collection


_FAKE_USAGE_CALLS = []


async def _fake_audit_log(**kwargs):
    return "audit_1"


async def _fake_record_execution(**kwargs):
    _FAKE_USAGE_CALLS.append(kwargs)


def _build_test_app():
    app = FastAPI()
    app.add_middleware(ExecutionLoggingMiddleware)

    @app.post("/api/core/execute")
    async def protected_execute():
        return {"ok": True}

    return app


@pytest.mark.asyncio
async def test_unauthenticated_execution_is_rejected():
    middleware = ExecutionLoggingMiddleware(_build_test_app())

    async def receive():
        return {
            "type": "http.request",
            "body": b'{"prompt":"test"}',
            "more_body": False,
        }

    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/core/execute",
            "headers": [(b"content-type", b"application/json")],
            "query_string": b"",
            "client": ("127.0.0.1", 1234),
            "server": ("testserver", 80),
            "scheme": "http",
        },
        receive,
    )

    async def call_next(_request):
        raise AssertionError("call_next should not run for unauthenticated execution")

    response = await middleware.dispatch(request, call_next)
    assert response.status_code == 401
    assert json.loads(response.body)["detail"] == "Not authenticated"


@pytest.mark.asyncio
async def test_api_key_tenant_boundary_cannot_be_crossed(monkeypatch):
    team_id = "507f1f77bcf86cd799439011"
    user_id = "507f1f77bcf86cd799439012"

    async def fake_api_key_context(_authorization):
        return {
            "team_id": team_id,
            "user_id": user_id,
            "user_role": "owner",
            "api_key_id": "key_1",
            "api_key_name": "Primary",
        }

    monkeypatch.setattr(engine_context_module, "get_api_key_context", fake_api_key_context)
    monkeypatch.setattr(
        engine_context_module,
        "teams_collection",
        lambda: FakeReadCollection([{"_id": team_id, "name": "Team A", "is_active": True}]),
    )
    monkeypatch.setattr(
        engine_context_module,
        "users_collection",
        lambda: FakeReadCollection([{"_id": user_id, "email": "owner@example.com", "is_active": True}]),
    )

    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/probe",
            "headers": [
                (b"authorization", b"Bearer hic_test_key"),
                (b"x-team-id", b"507f1f77bcf86cd799439099"),
            ],
            "query_string": b"",
            "client": ("127.0.0.1", 1234),
            "server": ("testserver", 80),
            "scheme": "http",
        }
    )

    with pytest.raises(Exception) as exc_info:
        await engine_context_module.resolve_execution_context(request)
    assert getattr(exc_info.value, "status_code", None) == 403
    assert "different team" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_duplicate_idempotency_keys_do_not_rerun_and_state_survives_restart(fake_execution_store, monkeypatch):
    calls = {"count": 0}

    async def fake_generate(self, prompt, size="1024x1024", quality="hd"):
        calls["count"] += 1
        return {"adapter": "vision", "prompt": prompt, "size": size, "quality": quality}

    monkeypatch.setattr(hybrid_engine_runtime.VisionSmithCore, "generate", fake_generate)

    orchestrator_a = hybrid_engine_runtime.EngineOrchestrator()
    first = await orchestrator_a.execute(
        engine="vision_smith",
        action="generate",
        payload={"prompt": "lowrider skyline"},
        options={
            "team_id": "team_1",
            "user_id": "user_1",
            "endpoint": "/hybrid/execute/vision_smith/generate",
            "method": "POST",
            "idempotency_key": "idem_1",
            "auth_type": "api_key",
            "api_key_id": "key_1",
            "api_key_name": "Primary",
        },
    )

    orchestrator_b = hybrid_engine_runtime.EngineOrchestrator()
    second = await orchestrator_b.execute(
        engine="vision_smith",
        action="generate",
        payload={"prompt": "lowrider skyline"},
        options={
            "team_id": "team_1",
            "user_id": "user_1",
            "endpoint": "/hybrid/execute/vision_smith/generate",
            "method": "POST",
            "idempotency_key": "idem_1",
            "auth_type": "api_key",
            "api_key_id": "key_1",
            "api_key_name": "Primary",
        },
    )

    assert calls["count"] == 1
    assert len(fake_execution_store.docs) == 1
    assert first["state"] == hybrid_engine_runtime.EngineState.COMPLETED
    assert second["metadata"]["replayed"] is True
    assert second["result"]["output"]["adapter"] == "vision"
    assert len(_FAKE_USAGE_CALLS) == 1


@pytest.mark.asyncio
async def test_real_engine_adapter_is_called_and_one_authoritative_mongo_receipt_is_produced(fake_execution_store, monkeypatch):
    async def fake_generate(self, prompt, size="1024x1024", quality="hd"):
        return {"adapter": "vision", "prompt": prompt}

    monkeypatch.setattr(hybrid_engine_runtime.VisionSmithCore, "generate", fake_generate)

    orchestrator = hybrid_engine_runtime.EngineOrchestrator()
    result = await orchestrator.execute(
        engine="vision_smith",
        action="generate",
        payload={"prompt": "boulevard palms"},
        options={
            "team_id": "team_2",
            "user_id": "user_2",
            "endpoint": "/hybrid/execute/vision_smith/generate",
            "method": "POST",
            "idempotency_key": "idem_vision",
            "auth_type": "jwt",
        },
    )

    assert result["state"] == hybrid_engine_runtime.EngineState.COMPLETED
    assert result["result"]["output"]["adapter"] == "vision"
    assert len(fake_execution_store.docs) == 1
    assert fake_execution_store.docs[0]["receipt_references"]["audit_log_id"] == "audit_1"


@pytest.mark.asyncio
async def test_failures_are_recorded_without_false_verified_state(fake_execution_store, monkeypatch):
    async def fake_generate(self, prompt, size="1024x1024", quality="hd"):
        raise RuntimeError("adapter exploded")

    monkeypatch.setattr(hybrid_engine_runtime.VisionSmithCore, "generate", fake_generate)

    orchestrator = hybrid_engine_runtime.EngineOrchestrator()
    result = await orchestrator.execute(
        engine="vision_smith",
        action="generate",
        payload={"prompt": "failed skyline"},
        options={
            "team_id": "team_3",
            "user_id": "user_3",
            "endpoint": "/hybrid/execute/vision_smith/generate",
            "method": "POST",
            "idempotency_key": "idem_fail",
            "auth_type": "jwt",
        },
    )

    receipt = fake_execution_store.docs[0]
    assert result["state"] == hybrid_engine_runtime.EngineState.FAILED
    assert receipt["status"] == "error"
    assert receipt["final_state"] == "error"
    assert receipt["error_message"] == "adapter exploded"
    assert "VERIFIED" not in json.dumps(receipt, default=str)
