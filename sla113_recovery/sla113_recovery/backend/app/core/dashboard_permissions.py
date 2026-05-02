"""
SLA113 Dashboard Permission Layer
Role-based access control derived from SLA113_BUILD_SPEC.yaml dashboard.permissions.
Roles: operator_standard | operator_advanced | executive | engineer_platform
"""

from fastapi import HTTPException, Header
from typing import Optional

from .build_spec_loader import get_dashboard_permissions, get_all_dashboard_permissions
from .config import get_settings

settings = get_settings()

# Map role header values to Build Spec permission keys
VALID_ROLES = {
    "operator_standard",
    "operator_advanced",
    "executive",
    "engineer_platform",
}


class DashboardAuth:
    """
    FastAPI dependency factory for role-based SLA113 dashboard access.
    Validates the X-SLA113-Key header (operator authentication) and
    the X-SLA113-Role header (role claim) against Build Spec permissions.
    """

    @staticmethod
    async def require_operator(
        x_sla113_key: Optional[str] = Header(None),
        x_sla113_role: Optional[str] = Header(default="operator_standard"),
    ) -> dict:
        """
        Require a valid operator key. Returns the permission set for the claimed role.
        Any valid key + any valid role grants access at the level of that role.
        """
        if not x_sla113_key:
            raise HTTPException(status_code=401, detail="Missing X-SLA113-Key header")

        # Validate key against configured admin key
        admin_key = settings.SLA113_ADMIN_KEY
        if x_sla113_key != admin_key:
            raise HTTPException(status_code=403, detail="Invalid SLA113 operator key")

        role = (x_sla113_role or "operator_standard").lower().replace("-", "_")
        if role not in VALID_ROLES:
            role = "operator_standard"

        permissions = get_dashboard_permissions(role) or {}
        return {
            "role": role,
            "allowed_panels": permissions.get("allowed_panels", []),
            "allowed_actions": permissions.get("allowed_actions", []),
        }

    @staticmethod
    def require_role(minimum_role: str):
        """
        Returns a FastAPI dependency that requires at least `minimum_role`.
        Role hierarchy: operator_standard < operator_advanced < executive < engineer_platform
        """
        ROLE_LEVELS = {
            "operator_standard": 1,
            "operator_advanced": 2,
            "executive": 3,
            "engineer_platform": 4,
        }
        min_level = ROLE_LEVELS.get(minimum_role, 1)

        async def _dependency(
            x_sla113_key: Optional[str] = Header(None),
            x_sla113_role: Optional[str] = Header(default="operator_standard"),
        ) -> dict:
            if not x_sla113_key:
                raise HTTPException(status_code=401, detail="Missing X-SLA113-Key header")

            admin_key = settings.SLA113_ADMIN_KEY
            if x_sla113_key != admin_key:
                raise HTTPException(status_code=403, detail="Invalid SLA113 operator key")

            role = (x_sla113_role or "operator_standard").lower().replace("-", "_")
            if role not in VALID_ROLES:
                role = "operator_standard"

            role_level = ROLE_LEVELS.get(role, 1)
            if role_level < min_level:
                raise HTTPException(
                    status_code=403,
                    detail=f"Insufficient role: {role} (requires {minimum_role})",
                )

            permissions = get_dashboard_permissions(role) or {}
            return {
                "role": role,
                "allowed_panels": permissions.get("allowed_panels", []),
                "allowed_actions": permissions.get("allowed_actions", []),
            }

        return _dependency

    @staticmethod
    def check_panel_access(operator: dict, panel: str) -> bool:
        """Check if operator's role permits access to a specific panel."""
        return panel in operator.get("allowed_panels", [])

    @staticmethod
    def check_action_access(operator: dict, action: str) -> bool:
        """Check if operator's role permits a specific action."""
        return action in operator.get("allowed_actions", [])


# =============================================================================
# STANDALONE HELPER: can_access_panel
# Role → panel matrix resolved directly from Build Spec dashboard.permissions.
# =============================================================================

def can_access_panel(role: str, panel_id: str) -> bool:
    """
    Return True if `role` is permitted to access `panel_id`.
    Matrix sourced exclusively from SLA113_BUILD_SPEC.yaml dashboard.permissions.

    Args:
        role:     operator_standard | operator_advanced | executive |
                  operator_executive | engineer_platform
        panel_id: analytics | tenant_management | machine_catalog |
                  revenue | regulatory | narrative

    Returns:
        bool — True if the role has access to the panel, False otherwise.
    """
    # Normalise role key: the Build Spec uses "operator_executive" for the
    # executive role; accept both spellings.
    normalised = role.lower().replace("-", "_")
    if normalised == "executive":
        normalised = "operator_executive"

    permissions = get_dashboard_permissions(normalised)
    if permissions is None:
        return False

    return panel_id in permissions.get("allowed_panels", [])
