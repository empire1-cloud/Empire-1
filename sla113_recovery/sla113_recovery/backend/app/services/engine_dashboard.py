import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from ..core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------
# MONGODB ATLAS CONNECTION (Engine Dashboard)
# ---------------------------------------------------------
class EngineDashboardClient:
    """MongoDB Atlas client for SLA113 engine dashboard."""

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

    async def find_one(self, collection: str, query: dict):
        if not self.db:
            await self.connect()
        return await self.db[collection].find_one(query)

    async def find_many(self, collection: str, query: dict, limit: int = 100):
        if not self.db:
            await self.connect()
        cursor = self.db[collection].find(query).limit(limit)
        return await cursor.to_list(length=limit)

    async def insert_one(self, collection: str, document: dict):
        if not self.db:
            await self.connect()
        return await self.db[collection].insert_one(document)

    async def update_one(self, collection: str, query: dict, update: dict):
        if not self.db:
            await self.connect()
        return await self.db[collection].update_one(query, update)

    async def delete_one(self, collection: str, query: dict):
        if not self.db:
            await self.connect()
        return await self.db[collection].delete_one(query)


dashboard_client = EngineDashboardClient()


# ---------------------------------------------------------
# ENGINE STATUS MODEL
# ---------------------------------------------------------
class EngineStatus(BaseModel):
    engine_id: str
    name: str
    status: str  # "active" | "placeholder" | "unavailable" | "maintenance"
    health: str  # "healthy" | "degraded" | "down"
    last_invoked: Optional[datetime] = None
    invocation_count: int = 0
    error_count: int = 0
    avg_response_time_ms: Optional[float] = None
    metadata: dict = {}


# ---------------------------------------------------------
# ENGINE DASHBOARD SERVICE
# ---------------------------------------------------------
class EngineDashboardService:
    """Dashboard service for managing engine status and metadata."""

    COLLECTION = "engine_status"

    async def list_engines(self) -> list:
        """List all engines with their status."""
        from ..core.engine_namespace import ALL_ENGINES
        
        engines = []
        for engine_id, engine_meta in ALL_ENGINES.items():
            status_doc = await dashboard_client.find_one(
                self.COLLECTION,
                {"engine_id": engine_id}
            )
            
            engines.append({
                "engine_id": engine_id,
                "name": engine_meta.name,
                "engine_type": engine_meta.engine_type,
                "status": status_doc.get("status", engine_meta.status) if status_doc else engine_meta.status,
                "health": status_doc.get("health", "healthy") if status_doc else "healthy",
                "last_invoked": status_doc.get("last_invoked") if status_doc else None,
                "invocation_count": status_doc.get("invocation_count", 0) if status_doc else 0,
                "credit_cost": engine_meta.credit_cost,
                "enabled_for": engine_meta.enabled_for,
                "description": engine_meta.description,
            })
        
        return engines

    async def get_engine_status(self, engine_id: str) -> Optional[dict]:
        """Get status for a specific engine."""
        from ..core.engine_namespace import ALL_ENGINES
        
        engine_meta = ALL_ENGINES.get(engine_id)
        if not engine_meta:
            return None
        
        status_doc = await dashboard_client.find_one(
            self.COLLECTION,
            {"engine_id": engine_id}
        )
        
        return {
            "engine_id": engine_id,
            "name": engine_meta.name,
            "status": status_doc.get("status", engine_meta.status) if status_doc else engine_meta.status,
            "health": status_doc.get("health", "healthy") if status_doc else "healthy",
            "last_invoked": status_doc.get("last_invoked") if status_doc else None,
            "invocation_count": status_doc.get("invocation_count", 0) if status_doc else 0,
            "error_count": status_doc.get("error_count", 0) if status_doc else 0,
            "avg_response_time_ms": status_doc.get("avg_response_time_ms") if status_doc else None,
            "credit_cost": engine_meta.credit_cost,
            "enabled_for": engine_meta.enabled_for,
            "description": engine_meta.description,
        }

    async def set_engine_status(
        self,
        engine_id: str,
        status: str,
        health: Optional[str] = None,
        admin_id: Optional[str] = None
    ) -> dict:
        """Set engine status (active, unavailable, maintenance)."""
        from ..core.engine_namespace import ALL_ENGINES
        
        engine_meta = ALL_ENGINES.get(engine_id)
        if not engine_meta:
            raise ValueError(f"Unknown engine: {engine_id}")
        
        valid_statuses = ["active", "placeholder", "unavailable", "maintenance"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
        
        valid_health = ["healthy", "degraded", "down"]
        if health and health not in valid_health:
            raise ValueError(f"Invalid health. Must be one of: {valid_health}")
        
        query = {"engine_id": engine_id}
        update = {
            "$set": {
                "status": status,
                "health": health or "healthy",
                "updated_at": datetime.utcnow(),
                "updated_by": admin_id,
            }
        }
        
        await dashboard_client.update_one(self.COLLECTION, query, update)
        
        return {"success": True, "engine_id": engine_id, "status": status}

    async def update_engine_metadata(
        self,
        engine_id: str,
        metadata: dict,
        admin_id: Optional[str] = None
    ) -> dict:
        """Update engine metadata."""
        from ..core.engine_namespace import ALL_ENGINES
        
        engine_meta = ALL_ENGINES.get(engine_id)
        if not engine_meta:
            raise ValueError(f"Unknown engine: {engine_id}")
        
        query = {"engine_id": engine_id}
        update = {
            "$set": {
                "metadata": metadata,
                "updated_at": datetime.utcnow(),
                "updated_by": admin_id,
            }
        }
        
        await dashboard_client.update_one(self.COLLECTION, query, update)
        
        return {"success": True, "engine_id": engine_id, "metadata": metadata}

    async def record_invocation(
        self,
        engine_id: str,
        response_time_ms: float,
        error: bool = False
    ):
        """Record an engine invocation for analytics."""
        status_doc = await dashboard_client.find_one(
            self.COLLECTION,
            {"engine_id": engine_id}
        )
        
        invocation_count = (status_doc.get("invocation_count", 0) + 1) if status_doc else 1
        error_count = (status_doc.get("error_count", 0) + 1) if error else (status_doc.get("error_count", 0) if status_doc else 0)
        
        # Calculate rolling average response time
        old_avg = status_doc.get("avg_response_time_ms") if status_doc else response_time_ms
        avg_response_time_ms = ((old_avg * (invocation_count - 1)) + response_time_ms) / invocation_count if invocation_count > 1 else response_time_ms
        
        query = {"engine_id": engine_id}
        update = {
            "$set": {
                "invocation_count": invocation_count,
                "error_count": error_count,
                "avg_response_time_ms": avg_response_time_ms,
                "last_invoked": datetime.utcnow(),
            }
        }
        
        await dashboard_client.update_one(self.COLLECTION, query, update)


# Singleton instance
engine_dashboard_service = EngineDashboardService()
