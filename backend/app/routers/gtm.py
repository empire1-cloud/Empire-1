"""Internal GTM — campaigns, outreach, launch planning, and the Empire-1 Content Growth Engine."""

from datetime import datetime, timezone
import re
import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import get_database

router = APIRouter(prefix="/gtm", tags=["GTM"])

CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"]
OUTREACH_CHANNELS = ["email", "linkedin", "cold_call", "dm", "event", "partner", "other"]
VIRAL_CHANNELS = ["linkedin", "carousel", "short_video", "newsletter"]
CONTENT_STATUSES = ["draft", "proof_review", "approved", "scheduled", "published", "retired"]
EVIDENCE_CLASSIFICATIONS = ["external_signal", "empire_proof", "founder_perspective", "unverified_claim"]
PROTECTED_UNIVERSES = [
    "Empire-1",
    "Lyrica 3",
    "Archisynapse",
    "Cultura Vibe Forge",
    "HIC / Empire Auto Cofounder",
    "Southern Lifestyle",
    "Founding 8 Youth Tech",
]
STORY_PATTERNS = [
    "audit_to_verdict",
    "problem_failed_assumption",
    "founder_struggle",
    "signal_to_position",
    "build_receipt",
]


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
    story_pattern: str = "audit_to_verdict"
    evidence_classification: str = "empire_proof"
    source_title: Optional[str] = None
    source_url: Optional[str] = None
    source_publisher: Optional[str] = None
    source_date: Optional[str] = None
    extracted_signal: Optional[str] = None
    founder_perspective: Optional[str] = None
    proof_reference: Optional[str] = None
    conversion_goal: str = "Qualified conversations"
    proof_strength: int = Field(default=70, ge=0, le=100)
    audience_relevance: int = Field(default=75, ge=0, le=100)
    originality: int = Field(default=75, ge=0, le=100)
    conversion_potential: int = Field(default=70, ge=0, le=100)
    universe_alignment: int = Field(default=90, ge=0, le=100)


class ContentSignalCreate(BaseModel):
    title: str
    source_url: Optional[str] = None
    publisher: Optional[str] = None
    published_date: Optional[str] = None
    category: str = "emerging_technology"
    extracted_signal: str
    founder_angle: Optional[str] = None
    product_universe: str = "Empire-1"
    evidence_classification: str = "external_signal"
    status: str = "new"


class GrowthMetricCreate(BaseModel):
    content_pack_id: Optional[str] = None
    product_universe: str = "Empire-1"
    channel: str = "linkedin"
    hook: Optional[str] = None
    format: Optional[str] = None
    proof_asset: Optional[str] = None
    audience: Optional[str] = None
    published_at: Optional[str] = None
    reach: int = Field(default=0, ge=0)
    saves: int = Field(default=0, ge=0)
    qualified_comments: int = Field(default=0, ge=0)
    profile_visits: int = Field(default=0, ge=0)
    direct_messages: int = Field(default=0, ge=0)
    applications: int = Field(default=0, ge=0)
    meetings: int = Field(default=0, ge=0)
    attributed_revenue: float = Field(default=0, ge=0)
    notes: Optional[str] = None


class LearningNoteCreate(BaseModel):
    product_universe: str = "Empire-1"
    content_pack_id: Optional[str] = None
    note_type: str = "audience_objection"
    observation: str
    recommendation: str
    action: str = "adapt"


class PackStatusUpdate(BaseModel):
    status: str
    founder_approved: bool = False
    approval_note: Optional[str] = None


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


def _validate_universe(universe: str) -> str:
    clean = universe.strip() or "Empire-1"
    aliases = {
        "Empire Auto Cofounder": "HIC / Empire Auto Cofounder",
        "San Bernardino Youth Tech": "Founding 8 Youth Tech",
    }
    clean = aliases.get(clean, clean)
    if clean not in PROTECTED_UNIVERSES:
        raise HTTPException(status_code=400, detail="Select one protected Empire-1 universe")
    return clean


def _score_summary(payload: ViralAuditPackCreate) -> dict:
    scores = {
        "proof_strength": payload.proof_strength,
        "audience_relevance": payload.audience_relevance,
        "originality": payload.originality,
        "conversion_potential": payload.conversion_potential,
        "universe_alignment": payload.universe_alignment,
    }
    overall = round(sum(scores.values()) / len(scores), 1)
    blockers = []
    if payload.evidence_classification == "unverified_claim":
        blockers.append("Unverified claims cannot become publish-ready.")
    if payload.proof_strength < 70:
        blockers.append("Performance claims require proof strength of at least 70.")
    if not payload.proof_reference and payload.evidence_classification == "empire_proof":
        blockers.append("Empire Proof requires a receipt, test, artifact, metric, screenshot, deployment, or source reference.")
    if payload.universe_alignment < 70:
        blockers.append("Universe alignment must be at least 70 to prevent product flattening.")
    return {
        "scores": scores,
        "overall_score": overall,
        "publish_ready": len(blockers) == 0,
        "blockers": blockers,
    }


def _story_copy(payload: ViralAuditPackCreate, product: str, subject: str, total: str, survivors: str, proof: str) -> dict:
    pattern = payload.story_pattern if payload.story_pattern in STORY_PATTERNS else "audit_to_verdict"
    cta = payload.call_to_action.strip() or "See the proof"

    if pattern == "problem_failed_assumption":
        headline = f"The industry assumption about {subject.lower()} failed our proof test."
        subheadline = f"We examined {total} and kept only {survivors} that could be traced to {proof}."
        verdict = f"The Empire-1 answer is not another promise. It is a verifiable workflow backed by {proof}."
    elif pattern == "founder_struggle":
        headline = f"I stopped accepting polished claims about {subject.lower()}."
        subheadline = f"As a founder, I examined {total}; only {survivors} survived the evidence standard."
        verdict = f"The decision was simple: preserve what can prove {proof}, and document what cannot."
    elif pattern == "signal_to_position":
        headline = payload.source_title.strip() if payload.source_title else f"A new signal is changing how {subject.lower()} gets judged."
        subheadline = payload.extracted_signal.strip() if payload.extracted_signal else f"The market is moving from claims toward {proof}."
        verdict = payload.founder_perspective.strip() if payload.founder_perspective else f"{product} is positioned around verification, ownership, and controlled execution."
    elif pattern == "build_receipt":
        headline = f"Build receipt: {survivors} survived the {subject.lower()} test."
        subheadline = f"We checked {total} against one operational standard: {proof}."
        verdict = "The result is usable because it is attached to a receipt, test, artifact, or metric—not a launch claim."
    else:
        headline = f"{total} {subject}. {survivors} Survived."
        subheadline = f"An evidence-backed audit of {subject.lower()} — and the proof behind what made the cut."
        verdict = f"Only {survivors} out of {total} met the standard: {proof}."

    return {
        "pattern": pattern,
        "headline": headline,
        "subheadline": subheadline,
        "verdict": verdict,
        "cta": cta,
    }


def _build_viral_audit_pack(payload: ViralAuditPackCreate) -> dict:
    product = _validate_universe(payload.product_universe)
    subject = payload.audited_subject.strip()
    total = payload.total_examined.strip()
    survivors = payload.survivors.strip()
    proof = payload.proof_basis.strip().rstrip(".")
    audience = payload.audience.strip() or "founders, creators, and operators"
    channels = _normalized_channels(payload.channels)
    evidence_classification = payload.evidence_classification.strip().lower()
    if evidence_classification not in EVIDENCE_CLASSIFICATIONS:
        raise HTTPException(status_code=400, detail="Invalid evidence classification")

    story = _story_copy(payload, product, subject, total, survivors, proof)
    headline = story["headline"]
    subheadline = story["subheadline"]
    verdict = story["verdict"]
    cta = story["cta"]
    rate = _survival_rate(total, survivors)
    scoring = _score_summary(payload)

    linkedin_post = "\n\n".join([
        headline,
        subheadline,
        f"We did not rank promises. We checked {proof}.",
        "What survived had to be verifiable, repeatable, and useful in the real workflow.",
        "What failed was documented instead of hidden.",
        f"The verdict: {verdict}",
        f"Next action: {cta}.",
    ])

    carousel_slides = [
        {"slide": 1, "role": "stop", "copy": headline},
        {"slide": 2, "role": "scope", "copy": f"The investigation: {total} {subject.lower()} reviewed for {audience}."},
        {"slide": 3, "role": "standard", "copy": f"The evidence gate: {proof}."},
        {"slide": 4, "role": "failure", "copy": "Anything that could not be traced to evidence stayed out of the publish-ready lane."},
        {"slide": 5, "role": "survivors", "copy": f"The result: {survivors}."},
        {"slide": 6, "role": "lesson", "copy": "Do not publish a feature list. Publish the investigation, the boundary, and the receipt."},
        {"slide": 7, "role": "cta", "copy": cta},
    ]

    short_video_script = [
        {"seconds": "0-3", "beat": "Hook", "copy": headline},
        {"seconds": "3-8", "beat": "Why it matters", "copy": f"Everybody claims results. We checked {proof}."},
        {"seconds": "8-18", "beat": "Method", "copy": "Every item had to produce traceable evidence, not a polished demo."},
        {"seconds": "18-28", "beat": "Reveal", "copy": verdict},
        {"seconds": "28-35", "beat": "Takeaway", "copy": "The content is not the claim. The content is the proof trail."},
        {"seconds": "35-40", "beat": "CTA", "copy": cta},
    ]

    hooks = [
        headline,
        "Most people publish the claim. We published what survived the proof gate.",
        f"A polished demo is not evidence. Here is what {product} required instead.",
        f"We tested {subject.lower()} against one brutal standard: {proof}.",
        "The result matters less than the receipt behind it.",
    ]
    short_posts = [
        f"{headline} We checked {proof}. What failed stayed documented. {cta}.",
        f"Evidence first. Virality second. {product} only promotes claims tied to tests, receipts, artifacts, metrics, or sources.",
        f"The fastest way to lose trust is to flatten every product into one giant promise. This result belongs to {product}, and the proof stays with it.",
    ]
    newsletter = {
        "subject_lines": [
            headline,
            f"We examined {total} {subject.lower()}. Here is what survived.",
            f"The {product} proof receipt",
        ],
        "opening": f"This week, {product} examined {total} {subject.lower()} against one standard: {proof}. The result was sharper than a feature announcement because the evidence produced the story.",
        "sections": [
            "What we tested",
            "The evidence gate",
            "What failed and why",
            "What the survivors proved",
            "The next conversion action",
        ],
    }
    investor_message = " ".join([
        f"We just completed a proof-backed {product} test covering {total} {subject.lower()}.",
        f"Only {survivors} met the standard: {proof}.",
        f"The next milestone is {payload.conversion_goal.lower()}.",
        "I can share the evidence trail rather than a feature-only update.",
    ])

    distribution_plan = [
        {"day": 1, "stage": "Authority", "action": "Publish the strongest founder verdict or category argument.", "approval_required": True},
        {"day": 2, "stage": "Conversation", "action": "Respond to qualified comments and log objections without automated messaging.", "approval_required": True},
        {"day": 3, "stage": "Proof", "action": "Release the test, receipt, screenshot, metric, architecture artifact, or demo evidence.", "approval_required": True},
        {"day": 4, "stage": "Personalized outreach", "action": "Prepare tailored messages for people whose work or thesis matches the proof.", "approval_required": True},
        {"day": 5, "stage": "Conversion", "action": f"Drive one measured action: {payload.conversion_goal}.", "approval_required": True},
    ]

    proof_checklist = [
        "The content belongs to exactly one protected Empire-1 universe.",
        "Every performance, customer, revenue, readiness, or deployment claim has a proof reference.",
        "External signals are not presented as Empire-1 achievements.",
        "Founder perspective is labeled as interpretation, not verified fact.",
        "Failures and exclusions remain in the historical record.",
        "The call to action maps to one measurable conversion goal.",
    ]

    return {
        "id": f"GROWTH-{uuid.uuid4().hex[:8].upper()}",
        "engine_version": "content-growth-v1",
        "pattern": "DISCOVER → VERIFY → CREATE → DISTRIBUTE → CONVERT → LEARN → REUSE",
        "story_pattern": story["pattern"],
        "product_universe": product,
        "objective": payload.objective.strip() or "Build authority through evidence",
        "conversion_goal": payload.conversion_goal.strip() or "Qualified conversations",
        "audience": audience,
        "channels": channels,
        "headline": headline,
        "subheadline": subheadline,
        "verdict": verdict,
        "survival_rate_percent": rate,
        "evidence": {
            "classification": evidence_classification,
            "proof_basis": proof,
            "proof_reference": payload.proof_reference,
            "source_title": payload.source_title,
            "source_url": payload.source_url,
            "source_publisher": payload.source_publisher,
            "source_date": payload.source_date,
            "extracted_signal": payload.extracted_signal,
            "founder_perspective": payload.founder_perspective,
        },
        "scoring": scoring,
        "content_assets": {
            "linkedin_post": linkedin_post,
            "carousel": carousel_slides,
            "short_video": short_video_script,
            "newsletter": newsletter,
            "short_posts": short_posts,
            "hooks": hooks,
            "investor_message": investor_message,
            "call_to_action": cta,
        },
        "distribution_plan": distribution_plan,
        "proof_checklist": proof_checklist,
        "integrity_rules": [
            "Never invent the total examined or survivor count.",
            "Do not say audit unless the selection standard is documented.",
            "Keep Cultura Vibe Forge separate from Lyrica 3, generic community content, and Youth Tech.",
            "Do not flatten protected Empire-1 product universes into one generic product.",
            "No external publishing, email, direct message, or outreach occurs without founder approval.",
            "WE EVOLVE. NEVER DELETE: historical packs and learning records remain available.",
        ],
        "empire_examples": [
            {"universe": "Empire-1", "headline": "We removed the claims our evidence could not support.", "proof": "tests, receipts, release evidence, and live workflow output"},
            {"universe": "Lyrica 3", "headline": "One Song. Six Proof Layers. No Lost Ownership.", "proof": "creation, DNA identity, Soulprint, VICS signing, ledger, and payout evidence"},
            {"universe": "Archisynapse", "headline": "Was the event entitled to create money?", "proof": "VICS verification, durable state, ledger entries, and balanced receipts"},
            {"universe": "Cultura Vibe Forge", "headline": "Culture belongs in the system architecture.", "proof": "heritage logic, dialect integrity, authenticity checks, and community context"},
            {"universe": "HIC / Empire Auto Cofounder", "headline": "The agent knows when it is not authorized to execute.", "proof": "approval state, preflight, sealed manifest, receipt, and audit status"},
            {"universe": "Southern Lifestyle", "headline": "Infrastructure becomes believable inside a real tenant experience.", "proof": "tenant boundaries, live routes, activity, and customer-facing workflow"},
            {"universe": "Founding 8 Youth Tech", "headline": "Turn technology consumption into skills and ownership.", "proof": "completed projects, learned tools, safe demos, and creator-owned portfolios"},
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "status": "proof_review" if not scoring["publish_ready"] else "draft",
        "founder_approved": False,
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
        {"$inc": {"outreach_steps": 1}},
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
        {"$set": {f"items.{item_index}.done": not current}},
    )
    updated = await db.gtm_launch_checklists.find_one({"id": checklist_id}, {"_id": 0})
    done = sum(1 for item in updated["items"] if item["done"])
    total = len(updated["items"])
    await db.gtm_launch_checklists.update_one(
        {"id": checklist_id},
        {"$set": {"progress": round((done / total) * 100, 1) if total else 0}},
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
    cursor = db.gtm_viral_audit_packs.find({}, {"_id": 0}).sort("created_at", -1).limit(50)
    packs = await cursor.to_list(50)
    return {"success": True, "packs": packs}


@router.get("/viral-audit-packs/{pack_id}")
async def get_viral_audit_pack(pack_id: str):
    db = get_database()
    pack = await db.gtm_viral_audit_packs.find_one({"id": pack_id}, {"_id": 0})
    if not pack:
        raise HTTPException(status_code=404, detail="Content growth pack not found")
    return {"success": True, "pack": pack}


@router.put("/viral-audit-packs/{pack_id}/status")
async def update_viral_audit_pack_status(pack_id: str, payload: PackStatusUpdate):
    if payload.status not in CONTENT_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid content status")
    if payload.status in ["approved", "scheduled", "published"] and not payload.founder_approved:
        raise HTTPException(status_code=400, detail="Founder approval is required before approval, scheduling, or publication")
    db = get_database()
    existing = await db.gtm_viral_audit_packs.find_one({"id": pack_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Content growth pack not found")
    blockers = existing.get("scoring", {}).get("blockers", [])
    if payload.status in ["approved", "scheduled", "published"] and blockers:
        raise HTTPException(status_code=400, detail="Resolve proof blockers before advancing this pack")
    update = {
        "status": payload.status,
        "founder_approved": payload.founder_approved,
        "approval_note": payload.approval_note,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.gtm_viral_audit_packs.update_one({"id": pack_id}, {"$set": update})
    updated = await db.gtm_viral_audit_packs.find_one({"id": pack_id}, {"_id": 0})
    return {"success": True, "pack": updated}


@router.post("/content-growth/signals")
async def create_content_signal(payload: ContentSignalCreate):
    product = _validate_universe(payload.product_universe)
    evidence = payload.evidence_classification.strip().lower()
    if evidence not in EVIDENCE_CLASSIFICATIONS:
        raise HTTPException(status_code=400, detail="Invalid evidence classification")
    if not payload.title.strip() or not payload.extracted_signal.strip():
        raise HTTPException(status_code=400, detail="Signal title and extracted signal are required")
    now = datetime.now(timezone.utc).isoformat()
    signal = payload.model_dump()
    signal.update({
        "id": f"SIGNAL-{uuid.uuid4().hex[:8].upper()}",
        "product_universe": product,
        "evidence_classification": evidence,
        "created_at": now,
        "updated_at": now,
    })
    db = get_database()
    await db.gtm_content_signals.insert_one(signal.copy())
    return {"success": True, "signal": signal}


@router.get("/content-growth/signals")
async def list_content_signals():
    db = get_database()
    cursor = db.gtm_content_signals.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    signals = await cursor.to_list(100)
    return {"success": True, "signals": signals}


@router.post("/content-growth/metrics")
async def create_growth_metric(payload: GrowthMetricCreate):
    product = _validate_universe(payload.product_universe)
    metric = payload.model_dump()
    metric.update({
        "id": f"METRIC-{uuid.uuid4().hex[:8].upper()}",
        "product_universe": product,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db = get_database()
    await db.gtm_content_metrics.insert_one(metric.copy())
    return {"success": True, "metric": metric}


@router.get("/content-growth/metrics")
async def list_growth_metrics():
    db = get_database()
    cursor = db.gtm_content_metrics.find({}, {"_id": 0}).sort("created_at", -1).limit(200)
    metrics = await cursor.to_list(200)
    return {"success": True, "metrics": metrics}


@router.post("/content-growth/learnings")
async def create_learning_note(payload: LearningNoteCreate):
    product = _validate_universe(payload.product_universe)
    if not payload.observation.strip() or not payload.recommendation.strip():
        raise HTTPException(status_code=400, detail="Observation and recommendation are required")
    learning = payload.model_dump()
    learning.update({
        "id": f"LEARN-{uuid.uuid4().hex[:8].upper()}",
        "product_universe": product,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db = get_database()
    await db.gtm_content_learnings.insert_one(learning.copy())
    return {"success": True, "learning": learning}


@router.get("/content-growth/learnings")
async def list_learning_notes():
    db = get_database()
    cursor = db.gtm_content_learnings.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    learnings = await cursor.to_list(100)
    return {"success": True, "learnings": learnings}


@router.get("/content-growth/dashboard")
async def content_growth_dashboard():
    db = get_database()
    packs = await db.gtm_viral_audit_packs.find({}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    signals = await db.gtm_content_signals.find({}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
    metrics = await db.gtm_content_metrics.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    learnings = await db.gtm_content_learnings.find({}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)

    totals = {
        "reach": sum(item.get("reach", 0) for item in metrics),
        "saves": sum(item.get("saves", 0) for item in metrics),
        "qualified_comments": sum(item.get("qualified_comments", 0) for item in metrics),
        "profile_visits": sum(item.get("profile_visits", 0) for item in metrics),
        "direct_messages": sum(item.get("direct_messages", 0) for item in metrics),
        "applications": sum(item.get("applications", 0) for item in metrics),
        "meetings": sum(item.get("meetings", 0) for item in metrics),
        "attributed_revenue": round(sum(item.get("attributed_revenue", 0) for item in metrics), 2),
    }
    publish_ready = sum(1 for item in packs if item.get("scoring", {}).get("publish_ready"))
    approved = sum(1 for item in packs if item.get("founder_approved"))
    published = sum(1 for item in packs if item.get("status") == "published")
    conversion_actions = totals["applications"] + totals["meetings"] + totals["direct_messages"]
    conversion_rate = round((conversion_actions / totals["reach"]) * 100, 2) if totals["reach"] else 0

    return {
        "success": True,
        "dashboard": {
            "workflow": ["DISCOVER", "VERIFY", "CREATE", "DISTRIBUTE", "CONVERT", "LEARN", "REUSE"],
            "counts": {
                "signals": len(signals),
                "packs": len(packs),
                "publish_ready": publish_ready,
                "founder_approved": approved,
                "published": published,
                "learning_notes": len(learnings),
            },
            "totals": totals,
            "conversion_rate_percent": conversion_rate,
            "recent_signals": signals[:6],
            "recent_packs": packs[:8],
            "recent_learnings": learnings[:6],
            "next_actions": [
                "Convert one verified Lyrica 3 or Archisynapse proof into a founder authority post.",
                "Attach a specific receipt, test, screenshot, metric, deployment, or source to every performance claim.",
                "Choose one conversion target before scheduling the five-day sequence.",
                "Record audience objections and performance data after publication so the next pack can reuse what worked.",
            ],
        },
    }


@router.get("/metrics")
async def gtm_metrics():
    db = get_database()
    campaigns = await db.gtm_campaigns.count_documents({})
    active = await db.gtm_campaigns.count_documents({"status": "active"})
    steps = await db.gtm_outreach_steps.count_documents({})
    viral_packs = await db.gtm_viral_audit_packs.count_documents({})
    content_signals = await db.gtm_content_signals.count_documents({})
    content_metrics = await db.gtm_content_metrics.count_documents({})
    content_learnings = await db.gtm_content_learnings.count_documents({})
    return {
        "success": True,
        "metrics": {
            "total_campaigns": campaigns,
            "active_campaigns": active,
            "total_outreach_steps": steps,
            "viral_audit_packs": viral_packs,
            "content_signals": content_signals,
            "content_metrics": content_metrics,
            "content_learnings": content_learnings,
        },
    }
