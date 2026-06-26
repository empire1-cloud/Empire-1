"""Internal CRM — deal pipeline, lead tracking, client lifecycle."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import get_database

router = APIRouter(prefix="/crm", tags=["CRM"])

PIPELINE_STAGES = [
    "lead", "qualified", "proposal", "negotiation",
    "onboarding", "active", "at_risk", "churned",
]

REVENUE_LANES = [
    "full_stack_builds", "automation", "micro_saas",
    "white_label", "enterprise", "creative_ai",
    "admin_ops", "other",
]

LEAD_SOURCES = [
    "website", "referral", "cold_outreach", "conference",
    "linkedin", "partner", "existing_client", "other",
]


class LeadCreate(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: str = "other"
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    source: Optional[str] = None
    pipeline_stage: Optional[str] = None
    lane: Optional[str] = None
    value: Optional[float] = None
    notes: Optional[str] = None


class ActivityCreate(BaseModel):
    lead_id: str
    type: str = "note"
    description: str


@router.get("/pipeline")
async def get_pipeline():
    db = get_database()
    cursor = db.crm_leads.find({}, {"_id": 0}).sort("updated_at", -1).limit(200)
    leads = await cursor.to_list(200)
    return {"success": True, "leads": leads, "stages": PIPELINE_STAGES}


@router.get("/pipeline/stage/{stage}")
async def get_pipeline_by_stage(stage: str):
    if stage not in PIPELINE_STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage: {stage}")
    db = get_database()
    cursor = db.crm_leads.find({"pipeline_stage": stage}, {"_id": 0}).sort("value", -1)
    leads = await cursor.to_list(100)
    return {"success": True, "leads": leads}


@router.post("/leads")
async def create_lead(lead: LeadCreate):
    db = get_database()
    doc = lead.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["pipeline_stage"] = "lead"
    doc["lane"] = None
    doc["value"] = 0.0
    doc["probability"] = 10
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    await db.crm_leads.insert_one(doc)
    return {"success": True, "lead": doc}


@router.get("/leads/{lead_id}")
async def get_lead(lead_id: str):
    db = get_database()
    lead = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    activities = await db.crm_activities.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return {"success": True, "lead": lead, "activities": activities}


@router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, update: LeadUpdate):
    db = get_database()
    existing = await db.crm_leads.find_one({"id": lead_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Lead not found")

    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    if not changes:
        return {"success": True, "lead": existing}

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.crm_leads.update_one({"id": lead_id}, {"$set": changes})
    updated = await db.crm_leads.find_one({"id": lead_id}, {"_id": 0})
    return {"success": True, "lead": updated}


@router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str):
    db = get_database()
    result = await db.crm_leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    await db.crm_activities.delete_many({"lead_id": lead_id})
    return {"success": True}


@router.post("/activities")
async def add_activity(activity: ActivityCreate):
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
async def crm_metrics():
    db = get_database()
    cursor = db.crm_leads.find({}, {"_id": 0, "pipeline_stage": 1, "value": 1, "lane": 1})
    leads = await cursor.to_list(500)

    stage_counts = {s: 0 for s in PIPELINE_STAGES}
    lane_counts = {l: 0 for l in REVENUE_LANES}
    total_pipeline_value = 0.0

    for lead in leads:
        stage = lead.get("pipeline_stage", "lead")
        if stage in stage_counts:
            stage_counts[stage] += 1
        lane = lead.get("lane")
        if lane in lane_counts:
            lane_counts[lane] += 1
        if stage in ("qualified", "proposal", "negotiation", "onboarding"):
            total_pipeline_value += lead.get("value", 0)

    return {
        "success": True,
        "metrics": {
            "total_leads": len(leads),
            "total_pipeline_value": total_pipeline_value,
            "stage_counts": stage_counts,
            "lane_counts": lane_counts,
        },
    }
