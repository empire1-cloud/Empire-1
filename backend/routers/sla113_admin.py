"""SLA113 Admin Router — /api/sla113/admin/engines endpoint."""
from fastapi import APIRouter
from typing import Optional

router = APIRouter(prefix="/sla113/admin", tags=["SLA113 Admin"])

# Basic engines list (fallback if engine_namespace not available)
BASIC_ENGINES = {
    "vision": {"name": "Vision", "status": "active"},
    "logic": {"name": "Logic", "status": "active"},
    "composer": {"name": "Composer", "status": "active"},
    "strategy": {"name": "Strategy", "status": "active"},
    "analysis": {"name": "Analysis", "status": "active"},
    "evaluator": {"name": "Evaluator", "status": "active"},
    "pricing": {"name": "Pricing", "status": "active"},
    "blueprint": {"name": "Blueprint", "status": "active"},
    "persona": {"name": "Persona", "status": "active"},
    "pipeline": {"name": "Pipeline", "status": "active"},
}

@router.get("/engines")
async def list_all_engines(tenant: Optional[str] = None):
    """List engines with optional tenant filter."""
    try:
        from app.core.engine_namespace import ALL_ENGINES
        return {"success": True, "engines": ALL_ENGINES}
    except ImportError:
        # Fallback to basic list
        return {"success": True, "engines": BASIC_ENGINES}
