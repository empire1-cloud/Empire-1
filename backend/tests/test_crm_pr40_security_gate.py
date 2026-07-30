"""Security gate for Empire-1 PR #40.

This test imports the real CRM, Business Analytics, and GTM routers from the
branch, but replaces MongoDB with an in-memory fake. It is intentionally a
release gate: the current unprotected implementation must fail until every
internal route is authenticated and tenant-scoped.
"""

from __future__ import annotations

import copy
import importlib
import os
import sys
import types
from dataclasses import dataclass
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from pydantic import ValidationError


@dataclass
class _WriteResult:
    modified_count: int = 1
    deleted_count: int = 1


class FakeCursor:
    def __init__(self, docs: list[dict[str, Any]]):
        self.docs = [copy.deepcopy(doc) for doc in docs]
        self._iter = None

    def sort(self, *args, **kwargs):
        return self

    def limit(self, value: int):
        self.docs = self.docs[:value]
        return self

    async def to_list(self, length: int):
        return [copy.deepcopy(doc) for doc in self.docs[:length]]

    def __aiter__(self):
        self._iter = iter(self.docs)
        return self

    async def __anext__(self):
        try:
            return copy.deepcopy(next(self._iter))
        except StopIteration as exc:
            raise StopAsyncIteration from exc


def _matches_value(actual: Any, expected: Any, present: bool) -> bool:
    if not isinstance(expected, dict):
        return actual == expected
    for operator, value in expected.items():
        if operator == "$exists" and present != bool(value):
            return False
        if operator == "$in" and actual not in value:
            return False
        if operator == "$nin" and actual in value:
            return False
        if operator == "$ne" and actual == value:
            return False
        if operator == "$lte" and (actual is None or actual > value):
            return False
    return True


def _matches(doc: dict[str, Any], query: dict[str, Any]) -> bool:
    for key, expected in query.items():
        if key == "$or":
            if not any(_matches(doc, option) for option in expected):
                return False
            continue
        present = key in doc
        if not _matches_value(doc.get(key), expected, present):
            return False
    return True


class FakeCollection:
    def __init__(self, docs: list[dict[str, Any]] | None = None):
        self.docs = [copy.deepcopy(doc) for doc in (docs or [])]

    async def create_index(self, *args, **kwargs):
        return "fake-index"

    def find(self, query=None, projection=None):
        query = query or {}
        return FakeCursor([doc for doc in self.docs if _matches(doc, query)])

    async def find_one(self, query, projection=None):
        for doc in self.docs:
            if _matches(doc, query):
                return copy.deepcopy(doc)
        return None

    async def count_documents(self, query):
        return sum(1 for doc in self.docs if _matches(doc, query or {}))

    async def insert_one(self, doc):
        self.docs.append(copy.deepcopy(doc))
        return _WriteResult()

    async def update_one(self, query, update):
        for doc in self.docs:
            if _matches(doc, query):
                for key, value in update.get("$set", {}).items():
                    doc[key] = copy.deepcopy(value)
                return _WriteResult(modified_count=1)
        return _WriteResult(modified_count=0)

    async def delete_one(self, query):
        for index, doc in enumerate(self.docs):
            if _matches(doc, query):
                self.docs.pop(index)
                return _WriteResult(deleted_count=1)
        return _WriteResult(deleted_count=0)

    async def delete_many(self, query):
        before = len(self.docs)
        self.docs = [doc for doc in self.docs if not _matches(doc, query)]
        return _WriteResult(deleted_count=before - len(self.docs))


class FakeDatabase:
    def __init__(self):
        self.crm_leads = FakeCollection([
            {
                "id": "lead-a",
                "tenant_id": "tenant-a",
                "name": "Tenant A Lead",
                "pipeline_stage": "active",
                "value": 1000,
                "email_verification_status": "unverified",
                "updated_at": "2026-07-30T00:00:00+00:00",
            },
            {
                "id": "lead-b",
                "tenant_id": "tenant-b",
                "name": "Tenant B Lead",
                "pipeline_stage": "active",
                "value": 9000,
                "email_verification_status": "unverified",
                "updated_at": "2026-07-30T00:00:00+00:00",
            },
        ])
        self.crm_activities = FakeCollection()
        self.crm_receipts = FakeCollection()
        self.gtm_campaigns = FakeCollection([
            {"id": "campaign-a", "tenant_id": "tenant-a", "name": "A", "created_at": "2026-07-30"},
            {"id": "campaign-b", "tenant_id": "tenant-b", "name": "B", "created_at": "2026-07-30"},
        ])
        self.gtm_outreach_steps = FakeCollection()
        self.gtm_launch_checklists = FakeCollection()
        self.gtm_viral_audit_packs = FakeCollection()
        self.users = FakeCollection()
        self.execution_logs = FakeCollection()
        self.pipelines = FakeCollection()
        self.teams = FakeCollection()
        self.team_invites = FakeCollection()


fake_db = FakeDatabase()

# Install only the external surfaces the real router modules need.
database_module = types.ModuleType("database")
database_module.get_database = lambda: fake_db
sys.modules["database"] = database_module

email_module = types.ModuleType("services.email_service")
email_module.RESEND_AVAILABLE = False

async def _send_email(*args, **kwargs):
    return None

email_module.send_email = _send_email
sys.modules["services.email_service"] = email_module

os.environ["CRM_INTEGRATION_KEY"] = "test-integration-key"

crm = importlib.import_module("app.routers.crm")
business_analytics = importlib.import_module("app.routers.business_analytics")
gtm = importlib.import_module("app.routers.gtm")
crm._INDEXES_READY = True

app = FastAPI()
app.include_router(crm.router, prefix="/api")
app.include_router(business_analytics.router, prefix="/api")
app.include_router(gtm.router, prefix="/api")
client = TestClient(app)

AUTH_HEADERS_A = {"Authorization": "Bearer test-token", "X-Team-ID": "tenant-a"}


def _dependency_names(route: APIRoute) -> set[str]:
    return {
        getattr(dependency.call, "__name__", dependency.call.__class__.__name__)
        for dependency in route.dependant.dependencies
    }


def _route(path: str, method: str) -> APIRoute:
    for route in app.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    pytest.fail(f"Missing route: {method} {path}")


@pytest.mark.parametrize(
    "path",
    [
        "/api/crm/pipeline",
        "/api/crm/metrics",
        "/api/business-analytics/revenue",
        "/api/gtm/campaigns",
    ],
)
def test_internal_reads_require_authentication(path: str):
    response = client.get(path)
    assert response.status_code == 401, response.text


def test_pipeline_is_tenant_scoped():
    response = client.get("/api/crm/pipeline", headers=AUTH_HEADERS_A)
    assert response.status_code == 200, response.text
    leads = response.json()["leads"]
    assert [lead["id"] for lead in leads] == ["lead-a"]


def test_revenue_is_tenant_scoped():
    response = client.get("/api/business-analytics/revenue", headers=AUTH_HEADERS_A)
    assert response.status_code == 200, response.text
    assert response.json()["total_mrr"] == 1000
    assert response.json()["active_clients"] == 1


def test_gtm_campaigns_are_tenant_scoped():
    response = client.get("/api/gtm/campaigns", headers=AUTH_HEADERS_A)
    assert response.status_code == 200, response.text
    campaigns = response.json()["campaigns"]
    assert [campaign["id"] for campaign in campaigns] == ["campaign-a"]


def test_new_leads_default_to_unverified():
    lead = crm.LeadCreate(name="New Lead", email="lead@example.com")
    assert lead.email_verification_status == "unverified"


def test_create_model_rejects_preverified_lead():
    with pytest.raises(ValidationError):
        crm.LeadCreate(
            name="Preverified Lead",
            email="lead@example.com",
            email_verification_status="verified",
        )


def test_general_update_surface_cannot_verify_lead():
    assert "email_verification_status" not in crm.LeadUpdate.model_fields


def test_dedicated_lead_verification_route_exists():
    route = _route("/api/crm/verify/{lead_id}", "POST")
    names = _dependency_names(route)
    assert "get_engine_context" in names


def test_integration_import_requires_auth_tenant_and_integration_key():
    route = _route("/api/crm/integrations/prospects/import", "POST")
    names = _dependency_names(route)
    assert "require_integration_key" in names
    assert "get_engine_context" in names


def test_every_internal_route_has_tenant_auth_dependency():
    unprotected: list[str] = []
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        if not route.path.startswith(("/api/crm", "/api/business-analytics", "/api/gtm")):
            continue
        names = _dependency_names(route)
        if "get_engine_context" not in names:
            methods = ",".join(sorted(route.methods or []))
            unprotected.append(f"{methods} {route.path}")
    assert unprotected == [], "Unprotected internal routes:\n" + "\n".join(unprotected)
