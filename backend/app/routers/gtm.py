"""Internal GTM — campaign builder, outreach sequencer, launch planner."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from database import get_database

router = APIRouter(prefix="/gtm", tags=["GTM"])

CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"]
OUTREACH_CHANNELS = ["email", "linkedin", "cold_call", "dm", "event", "partner", "other"]


class CampaignCreate(BaseModel):
    name: str
    objective: str
    target_audience: Optional[str] = None
    channels: List[str] = []
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class OutreachStepCreate(BaseModel):
    campaign_id: str
    channel: str = "email"
    subject: str
    template: str
    delay_days: int = 0
    order: int = 0


@router.get("/campaigns")
async def list_campaigns():
    db = get_database()
    cursor = db.gtm_campaigns.find({}, {"_id": 0}).sort("created_at", -1).limit(50)
    campaigns = await cursor.to_list(50)
    return {"success": True, "campaigns": campaigns}


@router.post("/campaigns")
async def create_campaign(c: CampaignCreate):
    db = get_database()
    doc = c.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "draft"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = doc["created_at"]
    doc["outreach_steps"] = 0
    await db.gtm_campaigns.insert_one(doc)
    return {"success": True, "campaign": doc}


@router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    db = get_database()
    campaign = await db.gtm_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    steps = await db.gtm_outreach_steps.find(
        {"campaign_id": campaign_id}, {"_id": 0}
    ).sort("order", 1).to_list(50)
    return {"success": True, "campaign": campaign, "outreach_steps": steps}


@router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, status: str, notes: Optional[str] = None):
    if status not in CAMPAIGN_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    db = get_database()
    existing = await db.gtm_campaigns.find_one({"id": campaign_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Campaign not found")
    update = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if notes:
        update["notes"] = notes
    await db.gtm_campaigns.update_one({"id": campaign_id}, {"$set": update})
    updated = await db.gtm_campaigns.find_one({"id": campaign_id}, {"_id": 0})
    return {"success": True, "campaign": updated}


@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str):
    db = get_database()
    result = await db.gtm_campaigns.delete_one({"id": campaign_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await db.gtm_outreach_steps.delete_many({"campaign_id": campaign_id})
    return {"success": True}


@router.post("/outreach-steps")
async def add_outreach_step(step: OutreachStepCreate):
    db = get_database()
    campaign = await db.gtm_campaigns.find_one({"id": step.campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    doc = step.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.gtm_outreach_steps.insert_one(doc)
    await db.gtm_campaigns.update_one(
        {"id": step.campaign_id},
        {"$inc": {"outreach_steps": 1}}
    )
    return {"success": True, "step": doc}


@router.get("/launch-checklist")
async def get_launch_checklist():
    db = get_database()
    cursor = db.gtm_launch_checklists.find({}, {"_id": 0}).sort("created_at", -1).limit(20)
    checklists = await cursor.to_list(20)
    return {"success": True, "checklists": checklists}


@router.post("/launch-checklist")
async def create_launch_checklist(name: str, items: List[str]):
    db = get_database()
    doc = {
        "id": str(uuid.uuid4()),
        "name": name,
        "items": [{"text": item, "done": False} for item in items],
        "progress": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.gtm_launch_checklists.insert_one(doc)
    return {"success": True, "checklist": doc}


@router.put("/launch-checklist/{checklist_id}/item/{item_index}")
async def toggle_checklist_item(checklist_id: str, item_index: int):
    db = get_database()
    checklist = await db.gtm_launch_checklists.find_one({"id": checklist_id})
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    if item_index >= len(checklist["items"]):
        raise HTTPException(status_code=400, detail="Invalid item index")
    current = checklist["items"][item_index]["done"]
    await db.gtm_launch_checklists.update_one(
        {"id": checklist_id},
        {"$set": {f"items.{item_index}.done": not current}}
    )
    updated = await db.gtm_launch_checklists.find_one({"id": checklist_id}, {"_id": 0})
    done = sum(1 for i in updated["items"] if i["done"])
    total = len(updated["items"])
    await db.gtm_launch_checklists.update_one(
        {"id": checklist_id},
        {"$set": {"progress": round((done / total) * 100, 1)}}
    )
    updated = await db.gtm_launch_checklists.find_one({"id": checklist_id}, {"_id": 0})
    return {"success": True, "checklist": updated}


@router.get("/metrics")
async def gtm_metrics():
    db = get_database()
    campaigns = await db.gtm_campaigns.count_documents({})
    active = await db.gtm_campaigns.count_documents({"status": "active"})
    steps = await db.gtm_outreach_steps.count_documents({})
    return {
        "success": True,
        "metrics": {
            "total_campaigns": campaigns,
            "active_campaigns": active,
            "total_outreach_steps": steps,
        },
    }
