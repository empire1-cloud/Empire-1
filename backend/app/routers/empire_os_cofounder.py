from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header

from app.services.empire_os_cofounder import EmpireOSCoFounderService


router = APIRouter(prefix="/api/empire-os-cofounder", tags=["Empire OS Co-Founder"])


def _resolve_universe(universe: Optional[str], x_tenant_id: Optional[str]) -> str:
    return universe or x_tenant_id or "empire"


@router.get("/brief")
async def get_brief(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_brief()


@router.get("/goals")
async def get_goals(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_goals()


@router.get("/watchdog")
async def get_watchdog(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_watchdog()


@router.get("/audit")
async def get_audit(limit: int = 50, universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_audit(limit=limit)


@router.get("/latest-brief")
async def get_latest_brief(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_latest_brief()


@router.get("/queue")
async def get_queue(
    limit: int = 50,
    status: Optional[str] = None,
    universe: Optional[str] = None,
    x_tenant_id: Optional[str] = Header(None),
):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_queue(limit=limit, status=status)


@router.get("/activity")
async def get_activity(limit: int = 100, universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.get_activity(limit=limit)


@router.post("/run-safe-loop")
async def run_safe_loop(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_safe_loop()


@router.post("/run-loop")
async def run_loop(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_loop()


@router.post("/run-survival-loop")
async def run_survival_loop(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_survival_loop()


@router.post("/queue/{item_id}/run")
async def run_queue_item(item_id: str, universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_queue_item(item_id)


@router.post("/run-next-safe")
async def run_next_safe(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_next_safe()


@router.post("/run-autonomous-cycle")
async def run_autonomous_cycle(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    service = EmpireOSCoFounderService(_resolve_universe(universe, x_tenant_id))
    return await service.run_autonomous_cycle()
