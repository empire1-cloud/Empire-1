"""
SLA113 Build Spec Loader
Single source of truth: SLA113_BUILD_SPEC.yaml (max-control version)
All canon, orchestration, regulatory, anti-addiction, and dashboard config
is derived exclusively from this file. No rules are invented here.
"""

import os
from functools import lru_cache
from typing import Optional
import yaml


# Resolve path relative to this file's location
_SPEC_PATH = os.path.join(os.path.dirname(__file__), "..", "SLA113_BUILD_SPEC.yaml")


@lru_cache(maxsize=1)
def _load_spec() -> dict:
    """Load and cache the Build Spec YAML. Called once at startup."""
    path = os.path.abspath(_SPEC_PATH)
    if not os.path.exists(path):
        raise FileNotFoundError(f"SLA113_BUILD_SPEC.yaml not found at: {path}")
    with open(path, "r") as f:
        spec = yaml.safe_load(f)
    return spec


# =============================================================================
# PUBLIC ACCESSORS
# =============================================================================

def get_spec() -> dict:
    """Return the full parsed Build Spec."""
    return _load_spec()


def get_canon() -> dict:
    """Return the full canon block (economic, shell, fault, governance)."""
    return _load_spec().get("canon", {})


def get_economic_canon() -> dict:
    return get_canon().get("economic", {})


def get_shell_canon() -> dict:
    return get_canon().get("shell", {})


def get_fault_canon() -> dict:
    return get_canon().get("fault", {})


def get_governance_canon() -> dict:
    return get_canon().get("governance", {})


def get_orchestration() -> dict:
    """Return the orchestration block including engine_priority_order and conflict_resolution_matrix."""
    return _load_spec().get("orchestration", {})


def get_engine_priority_order() -> list:
    """Return the 5-tier engine execution order."""
    return get_orchestration().get("engine_priority_order", [
        "sla113_revenue_engine",
        "sla113_narrative_engine",
        "sla113_adaptive_engine",
        "sla113_identity_engine",
        "sla113_governance_engine",
    ])


def get_conflict_resolution_matrix() -> dict:
    """Return the conflict resolution matrix."""
    return get_orchestration().get("conflict_resolution_matrix", {})


def get_cinematic_weighting() -> dict:
    return get_orchestration().get("cinematic_weighting", {"default": 0.6})


def get_identity_bias() -> dict:
    return get_orchestration().get("identity_bias", {})


def get_economic_bias() -> dict:
    return get_orchestration().get("economic_bias", {})


def get_regulatory_profile(jurisdiction: str) -> Optional[dict]:
    """
    Return regulatory profile by jurisdiction key.
    Valid keys: nevada_lvcc | uk_gbga | australia_ilga
    Returns None if jurisdiction not found.
    """
    profiles = _load_spec().get("regulatory_profiles", {})
    return profiles.get(jurisdiction)


def get_all_regulatory_profiles() -> dict:
    return _load_spec().get("regulatory_profiles", {})


def get_anti_addiction_profile() -> dict:
    """Return the global anti-addiction enforcement profile."""
    return _load_spec().get("anti_addiction_profile", {})


def get_session_limits() -> dict:
    return get_anti_addiction_profile().get("session_limits", {})


def get_loss_limits() -> dict:
    return get_anti_addiction_profile().get("loss_limits", {})


def get_deposit_limits() -> dict:
    return get_anti_addiction_profile().get("deposit_limits", {})


def get_self_exclusion_config() -> dict:
    return get_anti_addiction_profile().get("self_exclusion", {})


def get_player_monitoring_config() -> dict:
    return get_anti_addiction_profile().get("player_activity_monitoring", {})


def get_dashboard_config() -> dict:
    return _load_spec().get("dashboard", {})


def get_dashboard_panels() -> dict:
    return get_dashboard_config().get("panels", {})


def get_dashboard_permissions(role: str) -> Optional[dict]:
    """
    Return dashboard permissions for a given role.
    Valid roles: operator_standard | operator_advanced | executive | engineer_platform
    Returns None if role not found.
    """
    permissions = get_dashboard_config().get("permissions", {})
    return permissions.get(role)


def get_all_dashboard_permissions() -> dict:
    return get_dashboard_config().get("permissions", {})


def get_machine_profiles() -> dict:
    return _load_spec().get("machine_profiles", {})


def get_machine_profile(machine_type: str) -> Optional[dict]:
    return get_machine_profiles().get(machine_type)


def get_tenants_from_spec() -> dict:
    return _load_spec().get("tenants", {})


def get_clusters() -> dict:
    return _load_spec().get("clusters", {})


def get_metadata() -> dict:
    return _load_spec().get("metadata", {})


def get_deployment_config() -> dict:
    return _load_spec().get("deployment", {})
