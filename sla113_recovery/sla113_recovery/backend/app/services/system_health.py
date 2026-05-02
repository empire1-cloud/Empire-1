from datetime import datetime
from typing import Optional
import httpx

from ..core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------
# SYSTEM HEALTH SERVICE
# ---------------------------------------------------------
class SystemHealthService:
    """Health check service for SLA113 system components."""

    async def check_mongodb_connection(self) -> dict:
        """Check MongoDB Atlas connection."""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            client = AsyncIOMotorClient(settings.MONGODB_ATLAS_URI, serverSelectionTimeoutMS=5000)
            await client.server_info()
            return {
                "status": "healthy",
                "message": "MongoDB Atlas connected",
                "database": settings.MONGODB_ATLAS_DB or "sla113",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"MongoDB connection failed: {str(e)}",
            }

    async def check_postgres_connection(self) -> dict:
        """Check PostgreSQL connection."""
        try:
            from sqlalchemy.ext.asyncio import create_async_engine
            engine = create_async_engine(settings.DATABASE_URL, echo=False)
            async with engine.connect() as conn:
                await conn.execute("SELECT 1")
            await engine.dispose()
            return {
                "status": "healthy",
                "message": "PostgreSQL connected",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"PostgreSQL connection failed: {str(e)}",
            }

    async def check_engine_availability(self) -> dict:
        """Check availability of all engines in the registry."""
        from ..core.engine_namespace import ENGINES
        
        engines_status = {}
        available_count = 0
        
        for engine_id, engine_meta in ENGINES.items():
            engines_status[engine_id] = {
                "name": engine_meta.name,
                "status": engine_meta.status,
                "enabled_for": engine_meta.enabled_for,
            }
            if engine_meta.status == "active":
                available_count += 1
        
        return {
            "status": "healthy" if available_count > 0 else "degraded",
            "total_engines": len(ENGINES),
            "available_engines": available_count,
            "engines": engines_status,
        }

    async def check_hybrid_backend(self) -> dict:
        """Check Hybrid backend connectivity."""
        try:
            hybrid_url = settings.HYBRID_BACKEND_URL or "http://localhost:8000"
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{hybrid_url}/", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "status": "healthy",
                        "message": "Hybrid backend reachable",
                        "response": data,
                    }
                else:
                    return {
                        "status": "degraded",
                        "message": f"Hybrid backend returned {response.status_code}",
                    }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"Hybrid backend unreachable: {str(e)}",
            }

    async def check_redis_connection(self) -> dict:
        """Check Redis connection."""
        try:
            import redis.asyncio as redis
            r = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await r.ping()
            await r.aclose()
            return {
                "status": "healthy",
                "message": "Redis connected",
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "message": f"Redis connection failed: {str(e)}",
            }

    async def get_full_health_report(self) -> dict:
        """Get comprehensive health report for all SLA113 components."""
        mongodb = await self.check_mongodb_connection()
        postgres = await self.check_postgres_connection()
        redis = await self.check_redis_connection()
        engines = await self.check_engine_availability()
        hybrid = await self.check_hybrid_backend()
        
        # Calculate overall status
        components = [mongodb, postgres, redis, engines, hybrid]
        healthy_count = sum(1 for c in components if c.get("status") == "healthy")
        degraded_count = sum(1 for c in components if c.get("status") == "degraded")
        
        if healthy_count == len(components):
            overall_status = "healthy"
        elif healthy_count + degraded_count == len(components):
            overall_status = "degraded"
        else:
            overall_status = "unhealthy"
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": overall_status,
            "components": {
                "mongodb": mongodb,
                "postgresql": postgres,
                "redis": redis,
                "engines": engines,
                "hybrid_backend": hybrid,
            },
            "summary": {
                "healthy": healthy_count,
                "degraded": degraded_count,
                "unhealthy": len(components) - healthy_count - degraded_count,
            }
        }


# Singleton instance
system_health_service = SystemHealthService()
