"""Governed CRM — public lead intake plus protected operator workflows."""

import asyncio
from datetime import datetime, timezone
from html import escape
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.core.dashboard_permissions import DashboardAuth
from database import get_database

try:
    from services.email_service import RESEND_AVAILABLE, send_email
except ImportError:
    RESEND_AVAILABLE = False

    async def send_email(*args, **kwargs):
        return None


router = APIRouter(prefix="/crm", tags=["CRM"])

PIPELINE_STAGES = [
    "lead",
    "qualified",
    "proposal",
    "negotiation",
    "onboarding",
    "active",
    "at_risk",
    "churned",
]

PRODUCT_LABELS = {
    "revenue_receipt": "Revenue Receipt",
    "revenue_sprint": "Revenue Sprint",
    "revenue_enterprise": "Enterprise Implementation",
    "southern_build": "Southern Build",
    "game_studio": "Game Studio Build",
    "sonance_music": "Sonance / Music",
    "free_demo": "Free Demo",
    "other": "Other",
}

# Keep legacy lanes visible to the private operator while new intake uses the
# product taxonomy already shown in the CRM UI.
LEGACY_REVENUE_LANES = [
    "full_stack_builds",
    "automation",
    "micro_saas",
    "white_label",
    "enterprise",
    "creative_ai",
    "admin_ops",
]
REVENUE_LANES = [*PRODUCT_LABELS.keys(), *LEGACY_REVENUE_LANES]

LEAD_SOURCES = [
    "empire1_landing",
    "southern_request",
    "revenue_os_try",
    "website",
    "referral",
    "cold_outreach",
    "conference",
    "linkedin",
    "partner",
    "existing_client",
    "other",
]

PIPELINE_VALUE_STAGES = {"qualified", "proposal", "negotiation"}
ACTIVE_REVENUE_STAGES = {"onboarding", "active"}


def _validate_lane(value: str) -> str:
    if value not in PRODUCT_LABELS:
        raise ValueError(f"Invalid product lane: {value}")
    return value


def _validate_stage(value: str) -> str:
    if value not in PIPELINE_STAGES:
        raise ValueError(f"Invalid pipeline stage: {value}")
    return value


def _safe_amount(value: object) -> float:
    try:
        return max(0.0, float(value or 0))
    except (TypeError, ValueError):
        return 0.0


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: Optional[str] = Field(default=None, max_length=160)
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=40)
    source: str = Field(default="other", max_length=80)
    lane: str = "other"
    notes: Optional[str] = Field(default=None, max_length=5000)

    @field_validator("lane")
    @classmethod
    def lane_is_known(cls, value: str) -> str:
        return _validate_lane(value)


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    company: Optional[str] = Field(default=None, max_length=160)
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=40)
    source: Optional[str] = Field(default=None, max_length=80)
    pipeline_stage: Optional[str] = None
    lane: Optional[str] = None
    value: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=5000)

    @field_validator("lane")
    @classmethod
    def lane_is_known(cls, value: Optional[str]) -> Optional[str]:
        return _validate_lane(value) if value is not None else value

    @field_validator("pipeline_stage")
    @classmethod
    def stage_is_known(cls, value: Optional[str]) -> Optional[str]:
        return _validate_stage(value) if value is not None else value


class ActivityCreate(BaseModel):
    lead_id: str = Field(min_length=1, max_length=80)
    type: str = Field(default="note", max_length=40)
    description: str = Field(min_length=1, max_length=5000)


def build_public_summary(leads: list[dict]) -> dict:
    """Return public-safe aggregates and anonymous activity.

    This function deliberately has an allowlist. Private lead fields never
    enter the returned structure.
    """

    lane_counts = {lane: 0 for lane in PRODUCT_LABELS}
    stage_counts = {stage: 0 for stage in PIPELINE_STAGES}
    pipeline_value = 0.0
    active_revenue = 0.0
    recent_activity: list[dict] = []

    for lead in leads:
        lane = lead.get("lane")
        if lane not in PRODUCT_LABELS:
            lane = "other"
        stage = lead.get("pipeline_stage", "lead")
        if stage not in PIPELINE_STAGES:
            stage = "lead"

        lane_counts[lane] += 1
        stage_counts[stage] += 1

        amount = _safe_amount(lead.get("value"))
        if stage in PIPELINE_VALUE_STAGES:
            pipeline_value += amount
        if stage in ACTIVE_REVENUE_STAGES:
            active_revenue += amount

        if len(recent_activity) < 8:
            created_at = str(lead.get("created_at") or "")
            recent_activity.append(
                {
                    "product": lane,
                    "product_label": PRODUCT_LABELS[lane],
                    "stage": stage,
                    # Date precision is enough for the public surface and
                    # avoids exposing an exact lead-arrival timestamp.
                    "date": created_at[:10] if created_at else None,
                }
            )

    return {
        "state": "live" if leads else "empty",
        "metrics": {
            "total_leads": len(leads),
            "pipeline_value": pipeline_value,
            "active_revenue": active_revenue,
            "lane_counts": lane_counts,
            "stage_counts": stage_counts,
        },
        "recent_activity": recent_activity,
    }


@router.get("/public-summary")
async def get_public_summary():
    """Public, anonymous proof surface used by empire1.cloud."""

    db = get_database()
    cursor = db.crm_leads.find(
        {},
        {
            "_id": 0,
            "lane": 1,
            "pipeline_stage": 1,
            "value": 1,
            "created_at": 1,
        },
    ).sort("updated_at", -1).limit(500)
    leads = await cursor.to_list(500)
    summary = build_public_summary(leads)
    summary["generated_at"] = datetime.now(timezone.utc).isoformat()
    return {"success": True, **summary}


@router.get("/pipeline")
async def get_pipeline(
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    cursor = db.crm_leads.find({}, {"_id": 0}).sort("updated_at", -1).limit(200)
    leads = await cursor.to_list(200)
    return {"success": True, "leads": leads, "stages": PIPELINE_STAGES}


@router.get("/pipeline/stage/{stage}")
async def get_pipeline_by_stage(
    stage: str,
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    if stage not in PIPELINE_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")
    db = get_database()
    cursor = db.crm_leads.find(
        {"pipeline_stage": stage}, {"_id": 0}
    ).sort("value", -1)
    leads = await cursor.to_list(100)
    return {"success": True, "leads": leads}


@router.post("/leads")
async def create_lead(lead: LeadCreate):
    """Public lead intake. Operator-only fields are not accepted here."""

    db = get_database()
    doc = lead.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["pipeline_stage"] = "lead"
    doc["value"] = 0.0
    doc["probability"] = 10
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.crm_leads.insert_one(doc)
    doc.pop("_id", None)

    if doc.get("email") and RESEND_AVAILABLE:
        asyncio.create_task(_send_lead_confirmation(doc))

    return {"success": True, "lead": doc}


async def _send_lead_confirmation(lead: dict):
    """Fire-and-forget confirmation email after a lead is created."""

    name = escape(str(lead.get("name") or "there"))
    source = escape(str(lead.get("source") or "the form").replace("_", " "))
    notes = escape(str(lead.get("notes") or ""))[:500].replace("\n", "<br>")

    product_labels = {
        **PRODUCT_LABELS,
        "revenue_receipt": "Revenue Receipt ($299)",
        "revenue_sprint": "Revenue Sprint ($999)",
    }
    product = escape(product_labels.get(lead.get("lane", ""), "our platform"))

    notes_block = ""
    if notes:
        notes_block = (
            "<div style='background:#0d0d12;border:1px solid "
            "rgba(255,255,255,.07);border-radius:8px;padding:24px;"
            "margin-bottom:24px;'><p style='font-family:JetBrains Mono,"
            "monospace;font-size:9px;letter-spacing:3px;color:#555;"
            "text-transform:uppercase;margin:0 0 8px;'>Your Message</p>"
            f"<p style='font-size:13px;color:#c8c8d0;margin:0;'>{notes}</p>"
            "</div>"
        )

    html = f"""
    <div style="font-family:Inter,sans-serif;background:#050508;color:#e0e0e0;padding:40px;max-width:560px;margin:0 auto;">
      <div style="margin-bottom:24px;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;">Empire 1</span>
      </div>
      <h2 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 8px;">We got your request, {name}.</h2>
      <p style="font-size:14px;color:#777;margin:0 0 24px;">You reached out via <strong style="color:#e0e0e0;">{source}</strong>.</p>
      <div style="background:#0d0d12;border:1px solid rgba(212,175,55,.2);border-radius:8px;padding:24px;margin-bottom:24px;">
        <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:3px;color:#D4AF37;text-transform:uppercase;margin:0 0 8px;">Product Interest</p>
        <p style="font-size:16px;font-weight:700;color:#fff;margin:0;">{product}</p>
      </div>
      {notes_block}
      <p style="font-size:13px;color:#555;line-height:1.7;">We'll be in touch shortly. In the meantime, try the <a href="https://empire1.cloud/try-revenue-os" style="color:#D4AF37;">free Revenue OS demo</a> — no account needed.</p>
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);">
        <p style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:#333;text-transform:uppercase;">Empire 1 · empire1.cloud · founder@empire1.cloud</p>
      </div>
    </div>
    """
    await send_email(
        to_email=lead["email"],
        subject="Empire 1 — We got your request",
        html_content=html,
    )


@router.get("/leads/{lead_id}")
async def get_lead(
    lead_id: str,
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    lead = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    activities = await db.crm_activities.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return {"success": True, "lead": lead, "activities": activities}


@router.put("/leads/{lead_id}")
async def update_lead(
    lead_id: str,
    update: LeadUpdate,
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    existing = await db.crm_leads.find_one({"id": lead_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")

    changes = {key: value for key, value in update.model_dump().items() if value is not None}
    if not changes:
        existing.pop("_id", None)
        return {"success": True, "lead": existing}

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.crm_leads.update_one({"id": lead_id}, {"$set": changes})
    updated = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    return {"success": True, "lead": updated}


@router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: str,
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    result = await db.crm_leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.crm_activities.delete_many({"lead_id": lead_id})
    return {"success": True}


@router.post("/activities")
async def add_activity(
    activity: ActivityCreate,
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    lead = await db.crm_leads.find_one({"id": activity.lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    doc = activity.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["timestamp"] = datetime.now(timezone.utc).isoformat()
    await db.crm_activities.insert_one(doc)
    return {"success": True, "activity": doc}


@router.get("/metrics")
async def crm_metrics(
    _operator: dict = Depends(DashboardAuth.require_operator),
):
    db = get_database()
    cursor = db.crm_leads.find(
        {}, {"_id": 0, "pipeline_stage": 1, "value": 1, "lane": 1}
    )
    leads = await cursor.to_list(500)

    stage_counts = {stage: 0 for stage in PIPELINE_STAGES}
    lane_counts = {lane: 0 for lane in REVENUE_LANES}
    total_pipeline_value = 0.0

    for lead in leads:
        stage = lead.get("pipeline_stage", "lead")
        if stage in stage_counts:
            stage_counts[stage] += 1
        lane = lead.get("lane")
        if lane in lane_counts:
            lane_counts[lane] += 1
        if stage in PIPELINE_VALUE_STAGES | {"onboarding"}:
            total_pipeline_value += _safe_amount(lead.get("value"))

    return {
        "success": True,
        "metrics": {
            "total_leads": len(leads),
            "total_pipeline_value": total_pipeline_value,
            "stage_counts": stage_counts,
            "lane_counts": lane_counts,
        },
    }
