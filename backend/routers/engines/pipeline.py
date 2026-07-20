"""
Pipeline Composer Engine endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from core.engine_context import EngineContext, get_execution_context
from services.pipeline_composer import PipelineComposerEngine
from services.error_handler import ErrorHandler, PipelineStage

router = APIRouter(tags=["pipeline"])


class PipelineStepModel(BaseModel):
    engine: str
    input: str
    output_key: str


class PipelineComposeRequest(BaseModel):
    request: str
    context: Optional[str] = None
    preferred_engines: Optional[List[str]] = None
    model: Optional[str] = None


class CustomPipelineRequest(BaseModel):
    objective: str
    steps: List[PipelineStepModel]


class PipelineComposeResponse(BaseModel):
    objective: str
    pipeline: List[Dict[str, Any]]
    final_output_structure: Dict[str, Any]


@router.post("/pipeline/compose", response_model=PipelineComposeResponse)
async def compose_pipeline(
    payload: PipelineComposeRequest,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Compose a multi-engine pipeline based on request."""
    ctx.require_write()
    try:
        pipeline = await PipelineComposerEngine.compose_pipeline_async(
            request=payload.request,
            context=payload.context,
            preferred_engines=payload.preferred_engines,
            model=payload.model
        )
        
        return PipelineComposeResponse(**pipeline)
    except Exception as e:
        error_response = ErrorHandler.handle(e, PipelineStage.STRATEGY)
        return JSONResponse(
            status_code=500,
            content=error_response.model_dump()
        )


@router.post("/pipeline/compose-detailed")
async def compose_pipeline_detailed(
    payload: PipelineComposeRequest,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Compose pipeline with detailed engine descriptions."""
    ctx.require_write()
    try:
        pipeline = await PipelineComposerEngine.compose_and_describe_async(
            request=payload.request,
            include_descriptions=True
        )
        
        return pipeline
    except Exception as e:
        error_response = ErrorHandler.handle(e, PipelineStage.STRATEGY)
        return JSONResponse(
            status_code=500,
            content=error_response.model_dump()
        )


@router.post("/pipeline/custom")
async def build_custom_pipeline(
    payload: CustomPipelineRequest,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Build a custom pipeline from explicit steps."""
    ctx.require_write()
    try:
        steps = [s.model_dump() for s in payload.steps]
        pipeline = PipelineComposerEngine.build_custom_pipeline(
            objective=payload.objective,
            steps=steps
        )
        
        return pipeline
    except Exception as e:
        error_response = ErrorHandler.handle(e, PipelineStage.STRATEGY)
        return JSONResponse(
            status_code=500,
            content=error_response.model_dump()
        )


@router.post("/pipeline/validate")
async def validate_pipeline(
    steps: List[PipelineStepModel],
    ctx: EngineContext = Depends(get_execution_context),
):
    """Validate a pipeline configuration."""
    ctx.require_write()
    step_dicts = [s.model_dump() for s in steps]
    return PipelineComposerEngine.validate_pipeline(step_dicts)


@router.get("/pipeline/templates")
async def get_pipeline_templates(ctx: EngineContext = Depends(get_execution_context)):
    """Get available pre-built pipeline templates."""
    ctx.require_read()
    return PipelineComposerEngine.get_available_templates()


@router.get("/pipeline/template/{template_name}")
async def get_pipeline_template(
    template_name: str,
    ctx: EngineContext = Depends(get_execution_context),
):
    """Get a specific pipeline template."""
    ctx.require_read()
    template = PipelineComposerEngine.get_template(template_name)
    if template is None:
        raise HTTPException(status_code=404, detail=f"Template '{template_name}' not found")
    return {
        "name": template_name,
        "steps": template,
        "engine_count": len(template)
    }


@router.get("/pipeline/engines")
async def get_available_engines(ctx: EngineContext = Depends(get_execution_context)):
    """Get all available engines and their capabilities."""
    ctx.require_read()
    return PipelineComposerEngine.get_available_engines()
