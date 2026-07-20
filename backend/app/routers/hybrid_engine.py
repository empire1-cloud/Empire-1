from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional

from core.engine_context import EngineContext, get_execution_context
from ..services.hybrid_engine_runtime import engine_orchestrator

router = APIRouter(prefix="/hybrid", tags=["Hybrid Engine Runtime"])


# ---------------------------------------------------------
# HYBRID ENGINE EXECUTION
# ---------------------------------------------------------
@router.post("/execute/{engine}/{action}")
async def execute_engine(
    request: Request,
    engine: str,
    action: str,
    payload: dict,
    timeout: Optional[float] = 60.0,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Execute a single engine action."""
    try:
        result = await engine_orchestrator.execute(
            engine=engine,
            action=action,
            payload=payload,
            options={
                "timeout": timeout,
                "team_id": ctx.team_id,
                "user_id": ctx.user_id,
                "endpoint": str(request.url.path),
                "method": request.method,
                "idempotency_key": request.headers.get("Idempotency-Key") or request.headers.get("X-Idempotency-Key"),
                "auth_type": ctx.auth_metadata.auth_type,
                "api_key_id": ctx.auth_metadata.api_key_id,
                "api_key_name": ctx.auth_metadata.api_key_name,
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pipeline/execute")
async def execute_pipeline(
    request: Request,
    pipeline: list[dict],
    timeout: Optional[float] = 300.0,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Execute a pipeline of engines."""
    try:
        results = await engine_orchestrator.execute_pipeline(
            pipeline=pipeline,
            options={
                "timeout": timeout,
                "team_id": ctx.team_id,
                "user_id": ctx.user_id,
                "endpoint": str(request.url.path),
                "method": request.method,
                "idempotency_key": request.headers.get("Idempotency-Key") or request.headers.get("X-Idempotency-Key"),
                "auth_type": ctx.auth_metadata.auth_type,
                "api_key_id": ctx.auth_metadata.api_key_id,
                "api_key_name": ctx.auth_metadata.api_key_name,
            },
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
