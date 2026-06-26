"""
Empire GTM Layer — ICP scoring, signal detection, campaign generation, sequence creation, weekly updates.
Connects to Revenue OS data and provides GTM intelligence endpoints.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import uuid

from app.services.empire_gtm_layer import (
    load_gtm_context,
    save_gtm_context,
    score_buyer_profile,
    score_account,
    detect_signals,
    build_signal_to_sequence,
    generate_campaign_plan,
    generate_weekly_gtm_update,
    attach_gtm_to_revenue_os,
)

router = APIRouter(prefix="/gtm", tags=["GTM Layer"])


class ScoreAccountRequest(BaseModel):
    name: str
    segment: str = ""
    urgency: str = "normal"
    budget: float = 0
    signals: List[str] = []


class ScoreBuyersRequest(BaseModel):
    buyer_profiles: List[dict]


class DetectSignalsRequest(BaseModel):
    business_name: str
    business_type: str = "other"
    current_offer: str = ""
    target_customer: str = ""
    constraints: str = ""
    links_or_notes: str = ""
    preferred_sales_channel: str = "mixed"


class SignalToSequenceRequest(BaseModel):
    signal: dict
    persona: dict
    offer: dict


class CampaignPlanRequest(BaseModel):
    revenue_os_output: dict
    request_data: Optional[dict] = None


class WeeklyUpdateRequest(BaseModel):
    recent_commands: List[dict] = []
    recent_leads: List[dict] = []


@router.get("/context")
def get_gtm_context():
    return load_gtm_context()


@router.post("/context")
def update_gtm_context(payload: dict):
    save_gtm_context(payload)
    return {"success": True, "message": "GTM context updated"}


@router.post("/score-account")
def api_score_account(body: ScoreAccountRequest):
    context = load_gtm_context()
    result = score_account(body.model_dump(), context)
    return result


@router.post("/score-buyers")
def api_score_buyers(body: ScoreBuyersRequest):
    context = load_gtm_context()
    results = [score_buyer_profile(b, context) for b in body.buyer_profiles]
    return {
        "scored_buyers": results,
        "count": len(results),
        "average_score": round(sum(b["total_score"] for b in results) / len(results), 1) if results else 0,
        "tier_breakdown": {
            "tier_1": len([b for b in results if b["tier"] == "Tier 1"]),
            "tier_2": len([b for b in results if b["tier"] == "Tier 2"]),
            "tier_3": len([b for b in results if b["tier"] == "Tier 3"]),
            "monitor": len([b for b in results if b["tier"] == "Monitor"]),
            "exclude": len([b for b in results if b["tier"] == "Exclude"]),
        },
    }


@router.post("/detect-signals")
def api_detect_signals(body: DetectSignalsRequest):
    context = load_gtm_context()
    result = detect_signals(body.model_dump(), context)
    return result


@router.post("/signal-to-sequence")
def api_signal_to_sequence(body: SignalToSequenceRequest):
    context = load_gtm_context()
    result = build_signal_to_sequence(body.signal, body.persona, body.offer, context)
    return result


@router.post("/campaign-plan")
def api_campaign_plan(body: CampaignPlanRequest):
    context = load_gtm_context()
    result = generate_campaign_plan(body.revenue_os_output, context, body.request_data)
    return result


@router.get("/campaigns")
def api_list_campaigns():
    context = load_gtm_context()
    return {"campaigns": context.get("campaigns", [])}


@router.post("/weekly-update")
def api_weekly_update(body: WeeklyUpdateRequest):
    context = load_gtm_context()
    result = generate_weekly_gtm_update(context, body.recent_commands, body.recent_leads)
    return result
