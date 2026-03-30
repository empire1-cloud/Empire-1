import uuid
from datetime import datetime, timedelta
from typing import Optional

from ..core.config import get_settings
from ..core.sla113_constants import TENANTS

settings = get_settings()


# ---------------------------------------------------------
# MONGODB ATLAS CONNECTION (Tenant Billing)
# ---------------------------------------------------------
class TenantBillingClient:
    """MongoDB Atlas client for tenant billing."""

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

    async def insert_charge(self, charge: dict):
        if not self.db:
            await self.connect()
        await self.db.tenant_billing.insert_one(charge)

    async def find_charges(self, query: dict, limit: int = 100):
        if not self.db:
            await self.connect()
        cursor = self.db.tenant_billing.find(query).sort("timestamp", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def aggregate_charges(self, pipeline: list):
        if not self.db:
            await self.connect()
        return await self.db.tenant_billing.aggregate(pipeline).to_list(length=None)


billing_client = TenantBillingClient()


# ---------------------------------------------------------
# BILLING SERVICE
# ---------------------------------------------------------
class BillingService:
    """Tenant billing service for tracking engine usage charges."""

    async def record_charge(
        self,
        tenant_id: str,
        engine: str,
        action: str,
        credits: int,
        metadata: Optional[dict] = None,
    ) -> str:
        """
        Record a charge for tenant engine usage.
        
        Args:
            tenant_id: ID of the tenant
            engine: Engine used
            action: Action performed
            credits: Number of credits charged
            metadata: Additional charge metadata
        
        Returns:
            Charge ID
        """
        tenant = TENANTS.get(tenant_id)
        tenant_name = tenant.get("name", "unknown") if tenant else "unknown"
        
        charge_id = str(uuid.uuid4())
        
        charge = {
            "_id": charge_id,
            "timestamp": datetime.utcnow(),
            "tenant_id": tenant_id,
            "tenant_name": tenant_name,
            "engine": engine,
            "action": action,
            "credits": credits,
            "metadata": metadata or {},
        }
        
        await billing_client.insert_charge(charge)
        
        return charge_id

    async def get_billing_history(
        self,
        tenant_id: str,
        limit: int = 100,
    ) -> list:
        """Get billing history for a tenant."""
        query = {"tenant_id": tenant_id}
        charges = await billing_client.find_charges(query, limit=limit)
        
        for charge in charges:
            charge["_id"] = str(charge["_id"])
        
        return charges

    async def calculate_monthly_total(
        self,
        tenant_id: str,
        year: Optional[int] = None,
        month: Optional[int] = None,
    ) -> dict:
        """Calculate total charges for a specific month."""
        if year is None:
            year = datetime.utcnow().year
        if month is None:
            month = datetime.utcnow().month
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        pipeline = [
            {
                "$match": {
                    "tenant_id": tenant_id,
                    "timestamp": {
                        "$gte": start_date,
                        "$lt": end_date,
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_credits": {"$sum": "$credits"},
                    "total_charges": {"$sum": 1},
                    "by_engine": {
                        "$push": {
                            "engine": "$engine",
                            "credits": "$credits",
                        }
                    }
                }
            }
        ]
        
        results = await billing_client.aggregate_charges(pipeline)
        
        if not results:
            return {
                "tenant_id": tenant_id,
                "year": year,
                "month": month,
                "total_credits": 0,
                "total_charges": 0,
                "by_engine": {},
            }
        
        result = results[0]
        
        # Aggregate by engine
        by_engine = {}
        for item in result.get("by_engine", []):
            engine = item["engine"]
            if engine not in by_engine:
                by_engine[engine] = 0
            by_engine[engine] += item["credits"]
        
        return {
            "tenant_id": tenant_id,
            "year": year,
            "month": month,
            "total_credits": result.get("total_credits", 0),
            "total_charges": result.get("total_charges", 0),
            "by_engine": by_engine,
        }

    async def get_all_tenant_totals(self) -> list:
        """Get total charges for all tenants."""
        pipeline = [
            {
                "$group": {
                    "_id": "$tenant_id",
                    "tenant_name": {"$first": "$tenant_name"},
                    "total_credits": {"$sum": "$credits"},
                    "total_charges": {"$sum": 1},
                }
            },
            {
                "$sort": {"total_credits": -1}
            }
        ]
        
        results = await billing_client.aggregate_charges(pipeline)
        
        return [
            {
                "tenant_id": r["_id"],
                "tenant_name": r.get("tenant_name", "unknown"),
                "total_credits": r.get("total_credits", 0),
                "total_charges": r.get("total_charges", 0),
            }
            for r in results
        ]


# Singleton instance
billing_service = BillingService()
