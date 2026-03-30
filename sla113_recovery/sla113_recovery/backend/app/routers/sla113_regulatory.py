"""
SLA113 Regulatory Profile Router
GET  /sla113/regulatory/{jurisdiction}   — return active profile
POST /sla113/regulatory/validate         — validate session against jurisdiction
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..engines.sla113.sla113_regulatory_engine import SLA113RegulatoryEnforcer
from ..core.build_spec_loader import get_all_regulatory_profiles
from ..core.dashboard_permissions import DashboardAuth

router = APIRouter(prefix="/sla113/regulatory", tags=["SLA113 Regulatory"])

_enforcer = SLA113RegulatoryEnforcer()


class RegulatoryValidationRequest(BaseModel):
    jurisdiction: str                       # nevada_lvcc | uk_gbga | australia_ilga
    rtp: float
    bet_amount: float
    session_duration_minutes: float = 0.0
    player_age: Optional[int] = None
    session_loss_pct: float = 0.0
    daily_loss_pct: float = 0.0


@router.get("")
async def list_regulatory_profiles(
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """List all jurisdiction regulatory profiles from the Build Spec."""
    profiles = get_all_regulatory_profiles()
    return {
        "success": True,
        "jurisdictions": list(profiles.keys()),
        "profiles": profiles,
    }


@router.get("/{jurisdiction}")
async def get_regulatory_profile(
    jurisdiction: str,
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """Return the regulatory profile for a specific jurisdiction."""
    profile = _enforcer.get_profile(jurisdiction)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown jurisdiction: {jurisdiction}. "
                   f"Valid values: nevada_lvcc | uk_gbga | australia_ilga",
        )
    return {"success": True, "jurisdiction": jurisdiction, "profile": profile}


@router.post("/validate")
async def validate_session(
    request: RegulatoryValidationRequest,
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """
    Validate a session context against a jurisdiction's regulatory profile.
    Returns compliance status and any violations or warnings.
    """
    result = _enforcer.validate(
        jurisdiction=request.jurisdiction,
        rtp=request.rtp,
        bet_amount=request.bet_amount,
        session_duration_minutes=request.session_duration_minutes,
        player_age=request.player_age,
        session_loss_pct=request.session_loss_pct,
        daily_loss_pct=request.daily_loss_pct,
    )
    return {
        "success": True,
        "jurisdiction": result.jurisdiction,
        "compliant": result.compliant,
        "violations": result.violations,
        "warnings": result.warnings,
        "profile_summary": result.profile_summary,
    }
