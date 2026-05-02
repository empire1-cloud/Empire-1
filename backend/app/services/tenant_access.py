from typing import Optional
from fastapi import HTTPException, Header
import httpx

from ..core.sla113_constants import TENANTS, ENGINE_ROUTES
from ..core.engine_namespace import ENGINES, get_engine, is_engine_available
from ..core.config import get_settings
from .billing_service import billing_service
from .sla113_logs import sla113_logging_service

settings = get_settings()


# ---------------------------------------------------------
# TENANT IDENTITY RESOLUTION
# ---------------------------------------------------------
class TenantIdentity:
    """Resolves and validates tenant identity from request headers."""

    @staticmethod
    def resolve( x_tenant_id: Optional[str] = Header(None)) -> dict:
        """
        Resolve tenant from X-Tenant-ID header.
        According to canon: tenants access engines through SLA113 permissions.
        """
        if not x_tenant_id:
            raise HTTPException(
                status_code=400,
                detail="Missing X-Tenant-ID header. Tenant context required."
            )

        tenant = TENANTS.get(x_tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown tenant: {x_tenant_id}"
            )

        return tenant

    @staticmethod
    def get_tenant_id(x_tenant_id: Optional[str] = Header(None)) -> str:
        """Get tenant ID from header."""
        if not x_tenant_id:
            raise HTTPException(
                status_code=400,
                detail="Missing X-Tenant-ID header"
            )
        return x_tenant_id


# ---------------------------------------------------------
# PERMISSION CHECKS
# ---------------------------------------------------------
class PermissionChecker:
    """Enforces SLA113 permission model: tenants never call engines directly."""

    @staticmethod
    def check_engine_access(tenant_id: str, engine: str) -> bool:
        """
        Check if tenant has access to the specified engine.
        According to canon: tenants access engines only through SLA113 permissions.
        """
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            return False

        if engine not in tenant.get("allowed_engines", []):
            return False

        engine_meta = ENGINES.get(engine)
        if not engine_meta:
            return False

        if tenant_id not in engine_meta.enabled_for:
            return False

        return True

    @staticmethod
    def check_action_access(tenant_id: str, engine: str, action: str) -> bool:
        """Check if tenant can perform specific action on engine."""
        if not PermissionChecker.check_engine_access(tenant_id, engine):
            return False

        if engine not in ENGINE_ROUTES:
            return False

        if action not in ENGINE_ROUTES[engine]:
            return False

        return True

    @staticmethod
    def enforce(tenant_id: str, engine: str, action: str):
        """
        Enforce permission check. Raises HTTPException if denied.
        According to canon: tenants NEVER call engines directly.
        """
        if not PermissionChecker.check_action_access(tenant_id, engine, action):
            tenant = TENANTS.get(tenant_id, {})
            raise HTTPException(
                status_code=403,
                detail=f"Permission denied: {tenant.get('name', tenant_id)} cannot access {engine}.{action}. "
                       f"Engine access requires SLA113 permissions."
            )

    @staticmethod
    def check_sla113_override(x_sla113_key: Optional[str] = Header(None)) -> bool:
        """
        Check if request has SLA113 admin override.
        When present, allows SLA113 to bypass tenant restrictions.
        """
        if not x_sla113_key:
            return False
        # In production, validate against SLA113_ADMIN_KEY from settings
        return x_sla113_key == settings.SLA113_ADMIN_KEY


# ---------------------------------------------------------
# ENGINE ACCESS VALIDATION
# ---------------------------------------------------------
class EngineAccessValidator:
    """Validates engine availability and credit costs for tenants."""

    @staticmethod
    def validate_engine(engine: str) -> dict:
        """Validate engine exists and is available."""
        engine_meta = get_engine(engine)
        if not engine_meta:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown engine: {engine}"
            )

        if engine_meta.status == "unavailable":
            raise HTTPException(
                status_code=503,
                detail=f"Engine {engine} is currently unavailable"
            )

        return engine_meta.dict()

    @staticmethod
    def validate_tenant_engine(tenant_id: str, engine: str) -> dict:
        """Validate both tenant and engine, returning engine metadata."""
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown tenant: {tenant_id}"
            )

        if not is_engine_available(engine, tenant_id):
            raise HTTPException(
                status_code=403,
                detail=f"Engine {engine} not available for tenant {tenant.get('name', tenant_id)}"
            )

        return EngineAccessValidator.validate_engine(engine)

    @staticmethod
    def get_credit_cost(engine: str) -> int:
        """Get credit cost for engine operation."""
        engine_meta = get_engine(engine)
        if not engine_meta:
            return 0
        return engine_meta.credit_cost


# ---------------------------------------------------------
# CREDIT DEDUCTION HOOK
# ---------------------------------------------------------
class CreditDeductionHook:
    """Handles credit deduction for tenant engine usage."""

    @staticmethod
    async def deduct(tenant_id: str, engine: str, action: str, credits: int) -> dict:
        """
        Deduct credits from tenant account.
        
        In production, this would interact with tenant billing in MongoDB Atlas.
        For now, records the charge for billing purposes.
        """
        try:
            charge_id = await billing_service.record_charge(
                tenant_id=tenant_id,
                engine=engine,
                action=action,
                credits=credits,
                metadata={"hook": "credit_deduction"},
            )
            
            return {
                "success": True,
                "charge_id": charge_id,
                "credits_deducted": credits,
            }
        except Exception as e:
            # Log but don't fail the request
            return {
                "success": False,
                "error": str(e),
                "credits_deducted": 0,
            }

    @staticmethod
    async def check_balance(tenant_id: str, required_credits: int) -> bool:
        """
        Check if tenant has sufficient credits.
        
        In production, this would check tenant credit balance.
        """
        # Placeholder - always allow for now
        return True


# ---------------------------------------------------------
# USAGE LOGGING HOOK
# ---------------------------------------------------------
class UsageLoggingHook:
    """Logs tenant engine usage to MongoDB Atlas."""

    @staticmethod
    async def log(
        tenant_id: str,
        engine: str,
        action: str,
        credits: int,
        metadata: Optional[dict] = None,
    ) -> str:
        """Log usage to SLA113 logging service."""
        tenant = TENANTS.get(tenant_id)
        tenant_name = tenant.get("name", "unknown") if tenant else "unknown"
        
        try:
            log_id = await sla113_logging_service.log_usage(
                tenant_id=tenant_id,
                tenant_name=tenant_name,
                engine=engine,
                action=action,
                credits=credits,
                metadata=metadata,
            )
            return log_id
        except Exception:
            # Don't fail request on logging errors
            return None


# ---------------------------------------------------------
# TENANT ACCESS SERVICE (composite with hooks)
# ---------------------------------------------------------
class TenantAccessService:
    """
    Main entry point for tenant engine access.
    All engine routers should use this service to validate access.
    """

    def __init__(self):
        self.identity = TenantIdentity()
        self.permissions = PermissionChecker()
        self.validator = EngineAccessValidator()
        self.credit_hook = CreditDeductionHook()
        self.logging_hook = UsageLoggingHook()

    async def validate_request(
        self,
        tenant_id: str,
        engine: str,
        action: str,
        deduct_credits: bool = True,
        log_usage: bool = True,
    ) -> dict:
        """
        Validate complete request: tenant identity, permissions, engine availability.
        Returns context dict with tenant, engine metadata, and credit cost.
        
        Args:
            tenant_id: Tenant ID
            engine: Engine name
            action: Engine action
            deduct_credits: Whether to deduct credits
            log_usage: Whether to log usage
        """
        # Check for SLA113 override
        is_sla113_override = self.permissions.check_sla113_override()
        
        # If not SLA113 override, enforce tenant permissions
        if not is_sla113_override:
            tenant = TENANTS.get(tenant_id)
            if not tenant:
                raise HTTPException(status_code=404, detail="Tenant not found")

            engine_meta = self.validator.validate_tenant_engine(tenant_id, engine)
            self.permissions.enforce(tenant_id, engine, action)
        
        # Get credit cost
        credit_cost = self.validator.get_credit_cost(engine)
        
        # Credit deduction hook
        if deduct_credits:
            credit_result = await self.credit_hook.deduct(tenant_id, engine, action, credit_cost)
        else:
            credit_result = {"success": True, "credits_deducted": 0}
        
        # Usage logging hook
        if log_usage:
            log_id = await self.logging_hook.log(
                tenant_id=tenant_id,
                engine=engine,
                action=action,
                credits=credit_cost,
                metadata={"credit_deduction": credit_result},
            )
        else:
            log_id = None
        
        return {
            "tenant_id": tenant_id,
            "engine": engine,
            "action": action,
            "credit_cost": credit_cost,
            "credit_deduction": credit_result,
            "usage_log_id": log_id,
            "sla113_override": is_sla113_override,
        }

    def require_tenant(self, x_tenant_id: Optional[str] = Header(None)) -> dict:
        """Dependency for FastAPI routes requiring tenant context."""
        return self.identity.resolve(x_tenant_id)


# ---------------------------------------------------------
# FASTAPI DEPENDENCY
# ---------------------------------------------------------
async def require_tenant_access(
    x_tenant_id: Optional[str] = Header(None),
    x_sla113_key: Optional[str] = Header(None),
    engine: str = "",
    action: str = "",
    deduct_credits: bool = True,
    log_usage: bool = True,
) -> dict:
    """
    FastAPI dependency for tenant engine access with hooks.
    
    Usage: 
        async def my_endpoint(
            ctx: dict = Depends(
                require_tenant_access(engine="vision_smith", action="generate")
            )
        ):
    
    Supports SLA113 override via X-SLA113-Key header.
    """
    service = TenantAccessService()
    
    # Check for SLA113 override first
    if service.permissions.check_sla113_override(x_sla113_key):
        # SLA113 override - bypass tenant validation
        return {
            "tenant_id": "sla113",
            "engine": engine,
            "action": action,
            "credit_cost": service.validator.get_credit_cost(engine),
            "credit_deduction": {"success": True, "credits_deducted": 0},
            "usage_log_id": None,
            "sla113_override": True,
        }
    
    # Normal tenant request
    if not x_tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Missing X-Tenant-ID header. Tenant context required."
        )
    
    return await service.validate_request(
        tenant_id=x_tenant_id,
        engine=engine,
        action=action,
        deduct_credits=deduct_credits,
        log_usage=log_usage,
    )


async def require_tenant_context(x_tenant_id: Optional[str] = Header(None)) -> dict:
    """FastAPI dependency for basic tenant context."""
    return TenantIdentity.resolve(x_tenant_id)
