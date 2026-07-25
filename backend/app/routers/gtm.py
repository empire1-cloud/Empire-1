"""Internal GTM — campaign builder, outreach sequencer, launch planner, viral content engine."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import re
import uuid

from database import get_database

router = APIRouter(prefix="/gtm", tags=["GTM"])

CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"]
OUTREACH_CHANNELS = ["email", "linkedin", "cold_call", "dm", "event", "partner", "other"]
VIRAL_CHANNELS = ["linkedin", "carousel", "short_video", "newsletter"]


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


class ViralAuditPackCreate(BaseModel):
    product_universe: str = "Empire-1"
    audited_subject: str
    total_examined: str
    survivors: str
    proof_basis: str
    audience: str = "founders, creators, and operators"
    objective: str = "Build authority through evidence"
    call_to_action: str = "See the proof"
    channels: List[str] = Field(default_factory=lambda: VIRAL_CHANNELS.copy())


def _normalized_channels(channels: List[str]) -> List[str]:
    selected = [channel for channel in channels if channel in VIRAL_CHANNELS]
    return selected or VIRAL_CHANNELS.copy()


def _numeric_value(value: str) -> Optional[float]:
    match = re.search(r"\d+(?:\.\d+)?", value.replace(",", ""))
    return float(match.group(0)) if match else None


def _survival_rate(total_examined: str, survivors: str) -> Optional[float]:
    total = _numeric_value(total_examined)
    survived = _numeric_value(survivors)
    if not total or survived is None or total <= 0 or survived > total:
        return None
    return round((survived / total) * 100, 4)


def _build_viral_audit_pack(payload: ViralAuditPackCreate) -> dict:
    product = payload.product_universe.strip() or "Empire-1"
    subject = payload.audited_subject.strip()
    total = payload.total_examined.strip()
    survivors = payload.survivors.strip()
    proof = payload.proof_basis.strip().rstrip(".")
    audience = payload.audience.strip() or "founders, creators, and operators"
    cta = payload.call_to_action.strip() or "See the proof"
    channels = _normalized_channels(payload.channels)

    headline = f"{total} {subject}. {survivors} Survived."
    subheadline = f"An evidence-backed audit of {subject.lower()} — and the proof behind what made the cut."
    verdict = f"Only {survivors} out of {total} met the standard: {proof}."
    rate = _survival_rate(total, survivors)

    linkedin_post = "\n\n".join([
        headline,
        subheadline,
        f"We did not rank promises. We checked {proof}.",
        "What survived had to be verifiable, repeatable, and useful in the real workflow.",
        "What failed was documented instead of hidden.",
        f"The verdict: {verdict}",
        f"{cta}.",
    ])

    carousel_slides = [
        {"slide": 1, "role": "stop", "copy": headline},
        {"slide": 2, "role": "scope", "copy": f"The audit: {total} {subject.lower()} reviewed for {audience}."},
        {"slide": 3, "role": "standard", "copy": f"The filter: {proof}."},
        {"slide": 4, "role": "failure", "copy": "Most failed because the claim could not be traced to usable proof."},
        {"slide": 5, "role": "survivors", "copy": f"The survivors: {survivors}."},
        {"slide": 6, "role": "lesson", "copy": "Do not publish a feature list. Publish the investigation and the verdict."},
        {"slide": 7, "role": "cta", "copy": cta},
    ]

    short_video_script = [
        {"seconds": "0-3", "beat": "Hook", "copy": headline},
        {"seconds": "3-8", "beat": "Why it matters", "copy": f"Everybody claims results. We audited {proof}."},
        {"seconds": "8-18", "beat": "Method", "copy": "Every item had to produce traceable evidence, not a polished demo."},
        {"seconds": "18-28", "beat": "Reveal", "copy": verdict},
        {"seconds": "28-35", "beat": "Takeaway", "copy": "The content is not the claim. The content is the proof trail."},
        {"seconds": "35-40", "beat": "CTA", "copy": cta},
    ]

    newsletter = {
        "subject_lines": [
            headline,
            f"We audited {total} {subject.lower()}. Here is what survived.",
            f"The {product} proof audit",
        ],
        "opening": f"This week, {product} audited {total} {subject.lower()} against one standard: {proof}. The result was sharper than a feature announcement because the evidence produced the story.",
        "sections": [
            "What we tested",
            "The standard every item had to meet",
            "Why most candidates failed",
            "What the survivors proved",
            "What we will test next",
        ],
    }

    proof_checklist = [
        "Define the complete universe before publishing the result.",
        "Use one written survival standard for every candidate.",
        "Attach a test, receipt, artifact, metric, or source to every major claim.",
        "Separate verified facts from estimates and founder interpretation.",
        "Document failures and exclusions; do not quietly remove them.",
        "End with the operational lesson, not a generic sales pitch.",
    ]

    empire_examples = [
        {
            "universe": "Empire-1",
            "headline": "245+ AI Engines. Which Ones Can Actually Produce Proof?",
            "proof": "tests, receipts, release evidence, and live workflow output",
        },
        {
            "universe": "Lyrica 3",
            "headline": "One Song. Six Proof Layers. No Lost Ownership.",
            "proof": "creation, DNA identity, Soulprint, VICS signing, ledger, and payout evidence",
        },
        {
            "universe": "Archisynapse",
            "headline": "Every Payment Platform Tracks Money. We Tracked the Receipt.",
            "proof": "authorization, ledger entries, fees, refund reversal, and a balanced trial balance",
        },
        {
            "universe": "Cultura Vibe Forge",
            "headline": "Thousands of AI Outputs. How Many Actually Respect the Cultura?",
            "proof": "heritage logic, dialect integrity, authenticity checks, and community context",
        },
        {
            "universe": "Empire Auto Cofounder",
            "headline": "Dozens of AI Agents. Only the Evidence Gets Promoted.",
            "proof": "approval state, preflight, sealed manifest, execution receipt, and audit status",
        },
        {
            "universe": "San Bernardino Youth Tech",
            "headline": "10 Young Creators. 30 Days. Zero Gatekeeping.",
            "proof": "completed projects, learned tools, public demos, and creator-owned portfolios",
        },
    ]

    return {
        "id": f"VIRAL-{uuid.uuid4().hex[:8].upper()}",
        "pattern": "Huge universe → brutal filter → surprising result → specific proof",
        "product_universe": product,
        "objective": payload.objective.strip() or "Build authority through evidence",
        "audience": audience,
        "channels": channels,
        "headline": headline,
        "subheadline": subheadline,
        "verdict": verdict,
        "survival_rate_percent": rate,
        "content_assets": {
            "linkedin_post": linkedin_post,
            "carousel": carousel_slides,
            "short_video": short_video_script,
            "newsletter": newsletter,
        },
        "proof_checklist": proof_checklist,
        "integrity_rules": [
            "Never invent the total examined or survivor count.",
            "Do not say 'audit' unless the selection standard is documented.",
            "Keep Cultura Vibe Forge cultural claims tied to its own authenticity rules and evidence.",
            "Do not flatten separate Empire-1 product universes into one generic product.",
            "Label unverified claims before publication.",
        ],
        "empire_examples": empire_examples,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "draft",
    }


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


@router.post("/viral-audit-packs")
async def create_viral_audit_pack(payload: ViralAuditPackCreate):
    if not payload.audited_subject.strip():
        raise HTTPException(status_code=400, detail="Audited subject is required")
    if not payload.total_examined.strip():
        raise HTTPException(status_code=400, detail="Total examined is required")
    if not payload.survivors.strip():
        raise HTTPException(status_code=400, detail="Survivor result is required")
    if not payload.proof_basis.strip():
        raise HTTPException(status_code=400, detail="Proof basis is required")

    pack = _build_viral_audit_pack(payload)
    db = get_database()
    await db.gtm_viral_audit_packs.insert_one(pack.copy())
    return {"success": True, "pack": pack}


@router.get("/viral-audit-packs")
async def list_viral_audit_packs():
    db = get_database()
    cursor = db.gtm_viral_audit_packs.find({}, {"_id": 0}).sort("created_at", -1).limit(30)
    packs = await cursor.to_list(30)
    return {"success": True, "packs": packs}


@router.get("/viral-audit-packs/{pack_id}")
async def get_viral_audit_pack(pack_id: str):
    db = get_database()
    pack = await db.gtm_viral_audit_packs.find_one({"id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Viral audit pack not found")
    return {"success": True, "pack": pack}


@router.get("/metrics")
async def gtm_metrics():
    db = get_database()
    campaigns = await db.gtm_campaigns.count_documents({})
    active = await db.gtm_campaigns.count_documents({"status": "active"})
    steps = await db.gtm_outreach_steps.count_documents({})
    viral_packs = await db.gtm_viral_audit_packs.count_documents({})
    return {
        "success": True,
        "metrics": {
            "total_campaigns": campaigns,
            "active_campaigns": active,
            "total_outreach_steps": steps,
            "viral_audit_packs": viral_packs,
        },
    }
