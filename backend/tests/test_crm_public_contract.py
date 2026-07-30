import json

import pytest
from pydantic import ValidationError

from app.routers.crm import (
    LeadCreate,
    build_public_summary,
    router,
)


def test_public_summary_is_anonymous_and_truthful():
    leads = [
        {
            "id": "private-id",
            "name": "Private Name",
            "email": "private@example.com",
            "phone": "555-0100",
            "notes": "private note",
            "lane": "revenue_receipt",
            "pipeline_stage": "proposal",
            "value": 299,
            "created_at": "2026-07-26T14:01:33+00:00",
        }
    ]

    summary = build_public_summary(leads)
    encoded = json.dumps(summary)

    assert summary["state"] == "live"
    assert summary["metrics"]["total_leads"] == 1
    assert summary["metrics"]["pipeline_value"] == 299
    assert summary["recent_activity"] == [
        {
            "product": "revenue_receipt",
            "product_label": "Revenue Receipt",
            "stage": "proposal",
            "date": "2026-07-26",
        }
    ]
    for private_value in (
        "private-id",
        "Private Name",
        "private@example.com",
        "555-0100",
        "private note",
    ):
        assert private_value not in encoded


def test_public_summary_has_real_empty_state():
    summary = build_public_summary([])

    assert summary["state"] == "empty"
    assert summary["metrics"]["total_leads"] == 0
    assert summary["recent_activity"] == []


def test_lead_intake_records_the_selected_product_lane():
    lead = LeadCreate(
        name="Creator",
        source="empire1_landing",
        lane="sonance_music",
    )

    assert lead.lane == "sonance_music"


def test_lead_intake_rejects_unknown_product_lanes():
    with pytest.raises(ValidationError):
        LeadCreate(name="Creator", lane="made_up_product")


def test_private_crm_routes_require_operator_auth():
    protected = {
        ("/crm/pipeline", "GET"),
        ("/crm/pipeline/stage/{stage}", "GET"),
        ("/crm/leads/{lead_id}", "GET"),
        ("/crm/leads/{lead_id}", "PUT"),
        ("/crm/leads/{lead_id}", "DELETE"),
        ("/crm/activities", "POST"),
        ("/crm/metrics", "GET"),
    }

    discovered = set()
    for route in router.routes:
        for method in route.methods or set():
            key = (route.path, method)
            if key in protected:
                discovered.add(key)
                assert route.dependant.dependencies, f"{method} {route.path} is public"

    assert discovered == protected


def test_public_contract_routes_remain_public():
    public = {
        ("/crm/public-summary", "GET"),
        ("/crm/leads", "POST"),
    }

    discovered = set()
    for route in router.routes:
        for method in route.methods or set():
            key = (route.path, method)
            if key in public:
                discovered.add(key)
                assert not route.dependant.dependencies

    assert discovered == public
