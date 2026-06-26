"""
Empire Revenue OS — Full Revenue Operating System
Generates, sells, tracks, charges, delivers, and reports revenue workflows.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import uuid
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/revenue-os", tags=["Revenue OS"])

# ---------------------------------------------------------
# MODELS
# ---------------------------------------------------------

class RevenueOSRunRequest(BaseModel):
    business_name: str
    business_type: str = "other"
    current_offer: str
    target_customer: str
    current_price: Optional[str] = None
    revenue_goal: Optional[str] = None
    links_or_notes: Optional[str] = None
    urgency_level: str = "normal"
    desired_output_type: str = "quick"
    preferred_sales_channel: str = "mixed"
    founder_context: Optional[str] = None
    assets_available: Optional[str] = None
    constraints: Optional[str] = None


class Offer(BaseModel):
    name: str
    price: str
    target_buyer: str
    promise: str
    deliverables: List[str]
    turnaround: str
    cta: str
    risk_reversal: str
    upsell_path: str


class BuyerProfile(BaseModel):
    segment: str
    persona_type: str
    pain_point: str
    why_now: str
    best_channel: str
    opening_angle: str
    offer_fit: str
    priority_score: int


class OutreachCampaign(BaseModel):
    cold_dms: List[str]
    cold_emails: List[str]
    followups: List[str]
    objection_replies: List[str]
    close_messages: List[str]
    call_confirmation: str


class LeadCreate(BaseModel):
    name: str
    segment: str = ""
    channel: str = ""
    offer: str = ""
    status: str = "new"
    estimated_value: Optional[float] = None
    notes: str = ""
    receipt_id: str = ""
    command_id: str = ""


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    segment: Optional[str] = None
    channel: Optional[str] = None
    offer: Optional[str] = None
    status: Optional[str] = None
    estimated_value: Optional[float] = None
    actual_value: Optional[float] = None
    notes: Optional[str] = None
    next_step: Optional[str] = None


class CheckoutRequest(BaseModel):
    business_name: str
    offer_name: str
    price: str
    success_url: str = "/revenue-os?checkout=success"
    cancel_url: str = "/revenue-os?checkout=canceled"


class DeliveryReceiptRequest(BaseModel):
    customer_name: str
    purchased_offer: str
    business_name: str = ""
    delivered_assets: List[str] = []
    receipt_id: Optional[str] = None


class OfferForgeRequest(BaseModel):
    business_name: str
    current_offer: str
    target_customer: str
    business_type: str = "other"


class BuyerFinderRequest(BaseModel):
    business_name: str
    current_offer: str
    target_customer: str
    business_type: str = "other"
    count: int = 25


class OutreachRequest(BaseModel):
    business_name: str
    offer_name: str
    target_customer: str
    preferred_sales_channel: str = "mixed"


class ReceiptRequest(BaseModel):
    business_name: str
    current_offer: str
    target_customer: str
    business_type: str = "other"
    current_price: Optional[str] = None
    revenue_goal: Optional[str] = None


# ---------------------------------------------------------
# PERSISTENCE
# ---------------------------------------------------------

def _ensure_store():
    try:
        from app.services.revenue_os_store import ensure_store
        ensure_store()
        return True
    except Exception:
        return False


def _append_record(store: str, record: dict):
    try:
        from app.services.revenue_os_store import append_record, update_record, get_record, list_records, load_json_store
        from app.services.revenue_os_store import save_json_store as _save
        if store == "commands":
            recs = load_json_store("commands")
            recs.append(record)
            _save("commands", recs)
            return record
        return append_record(store, record)
    except Exception:
        return record


def _load_store(store: str) -> List[dict]:
    try:
        from app.services.revenue_os_store import load_json_store
        return load_json_store(store)
    except Exception:
        return []


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def _generate_id(prefix: str = "REV") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"


def _id() -> str:
    return uuid.uuid4().hex


# ---------------------------------------------------------
# ENGINE INTEGRATION
# ---------------------------------------------------------

def _try_money_pipeline(idea: str, context: str = "", target_revenue: str = "") -> Optional[dict]:
    try:
        from services.money_pipeline_engine import MoneyPipelineEngine
        kwargs = {"idea": idea}
        if context:
            kwargs["context"] = context
        if target_revenue:
            kwargs["target_revenue"] = target_revenue
        return MoneyPipelineEngine.generate_pipeline(**kwargs)
    except Exception:
        return None


# ---------------------------------------------------------
# MODULE BUILDERS
# ---------------------------------------------------------

def _build_receipt(data: dict) -> dict:
    offer = data.get("current_offer", data.get("business_name", ""))
    target = data.get("target_customer", "")
    biz = data.get("business_name", "")

    issues = []
    if not offer.strip():
        issues.append("No clear offer defined")
    if not target.strip():
        issues.append("No target customer defined")

    return {
        "revenue_diagnosis": {
            "business_name": biz,
            "current_offer": offer,
            "target_customer": target,
            "current_price": data.get("current_price", "Not set"),
            "revenue_goal": data.get("revenue_goal", "Not specified"),
            "identified_issues": issues,
            "money_leak": f"Missing clear monetization path for {biz}" if not data.get("current_price") else "Pricing exists but may need optimization",
        },
        "money_leak_audit": {
            "primary_leak": f"No clear paid offer path from {offer} to {target}",
            "secondary_leaks": [
                "No pricing ladder visible",
                "No outreach system in place",
                "No delivery receipt for proof of value",
            ],
            "estimated_leak_amount": data.get("revenue_goal", "$5,000+"),
        },
        "fastest_paid_offer": f"{offer} — Revenue Execution Package for {target}",
        "target_buyer": {
            "primary": target,
            "secondary": f"Agencies serving {data.get('business_type', 'other')} businesses",
            "pain": f"{target} needs immediate revenue clarity and a sellable offer",
            "budget": "$97 - $2,500+",
        },
        "price_ladder": {
            "tiers": [
                {"name": "Quick Start", "price": "$97", "audience": "Founders needing fast clarity"},
                {"name": "Core System", "price": "$299", "audience": "Businesses ready to execute"},
                {"name": "Revenue Sprint", "price": "$999", "audience": "Done-with-you execution"},
                {"name": "White-Label", "price": "$2,500+", "audience": "Agencies reselling"},
            ],
            "recommended": "Core System" if data.get("desired_output_type") == "full" else "Quick Start",
        },
        "landing_page_copy": f"# Get a Revenue System for {biz} by Monday\n\n"
        f"We find the fastest paid offer hiding inside {offer} — then give you pricing, outreach, landing copy, and a 72-hour execution plan.\n\n"
        "## What You Get\n"
        "1. Revenue Diagnosis — where the money is stuck\n"
        "2. Fastest Paid Offer — what to sell first\n"
        "3. Pricing Ladder — $97 → $299 → $999 → monthly\n"
        "4. Cold DM + Email Kit — ready to send\n"
        "5. 72-Hour Execution Plan — Monday-ready\n"
        f"## CTA\n[Get Your {biz} Revenue System →]",
        "cold_dm_script": f"Hey, I ran {biz} through Empire Revenue OS — it finds the fastest paid offer hiding inside any business.\n\n"
        f"For {biz}, here is what it surfaced:\n"
        f"• Fastest offer: {offer} for {target}\n"
        f"• Recommended first price: $97–$299\n\n"
        "Want the full system with pricing ladder, outreach kit, and 72-hour plan?",
        "email_script": f"Subject: Revenue System for {biz}\n\n"
        f"I ran {biz} through Empire Revenue OS. Here is what came back:\n\n"
        f"**Fastest Offer**\n{offer} for {target}\n\n"
        f"**Price Ladder**\n$97 — Quick Start\n$299 — Core System\n$999 — Revenue Sprint\n$2,500+ — White-Label\n\n"
        "I can deliver the full system in 48 hours. Want me to send it over?",
        "delivery_checklist": [
            "Revenue diagnosis delivered",
            "Fastest offer documented",
            "Pricing ladder built",
            "Outreach kit prepared",
            "Payment path configured",
            "Execution plan delivered",
        ],
        "execution_receipt": {"generated": datetime.now(timezone.utc).isoformat(), "status": "ready"},
        "seventy_two_hour_action_plan": {
            "day_1": [f"Validate {offer} against market demand", "Draft pricing based on value", "Write landing page copy"],
            "day_2": ["Build outreach list (first 20 prospects)", "Write DM and email sequences", "Set up payment link or checkout"],
            "day_3": ["Send first outreach batch", "Post offer on relevant channels", "Track response and iterate"],
        },
    }


def _build_offers(data: dict) -> List[dict]:
    offer = data.get("current_offer", data.get("business_name", ""))
    target = data.get("target_customer", "")

    return [
        {
            "name": f"{offer} — Quick Revenue Audit",
            "price": "$97",
            "target_buyer": target,
            "promise": "Find the fastest paid offer hiding inside your business in 24 hours",
            "deliverables": [
                "Revenue diagnosis",
                "Money leak audit",
                "Fastest paid offer recommendation",
                "Pricing suggestion",
                "One cold DM template",
            ],
            "turnaround": "24 hours",
            "cta": "Get Your Quick Audit",
            "risk_reversal": "If you do not find at least one new revenue insight, it is free.",
            "upsell_path": "Core Revenue System ($299)",
        },
        {
            "name": f"{offer} — Core Revenue System",
            "price": "$299",
            "target_buyer": target,
            "promise": "Complete revenue system with pricing ladder, outreach kit, landing copy, and 72-hour execution plan",
            "deliverables": [
                "Full revenue diagnosis",
                "3-tier pricing ladder",
                "Landing page copy",
                "5 cold DMs",
                "3 cold emails",
                "3 follow-up templates",
                "5 objection replies",
                "72-hour execution plan",
                "Delivery receipt template",
            ],
            "turnaround": "48 hours",
            "cta": "Build My Revenue System",
            "risk_reversal": "Full refund if you do not have a sellable offer within 72 hours of delivery.",
            "upsell_path": "Revenue Sprint ($999)",
        },
        {
            "name": f"{offer} — Revenue Sprint",
            "price": "$999",
            "target_buyer": target,
            "promise": "Done-with-you: we build the offer, outreach, and payment path together in one weekend",
            "deliverables": [
                "Everything in Core Revenue System",
                "2 strategy calls",
                "Custom offer crafting",
                "Outreach list building",
                "Payment link setup",
                "First 10 DMs sent together",
                "White-glove delivery",
            ],
            "turnaround": "Weekend sprint",
            "cta": "Book Your Sprint",
            "risk_reversal": "If you do not book a paid call within 7 days, we extend support free for 30 days.",
            "upsell_path": "White-Label System ($2,500+)",
        },
    ]


_BUYER_SEGMENTS = [
    ("Local Service", "Solo Owner"),
    ("Local Service", "Multi-Location Operator"),
    ("E-commerce", "DTC Founder"),
    ("E-commerce", "Amazon FBA Seller"),
    ("SaaS", "Indie Founder"),
    ("SaaS", "Pre-Seed Startup"),
    ("SaaS", "B2B SaaS CEO"),
    ("Agency", "Freelance Designer"),
    ("Agency", "Web Dev Agency Owner"),
    ("Agency", "Marketing Agency Partner"),
    ("Creator", "YouTuber (10-100K)"),
    ("Creator", "Podcaster"),
    ("Creator", "Newsletter Writer"),
    ("Consulting", "Solo Consultant"),
    ("Consulting", "Boutique Consultancy Owner"),
    ("Professional", "Real Estate Agent"),
    ("Professional", "Insurance Broker"),
    ("Professional", "Financial Advisor"),
    ("Health", "Fitness Coach"),
    ("Health", "Nutritionist"),
    ("Health", "Wellness Brand Founder"),
    ("Education", "Online Course Creator"),
    ("Education", "Coach/Trainer"),
    ("Nonprofit", "Executive Director"),
    ("Technology", "Indie Hacker"),
]

def _build_buyer_profiles(data: dict, count: int = 25) -> List[dict]:
    profiles = []
    offer = data.get("current_offer", data.get("business_name", ""))
    for segment, persona in _BUYER_SEGMENTS[:count]:
        profiles.append({
            "segment": segment,
            "persona_type": persona,
            "pain_point": f"Needs a clear revenue system for their {segment.lower()} business but lacks time and technical skills",
            "why_now": "Competitors are automating sales and delivery; manual processes are losing revenue daily",
            "best_channel": "linkedin" if segment in ("SaaS", "Agency", "Consulting", "Technology") else "instagram" if segment in ("Creator", "Health", "Education") else "email",
            "opening_angle": f"Saw you are building in {segment.lower()} — I found a revenue system for {offer} that might fit what you are doing",
            "offer_fit": "Core Revenue System ($299)" if segment in ("SaaS", "Agency", "Consulting") else "Quick Revenue Audit ($97)",
            "priority_score": 85 if segment in ("SaaS", "Agency", "E-commerce") else 70 if segment in ("Creator", "Consulting") else 55,
        })
    return profiles


_CHANNELS = ["linkedin", "email", "instagram", "local", "phone", "mixed"]

def _build_outreach(data: dict) -> dict:
    biz = data.get("business_name", "")
    offer = data.get("offer_name", data.get("current_offer", ""))
    target = data.get("target_customer", "")
    channel = data.get("preferred_sales_channel", "mixed")

    return {
        "cold_dms": [
            f"Hey! I analyzed {biz} through our revenue system and found a fast path to turn {offer} into a paid offer for {target}. Want me to send the breakdown?",
            f"Quick question — are you currently selling {offer} as a packaged offer, or is it custom every time?",
            f"I help {target} set up revenue systems in 48 hours. Here is the exact offer that works: {offer} starting at $97.",
            f"Noticed you are in the {target} space. We just built a revenue system for {biz} — 3 paid offers, outreach kit, execution plan. Want to see it?",
            f"If you could have a ready-to-send offer for {target} by Monday, would that be valuable?",
        ],
        "cold_emails": [
            f"Subject: Revenue system for {biz}\n\nHi,\n\nI built a revenue system for {biz} — 3 paid offers, buyer profiles, outreach campaign, and a 72-hour execution plan.\n\nWant me to share the key findings?",
            f"Subject: {offer} for {target}\n\nHi,\n\nWe specialize in turning offers like {offer} into sellable revenue systems.\n\nHere is what we found for {biz}:\n• Fastest offer: {offer} at $97-$299\n• Best channel: {channel}\n• First sale possible within 72 hours\n\nWorth a quick call?",
            f"Subject: Quick question about {biz}\n\nHi,\n\nQuick question — are you packaging {offer} as a repeatable offer, or is it custom every time?\n\nWe built a system that turns it into a sellable product in 48 hours.",
        ],
        "followups": [
            f"Hey, following up on {offer}. The revenue system includes pricing ladder, outreach copy, and delivery receipt. Ready when you are.",
            f"Just a friendly follow-up. We have built revenue systems for similar {target} businesses. Happy to share examples.",
            f"Last follow-up on this. If timing is not right, no worries. The revenue system for {biz} is ready whenever you want it.",
        ],
        "objection_replies": [
            f"Totally fair. The Quick Audit is just $97 and you get a clear offer recommendation in 24 hours. Low risk to see if it fits.",
            f"I hear you. The system is designed to work even if you are solo — the delivery receipt and automated outreach save time.",
            f"Good question. We focus on what is sellable now, not perfect SaaS. That is why the first offer starts at $97.",
            f"Understood. The Core System includes a risk reversal — if you do not have a sellable offer in 72 hours, full refund.",
            f"Valid concern. We use existing AI infrastructure — no custom build needed. That is why we deliver in 48 hours.",
        ],
        "close_messages": [
            f"Ready to start? Here is the link to get your {offer} Revenue System: [link]",
            f"Let us do this. I will send over the intake form and we can have your system ready by [day].",
        ],
        "call_confirmation": f"Confirmed! Here is your call link: [link]. We will cover: 1) Your fastest offer 2) Pricing ladder 3) Outreach plan 4) 72-hour execution roadmap.\n\nSee you there.",
    }


_PIPELINE_STAGES = ["new", "targeted", "contacted", "replied", "call_booked", "invoice_sent", "paid", "delivered", "upsell", "lost"]

def _build_pipeline(data: dict) -> dict:
    return {
        "stages": [{"name": s, "count": 0, "value": 0.0} for s in _PIPELINE_STAGES],
        "total_leads": 0,
        "total_pipeline_value": 0.0,
        "default_stages": _PIPELINE_STAGES,
    }


def _build_checkout(data: dict) -> dict:
    stripe_key = os.environ.get("STRIPE_SECRET_KEY", "")
    stripe_configured = bool(stripe_key) and not stripe_key.startswith("sk_test_placeholder")

    return {
        "stripe_configured": stripe_configured,
        "checkout_url": None,
        "manual_payment_required": not stripe_configured,
        "offer_name": data.get("offer_name", data.get("current_offer", "Revenue System")),
        "recommended_price": data.get("price", "$299"),
        "message": "Payment link configured." if stripe_configured else "Payment link not configured. Use manual payment, invoice, Cash App, PayPal, or Stripe Payment Link for this MVP.",
        "next_step": "Processing payment..." if stripe_configured else "Collect payment manually, then mark lead as paid.",
    }


def _build_delivery_receipt(data: dict) -> dict:
    receipt_id = data.get("receipt_id", _generate_id("DEL"))
    return {
        "receipt_id": receipt_id,
        "customer_name": data.get("customer_name", "Client"),
        "purchased_offer": data.get("purchased_offer", data.get("current_offer", "Revenue System")),
        "delivered_assets": data.get("delivered_assets", [
            "Revenue diagnosis document",
            "Offer forge output (3 paid offers)",
            "Buyer profiles (25 personas)",
            "Outreach campaign (DMs, emails, followups, objections, closes)",
            "Revenue pipeline template",
            "Checkout recommendation",
            "72-hour execution plan",
            "Next actions checklist",
        ]),
        "execution_summary": f"Empire Revenue OS generated a complete revenue system for {data.get('business_name', data.get('customer_name', ''))}. "
        f"The system includes offer forge, buyer finder, outreach desk, pipeline tracker, checkout desk, and delivery receipt engine.",
        "assumptions": [
            "Customer has a valid offer or service to sell",
            "Customer can execute outreach within 72 hours",
            "Pricing is a starting point and should be validated with first 5 sales",
        ],
        "risks": [
            "No execution = no revenue. This is a plan, not a guarantee.",
            "Pricing may need adjustment based on market feedback",
            "If no audience exists, outreach will take longer than projected",
        ],
        "next_7_days": [
            "Day 1: Review and customize offers",
            "Day 2: Set up payment collection",
            "Day 3: Send first 10 DMs",
            "Day 4: Post offer on relevant channels",
            "Day 5: Follow up on responses",
            "Day 6: Review pipeline and adjust pricing",
            "Day 7: Generate delivery receipt for first paid client",
        ],
        "upsell_recommendation": f"After delivering {data.get('purchased_offer', 'Core Revenue System')}, upsell to Revenue Sprint ($999) for ongoing execution support.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _build_analytics() -> dict:
    try:
        from app.services.revenue_os_store import load_json_store
        leads = load_json_store("leads")
        commands = load_json_store("commands")
        receipts_stored = load_json_store("receipts")
    except Exception:
        leads = []
        commands = []
        receipts_stored = []

    total_estimated = sum(l.get("estimated_value", 0) or 0 for l in leads)
    total_actual = sum(l.get("actual_value", 0) or 0 for l in leads)
    paid_leads = [l for l in leads if l.get("status") == "paid"]

    return {
        "total_commands": len(commands),
        "total_receipts": len(receipts_stored),
        "total_leads": len(leads),
        "estimated_pipeline_value": total_estimated,
        "paid_value": total_actual,
        "paid_count": len(paid_leads),
        "leads_by_status": {s: len([l for l in leads if l.get("status") == s]) for s in _PIPELINE_STAGES},
        "receipts_by_output_type": {},
        "top_segments": list(set(l.get("segment", "Unknown") for l in leads if l.get("segment"))),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def _build_action_plan(data: dict) -> dict:
    offer = data.get("current_offer", data.get("business_name", ""))
    target = data.get("target_customer", "")

    return {
        "day_1": [
            f"Finalize {offer} as a paid offer for {target}",
            "Set pricing: $97 Quick Audit, $299 Core System, $999 Sprint",
            "Write landing page headline and CTA",
            "Prepare intake form or payment link",
        ],
        "day_2": [
            "Build outreach list: 20 qualified prospects in target segment",
            "Draft 5 DMs and 3 emails using outreach campaign",
            "Set up manual payment or Stripe checkout",
            "Schedule first 5 DM sends",
        ],
        "day_3": [
            "Send first batch of outreach (5 DMs, 3 emails)",
            "Post about the offer on LinkedIn/Instagram",
            "Track responses and update lead statuses",
            "Review and iterate based on response rate",
        ],
    }


def _build_risks(data: dict) -> List[str]:
    risks = [
        "This is a generated plan — execution determines results",
        "Pricing recommendations are starting points — validate with real prospects",
        "If Stripe is not configured, payment must be collected manually",
        "Outreach effectiveness depends on audience quality and messaging fit",
        "Delivery receipt is a template — customize per client",
        "MVP persistence uses JSON files — data will not survive server restart without persistence layer configured",
    ]
    if data.get("constraints"):
        risks.append(f"User constraint: {data['constraints']}")
    if not data.get("current_price"):
        risks.append("No current pricing provided — revenue diagnosis is limited")
    return risks


def _build_next_actions(data: dict, command_id: str) -> List[str]:
    return [
        f"Review the full Revenue OS output (command {command_id})",
        "Start with the Quick Audit offer — lowest risk, fastest sale",
        "Send first 5 DMs today using the outreach campaign",
        "Set up payment collection (manual or Stripe)",
        "Track leads in the Revenue CRM",
        "Generate a delivery receipt when first client pays",
        "Check Revenue Analytics dashboard for pipeline progress",
    ]


# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------

@router.post("/run")
def run_revenue_os(body: RevenueOSRunRequest):
    data = body.model_dump()
    command_id = _generate_id("CMD")
    receipt_id = _generate_id("REC")

    engine_result = _try_money_pipeline(
        idea=f"{data['current_offer'] or data['business_name']} for {data['target_customer']}",
        context=f"Business: {data['business_name']}. Type: {data['business_type']}. Offer: {data['current_offer']}. Target: {data['target_customer']}. Channel: {data['preferred_sales_channel']}.",
        target_revenue=data.get("revenue_goal", ""),
    )

    receipt = _build_receipt(data)
    forged_offers = _build_offers(data)
    buyer_profiles = _build_buyer_profiles(data, 25)
    outreach = _build_outreach(data)
    pipeline = _build_pipeline(data)
    checkout = _build_checkout(data)
    delivery_template = _build_delivery_receipt({
        "receipt_id": receipt_id,
        "customer_name": "[Customer Name]",
        "purchased_offer": forged_offers[1]["name"] if len(forged_offers) > 1 else forged_offers[0]["name"],
        "business_name": data["business_name"],
        "purchased_offer_price": forged_offers[1]["price"] if len(forged_offers) > 1 else forged_offers[0]["price"],
    })
    analytics = _build_analytics()
    action_plan = _build_action_plan(data)
    risks = _build_risks(data)
    next_actions = _build_next_actions(data, command_id)

    output = {
        "receipt_id": receipt_id,
        "command_id": command_id,
        "receipt": receipt,
        "forged_offers": forged_offers,
        "buyer_profiles": buyer_profiles,
        "outreach_campaign": outreach,
        "revenue_pipeline": pipeline,
        "checkout_recommendation": checkout,
        "delivery_receipt_template": delivery_template,
        "analytics": analytics,
        "seventy_two_hour_action_plan": action_plan,
        "risks": risks,
        "next_actions": next_actions,
        "engine_output": engine_result,
        "note": "Engine-enhanced run." if engine_result else "Generated with deterministic fallback. Purchase a subscription for Money Pipeline enhancement.",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "complete",
    }

    try:
        from app.services.revenue_os_store import load_json_store, save_json_store
        cmds = load_json_store("commands")
        cmds.append({"id": command_id, "receipt_id": receipt_id, "business_name": data["business_name"], "created_at": output["generated_at"], "status": "complete"})
        save_json_store("commands", cmds)
        rcpts = load_json_store("receipts")
        rcpts.append({"id": receipt_id, "command_id": command_id, "business_name": data["business_name"], "created_at": output["generated_at"], "output_type": data.get("desired_output_type", "quick")})
        save_json_store("receipts", rcpts)
    except Exception:
        pass

    try:
        from services.execution_logger import execution_logger
        execution_logger.log(
            engine="revenue_os",
            endpoint="POST /run",
            method="POST",
            input_data={"business_name": data["business_name"], "offer": data["current_offer"], "target": data["target_customer"]},
            output_data={"command_id": command_id, "receipt_id": receipt_id, "status": "complete"},
            source="revenue_os",
        )
    except Exception:
        pass

    return output


@router.post("/receipt")
def generate_receipt(body: ReceiptRequest):
    receipt_id = _generate_id("REC")
    receipt = _build_receipt(body.model_dump())
    receipt["receipt_id"] = receipt_id

    try:
        from app.services.revenue_os_store import load_json_store, save_json_store
        rcpts = load_json_store("receipts")
        rcpts.append({"id": receipt_id, "business_name": body.business_name, "created_at": datetime.now(timezone.utc).isoformat(), "output_type": "receipt"})
        save_json_store("receipts", rcpts)
    except Exception:
        pass

    return {"receipt_id": receipt_id, "receipt": receipt, "generated_at": datetime.now(timezone.utc).isoformat()}


@router.post("/offer-forge")
def forge_offers(body: OfferForgeRequest):
    offers = _build_offers(body.model_dump())
    return {"offers": offers, "count": len(offers)}


@router.post("/buyer-finder")
def find_buyers(body: BuyerFinderRequest):
    profiles = _build_buyer_profiles(body.model_dump(), body.count)
    return {"buyer_profiles": profiles, "count": len(profiles)}


@router.post("/outreach")
def generate_outreach(body: OutreachRequest):
    campaign = _build_outreach(body.model_dump())
    return {"outreach_campaign": campaign}


@router.post("/leads")
def create_lead(body: LeadCreate):
    lead_id = _id()
    now = datetime.now(timezone.utc).isoformat()
    lead = {
        "id": lead_id,
        "created_at": now,
        "updated_at": now,
        "name": body.name,
        "segment": body.segment,
        "channel": body.channel,
        "offer": body.offer,
        "status": body.status,
        "estimated_value": body.estimated_value,
        "actual_value": None,
        "notes": body.notes,
        "next_step": "",
        "last_touch_at": now,
        "receipt_id": body.receipt_id,
        "command_id": body.command_id,
    }
    _append_record("leads", lead)
    return lead


@router.get("/leads")
def list_leads(status: Optional[str] = None, segment: Optional[str] = None):
    filters = {}
    if status:
        filters["status"] = status
    if segment:
        filters["segment"] = segment
    try:
        from app.services.revenue_os_store import list_records
        leads = list_records("leads", **filters) if filters else _load_store("leads")
    except Exception:
        leads = _load_store("leads")
    return {"leads": leads, "count": len(leads)}


@router.patch("/leads/{lead_id}")
def update_lead(lead_id: str, body: LeadUpdate):
    try:
        from app.services.revenue_os_store import update_record
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields to update")
        updated = update_record("leads", lead_id, updates)
        if not updated:
            raise HTTPException(status_code=404, detail="Lead not found")
        return updated
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update lead")


@router.post("/checkout")
def create_checkout(body: CheckoutRequest):
    recommendation = _build_checkout(body.model_dump())

    if recommendation["stripe_configured"]:
        stripe_key = os.environ.get("STRIPE_SECRET_KEY", "")
        try:
            import stripe
            stripe.api_key = stripe_key
            session = stripe.checkout.Session.create(
                mode="payment",
                line_items=[{"price_data": {"currency": "usd", "product_data": {"name": body.offer_name}, "unit_amount": int(body.price.replace("$", "").replace(",", "")) * 100}, "quantity": 1}],
                success_url=f"{os.environ.get('APP_URL', 'http://localhost:3000')}{body.success_url}",
                cancel_url=f"{os.environ.get('APP_URL', 'http://localhost:3000')}{body.cancel_url}",
            )
            recommendation["checkout_url"] = session.url
            recommendation["session_id"] = session.id
        except Exception as e:
            recommendation["stripe_error"] = str(e)
            recommendation["manual_payment_required"] = True
            recommendation["message"] = f"Stripe error: {str(e)}. Use manual payment for now."

    return recommendation


@router.post("/delivery-receipt")
def generate_delivery_receipt(body: DeliveryReceiptRequest):
    receipt = _build_delivery_receipt(body.model_dump())
    _append_record("delivery_receipts", receipt)
    return receipt


@router.get("/analytics")
def get_analytics():
    return _build_analytics()


@router.get("/dashboard")
def get_dashboard():
    analytics = _build_analytics()
    try:
        from app.services.revenue_os_store import load_json_store
        commands = load_json_store("commands")[-20:]
        recent_leads = load_json_store("leads")[-20:]
    except Exception:
        commands = []
        recent_leads = []

    return {
        "analytics": analytics,
        "recent_commands": list(reversed(commands[-10:])),
        "recent_leads": list(reversed(recent_leads[-10:])),
        "pipeline_stages": _PIPELINE_STAGES,
        "dashboard_last_updated": datetime.now(timezone.utc).isoformat(),
    }
