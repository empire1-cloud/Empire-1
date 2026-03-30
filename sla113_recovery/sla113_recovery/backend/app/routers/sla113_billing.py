from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from ..services.billing_service import BillingService
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/billing", tags=["SLA113 Billing"])

require_sla113_admin = DashboardAuth.require_role("operator_executive")


# ---------------------------------------------------------
# BILLING ENDPOINTS
# ---------------------------------------------------------
@router.get("/{tenant_id}")
async def get_billing_history(
    tenant_id: str,
    limit: int = Query(default=100, le=1000),
    admin: dict = Depends(require_sla113_admin)
):
    """Get billing history for a tenant."""
    service = BillingService()
    history = await service.get_billing_history(tenant_id, limit)
    return {"success": True, "tenant_id": tenant_id, "charges": history, "count": len(history)}


@router.get("/{tenant_id}/monthly")
async def get_monthly_total(
    tenant_id: str,
    year: Optional[int] = None,
    month: Optional[int] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Get monthly billing total for a tenant."""
    service = BillingService()
    total = await service.calculate_monthly_total(tenant_id, year, month)
    return {"success": True, **total}


@router.get("")
async def get_all_tenant_totals(
    admin: dict = Depends(require_sla113_admin)
):
    """Get total billing for all tenants."""
    service = BillingService()
    totals = await service.get_all_tenant_totals()
    return {"success": True, "tenants": totals, "count": len(totals)}


@router.post("/charge")
async def record_charge(
    tenant_id: str,
    engine: str,
    action: str,
    credits: int,
    metadata: Optional[dict] = None,
    admin: dict = Depends(require_sla113_admin)
):
    """Manually record a charge."""
    service = BillingService()
    charge_id = await service.record_charge(tenant_id, engine, action, credits, metadata)
    return {"success": True, "charge_id": charge_id}
