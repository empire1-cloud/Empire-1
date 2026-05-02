from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from ..services.sla113_logs import SLA113LoggingService
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/logs", tags=["SLA113 Logs"])

require_sla113_admin = DashboardAuth.require_role("operator_advanced")


# ---------------------------------------------------------
# LOGGING ENDPOINTS
# ---------------------------------------------------------
@router.get("")
async def get_logs(
    admin_id: Optional[str] = None,
    action: Optional[str] = None,
    tenant_id: Optional[str] = None,
    engine: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    admin: dict = Depends(require_sla113_admin)
):
    """Get SLA113 admin logs with optional filtering."""
    service = SLA113LoggingService()
    try:
        logs = await service.get_admin_logs(
            admin_id=admin_id,
            action=action,
            tenant_id=tenant_id,
            engine=engine,
            limit=limit
        )
    except Exception:
        logs = []
    return {"success": True, "logs": logs, "count": len(logs), "note": "log_store_unavailable" if not logs else None}


@router.get("/recent")
async def get_recent_logs(
    limit: int = Query(default=50, le=500),
    admin: dict = Depends(require_sla113_admin)
):
    """Get most recent SLA113 logs."""
    service = SLA113LoggingService()
    try:
        logs = await service.get_recent_logs(limit=limit)
    except Exception:
        logs = []
    return {"success": True, "logs": logs, "count": len(logs), "note": "log_store_unavailable" if not logs else None}


@router.get("/usage")
async def get_usage_logs(
    tenant_id: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    admin: dict = Depends(require_sla113_admin)
):
    """Get tenant usage logs."""
    service = SLA113LoggingService()
    logs = await service.get_usage_logs(tenant_id=tenant_id, limit=limit)
    return {"success": True, "logs": logs, "count": len(logs)}


@router.get("/engine")
async def get_engine_logs(
    engine: Optional[str] = None,
    tenant_id: Optional[str] = None,
    limit: int = Query(default=100, le=1000),
    admin: dict = Depends(require_sla113_admin)
):
    """Get engine invocation logs."""
    service = SLA113LoggingService()
    logs = await service.get_engine_logs(
        engine=engine,
        tenant_id=tenant_id,
        limit=limit
    )
    return {"success": True, "logs": logs, "count": len(logs)}


@router.post("/write")
async def write_log(
    admin_id: str,
    action: str,
    metadata: Optional[dict] = None,
    tenant_id: Optional[str] = None,
    engine: Optional[str] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Manually write a log entry."""
    service = SLA113LoggingService()
    log_id = await service.log_admin_action(
        admin_id=admin_id,
        action=action,
        metadata=metadata,
        tenant_id=tenant_id,
        engine=engine
    )
    return {"success": True, "log_id": log_id}


@router.get("/count")
async def get_log_count(
    admin_id: Optional[str] = None,
    action: Optional[str] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Get count of log entries."""
    service = SLA113LoggingService()
    count = await service.get_log_count(admin_id=admin_id, action=action)
    return {"success": True, "count": count}
