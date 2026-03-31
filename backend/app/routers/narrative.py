from fastapi import APIRouter, Header
from typing import Dict, Any, Optional
from ..services.gemini_service import gemini_service

router = APIRouter(prefix="/narrative", tags=["Narrative Orchestration"])

@router.get("/beat")
async def get_narrative_beat(x_tenant_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Fetch the latest atmospheric beat for the current tenant.
    This is powered by Gemini and respects the unique 'canon' of the host.
    """
    tenant = x_tenant_id or "empire1"
    beat_data = await gemini_service.generate_beat(tenant)
    return {
        "success": True,
        "tenant": tenant,
        "beat": beat_data
    }
