"""
Audio Effects Pipeline Endpoints — Post-processing for the Hybrid AI Stack.

Apply Spotify Pedalboard effects to any audio file. Includes tenant-specific
presets (Southern G-Funk, Arcade Hype, Empire Corporate, SLA113 Operator)
and custom chain support.

Designed to work as the final stage in the VoxCPM2 → Effects pipeline.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audio-fx", tags=["AudioFX"])

import os
VOXCPM_AUDIO_DIR = os.getenv("VOXCPM_AUDIO_DIR", "/var/sla/audio/voxcpm")
FX_DIR = Path(VOXCPM_AUDIO_DIR, "fx")
FX_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = Path(VOXCPM_AUDIO_DIR, "fx_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class EffectSpec(BaseModel):
    type: str = Field(..., description="Effect type: reverb, compressor, gain, highpass, lowpass, chorus, delay, pitch_shift")
    room_size: Optional[float] = None
    damping: Optional[float] = None
    wet_level: Optional[float] = None
    threshold_db: Optional[float] = None
    ratio: Optional[float] = None
    gain_db: Optional[float] = None
    cutoff_hz: Optional[float] = None
    rate_hz: Optional[float] = None
    depth: Optional[float] = None
    mix: Optional[float] = None
    delay_seconds: Optional[float] = None
    feedback: Optional[float] = None
    semitones: Optional[float] = None


class ApplyPresetRequest(BaseModel):
    input_path: str = Field(..., description="Path to input audio file (e.g. from /api/voxcpm/generate)")
    preset: str = Field(..., description="Preset name: southern_radio, arcade_hype, empire_corporate, sla113_operator, narrator_cinematic, robotic, echo_chamber, deep_voice")


class ApplyChainRequest(BaseModel):
    input_path: str = Field(..., description="Path to input audio file")
    chain: List[EffectSpec] = Field(..., min_length=1)


@router.post("/apply-preset")
async def apply_preset(request: ApplyPresetRequest):
    """
    Apply a named effect preset to an audio file.

    Use the output path from /api/voxcpm/generate as input_path.
    Presets are tuned for each tenant's sonic identity.
    """
    try:
        from app.services.audio_fx_pipeline import AudioFXPipeline
        pipeline = AudioFXPipeline()
        result = pipeline.apply_preset(request.input_path, request.preset)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Audio file not found: {request.input_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply-chain")
async def apply_chain(request: ApplyChainRequest):
    """
    Apply a custom effect chain to an audio file.

    Build your own chain from individual effects:
    reverb, compressor, gain, highpass, lowpass, chorus, delay, pitch_shift.
    """
    try:
        from app.services.audio_fx_pipeline import AudioFXPipeline
        pipeline = AudioFXPipeline()
        chain_dicts = [fx.model_dump(exclude_none=True) for fx in request.chain]
        result = pipeline.apply_chain(request.input_path, chain_dicts)
        return {"success": True, **result}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Audio file not found: {request.input_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply-preset-upload")
async def apply_preset_upload(
    preset: str = Form(...),
    audio_file: UploadFile = File(...),
):
    """Apply an effect preset to an uploaded audio file."""
    try:
        temp_id = str(uuid.uuid4())
        upload_path = UPLOAD_DIR / f"{temp_id}_{audio_file.filename}"
        content = await audio_file.read()
        upload_path.write_bytes(content)

        from app.services.audio_fx_pipeline import AudioFXPipeline
        pipeline = AudioFXPipeline()
        result = pipeline.apply_preset(str(upload_path), preset)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presets")
async def list_presets():
    """List all available effect presets with descriptions."""
    from app.services.audio_fx_pipeline import EFFECT_PRESETS
    presets = {
        name: {
            "name": p["name"],
            "description": p["description"],
            "effects_count": len(p["chain"]),
            "effects": [fx["type"] for fx in p["chain"]],
        }
        for name, p in EFFECT_PRESETS.items()
    }
    return {"success": True, "presets": presets, "total": len(presets)}


@router.get("/effects")
async def list_effects():
    """List all available individual effects and their parameters."""
    return {
        "success": True,
        "effects": {
            "reverb": {"params": ["room_size", "damping", "wet_level"]},
            "compressor": {"params": ["threshold_db", "ratio"]},
            "gain": {"params": ["gain_db"]},
            "highpass": {"params": ["cutoff_hz"]},
            "lowpass": {"params": ["cutoff_hz"]},
            "chorus": {"params": ["rate_hz", "depth", "mix"]},
            "delay": {"params": ["delay_seconds", "feedback", "mix"]},
            "pitch_shift": {"params": ["semitones"]},
        },
    }
