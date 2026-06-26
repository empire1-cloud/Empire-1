"""Internal Business Analytics — MRR, usage per tenant, platform KPIs."""

from fastapi import APIRouter
from datetime import datetime, timezone

from database import get_database

router = APIRouter(prefix="/business-analytics", tags=["Business Analytics"])

REVENUE_LANES = [
    "full_stack_builds", "automation", "micro_saas",
    "white_label", "enterprise", "creative_ai", "admin_ops", "other",
]


@router.get("/revenue")
async def revenue_metrics():
    db = get_database()
    cursor = db.crm_leads.find({"pipeline_stage": {"$in": ["active", "onboarding"]}}, {"_id": 0})
    active_clients = await cursor.to_list(200)

    total_mrr = 0.0
    lane_mrr = {l: 0.0 for l in REVENUE_LANES}
    for client in active_clients:
        val = client.get("value", 0)
        lane = client.get("lane")
        if lane in lane_mrr:
            lane_mrr[lane] += val
        total_mrr += val

    return {
        "success": True,
        "total_mrr": total_mrr,
        "lane_mrr": lane_mrr,
        "active_clients": len(active_clients),
    }


@router.get("/usage")
async def usage_metrics():
    db = get_database()
    now = datetime.now(timezone.utc)

    total_users = await db.users.count_documents({})
    total_executions = await db.execution_logs.count_documents({})

    recent_cutoff = now.isoformat()
    recent_executions = await db.execution_logs.count_documents({})

    pipeline_count = await db.pipelines.count_documents({})
    teams_count = await db.teams.count_documents({})

    engine_usage = {}
    cursor = db.execution_logs.find({}, {"_id": 0, "engine": 1})
    async for log in cursor:
        eng = log.get("engine", "unknown")
        engine_usage[eng] = engine_usage.get(eng, 0) + 1

    sorted_engines = sorted(engine_usage.items(), key=lambda x: -x[1])[:10]

    return {
        "success": True,
        "metrics": {
            "total_users": total_users,
            "total_executions": total_executions,
            "recent_executions": recent_executions,
            "total_pipelines": pipeline_count,
            "total_teams": teams_count,
            "top_engines": [{"engine": e, "count": c} for e, c in sorted_engines],
        },
    }


@router.get("/kpi")
async def platform_kpis():
    db = get_database()

    users_cursor = db.users.find({}, {"_id": 0, "created_at": 1})
    total_new_users = 0
    async for user in users_cursor:
        total_new_users += 1

    active_teams = await db.teams.count_documents({"is_active": True})
    total_invites = await db.team_invites.count_documents({})
    pending_invites = await db.team_invites.count_documents({"is_active": True})

    crm_leads = await db.crm_leads.count_documents({})
    active_clients = await db.crm_leads.count_documents({"pipeline_stage": "active"})

    return {
        "success": True,
        "kpis": {
            "total_users": total_new_users,
            "active_teams": active_teams,
            "total_invites": total_invites,
            "pending_invites": pending_invites,
            "crm_leads": crm_leads,
            "active_clients": active_clients,
            "conversion_rate": round((active_clients / max(crm_leads, 1)) * 100, 1),
        },
    }
