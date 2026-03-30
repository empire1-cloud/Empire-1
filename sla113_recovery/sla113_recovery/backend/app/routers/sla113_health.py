from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from ..services.system_health import SystemHealthService
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/health", tags=["SLA113 Health"])

require_sla113_admin = DashboardAuth.require_role("operator_standard")


# ---------------------------------------------------------
# HEALTH CHECK ENDPOINTS
# ---------------------------------------------------------
@router.get("")
async def get_health(
    admin: dict = Depends(require_sla113_admin)
):
    """Get full health report for SLA113 system."""
    from ..core.build_spec_loader import get_metadata, get_deployment_config
    service = SystemHealthService()
    report = await service.get_full_health_report()
    meta = get_metadata()
    deploy = get_deployment_config()
    report["os_identity"] = {
        "os": "SLA113",
        "build_id": meta.get("build_id", "sla113-prod-2026-03"),
        "version": meta.get("version", "1.0.0"),
        "environment": deploy.get("environment", "production"),
        "rollout_strategy": deploy.get("rollout_strategy", "canary"),
        "created_at": meta.get("created_at", "2026-03-03T14:41:00Z"),
    }
    return report


@router.get("/mongodb")
async def check_mongodb(
    admin: dict = Depends(require_sla113_admin)
):
    """Check MongoDB Atlas connection."""
    service = SystemHealthService()
    result = await service.check_mongodb_connection()
    return result


@router.get("/postgres")
async def check_postgres(
    admin: dict = Depends(require_sla113_admin)
):
    """Check PostgreSQL connection."""
    service = SystemHealthService()
    result = await service.check_postgres_connection()
    return result


@router.get("/redis")
async def check_redis(
    admin: dict = Depends(require_sla113_admin)
):
    """Check Redis connection."""
    service = SystemHealthService()
    result = await service.check_redis_connection()
    return result


@router.get("/engines")
async def check_engines(
    admin: dict = Depends(require_sla113_admin)
):
    """Check engine availability."""
    service = SystemHealthService()
    result = await service.check_engine_availability()
    return result


@router.get("/hybrid")
async def check_hybrid(
    admin: dict = Depends(require_sla113_admin)
):
    """Check Hybrid backend connectivity."""
    service = SystemHealthService()
    result = await service.check_hybrid_backend()
    return result
