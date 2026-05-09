"""
Audio Effects Pipeline Router (SLA113 Admin Layer).

Re-exports the effects pipeline for the SLA113 admin FastAPI app.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

from app.services.audio_fx_pipeline import AudioFXPipeline, EFFECT_PRESETS
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/audio-fx", tags=["AudioFX"])

UPLOAD_DIR = Path(settings.VOXCPM_AUDIO_DIR) / "fx_uploads"
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except OSError as e:
    logger.warning(f"Could not create directory {UPLOAD_DIR}: {e}")


class EffectSpec(BaseModel):
    type: str
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
    input_path: str
    preset: str


class ApplyChainRequest(BaseModel):
    input_path: str
    chain: List[EffectSpec]


@router.post("/apply-preset")
async def apply_preset(request: ApplyPresetRequest):
    try:
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
    try:
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
    try:
        temp_id = str(uuid.uuid4())
        upload_path = UPLOAD_DIR / f"{temp_id}_{audio_file.filename}"
        content = await audio_file.read()
        upload_path.write_bytes(content)

        pipeline = AudioFXPipeline()
        result = pipeline.apply_preset(str(upload_path), preset)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presets")
async def list_presets():
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
