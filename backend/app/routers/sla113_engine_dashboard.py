from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from ..services.engine_dashboard import EngineDashboardService
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/engines", tags=["SLA113 Engine Dashboard"])

require_sla113_admin = DashboardAuth.require_role("operator_standard")


# ---------------------------------------------------------
# ENGINE DASHBOARD ENDPOINTS
# ---------------------------------------------------------
@router.get("/dashboard")
async def get_dashboard(
    admin: dict = Depends(require_sla113_admin)
):
    """Get engine dashboard with status of all engines."""
    service = EngineDashboardService()
    try:
        engines = await service.list_engines()
    except Exception:
        from ..core.engine_namespace import ENGINES
        engines = [
            {"engine_id": eid, "name": e.name, "status": e.status, "health": "unknown", "last_invoked": None}
            for eid, e in ENGINES.items()
        ]
    return {"success": True, "engines": engines, "count": len(engines)}


@router.get("/{engine_id}")
async def get_engine(
    engine_id: str,
    admin: dict = Depends(require_sla113_admin)
):
    """Get status for a specific engine."""
    service = EngineDashboardService()
    engine_status = await service.get_engine_status(engine_id)
    if not engine_status:
        raise HTTPException(status_code=404, detail=f"Engine not found: {engine_id}")
    return {"success": True, "engine": engine_status}


@router.post("/{engine_id}/status")
async def set_engine_status(
    engine_id: str,
    status: str,
    health: Optional[str] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Set engine status (active, unavailable, maintenance)."""
    service = EngineDashboardService()
    try:
        result = await service.set_engine_status(engine_id, status, health, admin.get("admin_id"))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{engine_id}/metadata")
async def update_engine_metadata(
    engine_id: str,
    metadata: dict,
    admin: dict = Depends(require_sla113_admin)
):
    """Update engine metadata."""
    service = EngineDashboardService()
    try:
        result = await service.update_engine_metadata(engine_id, metadata, admin.get("admin_id"))
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
