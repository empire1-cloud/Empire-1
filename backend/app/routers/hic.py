"""Hybrid Intelligence Core API.

This router is intentionally thin: execution is delegated to the real
HybridIntelligenceCore service. It must never manufacture successful model
execution, telemetry, drift, or verification claims.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.hybrid_core import get_core, TaskType

router = APIRouter(prefix="/hybrid", tags=["HIC"])

ENGINE_CATEGORIES = {
    "Core": {
        "engines": {
            "hybrid_intelligence_core": "Master orchestrator",
            "routing_engine": "Task classification and model selection",
            "canon_enforcer": "Output normalization and validation",
            "drift_monitor": "Behavioral drift checks",
            "error_handler": "Structured error handling",
        }
    },
    "Intelligence": {
        "engines": {
            "strategy_engine": "Generate actionable strategies",
            "plan_builder_engine": "Convert goals into execution plans",
            "analysis_engine": "Structured analysis",
            "opportunity_mapper_engine": "Identify opportunities",
            "evaluator_engine": "Evaluate against criteria",
            "pricing_engine": "Generate pricing structures",
            "blueprint_engine": "System architecture blueprints",
            "persona_engine": "Customer/persona analysis",
        }
    },
    "Creative": {
        "engines": {
            "anime_character_engine": "Character creation",
            "anime_lore_engine": "World-building",
            "anime_story_engine": "Narrative structure",
            "art_direction_engine": "Visual direction",
        }
    },
    "Business": {
        "engines": {
            "money_pipeline_engine": "Revenue pipeline generation",
            "pipeline_composer_engine": "Multi-step orchestration",
        }
    },
}

ALL_ENGINES: Dict[str, Dict[str, str]] = {}
for category, info in ENGINE_CATEGORIES.items():
    for engine_id, description in info["engines"].items():
        ALL_ENGINES[engine_id] = {
            "id": engine_id,
            "name": engine_id.replace("_engine", "").replace("_", " ").title(),
            "description": description,
            "category": category,
            "status": "available",
        }


class ExecuteRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=100_000)
    engine: Optional[str] = None
    context: Optional[str] = Field(default=None, max_length=100_000)
    force_model: Optional[str] = None


class PipelineStep(BaseModel):
    engine: str
    input: str = Field(min_length=1, max_length=100_000)
    output_key: Optional[str] = None


class PipelineRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=100_000)
    steps: List[PipelineStep] = Field(min_length=1, max_length=20)


def _task_type_for_engine(engine: str) -> Optional[TaskType]:
    if engine == "plan_builder_engine":
        return TaskType.PLAN
    if engine in {"strategy_engine", "money_pipeline_engine", "pricing_engine", "opportunity_mapper_engine", "persona_engine"}:
        return TaskType.STRATEGY
    if engine in {"analysis_engine", "evaluator_engine"}:
        return TaskType.ANALYSIS
    return None


def _serialize_result(result: Any) -> dict:
    if result.success:
        return {
            "success": True,
            "data": result.data,
            "metadata": result.metadata,
        }
    return {
        "success": False,
        "error": result.error,
        "metadata": result.metadata,
    }


@router.get("/engines")
async def list_engines():
    return {"engines": list(ALL_ENGINES.values()), "total": len(ALL_ENGINES)}


@router.get("/engines/{engine_id}")
async def get_engine(engine_id: str):
    engine = ALL_ENGINES.get(engine_id)
    if not engine:
        raise HTTPException(status_code=404, detail=f"Engine '{engine_id}' not found")
    return engine


@router.get("/engines/categories")
async def get_categories():
    return {"categories": ENGINE_CATEGORIES}


@router.post("/execute")
async def execute_engine(payload: ExecuteRequest):
    """Execute through the real HybridIntelligenceCore.

    No synthetic success, random model selection, fake latency, or fabricated
    canon/drift claims are permitted here.
    """
    engine = payload.engine or "hybrid_intelligence_core"
    if engine not in ALL_ENGINES:
        raise HTTPException(status_code=404, detail=f"Engine '{engine}' not found")

    core = get_core()
    task_type = _task_type_for_engine(engine)
    prompt = payload.prompt
    if engine not in {"hybrid_intelligence_core", "strategy_engine", "plan_builder_engine"}:
        prompt = f"Execute the {ALL_ENGINES[engine]['name']} responsibility.\n\n{payload.prompt}"

    result = await core.execute(
        prompt=prompt,
        task_type=task_type,
        context=payload.context,
        force_model=payload.force_model,
    )
    return _serialize_result(result)


@router.post("/pipeline/compose")
async def compose_pipeline(payload: PipelineRequest):
    """Run a real sequential pipeline through the HybridIntelligenceCore."""
    core = get_core()
    results = []
    current_input = payload.objective

    for index, step in enumerate(payload.steps, start=1):
        if step.engine not in ALL_ENGINES:
            results.append({"step": index, "engine": step.engine, "success": False, "error": "Engine not found"})
            continue

        task_type = _task_type_for_engine(step.engine)
        prompt = f"Engine responsibility: {ALL_ENGINES[step.engine]['name']}\nObjective: {payload.objective}\nInput from prior step: {current_input}\nStep instruction: {step.input}"
        result = await core.execute(prompt=prompt, task_type=task_type)
        serialized = _serialize_result(result)
        results.append({"step": index, "engine": step.engine, **serialized})

        if not result.success:
            break
        current_input = str(result.data)

    return {
        "objective": payload.objective,
        "steps_completed": len(results),
        "results": results,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/pipeline/templates")
async def pipeline_templates():
    return {
        "templates": {
            "strategy_to_plan": {"name": "Strategy → Plan", "steps": ["strategy_engine", "plan_builder_engine"]},
            "full_analysis": {"name": "Full Analysis", "steps": ["analysis_engine", "opportunity_mapper_engine", "evaluator_engine"]},
            "content_pipeline": {"name": "Content Pipeline", "steps": ["persona_engine", "strategy_engine", "art_direction_engine"]},
            "monetize_idea": {"name": "Monetize Idea", "steps": ["strategy_engine", "pricing_engine", "money_pipeline_engine"]},
            "product_blueprint": {"name": "Product Blueprint", "steps": ["blueprint_engine", "plan_builder_engine", "evaluator_engine"]},
        }
    }


@router.get("/analytics")
async def get_analytics():
    """Return only telemetry actually recorded by the core process."""
    core = get_core()
    log = list(core.execution_log)
    successes = sum(1 for entry in log if entry.get("success"))
    return {
        "source": "HybridIntelligenceCore.execution_log",
        "persistence": "process-local; not a durable production telemetry store",
        "summary": {
            "total_executions": len(log),
            "successes": successes,
            "errors": len(log) - successes,
        },
        "recent": list(reversed(log[-20:])),
    }


@router.get("/drift")
async def get_drift_report():
    """Do not manufacture drift scores; return the core's recorded execution metadata."""
    core = get_core()
    models = {}
    for entry in core.execution_log:
        metadata = entry.get("metadata") or {}
        model = metadata.get("model_used")
        if model:
            models.setdefault(model, {"executions": 0, "last_drift_status": None})
            models[model]["executions"] += 1
            models[model]["last_drift_status"] = metadata.get("drift_status")
    return {
        "status": "observed",
        "models": models,
        "note": "No synthetic compliance or quality percentages are emitted.",
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/history")
async def get_history(limit: int = 50):
    core = get_core()
    limit = max(1, min(limit, 100))
    log = core.execution_log
    return {
        "executions": list(reversed(log[-limit:])),
        "total": len(log),
        "persistence": "process-local; durable history is not claimed",
    }


@router.get("/status")
async def system_status():
    core = get_core()
    return {
        "status": "operational",
        "version": "2.0.0",
        "engines_registered": len(ALL_ENGINES),
        "total_recorded_executions": len(core.execution_log),
        "execution_backend": "HybridIntelligenceCore",
    }
