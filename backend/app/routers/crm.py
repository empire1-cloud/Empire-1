"""Empire-1 CRM — verified prospecting, deal pipeline, follow-ups, and evidence receipts.

This module preserves the existing CRM API while adding the bridge FABLE-5 and
other prospecting agents need. The bridge never invents contacts: imported
prospects must carry a public source URL and evidence note, and contact methods
remain explicitly unverified until a verifier says otherwise.
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Literal, Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel, Field

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

PROBABILITY_BY_STAGE = {
    "lead": 10,
    "qualified": 30,
    "proposal": 50,
    "negotiation": 70,
    "onboarding": 90,
    "active": 100,
    "at_risk": 50,
    "churned": 0,
}

ALLOWED_STAGE_TRANSITIONS = {
    "lead": {"qualified", "churned"},
    "qualified": {"lead", "proposal", "churned"},
    "proposal": {"qualified", "negotiation", "churned"},
    "negotiation": {"proposal", "onboarding", "churned"},
    "onboarding": {"active", "at_risk", "churned"},
    "active": {"at_risk", "churned"},
    "at_risk": {"active", "churned"},
    "churned": {"lead"},
}

REVENUE_LANES = [
    "full_stack_builds",
    "automation",
    "micro_saas",
    "white_label",
    "enterprise",
    "creative_ai",
    "admin_ops",
    "receipts",
    "other",
]

LEAD_SOURCES = [
    "website",
    "referral",
    "cold_outreach",
    "conference",
    "linkedin",
    "partner",
    "existing_client",
    "public_web",
    "fable",
    "other",
]

LEAD_TYPES = [
    "prospect",
    "investor",
    "creator",
    "customer",
    "partner",
    "tenant",
    "vendor",
    "other",
]

EMAIL_VERIFICATION_STATES = ["unknown", "unverified", "verified", "bounced"]
RECEIPT_STATES = ["receipted", "verified", "contradicted"]
RECEIPT_EVENT_TYPES = [
    "prospect_discovered",
    "prospect_enriched",
    "outreach_approved",
    "outreach_sent",
    "reply_received",
    "meeting_booked",
    "proposal_sent",
    "payment_verified",
    "stage_changed",
    "follow_up_completed",
]

_INDEXES_READY = False
_INDEX_LOCK = asyncio.Lock()


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_email(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None


def normalize_domain(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    candidate = value.strip().lower()
    if not candidate:
        return None
    if "://" not in candidate:
        candidate = f"https://{candidate}"
    parsed = urlparse(candidate)
    host = (parsed.hostname or "").lower().strip(".")
    if host.startswith("www."):
        host = host[4:]
    return host or None


def normalize_text(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def lead_fingerprint(
    *,
    name: str,
    company: Optional[str],
    email: Optional[str],
    domain: Optional[str],
    external_id: Optional[str] = None,
) -> str:
    identity = "|".join(
        [
            normalize_text(external_id),
            normalize_email(email) or "",
            normalize_domain(domain) or "",
            normalize_text(company),
            normalize_text(name),
        ]
    )
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()


def evidence_hash(payload: Any) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def validate_choice(value: Optional[str], allowed: list[str], field_name: str) -> None:
    if value is not None and value not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {field_name}: {value}. Allowed: {', '.join(allowed)}",
        )


def validate_stage_transition(current: str, target: str) -> None:
    if current == target:
        return
    if target not in ALLOWED_STAGE_TRANSITIONS.get(current, set()):
        raise HTTPException(
            status_code=409,
            detail=f"Invalid stage transition: {current} -> {target}",
        )


async def ensure_crm_indexes() -> None:
    global _INDEXES_READY
    if _INDEXES_READY:
        return
    async with _INDEX_LOCK:
        if _INDEXES_READY:
            return
        db = get_database()
        await db.crm_leads.create_index("id", unique=True)
        await db.crm_leads.create_index("fingerprint")
        await db.crm_leads.create_index("normalized_email", sparse=True)
        await db.crm_leads.create_index("company_domain")
        await db.crm_leads.create_index([("pipeline_stage", 1), ("updated_at", -1)])
        await db.crm_leads.create_index([("next_action_at", 1), ("archived_at", 1)])
        await db.crm_activities.create_index("id", unique=True)
        await db.crm_activities.create_index([("lead_id", 1), ("timestamp", -1)])
        await db.crm_receipts.create_index("id", unique=True)
        await db.crm_receipts.create_index([("lead_id", 1), ("timestamp", -1)])
        await db.crm_receipts.create_index("idempotency_key", unique=True, sparse=True)
        await db.crm_receipts.create_index([("event_type", 1), ("status", 1)])
        _INDEXES_READY = True


async def require_integration_key(
    x_crm_integration_key: Optional[str] = Header(default=None),
) -> None:
    configured = os.environ.get("CRM_INTEGRATION_KEY", "")
    if not configured:
        raise HTTPException(
            status_code=503,
            detail="CRM integration is disabled until CRM_INTEGRATION_KEY is configured",
        )
    if not x_crm_integration_key or not hmac.compare_digest(
        x_crm_integration_key, configured
    ):
        raise HTTPException(status_code=401, detail="Invalid CRM integration key")


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    company: Optional[str] = Field(default=None, max_length=200)
    title: Optional[str] = Field(default=None, max_length=200)
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=80)
    website: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    persona: Optional[str] = Field(default=None, max_length=200)
    lead_type: str = "prospect"
    source: str = "other"
    lane: Optional[str] = None
    value: float = Field(default=0.0, ge=0)
    notes: Optional[str] = Field(default=None, max_length=5000)
    tags: list[str] = Field(default_factory=list)
    assigned_to: Optional[str] = Field(default=None, max_length=200)
    next_action: Optional[str] = Field(default=None, max_length=500)
    next_action_at: Optional[datetime] = None
    source_url: Optional[str] = Field(default=None, max_length=1000)
    source_evidence: Optional[str] = Field(default=None, max_length=5000)
    email_verification_status: str = "unknown"
    external_id: Optional[str] = Field(default=None, max_length=300)
    source_system: Optional[str] = Field(default=None, max_length=100)


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    company: Optional[str] = Field(default=None, max_length=200)
    title: Optional[str] = Field(default=None, max_length=200)
    email: Optional[str] = Field(default=None, max_length=320)
    phone: Optional[str] = Field(default=None, max_length=80)
    website: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    persona: Optional[str] = Field(default=None, max_length=200)
    lead_type: Optional[str] = None
    source: Optional[str] = None
    pipeline_stage: Optional[str] = None
    lane: Optional[str] = None
    value: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None, max_length=5000)
    tags: Optional[list[str]] = None
    assigned_to: Optional[str] = Field(default=None, max_length=200)
    next_action: Optional[str] = Field(default=None, max_length=500)
    next_action_at: Optional[datetime] = None
    source_url: Optional[str] = Field(default=None, max_length=1000)
    source_evidence: Optional[str] = Field(default=None, max_length=5000)
    email_verification_status: Optional[str] = None
    external_id: Optional[str] = Field(default=None, max_length=300)
    source_system: Optional[str] = Field(default=None, max_length=100)


class ActivityCreate(BaseModel):
    lead_id: str
    type: str = "note"
    description: str = Field(min_length=1, max_length=5000)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ReceiptCreate(BaseModel):
    lead_id: str
    event_type: str
    source_system: str = "empire1"
    actor: str = "system"
    evidence_ref: str = Field(min_length=1, max_length=2000)
    evidence_payload: dict[str, Any] = Field(default_factory=dict)
    idempotency_key: Optional[str] = Field(default=None, max_length=300)


class ReceiptVerification(BaseModel):
    reproduction_status: Literal["passed", "failed"]
    verifier: str = Field(min_length=1, max_length=200)
    evidence_ref: str = Field(min_length=1, max_length=2000)
    notes: Optional[str] = Field(default=None, max_length=5000)
    idempotency_key: Optional[str] = Field(default=None, max_length=300)


class ProspectImportItem(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    title: Optional[str] = Field(default=None, max_length=200)
    persona: Optional[str] = Field(default=None, max_length=200)
    domain: Optional[str] = Field(default=None, max_length=500)
    website: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    contact_email: Optional[str] = Field(default=None, max_length=320)
    email_verification_status: str = "unknown"
    source_url: str = Field(min_length=1, max_length=1000)
    source_evidence: str = Field(min_length=1, max_length=5000)
    outreach_angle: Optional[str] = Field(default=None, max_length=2000)
    lane: str = "receipts"
    estimated_value: float = Field(default=0.0, ge=0)
    tags: list[str] = Field(default_factory=list)
    external_id: Optional[str] = Field(default=None, max_length=300)


class ProspectImportRequest(BaseModel):
    source_system: str = Field(default="fable", min_length=1, max_length=100)
    batch_id: str = Field(min_length=1, max_length=200)
    prospects: list[ProspectImportItem] = Field(min_length=1, max_length=200)


class FollowUpComplete(BaseModel):
    description: str = Field(min_length=1, max_length=5000)
    next_action: Optional[str] = Field(default=None, max_length=500)
    next_action_at: Optional[datetime] = None
    evidence_ref: Optional[str] = Field(default=None, max_length=2000)


def serialize_datetime(value: Optional[datetime]) -> Optional[str]:
    return value.astimezone(timezone.utc).isoformat() if value else None


async def create_receipt_document(
    *,
    lead_id: str,
    event_type: str,
    source_system: str,
    actor: str,
    evidence_ref: str,
    evidence_payload: dict[str, Any],
    idempotency_key: Optional[str] = None,
    status: str = "receipted",
    parent_receipt_id: Optional[str] = None,
) -> dict[str, Any]:
    validate_choice(event_type, RECEIPT_EVENT_TYPES + [
        f"{event}.verification" for event in RECEIPT_EVENT_TYPES
    ], "receipt event type")
    validate_choice(status, RECEIPT_STATES, "receipt status")

    db = get_database()
    if idempotency_key:
        existing = await db.crm_receipts.find_one(
            {"idempotency_key": idempotency_key}, {"_id": 0}
        )
        if existing:
            return existing

    timestamp = utc_now_iso()
    payload = {
        "lead_id": lead_id,
        "event_type": event_type,
        "source_system": source_system,
        "actor": actor,
        "evidence_ref": evidence_ref,
        "evidence_payload": evidence_payload,
        "timestamp": timestamp,
        "parent_receipt_id": parent_receipt_id,
    }
    doc = {
        "id": str(uuid.uuid4()),
        **payload,
        "status": status,
        "evidence_hash": evidence_hash(payload),
        "idempotency_key": idempotency_key,
    }
    await db.crm_receipts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.get("/integrations/manifest", dependencies=[Depends(require_integration_key)])
async def integration_manifest():
    return {
        "name": "Empire-1 Verified Prospecting Bridge",
        "schema_version": "1.0.0",
        "capabilities": [
            "import_grounded_prospects",
            "deduplicate_leads",
            "queue_follow_ups",
            "read_outreach_ready_contacts",
            "append_evidence_receipts",
            "independently_verify_receipts",
        ],
        "policies": {
            "fabricated_contacts": "forbidden",
            "public_source_required": True,
            "email_verification_is_explicit": True,
            "receipts_are_append_only": True,
            "verified_requires_independent_reproduction": True,
        },
        "pipeline_stages": PIPELINE_STAGES,
        "receipt_events": RECEIPT_EVENT_TYPES,
    }


@router.get("/pipeline")
async def get_pipeline(include_archived: bool = False):
    await ensure_crm_indexes()
    db = get_database()
    query = {} if include_archived else {"archived_at": {"$exists": False}}
    cursor = db.crm_leads.find(query, {"_id": 0}).sort("updated_at", -1).limit(500)
    leads = await cursor.to_list(500)
    return {"success": True, "leads": leads, "stages": PIPELINE_STAGES}


@router.get("/pipeline/stage/{stage}")
async def get_pipeline_by_stage(stage: str):
    validate_choice(stage, PIPELINE_STAGES, "stage")
    await ensure_crm_indexes()
    db = get_database()
    cursor = db.crm_leads.find(
        {"pipeline_stage": stage, "archived_at": {"$exists": False}},
        {"_id": 0},
    ).sort("value", -1)
    leads = await cursor.to_list(250)
    return {"success": True, "leads": leads}


@router.post("/leads")
async def create_lead(lead: LeadCreate):
    validate_choice(lead.source, LEAD_SOURCES, "source")
    validate_choice(lead.lead_type, LEAD_TYPES, "lead type")
    validate_choice(lead.lane, REVENUE_LANES, "lane")
    validate_choice(
        lead.email_verification_status,
        EMAIL_VERIFICATION_STATES,
        "email verification status",
    )
    await ensure_crm_indexes()
    db = get_database()

    normalized_email = normalize_email(lead.email)
    company_domain = normalize_domain(lead.website)
    fingerprint = lead_fingerprint(
        name=lead.name,
        company=lead.company,
        email=normalized_email,
        domain=company_domain,
        external_id=lead.external_id,
    )

    duplicate_query: dict[str, Any] = {"fingerprint": fingerprint}
    if normalized_email:
        duplicate_query = {
            "$or": [
                {"normalized_email": normalized_email},
                {"fingerprint": fingerprint},
            ]
        }
    existing = await db.crm_leads.find_one(duplicate_query, {"_id": 0})
    if existing:
        raise HTTPException(
            status_code=409,
            detail={"message": "Lead already exists", "lead_id": existing["id"]},
        )

    doc = lead.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["email"] = normalized_email
    doc["normalized_email"] = normalized_email
    doc["company_domain"] = company_domain
    doc["fingerprint"] = fingerprint
    doc["pipeline_stage"] = "lead"
    doc["probability"] = PROBABILITY_BY_STAGE["lead"]
    doc["next_action_at"] = serialize_datetime(lead.next_action_at)
    doc["created_at"] = utc_now_iso()
    doc["updated_at"] = doc["created_at"]
    await db.crm_leads.insert_one(doc)
    doc.pop("_id", None)

    if doc.get("source_url"):
        await create_receipt_document(
            lead_id=doc["id"],
            event_type="prospect_discovered",
            source_system=doc.get("source_system") or "empire1",
            actor="crm",
            evidence_ref=doc["source_url"],
            evidence_payload={
                "source_evidence": doc.get("source_evidence"),
                "company": doc.get("company"),
                "title": doc.get("title"),
            },
            idempotency_key=f"lead-created:{doc['id']}",
        )

    if doc.get("email") and RESEND_AVAILABLE:
        asyncio.create_task(_send_lead_confirmation(doc))

    return {"success": True, "lead": doc}


async def _send_lead_confirmation(lead: dict):
    """Fire-and-forget confirmation email after a lead is created."""
    name = lead.get("name", "there")
    source = lead.get("source", "the form").replace("_", " ")
    notes = lead.get("notes", "")

    product_labels = {
        "revenue_receipt": "Revenue Receipt ($299)",
        "revenue_sprint": "Revenue Sprint ($999)",
        "revenue_enterprise": "Enterprise Implementation",
        "southern_build": "Southern Lyfestyle Build",
        "game_studio": "Game Studio Build",
        "sonance_music": "Sonance / Music Production",
        "free_demo": "Free Demo",
        "receipts": "Receipts — Verified Agent Work",
    }
    product = product_labels.get(lead.get("lane", ""), "our platform")

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
      {"<div style='background:#0d0d12;border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:24px;margin-bottom:24px;'><p style='font-family:JetBrains Mono,monospace;font-size:9px;letter-spacing:3px;color:#555;text-transform:uppercase;margin:0 0 8px;'>Your Message</p><p style='font-size:13px;color:#c8c8d0;margin:0;white-space:pre-wrap;'>" + notes[:500] + "</p></div>" if notes else ""}
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
async def get_lead(lead_id: str):
    await ensure_crm_indexes()
    db = get_database()
    lead = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    activities = await db.crm_activities.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(250)
    receipts = await db.crm_receipts.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(250)
    return {
        "success": True,
        "lead": lead,
        "activities": activities,
        "receipts": receipts,
    }


@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate):
    await ensure_crm_indexes()
    db = get_database()
    existing = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")

    payload = update.model_dump()
    changes = {key: value for key, value in payload.items() if value is not None}
    if not changes:
        return {"success": True, "lead": existing}

    validate_choice(changes.get("source"), LEAD_SOURCES, "source")
    validate_choice(changes.get("lead_type"), LEAD_TYPES, "lead type")
    validate_choice(changes.get("lane"), REVENUE_LANES, "lane")
    validate_choice(
        changes.get("email_verification_status"),
        EMAIL_VERIFICATION_STATES,
        "email verification status",
    )

    stage_changed = False
    old_stage = existing.get("pipeline_stage", "lead")
    new_stage = changes.get("pipeline_stage")
    if new_stage is not None:
        validate_choice(new_stage, PIPELINE_STAGES, "pipeline stage")
        validate_stage_transition(old_stage, new_stage)
        changes["probability"] = PROBABILITY_BY_STAGE[new_stage]
        stage_changed = old_stage != new_stage

    if "email" in changes:
        changes["email"] = normalize_email(changes["email"])
        changes["normalized_email"] = changes["email"]
    if "website" in changes:
        changes["company_domain"] = normalize_domain(changes["website"])
    if "next_action_at" in changes:
        changes["next_action_at"] = serialize_datetime(changes["next_action_at"])

    fingerprint_fields = {
        "name": changes.get("name", existing.get("name", "")),
        "company": changes.get("company", existing.get("company")),
        "email": changes.get("normalized_email", existing.get("normalized_email")),
        "domain": changes.get("company_domain", existing.get("company_domain")),
        "external_id": changes.get("external_id", existing.get("external_id")),
    }
    changes["fingerprint"] = lead_fingerprint(**fingerprint_fields)
    changes["updated_at"] = utc_now_iso()

    await db.crm_leads.update_one({"id": lead_id}, {"$set": changes})
    updated = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})

    if stage_changed:
        await create_receipt_document(
            lead_id=lead_id,
            event_type="stage_changed",
            source_system="empire1",
            actor="crm",
            evidence_ref=f"crm://leads/{lead_id}",
            evidence_payload={"from": old_stage, "to": new_stage},
            idempotency_key=f"stage:{lead_id}:{old_stage}:{new_stage}:{changes['updated_at']}",
        )
        await _append_activity(
            lead_id=lead_id,
            activity_type="stage_changed",
            description=f"Pipeline stage changed from {old_stage} to {new_stage}",
            metadata={"from": old_stage, "to": new_stage},
        )

    return {"success": True, "lead": updated}


@router.delete("/leads/{lead_id}")
async def archive_lead(lead_id: str):
    """Soft archive a lead; evidence and activity history are preserved."""
    await ensure_crm_indexes()
    db = get_database()
    timestamp = utc_now_iso()
    result = await db.crm_leads.update_one(
        {"id": lead_id, "archived_at": {"$exists": False}},
        {"$set": {"archived_at": timestamp, "updated_at": timestamp}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found or already archived")
    await _append_activity(
        lead_id=lead_id,
        activity_type="archived",
        description="Lead archived; history preserved",
        metadata={},
    )
    return {"success": True, "archived": True}


async def _append_activity(
    *,
    lead_id: str,
    activity_type: str,
    description: str,
    metadata: dict[str, Any],
) -> dict[str, Any]:
    db = get_database()
    doc = {
        "id": str(uuid.uuid4()),
        "lead_id": lead_id,
        "type": activity_type,
        "description": description,
        "metadata": metadata,
        "timestamp": utc_now_iso(),
    }
    await db.crm_activities.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.post("/activities")
async def add_activity(activity: ActivityCreate):
    await ensure_crm_indexes()
    db = get_database()
    lead = await db.crm_leads.find_one({"id": activity.lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    doc = await _append_activity(
        lead_id=activity.lead_id,
        activity_type=activity.type,
        description=activity.description,
        metadata=activity.metadata,
    )
    return {"success": True, "activity": doc}


@router.post("/receipts", dependencies=[Depends(require_integration_key)])
async def add_receipt(receipt: ReceiptCreate):
    await ensure_crm_indexes()
    db = get_database()
    lead = await db.crm_leads.find_one({"id": receipt.lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    doc = await create_receipt_document(**receipt.model_dump())
    return {"success": True, "receipt": doc}


@router.post(
    "/receipts/{receipt_id}/verify",
    dependencies=[Depends(require_integration_key)],
)
async def verify_receipt(receipt_id: str, verification: ReceiptVerification):
    """Append an independent verification receipt; never mutate the original."""
    await ensure_crm_indexes()
    db = get_database()
    original = await db.crm_receipts.find_one({"id": receipt_id}, {"_id": 0})
    if not original:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if original.get("status") != "receipted":
        raise HTTPException(
            status_code=409,
            detail="Only a receipted event can receive an independent verification",
        )

    status = (
        "verified" if verification.reproduction_status == "passed" else "contradicted"
    )
    verification_doc = await create_receipt_document(
        lead_id=original["lead_id"],
        event_type=f"{original['event_type']}.verification",
        source_system="independent_verifier",
        actor=verification.verifier,
        evidence_ref=verification.evidence_ref,
        evidence_payload={
            "original_receipt_id": receipt_id,
            "original_evidence_hash": original["evidence_hash"],
            "reproduction_status": verification.reproduction_status,
            "notes": verification.notes,
        },
        idempotency_key=verification.idempotency_key,
        status=status,
        parent_receipt_id=receipt_id,
    )
    return {
        "success": True,
        "original_receipt": original,
        "verification_receipt": verification_doc,
    }


@router.post(
    "/integrations/prospects/import",
    dependencies=[Depends(require_integration_key)],
)
async def import_grounded_prospects(request: ProspectImportRequest):
    """Import grounded accounts from FABLE or another approved prospecting source."""
    await ensure_crm_indexes()
    db = get_database()
    created: list[dict[str, Any]] = []
    updated: list[dict[str, Any]] = []
    rejected: list[dict[str, Any]] = []

    for index, prospect in enumerate(request.prospects):
        validate_choice(
            prospect.email_verification_status,
            EMAIL_VERIFICATION_STATES,
            "email verification status",
        )
        validate_choice(prospect.lane, REVENUE_LANES, "lane")

        source_domain = normalize_domain(prospect.source_url)
        if not source_domain:
            rejected.append(
                {"index": index, "reason": "A valid public source_url is required"}
            )
            continue

        normalized_email = normalize_email(prospect.contact_email)
        company_domain = normalize_domain(prospect.domain or prospect.website)
        fingerprint = lead_fingerprint(
            name=prospect.name,
            company=prospect.company,
            email=normalized_email,
            domain=company_domain,
            external_id=prospect.external_id,
        )
        duplicate_query: dict[str, Any] = {"fingerprint": fingerprint}
        if prospect.external_id:
            duplicate_query = {
                "$or": [
                    {
                        "source_system": request.source_system,
                        "external_id": prospect.external_id,
                    },
                    {"fingerprint": fingerprint},
                ]
            }
        elif normalized_email:
            duplicate_query = {
                "$or": [
                    {"normalized_email": normalized_email},
                    {"fingerprint": fingerprint},
                ]
            }

        existing = await db.crm_leads.find_one(duplicate_query, {"_id": 0})
        timestamp = utc_now_iso()
        notes = prospect.outreach_angle
        common = {
            "name": prospect.name,
            "company": prospect.company,
            "title": prospect.title,
            "persona": prospect.persona,
            "email": normalized_email,
            "normalized_email": normalized_email,
            "email_verification_status": prospect.email_verification_status,
            "website": prospect.website or prospect.domain,
            "company_domain": company_domain,
            "linkedin_url": prospect.linkedin_url,
            "source": "fable" if request.source_system == "fable" else "public_web",
            "source_system": request.source_system,
            "source_url": prospect.source_url,
            "source_evidence": prospect.source_evidence,
            "external_id": prospect.external_id,
            "fingerprint": fingerprint,
            "lane": prospect.lane,
            "value": prospect.estimated_value,
            "notes": notes,
            "tags": sorted(set(prospect.tags + ["grounded-prospect"])),
            "updated_at": timestamp,
        }

        if existing:
            await db.crm_leads.update_one({"id": existing["id"]}, {"$set": common})
            lead = await db.crm_leads.find_one({"id": existing["id"]}, {"_id": 0})
            updated.append(lead)
        else:
            lead = {
                "id": str(uuid.uuid4()),
                **common,
                "lead_type": "prospect",
                "pipeline_stage": "lead",
                "probability": PROBABILITY_BY_STAGE["lead"],
                "phone": None,
                "assigned_to": None,
                "next_action": "Review grounded account and approve outreach",
                "next_action_at": None,
                "created_at": timestamp,
            }
            await db.crm_leads.insert_one(lead)
            lead.pop("_id", None)
            created.append(lead)

        await create_receipt_document(
            lead_id=lead["id"],
            event_type="prospect_discovered",
            source_system=request.source_system,
            actor="prospecting_bridge",
            evidence_ref=prospect.source_url,
            evidence_payload={
                "batch_id": request.batch_id,
                "source_domain": source_domain,
                "source_evidence": prospect.source_evidence,
                "outreach_angle": prospect.outreach_angle,
                "contact_email_present": bool(normalized_email),
                "email_verification_status": prospect.email_verification_status,
            },
            idempotency_key=(
                f"prospect-import:{request.source_system}:{request.batch_id}:{index}"
            ),
        )

    return {
        "success": True,
        "batch_id": request.batch_id,
        "created_count": len(created),
        "updated_count": len(updated),
        "rejected_count": len(rejected),
        "created": created,
        "updated": updated,
        "rejected": rejected,
    }


@router.get(
    "/integrations/prospects/outreach-ready",
    dependencies=[Depends(require_integration_key)],
)
async def outreach_ready_prospects(
    limit: int = Query(default=100, ge=1, le=500),
):
    """Return only grounded prospects with a usable, honestly labeled channel."""
    await ensure_crm_indexes()
    db = get_database()
    query = {
        "archived_at": {"$exists": False},
        "source_url": {"$nin": [None, ""]},
        "pipeline_stage": {"$in": ["lead", "qualified"]},
        "$or": [
            {
                "normalized_email": {"$nin": [None, ""]},
                "email_verification_status": "verified",
            },
            {"linkedin_url": {"$nin": [None, ""]}},
        ],
    }
    leads = await db.crm_leads.find(query, {"_id": 0}).sort(
        "updated_at", -1
    ).limit(limit).to_list(limit)
    for lead in leads:
        lead["outreach_channel"] = (
            "email"
            if lead.get("normalized_email")
            and lead.get("email_verification_status") == "verified"
            else "linkedin"
        )
    return {"success": True, "count": len(leads), "prospects": leads}


@router.get("/follow-ups/due")
async def due_follow_ups(
    before: Optional[datetime] = None,
    limit: int = Query(default=100, ge=1, le=500),
):
    await ensure_crm_indexes()
    db = get_database()
    cutoff = serialize_datetime(before) if before else utc_now_iso()
    query = {
        "archived_at": {"$exists": False},
        "next_action_at": {"$ne": None, "$lte": cutoff},
        "pipeline_stage": {"$ne": "churned"},
    }
    leads = await db.crm_leads.find(query, {"_id": 0}).sort(
        "next_action_at", 1
    ).limit(limit).to_list(limit)
    return {"success": True, "cutoff": cutoff, "count": len(leads), "leads": leads}


@router.post("/follow-ups/{lead_id}/complete")
async def complete_follow_up(lead_id: str, completion: FollowUpComplete):
    await ensure_crm_indexes()
    db = get_database()
    existing = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")

    timestamp = utc_now_iso()
    await _append_activity(
        lead_id=lead_id,
        activity_type="follow_up_completed",
        description=completion.description,
        metadata={"evidence_ref": completion.evidence_ref},
    )
    await db.crm_leads.update_one(
        {"id": lead_id},
        {
            "$set": {
                "last_contact_at": timestamp,
                "next_action": completion.next_action,
                "next_action_at": serialize_datetime(completion.next_action_at),
                "updated_at": timestamp,
            }
        },
    )
    if completion.evidence_ref:
        await create_receipt_document(
            lead_id=lead_id,
            event_type="follow_up_completed",
            source_system="empire1",
            actor="crm",
            evidence_ref=completion.evidence_ref,
            evidence_payload={"description": completion.description},
            idempotency_key=f"follow-up:{lead_id}:{timestamp}",
        )
    updated = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    return {"success": True, "lead": updated}


@router.get("/metrics")
async def crm_metrics():
    await ensure_crm_indexes()
    db = get_database()
    cursor = db.crm_leads.find(
        {"archived_at": {"$exists": False}},
        {
            "_id": 0,
            "pipeline_stage": 1,
            "value": 1,
            "lane": 1,
            "next_action_at": 1,
        },
    )
    leads = await cursor.to_list(2000)

    stage_counts = {stage: 0 for stage in PIPELINE_STAGES}
    lane_counts = {lane: 0 for lane in REVENUE_LANES}
    total_pipeline_value = 0.0
    weighted_pipeline_value = 0.0
    now = utc_now_iso()
    due_follow_ups_count = 0

    for lead in leads:
        stage = lead.get("pipeline_stage", "lead")
        if stage in stage_counts:
            stage_counts[stage] += 1
        lane = lead.get("lane")
        if lane in lane_counts:
            lane_counts[lane] += 1
        value = float(lead.get("value", 0) or 0)
        if stage in ("qualified", "proposal", "negotiation", "onboarding"):
            total_pipeline_value += value
            weighted_pipeline_value += value * (
                PROBABILITY_BY_STAGE.get(stage, 0) / 100
            )
        next_action_at = lead.get("next_action_at")
        if next_action_at and next_action_at <= now and stage != "churned":
            due_follow_ups_count += 1

    verified_receipts = await db.crm_receipts.count_documents({"status": "verified"})
    contradictions = await db.crm_receipts.count_documents(
        {"status": "contradicted"}
    )

    return {
        "success": True,
        "metrics": {
            "total_leads": len(leads),
            "total_pipeline_value": total_pipeline_value,
            "weighted_pipeline_value": round(weighted_pipeline_value, 2),
            "due_follow_ups": due_follow_ups_count,
            "verified_receipts": verified_receipts,
            "contradictions": contradictions,
            "stage_counts": stage_counts,
            "lane_counts": lane_counts,
        },
    }
