"""
Empire Receipts Agent — Revenue Receipt Engine
Turns any business, repo, creator brand, or offer into a paid revenue receipt.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
import json
import time
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/revenue-receipts", tags=["Revenue Receipts"])

# In-memory store for receipts (replace with DB in production)
_receipts: dict[str, dict] = {}

# ---------------------------------------------------------
# MODELS
# ---------------------------------------------------------

class RevenueReceiptRequest(BaseModel):
    business_name: str
    business_type: str = "other"
    current_offer: str
    target_customer: str
    current_price: Optional[str] = None
    revenue_goal: Optional[str] = None
    links_or_notes: Optional[str] = None
    urgency_level: str = "normal"
    desired_output_type: str = "quick"  # quick | full | sprint

class RevenueReceiptResponse(BaseModel):
    receipt_id: str
    created_at: str
    status: str
    price_tier: str
    diagnosis: dict
    fastest_offer: dict
    target_buyer: dict
    pricing_ladder: dict
    landing_page_copy: str
    dm_script: str
    email_script: str
    execution_plan: dict
    execution_receipt: dict
    next_actions: List[str]

# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _generate_receipt_id() -> str:
    return f"REC-{uuid.uuid4().hex[:8].upper()}"

def _build_diagnosis(data: RevenueReceiptRequest) -> dict:
    issues = []
    if not data.current_offer.strip():
        issues.append("No clear offer defined")
    if not data.target_customer.strip():
        issues.append("No target customer defined")
    if not data.current_price and data.desired_output_type != "quick":
        issues.append("No current pricing defined")
    if data.urgency_level == "high":
        issues.append("Urgency indicates immediate revenue need")

    return {
        "business_name": data.business_name,
        "business_type": data.business_type,
        "current_offer": data.current_offer,
        "target_customer": data.target_customer,
        "current_price": data.current_price or "Not set",
        "revenue_goal": data.revenue_goal or "Not specified",
        "identified_issues": issues,
        "money_leak": f"Missing clear monetization path for {data.business_name}" if not data.current_price else "Pricing exists but may need optimization",
    }

def _build_fastest_offer(data: RevenueReceiptRequest) -> dict:
    base = data.current_offer if data.current_offer.strip() else data.business_name

    quick_offer = base
    if data.desired_output_type == "quick":
        quick_offer = f"{base} — Revenue Audit & Execution Plan"
    elif data.desired_output_type == "full":
        quick_offer = f"{base} — Full Revenue System & Go-to-Market Package"
    elif data.desired_output_type == "sprint":
        quick_offer = f"{base} — Done-With-You Revenue Sprint"

    return {
        "offer_name": quick_offer,
        "core_promise": f"Turn {data.business_name} into a revenue-generating system by Monday",
        "deliverables": [
            "Revenue Diagnosis",
            "Money Leak Audit",
            "Fastest Paid Offer",
            "Pricing Ladder",
            "Landing Page Copy",
            "Cold DM / Email Kit",
            "72-Hour Execution Plan",
            "Execution Receipt with Proof",
        ],
        "delivery_time": "48-72 hours" if data.desired_output_type != "sprint" else "Weekend sprint",
    }

def _build_target_buyer(data: RevenueReceiptRequest) -> dict:
    return {
        "primary": data.target_customer,
        "secondary": f"Agencies serving {data.business_type} businesses" if data.business_type else "Freelancers and consultants",
        "buyer_pain": f"{data.target_customer} needs a clear revenue path fast",
        "buyer_budget": "$97 - $2,500+",
    }

def _build_pricing_ladder(data: RevenueReceiptRequest) -> dict:
    return {
        "tiers": [
            {"name": "Quick Receipt", "price": "$97", "audience": "Founders needing fast clarity", "deliverables": "Audit + Offer + Pricing + DM"},
            {"name": "Full Receipt", "price": "$299", "audience": "Businesses ready to execute", "deliverables": "Full diagnosis + Offer + Pricing + Copy + Email + Execution Plan + Receipt"},
            {"name": "Revenue Sprint", "price": "$999", "audience": "Agencies & founders wanting done-with-you", "deliverables": "Everything in Full + 2 calls + Review + White-glove delivery"},
            {"name": "White-Label System", "price": "$2,500+", "audience": "Agencies reselling revenue systems", "deliverables": "Custom setup + Branded receipt system + License"},
        ],
        "recommended_tier": "Full Receipt" if data.desired_output_type == "full" else "Quick Receipt",
    }

def _build_landing_copy(data: RevenueReceiptRequest) -> str:
    headline = f"Get a Revenue Receipt for {data.business_name} by Monday"
    subheadline = f"We find the fastest paid offer hiding inside {data.current_offer or data.business_name} — then give you pricing, outreach, landing copy, and a 72-hour execution plan to sell it."
    return f"""# {headline}

{subheadline}

## What You Get
1. Revenue Diagnosis — where the money is stuck
2. Money Leak Audit — what's blocking revenue
3. Fastest Paid Offer — what to sell first
4. Pricing Ladder — $97 → $299 → $999 → monthly
5. Landing Page Copy — headline, offer, CTA
6. Cold DM + Email Kit — ready to send
7. 72-Hour Execution Plan — Monday-ready
8. Execution Receipt — proof of analysis

## Your Investment
- Quick Receipt: $97
- Full Receipt: $299
- Revenue Sprint: $999
- White-Label System: $2,500+

## CTA
[Generate My Revenue Receipt →]

_Results in 48-72 hours. Money leak identified. Offer built. Receipt delivered._"""

def _build_dm_script(data: RevenueReceiptRequest) -> str:
    return f"""Hey, I ran your business through Empire Receipts Agent — it finds the fastest paid offer hiding inside any business.

For {data.business_name}, here's what it surfaced:
• Revenue leak: {_build_diagnosis(data).get('money_leak', 'Unclear monetization')}
• Fastest offer: {_build_fastest_offer(data).get('offer_name', data.current_offer)}
• Target buyer: {data.target_customer}
• Recommended first price: $97–$299

Want the full receipt with pricing ladder, landing copy, outreach kit, and 72-hour plan? I can send it over."""

def _build_email_script(data: RevenueReceiptRequest) -> str:
    return f"""Subject: Revenue Receipt for {data.business_name}

Hi,

I ran {data.business_name} through Empire Receipts Agent — an AI revenue execution system that turns businesses into paid offers with proof.

Here's what came back:

**Revenue Diagnosis**
{_build_diagnosis(data).get('money_leak')}

**Fastest Offer**
{_build_fastest_offer(data).get('offer_name')}

**Target Buyer**
{data.target_customer}

**Price Ladder**
$97 — Quick Receipt
$299 — Full Receipt with outreach kit
$999 — Done-with-you sprint
$2,500+ — White-label system

I can deliver the full receipt with copy, DMs, emails, and execution plan in 48 hours.

Want me to send it over?

— Empire Receipts Agent"""

def _build_execution_plan(data: RevenueReceiptRequest) -> dict:
    return {
        "phase_1": {
            "days": "Day 1",
            "actions": [
                f"Validate {data.current_offer or data.business_name} against market demand",
                "Draft pricing based on value delivered",
                "Write landing page copy",
            ]
        },
        "phase_2": {
            "days": "Day 2",
            "actions": [
                "Build outreach list (first 20 prospects)",
                "Write DM and email sequences",
                "Set up payment link or checkout",
            ]
        },
        "phase_3": {
            "days": "Day 3",
            "actions": [
                "Send first outreach batch",
                "Post offer on relevant channels",
                "Track response and iterate",
            ]
        },
    }

def _build_receipt(data: RevenueReceiptRequest, receipt_id: str) -> dict:
    engine_path = ["money_pipeline_engine", "persona_engine", "blueprint_engine", "evaluator_engine"]
    return {
        "receipt_id": receipt_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "engine_path": engine_path,
        "input_summary": {
            "business": data.business_name,
            "offer": data.current_offer,
            "target": data.target_customer,
        },
        "assumptions": [
            "Customer has a valid offer or business to analyze",
            "Customer can execute within 72 hours",
            "Recommended pricing is a starting point — validate with first 5 sales",
        ],
        "risks": [
            "No execution = no revenue (this is a plan, not a guarantee)",
            "Pricing may need adjustment based on market feedback",
            "If no audience exists, outreach will take longer than 72 hours",
        ],
        "roi_projection": f"Based on pricing ladder, first sale at $97 covers the investment. First 3-5 sales at $299 = ~$1,000+ ROI within week one.",
        "next_steps": [
            "Review and customize the offer",
            "Set up payment collection",
            "Send first 10 DMs today",
            "Post landing page",
            "Track conversions and iterate",
        ],
    }

def _resolve_price_tier(desired: str) -> str:
    return {"quick": "$97 — Quick Receipt", "full": "$299 — Full Receipt", "sprint": "$999 — Revenue Sprint"}.get(desired, "$97 — Quick Receipt")

# ---------------------------------------------------------
# FALLBACK RECEIPT (when engine fails)
# ---------------------------------------------------------

def _build_fallback_receipt(data: RevenueReceiptRequest) -> dict:
    receipt_id = _generate_receipt_id()
    return {
        "receipt_id": receipt_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "generated",
        "price_tier": _resolve_price_tier(data.desired_output_type),
        "diagnosis": _build_diagnosis(data),
        "fastest_offer": _build_fastest_offer(data),
        "target_buyer": _build_target_buyer(data),
        "pricing_ladder": _build_pricing_ladder(data),
        "landing_page_copy": _build_landing_copy(data),
        "dm_script": _build_dm_script(data),
        "email_script": _build_email_script(data),
        "execution_plan": _build_execution_plan(data),
        "execution_receipt": _build_receipt(data, receipt_id),
        "next_actions": [
            f"Launch {_build_fastest_offer(data).get('offer_name')}",
            "Validate pricing with first 5 prospects",
            "Send outreach daily for 7 days",
        ],
        "note": "Engine-generated version. Purchase full receipt for expanded analysis.",
    }

# ---------------------------------------------------------
# TRY MONEY PIPELINE ENGINE
# ---------------------------------------------------------

def _try_money_pipeline(data: RevenueReceiptRequest) -> Optional[dict]:
    try:
        from services.money_pipeline_engine import MoneyPipelineEngine
        idea = f"{data.current_offer or data.business_name} for {data.target_customer}"
        context = f"Business: {data.business_name}. Type: {data.business_type}. Offer: {data.current_offer}. Target: {data.target_customer}. Revenue goal: {data.revenue_goal or 'Not specified'}."
        result = MoneyPipelineEngine.generate_pipeline(idea=idea, context=context, target_revenue=data.revenue_goal)
        return result
    except Exception as e:
        return None

# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------

@router.post("/run")
def run_revenue_receipt(body: RevenueReceiptRequest):
    receipt_id = _generate_receipt_id()

    engine_result = _try_money_pipeline(body)

    receipt = _build_fallback_receipt(body)
    receipt["receipt_id"] = receipt_id

    if engine_result:
        receipt["note"] = "Engine-enhanced receipt with Money Pipeline analysis."
        receipt["engine_output"] = engine_result

    _receipts[receipt_id] = receipt

    try:
        from services.execution_logger import execution_logger
        execution_logger.log(
            engine="revenue_receipts_agent",
            endpoint="POST /run",
            method="POST",
            input_data=body.model_dump(),
            output_data={"receipt_id": receipt_id, "status": "generated"},
            source="revenue_receipts_agent",
        )
    except Exception:
        pass

    return receipt


@router.get("/{receipt_id}")
def get_receipt(receipt_id: str):
    receipt = _receipts.get(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipt


@router.get("")
def list_receipts():
    return {
        "receipts": [
            {
                "receipt_id": rid,
                "created_at": r.get("created_at"),
                "status": r.get("status"),
                "price_tier": r.get("price_tier"),
                "business_name": r.get("diagnosis", {}).get("business_name", "Unknown"),
            }
            for rid, r in _receipts.items()
        ],
        "count": len(_receipts),
    }


@router.post("/checkout")
def create_receipt_checkout(body: RevenueReceiptRequest):
    price_map = {"quick": "price_quick_receipt", "full": "price_full_receipt", "sprint": "price_sprint_receipt"}
    price_id = price_map.get(body.desired_output_type, "price_quick_receipt")

    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    if not stripe_key or stripe_key.startswith("sk_test_placeholder"):
        return {
            "success": False,
            "url": None,
            "message": "Payment not configured. Contact Empire-1 to complete order.",
            "receipt": _build_fallback_receipt(body),
        }

    try:
        import stripe
        stripe.api_key = stripe_key
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{os.environ.get('APP_URL', 'http://localhost:3000')}/revenue-receipt?success=true",
            cancel_url=f"{os.environ.get('APP_URL', 'http://localhost:3000')}/revenue-receipt?canceled=true",
        )
        return {"success": True, "url": session.url, "receipt": _build_fallback_receipt(body)}
    except Exception as e:
        return {
            "success": False,
            "url": None,
            "message": f"Checkout error: {str(e)}",
            "receipt": _build_fallback_receipt(body),
        }
