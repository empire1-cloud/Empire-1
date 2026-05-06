from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from ..services.sla113_admin import SLA113AdminService
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/admin", tags=["SLA113 Admin"])

require_sla113_admin = DashboardAuth.require_role("operator_advanced")


# ---------------------------------------------------------
# TENANT MANAGEMENT
# ---------------------------------------------------------
@router.get("/tenants")
async def list_tenants(admin: dict = Depends(require_sla113_admin)):
    """List all registered tenants."""
    service = SLA113AdminService()
    tenants = service.list_tenants()
    return {"success": True, "tenants": tenants}


@router.get("/tenant/{tenant_id}")
async def get_tenant(tenant_id: str, admin: dict = Depends(require_sla113_admin)):
    """Get tenant details by ID."""
    service = SLA113AdminService()
    tenant = service.get_tenant(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"success": True, "tenant": tenant}


@router.post("/tenant/switch")
async def switch_tenant(tenant_id: str, admin: dict = Depends(require_sla113_admin)):
    """Switch to a tenant context for engine invocation."""
    service = SLA113AdminService()
    try:
        context = service.switch_tenant_context(tenant_id)
        return {"success": True, "context": context}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------------------------------------------------------
# PERMISSION MANAGEMENT
# ---------------------------------------------------------
@router.get("/permissions/{tenant_id}/{engine}/{action}")
async def check_permission(
    tenant_id: str,
    engine: str,
    action: str,
    admin: dict = Depends(require_sla113_admin)
):
    """Check if tenant has permission to invoke engine action."""
    service = SLA113AdminService()
    details = service.get_permission_details(tenant_id, engine, action)
    return {"success": True, "permission": details}


# ---------------------------------------------------------
# ENGINE INVOCATION BRIDGE
# ---------------------------------------------------------
@router.post("/engine/invoke")
async def invoke_engine(
    tenant_id: str,
    engine: str,
    action: str,
    payload: dict,
    admin: dict = Depends(require_sla113_admin)
):
    """Invoke engine on behalf of tenant through Hybrid backend."""
    service = SLA113AdminService()
    try:
        result = await service.invoke_engine(tenant_id, engine, action, payload)
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# USAGE LOGGING
# ---------------------------------------------------------
@router.post("/usage/log")
async def log_usage(
    tenant_id: str,
    engine: str,
    action: str,
    credits: int,
    metadata: Optional[dict] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Manually log usage to MongoDB Atlas."""
    service = SLA113AdminService()
    await service.log_usage(tenant_id, engine, action, credits, metadata)
    return {"success": True, "message": "Usage logged"}


@router.get("/usage/logs")
async def get_usage_logs(
    tenant_id: Optional[str] = None,
    limit: int = 100,
    admin: dict = Depends(require_sla113_admin)
):
    """Retrieve usage logs from MongoDB Atlas."""
    service = SLA113AdminService()
    logs = await service.get_usage_logs(tenant_id, limit)
    return {"success": True, "logs": logs}


# ---------------------------------------------------------
# ENGINE REGISTRY (SLA113 view)
# ---------------------------------------------------------
@router.get("/engines")
async def list_engines(admin: dict = Depends(require_sla113_admin)):
    """List all engines available to SLA113."""
    from ..core.engine_namespace import ALL_ENGINES
    return {"success": True, "engines": ALL_ENGINES}


@router.get("/engine/{engine_id}")
async def get_engine(engine_id: str, admin: dict = Depends(require_sla113_admin)):
    """Get engine metadata."""
    from ..core.engine_namespace import get_engine
    engine = get_engine(engine_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")
    return {"success": True, "engine": engine}
