"""
SLA113 Orchestration Router
Exposes the 5-tier orchestration engine via POST /sla113/orchestrate
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..engines.sla113.sla113_orchestration_engine import SLA113Orchestrator, SessionContext
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/orchestrat", tags=["SLA113 Orchestration"])


@router.get("ion/spec")
async def get_orchestration_spec(
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """Describe the 5-tier orchestration engine as defined in the Build Spec."""
    from ..core.build_spec_loader import get_orchestration
    spec = get_orchestration()
    return {
        "engine": "SLA113 5-Tier Orchestration Engine",
        "mode": spec.get("mode", "deterministic_cinematic"),
        "conflict_resolution_order": spec.get("conflict_resolution_order", []),
        "tier_priority": [
            {"tier": 1, "engine": "RevenueEngine",    "key": "sla113_revenue_engine"},
            {"tier": 2, "engine": "NarrativeEngine",  "key": "sla113_narrative_engine"},
            {"tier": 3, "engine": "AdaptiveEngine",   "key": "sla113_adaptive_engine"},
            {"tier": 4, "engine": "IdentityEngine",   "key": "sla113_identity_engine"},
            {"tier": 5, "engine": "GovernanceEngine", "key": "sla113_governance_engine",
             "note": "Governance always wins. No override is allowed."},
        ],
        "governance_weight": 1.0,
        "canons_enforced": ["canonical_economic_v1", "canonical_governance_v1",
                            "canonical_fault_v1", "canonical_shell_v1"],
        "conflict_resolution": spec.get("conflict_resolution_matrix", {}),
    }


class OrchestrationRequest(BaseModel):
    tenant_id: str
    player_id: str
    machine_type: str                        # fish | slots | keno | custom
    jurisdiction: str                        # nevada_lvcc | uk_gbga | australia_ilga
    session_duration_minutes: float = 0.0
    consecutive_losses: int = 0
    current_balance: float = 0.0
    buy_in_amount: float = 0.0
    spin_count: int = 0
    is_bonus_round: bool = False
    player_history: Optional[dict] = None
    demographic: Optional[dict] = None
    custom: Optional[dict] = None


@router.post("e")
async def orchestrate(
    request: OrchestrationRequest,
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """
    Run the SLA113 5-tier orchestration engine for a session context.
    Returns resolved engine decision, governance gate status, and full audit trace.
    Engine priority: Revenue → Narrative → Adaptive → Identity → Governance.
    Governance always wins. No override is allowed.
    """
    ctx = SessionContext(
        tenant_id=request.tenant_id,
        player_id=request.player_id,
        machine_type=request.machine_type,
        jurisdiction=request.jurisdiction,
        session_duration_minutes=request.session_duration_minutes,
        consecutive_losses=request.consecutive_losses,
        current_balance=request.current_balance,
        buy_in_amount=request.buy_in_amount,
        spin_count=request.spin_count,
        is_bonus_round=request.is_bonus_round,
        player_history=request.player_history,
        demographic=request.demographic,
        custom=request.custom,
    )

    orchestrator = SLA113Orchestrator()
    result = orchestrator.orchestrate(ctx)

    return {
        "success": True,
        "tenant_id": request.tenant_id,
        "player_id": request.player_id,
        "resolved": result.resolved,
        "narrative_beat": result.narrative_beat,
        "volatility_tier": result.volatility_tier,
        "cinematic_weight": result.cinematic_weight,
        "governance_enforced": result.governance_enforced,
        "timestamp": result.timestamp,
        "audit_trace": result.audit_trace,
    }
