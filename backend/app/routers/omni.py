from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Header, Depends
from pydantic import BaseModel

from ..core.dashboard_permissions import DashboardAuth
from ..services.omni_service import (
    load_state,
    normalize_universe,
    recent_runs,
    run_next,
    summary_metrics,
    task_list,
    utc_now,
)


router = APIRouter(prefix="/api/omni", tags=["Omni Agent"])
sla_router = APIRouter(
    prefix="/api/sla113/omni",
    tags=["SLA113 Omni Agent"],
    dependencies=[Depends(DashboardAuth.require_operator)],
)


class OmniRunNextRequest(BaseModel):
    actor: str = "operator"
    mode: str = "hybrid"


def _resolve_universe(universe: Optional[str], x_tenant_id: Optional[str]) -> str:
    if universe:
        return normalize_universe(universe)
    if x_tenant_id:
        resolved = normalize_universe(x_tenant_id)
        return "empire" if resolved == "sla113" else resolved
    return "empire"


@router.get("/status")
@sla_router.get("/status")
async def omni_status(universe: Optional[str] = None, x_tenant_id: Optional[str] = Header(None)):
    resolved_universe = _resolve_universe(universe, x_tenant_id)
    state = load_state(resolved_universe)
    tasks = task_list(state)
    runs = recent_runs(state)
    metrics = summary_metrics(tasks, runs)
    last_run = runs[0] if runs else None
    return {
        "status": "online",
        "module": "omni_agent",
        "universe": resolved_universe,
        "state_scope": state.get("_state_scope"),
        "state_file": state.get("_state_file"),
        "exported_at": state.get("exported_at"),
        "metrics": metrics,
        "last_run": last_run,
        "timestamp": utc_now(),
    }


@router.get("/tasks")
@sla_router.get("/tasks")
async def omni_tasks(
    status: Optional[str] = None,
    limit: int = 100,
    universe: Optional[str] = None,
    x_tenant_id: Optional[str] = Header(None),
):
    resolved_universe = _resolve_universe(universe, x_tenant_id)
    state = load_state(resolved_universe)
    tasks = task_list(state)

    if status:
        tasks = [t for t in tasks if str(t.get("status", "")).lower() == status.lower()]

    tasks = tasks[: max(1, min(limit, 500))]
    return {
        "count": len(tasks),
        "universe": resolved_universe,
        "state_scope": state.get("_state_scope"),
        "tasks": tasks,
        "timestamp": utc_now(),
    }


@router.post("/run-next")
@sla_router.post("/run-next")
async def omni_run_next(
    payload: OmniRunNextRequest,
    universe: Optional[str] = None,
    x_tenant_id: Optional[str] = Header(None),
):
    resolved_universe = _resolve_universe(universe, x_tenant_id)
    return run_next(resolved_universe, payload.actor, payload.mode)
