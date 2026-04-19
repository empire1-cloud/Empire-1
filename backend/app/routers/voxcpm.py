"""
VoxCPM2 API Router — Voice Synthesis Endpoints for Empire Universe.

Endpoints:
  POST /voxcpm/generate        — Text-to-Speech (with tenant voice presets)
  POST /voxcpm/design          — Voice Design from natural-language description
  POST /voxcpm/clone           — Voice Cloning (controllable or ultimate)
  GET  /voxcpm/voices          — List available voices and custom designs
  GET  /voxcpm/status          — Engine status and capability check
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional
import uuid
from pathlib import Path

from app.services.voxcpm_service import VoxCPMService

router = APIRouter(prefix="/voxcpm", tags=["VoxCPM"])


class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str = Field(default="default")
    style_instruction: Optional[str] = Field(
        default=None,
        description="Custom style guidance, e.g. 'cheerful tone, slightly faster pace'",
    )


class DesignRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Natural-language voice description, e.g. 'A young woman with a gentle, warm voice'",
    )
    sample_text: str = Field(
        default="Hello, this is a voice design preview from Empire Universe.",
        max_length=1000,
    )


class CloneRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    style_instruction: Optional[str] = None
    reference_transcript: Optional[str] = Field(
        default=None,
        description="Transcript of the reference audio. Enables Ultimate Cloning for maximum fidelity.",
    )


@router.post("/generate")
async def generate_speech(request: GenerateRequest):
    """
    Generate speech from text using VoxCPM2.

    Use voice_id to select a tenant preset (empire, southern, arcade, sla113, narrator)
    or provide a custom style_instruction for fine-grained control.
    """
    try:
        service = VoxCPMService()
        result = await service.generate_speech(
            text=request.text,
            voice_id=request.voice_id,
            style_instruction=request.style_instruction,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/design")
async def design_voice(request: DesignRequest):
    """
    Create a brand-new voice from a natural-language description.

    VoxCPM2 generates a unique voice matching your description — no reference audio needed.
    Returns a voice_id you can reuse in subsequent /generate calls.
    """
    try:
        service = VoxCPMService()
        result = await service.design_voice(
            description=request.description,
            sample_text=request.sample_text,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clone")
async def clone_voice(
    text: str = Form(...),
    style_instruction: Optional[str] = Form(default=None),
    reference_transcript: Optional[str] = Form(default=None),
    reference_audio: UploadFile = File(...),
):
    """
    Clone a voice from uploaded reference audio.

    - Without reference_transcript: Controllable Cloning (timbre + optional style control)
    - With reference_transcript: Ultimate Cloning (reproduces every vocal nuance)
    """
    try:
        temp_id = str(uuid.uuid4())
        ref_dir = Path("/var/sla/audio/voxcpm/references")
        ref_dir.mkdir(parents=True, exist_ok=True)
        ref_path = ref_dir / f"{temp_id}_ref.wav"

        content = await reference_audio.read()
        ref_path.write_bytes(content)

        service = VoxCPMService()
        result = await service.clone_voice(
            reference_audio_path=str(ref_path),
            text=text,
            style_instruction=style_instruction,
            reference_transcript=reference_transcript,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    """List all available voices: tenant presets + custom designed voices."""
    try:
        service = VoxCPMService()
        voices = await service.list_voices()
        return {"success": True, "voices": voices, "total": len(voices)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def voxcpm_status():
    """Check VoxCPM2 engine status, mode, and capabilities."""
    try:
        service = VoxCPMService()
        status = await service.get_status()
        return {"success": True, **status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
