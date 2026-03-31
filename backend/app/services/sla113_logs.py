import uuid
from datetime import datetime
from typing import Optional

from ..core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------
# MONGODB ATLAS CONNECTION (SLA113 Admin Logs)
# ---------------------------------------------------------
class SLA113LogsClient:
    """MongoDB Atlas client for SLA113 system logging."""

    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB Atlas."""
        if not self.client and settings.MONGODB_ATLAS_URI:
            from motor.motor_asyncio import AsyncIOMotorClient
            self.client = AsyncIOMotorClient(settings.MONGODB_ATLAS_URI)
            self.db = self.client[settings.MONGODB_ATLAS_DB or "sla113"]

    async def close(self):
        """Close MongoDB connection."""
        if self.client:
            self.client.close()

    async def insert_log(self, log_entry: dict):
        """Insert a log entry into sla113_admin_logs collection."""
        if not self.db:
            await self.connect()
        
        await self.db.sla113_admin_logs.insert_one(log_entry)

    async def find_logs(self, query: dict, limit: int = 100, sort_desc: bool = True) -> list:
        """Find log entries with optional filtering."""
        if not self.db:
            await self.connect()
        
        cursor = self.db.sla113_admin_logs.find(query)
        
        if sort_desc:
            cursor = cursor.sort("timestamp", -1)
        else:
            cursor = cursor.sort("timestamp", 1)
        
        cursor = cursor.limit(limit)
        logs = await cursor.to_list(length=limit)
        
        for log in logs:
            log["_id"] = str(log["_id"])
        
        return logs

    async def count_logs(self, query: dict = None) -> int:
        """Count log entries."""
        if not self.db:
            await self.connect()
        
        query = query or {}
        return await self.db.sla113_admin_logs.count_documents(query)


logs_client = SLA113LogsClient()


# ---------------------------------------------------------
# SLA113 SYSTEM LOGGING SERVICE
# ---------------------------------------------------------
class SLA113LoggingService:
    """
    System logging service for SLA113 operator actions.
    All admin actions, engine invocations, and tenant operations are logged.
    """

    # Action types for categorization
    ACTION_TENANT_SWITCH = "tenant_switch"
    ACTION_ENGINE_INVOKE = "engine_invoke"
    ACTION_PERMISSION_CHECK = "permission_check"
    ACTION_USAGE_LOG = "usage_log"
    ACTION_ADMIN_CREATE = "admin_create"
    ACTION_ADMIN_UPDATE = "admin_update"
    ACTION_ADMIN_DELETE = "admin_delete"
    ACTION_ENGINE_REGISTER = "engine_register"
    ACTION_ENGINE_UPDATE = "engine_update"
    ACTION_UI_GENERATE = "ui_generate"
    ACTION_BILLING_UPDATE = "billing_update"
    ACTION_PERMISSION_GRANT = "permission_grant"
    ACTION_PERMISSION_REVOKE = "permission_revoke"
    ACTION_SYSTEM_CONFIG = "system_config"
    ACTION_UNKNOWN = "unknown"

    async def log_admin_action(
        self,
        admin_id: str,
        action: str,
        metadata: Optional[dict] = None,
        tenant_id: Optional[str] = None,
        engine: Optional[str] = None,
    ) -> str:
        """
        Log an admin action to MongoDB Atlas.
        
        Args:
            admin_id: ID of the admin performing the action
            action: Type of action being performed
            metadata: Additional action metadata
            tenant_id: Related tenant ID (if applicable)
            engine: Related engine ID (if applicable)
        
        Returns:
            Log entry ID
        """
        log_id = str(uuid.uuid4())
        
        log_entry = {
            "_id": log_id,
            "timestamp": datetime.utcnow(),
            "admin_id": admin_id,
            "action": action,
            "tenant_id": tenant_id,
            "engine": engine,
            "metadata": metadata or {},
            "canon": "SLA113",
            "version": "1.0",
        }
        
        await logs_client.insert_log(log_entry)
        
        return log_id

    async def log_engine_invocation(
        self,
        admin_id: str,
        tenant_id: str,
        engine: str,
        action: str,
        payload: dict,
        result: dict,
        credits_used: int,
    ) -> str:
        """Log an engine invocation through SLA113."""
        metadata = {
            "payload": payload,
            "result": result,
            "credits_used": credits_used,
        }
        
        return await self.log_admin_action(
            admin_id=admin_id,
            action=self.ACTION_ENGINE_INVOKE,
            metadata=metadata,
            tenant_id=tenant_id,
            engine=engine,
        )

    async def log_permission_check(
        self,
        admin_id: str,
        tenant_id: str,
        engine: str,
        action: str,
        granted: bool,
    ) -> str:
        """Log a permission check result."""
        metadata = {
            "action": action,
            "granted": granted,
        }
        
        return await self.log_admin_action(
            admin_id=admin_id,
            action=self.ACTION_PERMISSION_CHECK,
            metadata=metadata,
            tenant_id=tenant_id,
            engine=engine,
        )

    async def log_usage(
        self,
        tenant_id: str,
        tenant_name: str,
        engine: str,
        action: str,
        credits: int,
        metadata: Optional[dict] = None,
    ) -> str:
        """Log tenant usage (non-admin action)."""
        log_entry = {
            "_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow(),
            "action": self.ACTION_USAGE_LOG,
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "engine": engine,
            "credits_used": credits,
            "metadata": metadata or {},
            "canon": "SLA113",
            "version": "1.0",
        }
        
        await logs_client.insert_log(log_entry)
        
        return log_entry["_id"]

    async def get_admin_logs(
        self,
        admin_id: Optional[str] = None,
        action: Optional[str] = None,
        tenant_id: Optional[str] = None,
        engine: Optional[str] = None,
        limit: int = 100,
    ) -> list:
        """
        Retrieve admin logs with optional filtering.
        
        Args:
            admin_id: Filter by admin ID
            action: Filter by action type
            tenant_id: Filter by tenant ID
            engine: Filter by engine
            limit: Maximum number of logs to return
        
        Returns:
            List of log entries
        """
        query = {}
        
        if admin_id:
            query["admin_id"] = admin_id
        if action:
            query["action"] = action
        if tenant_id:
            query["tenant_id"] = tenant_id
        if engine:
            query["engine"] = engine
        
        return await logs_client.find_logs(query, limit=limit)

    async def get_usage_logs(
        self,
        tenant_id: Optional[str] = None,
        limit: int = 100,
    ) -> list:
        """Retrieve usage logs."""
        query = {"action": self.ACTION_USAGE_LOG}
        
        if tenant_id:
            query["tenant_id"] = tenant_id
        
        return await logs_client.find_logs(query, limit=limit)

    async def get_engine_logs(
        self,
        engine: Optional[str] = None,
        tenant_id: Optional[str] = None,
        limit: int = 100,
    ) -> list:
        """Retrieve engine invocation logs."""
        query = {"action": self.ACTION_ENGINE_INVOKE}
        
        if engine:
            query["engine"] = engine
        if tenant_id:
            query["tenant_id"] = tenant_id
        
        return await logs_client.find_logs(query, limit=limit)

    async def get_recent_logs(self, limit: int = 100) -> list:
        """Get the most recent logs regardless of type."""
        return await logs_client.find_logs({}, limit=limit)

    async def get_log_count(
        self,
        admin_id: Optional[str] = None,
        action: Optional[str] = None,
    ) -> int:
        """Get count of log entries matching filter."""
        query = {}
        
        if admin_id:
            query["admin_id"] = admin_id
        if action:
            query["action"] = action
        
        return await logs_client.count_logs(query)


# Singleton instance
sla113_logging_service = SLA113LoggingService()
