from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from ..services.hybrid_engine_runtime import engine_orchestrator

router = APIRouter(prefix="/hybrid", tags=["Hybrid Engine Runtime"])


# ---------------------------------------------------------
# HYBRID ENGINE EXECUTION
# ---------------------------------------------------------
@router.post("/execute/{engine}/{action}")
async def execute_engine(
    engine: str,
    action: str,
    payload: dict,
    timeout: Optional[float] = 60.0,
    tenant_id: Optional[str] = None,
):
    """Execute a single engine action."""
    try:
        result = await engine_orchestrator.execute(
            engine=engine,
            action=action,
            payload=payload,
            options={"timeout": timeout, "tenant_id": tenant_id},
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pipeline/execute")
async def execute_pipeline(
    pipeline: list[dict],
    timeout: Optional[float] = 300.0,
    tenant_id: Optional[str] = None,
):
    """Execute a pipeline of engines."""
    try:
        results = await engine_orchestrator.execute_pipeline(
            pipeline=pipeline,
            options={"timeout": timeout, "tenant_id": tenant_id},
        )
        return {"success": True, "pipeline": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# ENGINE VERSIONING
# ---------------------------------------------------------
@router.get("/engine/{engine}/version")
async def get_engine_version(engine: str):
    """Get engine version."""
    version = await engine_orchestrator.get_engine_version(engine)
    return {"engine": engine, "version": version}


# ---------------------------------------------------------
# ENGINE HEALTH
# ---------------------------------------------------------
@router.get("/engine/{engine}/health")
async def get_engine_health(engine: str):
    """Get engine health status."""
    health = await engine_orchestrator.get_engine_health(engine)
    return health


@router.get("/engines/health")
async def get_all_engine_health():
    """Get health status of all engines."""
    from ..core.engine_namespace import ENGINES
    
    health_status = {}
    for engine_id in ENGINES.keys():
        health_status[engine_id] = await engine_orchestrator.get_engine_health(engine_id)
    
    return {"engines": health_status}
