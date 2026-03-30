from fastapi import APIRouter, Depends, HTTPException, Header, Query
from typing import Optional

from ..services.os_modules import os_modules_service

router = APIRouter(prefix="/southern/os-modules", tags=["Southern OS Modules"])


# ========================================================
# MODULE REGISTRY
# ========================================================
@router.get("/modules")
async def list_modules(
    type: Optional[str] = Query(None, description="Filter: visual, audio, or all"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """List all OS modules."""
    from ..core.os_modules import list_modules as get_modules
    
    modules = get_modules(type)
    return {
        "success": True,
        "modules": [m.dict() for m in modules],
        "count": len(modules),
    }


@router.get("/modules/{module_id}")
async def get_module(
    module_id: str,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Get module details."""
    from ..core.os_modules import get_module
    
    module = get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return {"success": True, "module": module.dict()}


# ========================================================
# VISUAL MODULES
# ========================================================
@router.post("/visual/g-funk-ui")
async def g_funk_ui(
    metadata: dict,
    theme: str = Query("southern"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """G-Funk UI Generator - consumes style_tags, symbol_tags, identity_tags."""
    result = await os_modules_service.g_funk_ui(metadata, theme)
    return result


@router.post("/visual/arcade-os")
async def arcade_os_ui(
    metadata: dict,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Arcade OS UI - consumes style_tags, world_tags, character_tags."""
    result = await os_modules_service.arcade_os_ui(metadata)
    return result


@router.post("/visual/operator-console")
async def operator_console_ui(
    metadata: dict,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Operator Console UI - consumes style_tags, progression_tags."""
    result = await os_modules_service.operator_console_ui(metadata)
    return result


@router.post("/visual/universe-console")
async def universe_console_ui(
    metadata: dict,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Universe Console UI - consumes theme_tags, world_tags."""
    result = await os_modules_service.universe_console_ui(metadata)
    return result


@router.post("/visual/tenant")
async def tenant_ui(
    metadata: dict,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Tenant UI - consumes theme_tags, reward_tags."""
    result = await os_modules_service.tenant_ui(metadata)
    return result


# ========================================================
# AUDIO MODULES
# ========================================================
@router.post("/audio/audioking")
async def audioking(
    metadata: dict,
    scene_description: str = Query("general"),
    intensity: str = Query("medium"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """AudioKing (SFX + Ambience) - consumes music_tags, emotion_tags."""
    result = await os_modules_service.audioking(metadata, scene_description, intensity)
    return result


@router.post("/audio/voiceking")
async def voiceking(
    metadata: dict,
    x_orchestrator_key: Optional[str] = Header(None),
):
    """VoiceKing (TTS + Voice Routing) - consumes character_tags, emotion_tags."""
    result = await os_modules_service.voiceking_audio(metadata)
    return result


@router.post("/audio/sonicforge")
async def sonicforge_audio(
    metadata: dict,
    scene_description: str = Query("general"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """SonicForge (Music Cues + Stems) - consumes music_tags, emotion_tags."""
    result = await os_modules_service.sonicforge_audio(metadata, scene_description)
    return result


# ========================================================
# OS ASSEMBLY
# ========================================================
@router.post("/assemble")
async def assemble_os(
    engine_metadata: dict,
    theme: str = Query("southern"),
    scene_description: str = Query("general"),
    intensity: str = Query("medium"),
    x_orchestrator_key: Optional[str] = Header(None),
):
    """
    SLA113 OS Assembly - consumes all engine metadata.
    UI modules + Audio modules working together.
    
    Bind to:
    - UI: style_tags, theme_tags, world_tags, symbol_tags, identity_tags
    - Audio: music_tags, emotion_tags, scene_description, intensity
    """
    result = await os_modules_service.assemble_os(
        engine_metadata=engine_metadata,
        theme=theme,
        scene_description=scene_description,
        intensity=intensity,
    )
    return result


# ========================================================
# MODULE STATUS
# ========================================================
@router.get("/status")
async def get_status(
    x_orchestrator_key: Optional[str] = Header(None),
):
    """Get OS modules status."""
    from ..core.os_modules import VISUAL_MODULES, AUDIO_MODULES
    
    return {
        "success": True,
        "status": {
            "visual_modules": len(VISUAL_MODULES),
            "audio_modules": len(AUDIO_MODULES),
            "total": len(VISUAL_MODULES) + len(AUDIO_MODULES),
            "engine_metadata_consumed": True,
            "canon_override": True,
        },
    }
