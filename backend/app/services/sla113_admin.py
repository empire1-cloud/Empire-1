import uuid
import asyncio
from datetime import datetime
from typing import Optional
import httpx

from ..core.sla113_constants import TENANTS, ENGINE_ROUTES
from ..core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------
# ERROR MAPPING
# ---------------------------------------------------------
class EngineError(Exception):
    """Base exception for engine invocation errors."""
    def __init__(self, message: str, code: str, details: Optional[dict] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}


ERROR_MAPPING = {
    "timeout": {
        "code": "ENGINE_TIMEOUT",
        "message": "Engine request timed out",
        "retryable": True,
    },
    "connection_error": {
        "code": "ENGINE_UNAVAILABLE",
        "message": "Engine backend is unavailable",
        "retryable": True,
    },
    "500": {
        "code": "ENGINE_INTERNAL_ERROR",
        "message": "Engine returned internal error",
        "retryable": True,
    },
    "502": {
        "code": "ENGINE_BAD_GATEWAY",
        "message": "Engine gateway returned bad gateway",
        "retryable": True,
    },
    "503": {
        "code": "ENGINE_SERVICE_UNAVAILABLE",
        "message": "Engine service is unavailable",
        "retryable": True,
    },
    "504": {
        "code": "ENGINE_GATEWAY_TIMEOUT",
        "message": "Engine gateway timed out",
        "retryable": True,
    },
    "401": {
        "code": "ENGINE_UNAUTHORIZED",
        "message": "Engine authorization failed",
        "retryable": False,
    },
    "403": {
        "code": "ENGINE_FORBIDDEN",
        "message": "Engine access forbidden",
        "retryable": False,
    },
    "404": {
        "code": "ENGINE_NOT_FOUND",
        "message": "Engine endpoint not found",
        "retryable": False,
    },
    "422": {
        "code": "ENGINE_VALIDATION_ERROR",
        "message": "Engine request validation failed",
        "retryable": False,
    },
}


def map_error(status_code: int, original_error: Exception) -> EngineError:
    """Map HTTP status codes to structured engine errors."""
    status_str = str(status_code)
    error_info = ERROR_MAPPING.get(status_str, ERROR_MAPPING.get("connection_error"))
    
    return EngineError(
        message=error_info["message"],
        code=error_info["code"],
        details={
            "original_error": str(original_error),
            "status_code": status_code,
            "retryable": error_info["retryable"],
        }
    )


# ---------------------------------------------------------
# MONGODB ATLAS CONNECTION (for tenant usage logs)
# ---------------------------------------------------------
class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        if not self.client and settings.MONGODB_ATLAS_URI:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.client = AsyncIOMotorClient(settings.MONGODB_ATLAS_URI)
            self.db = self.client[settings.MONGODB_ATLAS_DB or "sla113"]

    async def close(self):
        if self.client:
            self.client.close()

    async def log_usage(self, tenant_id: str, tenant_name: str, engine: str, action: str, credits: int, metadata: Optional[dict] = None):
        if not self.db:
            await self.connect()
        
        log_entry = {
            "_id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "engine": engine,
            "action": action,
            "timestamp": datetime.utcnow(),
            "credits_used": credits,
            "metadata": metadata or {},
        }
        await self.db.usage_logs.insert_one(log_entry)


mongo_client = MongoDBClient()


# ---------------------------------------------------------
# SLA113 ADMIN SERVICE (HARDENED)
# ---------------------------------------------------------
class SLA113AdminService:
    def __init__(self):
        self.hybrid_base_url = settings.HYBRID_BACKEND_URL or "http://localhost:8000"
        self.max_retries = 3
        self.retry_delay = 1.0  # seconds
        self.timeout = 60.0  # seconds

    # ---------------------------------------------------------
    # TENANT SWITCHER
    # ---------------------------------------------------------
    def get_tenant(self, tenant_id: str) -> Optional[dict]:
        """Get tenant details by ID."""
        return TENANTS.get(tenant_id)

    def list_tenants(self) -> list:
        """List all registered tenants."""
        return list(TENANTS.values())

    def switch_tenant_context(self, tenant_id: str) -> dict:
        """Switch to a tenant context for engine invocation."""
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            raise ValueError(f"Unknown tenant: {tenant_id}")
        return {
            "tenant_id": tenant["id"],
            "tenant_name": tenant["name"],
            "tenant_type": tenant["type"],
            "allowed_engines": tenant["allowed_engines"],
        }

    # ---------------------------------------------------------
    # PERMISSION ENFORCEMENT
    # ---------------------------------------------------------
    def check_permission(self, tenant_id: str, engine: str, action: str) -> bool:
        """Check if tenant has permission to invoke engine action."""
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            return False
        
        if engine not in tenant["allowed_engines"]:
            return False
        
        if engine not in ENGINE_ROUTES:
            return False
        
        if action not in ENGINE_ROUTES[engine]:
            return False
        
        return True

    def get_permission_details(self, tenant_id: str, engine: str, action: str) -> dict:
        """Get detailed permission info for debugging."""
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            return {"allowed": False, "reason": "unknown_tenant"}
        
        if engine not in tenant["allowed_engines"]:
            return {"allowed": False, "reason": "engine_not_allowed", "allowed_engines": tenant["allowed_engines"]}
        
        if engine not in ENGINE_ROUTES:
            return {"allowed": False, "reason": "unknown_engine"}
        
        if action not in ENGINE_ROUTES[engine]:
            return {"allowed": False, "reason": "unknown_action", "available_actions": list(ENGINE_ROUTES[engine].keys())}
        
        return {"allowed": True, "tenant": tenant, "engine": engine, "action": action}

    # ---------------------------------------------------------
    # HARDENED ENGINE INVOCATION BRIDGE
    # ---------------------------------------------------------
    async def invoke_engine_with_retry(
        self,
        tenant_id: str,
        engine: str,
        action: str,
        payload: dict,
        retries: Optional[int] = None,
    ) -> dict:
        """
        Invoke engine with retry logic and timeout handling.
        
        Args:
            tenant_id: Tenant ID
            engine: Engine name
            action: Action to perform
            payload: Request payload
            retries: Number of retries (defaults to max_retries)
        
        Returns:
            Engine invocation result
        
        Raises:
            PermissionError: If tenant lacks permission
            ValueError: If tenant or engine not found
            EngineError: If invocation fails after retries
        """
        tenant = TENANTS.get(tenant_id)
        if not tenant:
            raise ValueError(f"Unknown tenant: {tenant_id}")
        
        if not self.check_permission(tenant_id, engine, action):
            raise PermissionError(f"Permission denied: {tenant_id} cannot invoke {engine}.{action}")
        
        route = ENGINE_ROUTES[engine][action]
        url = f"{self.hybrid_base_url}{route}"
        
        max_attempts = retries if retries is not None else self.max_retries
        last_error = None
        
        for attempt in range(max_attempts):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    result = response.json()
                
                # Success - log usage and return
                credits_used = payload.get("credits", 1)
                
                await mongo_client.log_usage(
                    tenant_id=tenant_id,
                    tenant_name=tenant["name"],
                    engine=engine,
                    action=action,
                    credits=credits_used,
                    metadata={"payload": payload, "response": result},
                )
                
                return {
                    "success": True,
                    "tenant_id": tenant_id,
                    "tenant_name": tenant["name"],
                    "engine": engine,
                    "action": action,
                    "result": result,
                    "credits_used": credits_used,
                    "attempts": attempt + 1,
                }
                
            except httpx.TimeoutException as e:
                last_error = map_error(408, e)
                if not ERROR_MAPPING.get("timeout", {}).get("retryable", True):
                    break
                    
            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code
                last_error = map_error(status_code, e)
                
                error_info = ERROR_MAPPING.get(str(status_code), {})
                if not error_info.get("retryable", True):
                    break
                    
            except httpx.ConnectError as e:
                last_error = map_error(0, e)
                # Always retry on connection errors
                
            except Exception as e:
                last_error = EngineError(
                    message=str(e),
                    code="ENGINE_UNKNOWN_ERROR",
                    details={"original_error": str(e)},
                )
                break
            
            # Wait before retry (exponential backoff)
            if attempt < max_attempts - 1:
                await asyncio.sleep(self.retry_delay * (2 ** attempt))
        
        # All retries exhausted
        raise last_error or EngineError(
            message="Engine invocation failed after all retries",
            code="ENGINE_MAX_RETRIES_EXCEEDED",
            details={"attempts": max_attempts},
        )

    async def invoke_engine(self, tenant_id: str, engine: str, action: str, payload: dict) -> dict:
        """Invoke engine (backward compatible wrapper)."""
        return await self.invoke_engine_with_retry(tenant_id, engine, action, payload)

    # ---------------------------------------------------------
    # USAGE LOGGING (MongoDB Atlas)
    # ---------------------------------------------------------
    async def log_usage(self, tenant_id: str, engine: str, action: str, credits: int, metadata: Optional[dict] = None):
        """Log usage to MongoDB Atlas."""
        tenant = TENANTS.get(tenant_id)
        tenant_name = tenant["name"] if tenant else "unknown"
        
        await mongo_client.log_usage(
            tenant_id=tenant_id,
            tenant_name=tenant_name,
            engine=engine,
            action=action,
            credits=credits,
            metadata=metadata,
        )

    async def get_usage_logs(self, tenant_id: Optional[str] = None, limit: int = 100) -> list:
        """Retrieve usage logs from MongoDB Atlas."""
        await mongo_client.connect()
        
        query = {"tenant_id": tenant_id} if tenant_id else {}
        
        cursor = mongo_client.db.usage_logs.find(query).sort("timestamp", -1).limit(limit)
        logs = await cursor.to_list(length=limit)
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return logs
