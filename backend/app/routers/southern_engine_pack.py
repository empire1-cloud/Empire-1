from fastapi import APIRouter, Depends, HTTPException, Header, Query
from typing import Optional, List

from ..services.southern_engine_pack import southern_engine_pack_service

router = APIRouter(prefix="/southern/engine-pack", tags=["Southern Engine Pack"])


# ========================================================
# ENGINE REGISTRY ENDPOINTS
# ========================================================
@router.get("/engines")
async def list_engines(
    type: Optional[str] = Query(None, description="Filter: canon, universal, or all"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """List all Southern Engine Pack engines."""
    from ..core.engine_namespace import (
        get_canon_engines,
        get_universal_engines,
        list_engines as list_all,
    )
    
    if type == "canon":
        engines = get_canon_engines()
    elif type == "universal":
        engines = get_universal_engines()
    else:
        engines = list_all(tenant="Southern")
    
    return {
        "success": True,
        "engines": [e.dict() for e in engines],
        "count": len(engines),
    }


@router.get("/engines/{engine_id}")
async def get_engine(
    engine_id: str,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Get engine metadata."""
    from ..core.engine_namespace import get_engine
    
    engine = get_engine(engine_id)
    if not engine:
        raise HTTPException(status_code=404, detail="Engine not found")
    
    return {"success": True, "engine": engine.dict()}


# ========================================================
# CANON 5 ENDPOINTS (Identity Layer)
# ========================================================
@router.post("/canon/{engine_id}")
async def execute_canon(
    engine_id: str,
    tenant_id: str = Query(...),
    role: str = Query("player"),
    context: dict = {},
    overrides: dict = {},
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Execute Canon 5 engine (identity layer)."""
    # Verify Canon engine
    from ..core.engine_namespace import get_engine
    engine = get_engine(engine_id)
    if not engine or not engine.canon_lock:
        raise HTTPException(status_code=400, detail="Not a Canon engine")
    
    result = await southern_engine_pack_service.execute_engine(
        engine_id=engine_id,
        tenant_id=tenant_id,
        role=role,
        context=context,
        overrides=overrides,
    )
    
    return result


# ========================================================
# UNIVERSAL 15 ENDPOINTS (Production Layer)
# ========================================================
@router.post("/universal/{engine_id}")
async def execute_universal(
    engine_id: str,
    tenant_id: str = Query(...),
    role: str = Query("player"),
    theme: str = Query("southern", description="Theme: southern, anime, horror, wizard, sci-fi, fantasy"),
    context: dict = {},
    overrides: dict = {},
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Execute Universal 15 engine (production layer) with theme parameter."""
    # Verify Universal engine
    from ..core.engine_namespace import get_engine
    engine = get_engine(engine_id)
    if not engine or engine.canon_lock:
        raise HTTPException(status_code=400, detail="Not a Universal engine")
    
    result = await southern_engine_pack_service.execute_engine(
        engine_id=engine_id,
        tenant_id=tenant_id,
        role=role,
        context=context,
        overrides=overrides,
        theme=theme,
    )
    
    return result


# ========================================================
# ENGINE CHAINING ENDPOINTS
# ========================================================
@router.post("/chain/execute")
async def execute_chain(
    canon_engines: List[str] = Query(..., description="Canon engine IDs"),
    universal_engines: List[str] = Query(..., description="Universal engine IDs"),
    tenant_id: str = Query(...),
    role: str = Query("player"),
    theme: str = Query("southern"),
    context: dict = {},
    x_orchestrator_key: Optional[str] = Header(None),
):
    """
    Execute engine chain: Canon 5 outputs feed into Universal 15.
    Universal outputs inherit Canon metadata (canon_lock=True).
    """
    result = await southern_engine_pack_service.execute_chain(
        canon_engines=canon_engines,
        universal_engines=universal_engines,
        tenant_id=tenant_id,
        role=role,
        theme=theme,
        context=context,
    )
    
    return result


# ========================================================
# SLA113 OS MERGE ENDPOINT
# ========================================================
@router.post("/os/merge")
async def os_merge(
    tenant_id: str = Query(...),
    role: str = Query("player"),
    theme: str = Query("southern", description="Theme parameter for content generation"),
    context: dict = {},
    x_orchestrator_key: Optional[str] = Header(None),
):
    """
    SLA113 merges Canon metadata + Universal content into final OS output.
    Canon 5 always overrides Universal 15 for identity, tone, symbols, SGV, music.
    
    Theme switching: ?theme=southern, anime, horror, wizard, sci-fi, fantasy
    """
    result = await southern_engine_pack_service.os_merge(
        tenant_id=tenant_id,
        role=role,
        theme=theme,
        context=context,
    )
    
    return result


# ========================================================
# THEME SWITCHING ENDPOINT
# ========================================================
@router.get("/themes")
async def list_themes(
    x_orchestrator_key: Optional[str] = Header(None),
):
    """List available themes for Southern Engine Pack."""
    return {
        "success": True,
        "themes": [
            {"id": "southern", "name": "Southern Lyfestyle", "canon_lock": True},
            {"id": "anime", "name": "Anime", "canon_lock": False},
            {"id": "horror", "name": "Horror", "canon_lock": False},
            {"id": "wizard", "name": "Wizard", "canon_lock": False},
            {"id": "sci-fi", "name": "Sci-Fi", "canon_lock": False},
            {"id": "fantasy", "name": "Fantasy", "canon_lock": False},
        ],
    }


# ========================================================
# ENGINE STATUS
# ========================================================
@router.get("/status")
async def get_status(
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Get Southern Engine Pack status."""
    from ..core.engine_namespace import get_canon_engines, get_universal_engines
    
    return {
        "success": True,
        "status": {
            "canon_engines": len(get_canon_engines()),
            "universal_engines": len(get_universal_engines()),
            "total": len(get_canon_engines()) + len(get_universal_engines()),
            "canon_lock": True,
            "chain_enabled": True,
            "theme_switching": True,
        },
    }


# ========================================================
# SOUTHERN PIPELINES (20) — Game OS + Arcade + Canon
# ========================================================
@router.get("/pipelines")
async def list_southern_pipelines(
    group: Optional[str] = Query(None, description="Filter by group: arcade_session, game_os, canon, deployment, og_build"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """List all 20 Southern pipelines."""
    from ..core.engine_namespace import list_southern_pipelines as _list
    pipelines = _list(group=group, tenant="Southern")
    return {
        "success": True,
        "data": pipelines,
        "count": len(pipelines),
        "boundary": "SLA113_ORCHESTRATED",
    }


@router.get("/pipelines/{pipeline_id}")
async def get_southern_pipeline(
    pipeline_id: str,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Get a specific Southern pipeline by ID."""
    from ..core.engine_namespace import get_southern_pipeline as _get, calculate_southern_pipeline_cost
    pipeline = _get(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Southern pipeline '{pipeline_id}' not found")
    return {
        "success": True,
        "data": {
            **pipeline,
            "estimated_credit_cost": calculate_southern_pipeline_cost(pipeline_id),
        },
    }


@router.post("/pipelines/{pipeline_id}/run")
async def run_southern_pipeline(
    pipeline_id: str,
    payload: dict = {},
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Dispatch a Southern pipeline run (SLA113 orchestrated)."""
    from ..core.engine_namespace import get_southern_pipeline as _get, calculate_southern_pipeline_cost
    pipeline = _get(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Southern pipeline '{pipeline_id}' not found")
    return {
        "success": True,
        "message": f"Southern pipeline '{pipeline['name']}' dispatched via SLA113",
        "pipeline": {
            "pipeline_id": pipeline_id,
            "pipeline_name": pipeline["name"],
            "group": pipeline["group"],
            "steps": pipeline["steps"],
            "credit_cost": calculate_southern_pipeline_cost(pipeline_id),
            "output_type": pipeline.get("output_type"),
            "math_rev": pipeline.get("math_rev", "MATH_CORE_REV_7"),
            "payload": payload,
        },
        "boundary": "SLA113_ORCHESTRATED",
        "status": "dispatched",
    }
