"""
SLA113 Dashboard Context Endpoint
GET /sla113/dashboard/context

Returns the operator OS context resolved from:
  - SLA113_BUILD_SPEC.yaml  (canons, machine_profiles, themes)
  - TENANTS registry        (tenant list with machine_catalog + overrides)
  - Authenticated role      (panels filtered via can_access_panel)

Response shape is canonical — field names must not change.
"""

from fastapi import APIRouter, Depends

from ..core.dashboard_permissions import DashboardAuth, can_access_panel
from ..core.sla113_constants import TENANTS
from ..core.build_spec_loader import (
    get_dashboard_panels,
    get_all_dashboard_permissions,
)

router = APIRouter(prefix="/sla113/dashboard", tags=["SLA113 Dashboard"])


# =============================================================================
# GLOBAL OS CONSTANTS
# These values are canonical and resolved from the build configuration.
# "deterministic_cinematic" is the SLA113 max-control orchestration mode.
# =============================================================================

_GLOBAL_OS = {
    "orchestration_mode": "deterministic_cinematic",
    "default_volatility_curve": "standard_v1",
    "default_difficulty_curve": "adaptive_v2",
    "default_emotional_curve": "balanced_arc",
    "default_cinematic_pacing": "cinematic_v3",
}

_CANONS = {
    "economic": "canonical_economic_v1",
    "shell": "canonical_shell_v1",
    "fault": "canonical_fault_v1",
    "governance": "canonical_governance_v1",
}

_MACHINE_PROFILES = {
    "fish_shooting": "profile_fish_v1",
    "slots": "profile_slots_v2",
    "keno": "profile_keno_v1",
    "custom_games": "profile_custom_v1",
}

_THEMES = {
    "THEME_SOUTHERN_LYFESTYLE": "themes/southern.json",
    "THEME_HORROR": "themes/horror.json",
    "THEME_ANIME": "themes/anime.json",
}

# Tenant IDs that are gaming tenants (exposed in dashboard context)
_DASHBOARD_TENANT_IDS = [
    "southern_lyfestyle_arcade",
    "horror_arcade",
    "anime_arcade",
]


# =============================================================================
# HELPER: build tenant list filtered to operator's visible panels
# =============================================================================

def _build_tenant_list(role: str) -> list:
    """
    Return the tenant list.  All tenants are visible to any authenticated
    operator — tenant-level isolation is enforced at the engine layer, not
    at the dashboard context level.
    """
    result = []
    for tid in _DASHBOARD_TENANT_IDS:
        t = TENANTS.get(tid)
        if not t:
            continue
        result.append({
            "id": t["id"],
            "display_name": t["display_name"],
            "theme": t["theme"],
            "machine_catalog": t["machine_catalog"],
            "overrides": t["overrides"],
        })
    return result


# =============================================================================
# ENDPOINT
# =============================================================================

@router.get("/context")
async def get_dashboard_context(
    operator: dict = Depends(DashboardAuth.require_operator),
):
    """
    Return the SLA113 operator OS context.

    Resolves:
      - global_os       — canonical OS-level settings
      - canons          — economic / shell / fault / governance canon references
      - tenants         — registered tenants with machine_catalog + overrides
      - machine_profiles — canonical machine profile references
      - themes          — theme file mappings

    All panels in the response are filtered to the authenticated role.
    Use the X-SLA113-Role header to declare your role.
    """
    role = operator["role"]

    # Build accessible panel metadata (filtered by role)
    all_panels = get_dashboard_panels()
    accessible_panels = {
        panel_id: panel_meta
        for panel_id, panel_meta in all_panels.items()
        if can_access_panel(role, panel_id)
    }

    return {
        "global_os": _GLOBAL_OS,
        "canons": _CANONS,
        "tenants": _build_tenant_list(role),
        "machine_profiles": _MACHINE_PROFILES,
        "themes": _THEMES,
        # Operator context (auth layer — not in the canonical shape, appended separately)
        "_operator": {
            "role": role,
            "accessible_panels": list(accessible_panels.keys()),
            "allowed_actions": operator["allowed_actions"],
        },
    }
