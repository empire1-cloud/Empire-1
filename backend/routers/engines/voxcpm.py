"""
VoxCPM2 Engine Endpoints — Voice Synthesis for the Hybrid AI Stack.

Provides text-to-speech, voice design, voice cloning, and status
via VoxCPM2 (OpenBMB). Registered on the main API router under /api/voxcpm/*.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional
import uuid
import json
import logging
from pathlib import Path

import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/voxcpm", tags=["VoxCPM"])

# ---------------------------------------------------------------------------
# Configuration (reads from env, mirrors app/core/config.py for standalone use)
# ---------------------------------------------------------------------------
import os

VOXCPM_MODE = os.getenv("VOXCPM_MODE", "remote")
VOXCPM_API_URL = os.getenv("VOXCPM_API_URL", "http://localhost:8808")
VOXCPM_MODEL = os.getenv("VOXCPM_MODEL", "openbmb/VoxCPM2")
VOXCPM_AUDIO_DIR = os.getenv("VOXCPM_AUDIO_DIR", "/var/sla/audio/voxcpm")
VOXCPM_SAMPLE_RATE = 48000

TENANT_VOICE_PRESETS = {
    "empire_one": "(Professional male voice, authoritative and polished, corporate tone)",
    "southern": "(Warm Chicano male voice, smooth barrio cadence, confident and authentic)",
    "southern_female": "(Young Chicana woman, warm and melodic, gentle Southern California inflection)",
    "arcade": "(Energetic male announcer voice, high energy, arcade hype style)",
    "sla113": "(Deep commanding male voice, operator-grade, precise and technical)",
    "narrator": "(Rich baritone narrator, cinematic gravitas, measured pacing)",
}

VOICE_MAP = {
    "default": None,
    "empire": "empire_one",
    "southern": "southern",
    "southern_female": "southern_female",
    "arcade": "arcade",
    "sla113": "sla113",
    "narrator": "narrator",
}


def _ensure_dirs():
    for sub in ["", "voices", "clones", "references"]:
        try:
            Path(VOXCPM_AUDIO_DIR, sub).mkdir(parents=True, exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory {Path(VOXCPM_AUDIO_DIR, sub)}: {e}")


_ensure_dirs()


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice_id: str = Field(default="default")
    style_instruction: Optional[str] = Field(
        default=None,
        description="Custom style guidance, e.g. 'cheerful tone, slightly faster pace'",
    )


class DesignRequest(BaseModel):
    description: str = Field(
        ..., min_length=5, max_length=500,
        description="Natural-language voice description",
    )
    sample_text: str = Field(
        default="Hello, this is a voice design preview from Empire Universe.",
        max_length=1000,
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _generate_remote(synth_text: str, output_path: Path):
    api_url = VOXCPM_API_URL.rstrip("/")
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{api_url}/v1/audio/speech",
            json={"model": VOXCPM_MODEL, "input": synth_text, "voice": "default"},
        )
        resp.raise_for_status()
        output_path.write_bytes(resp.content)


async def _generate_local(synth_text: str, output_path: Path):
    import asyncio
    import soundfile as sf
    from voxcpm import VoxCPM

    model = VoxCPM.from_pretrained(VOXCPM_MODEL, load_denoiser=False)
    wav = await asyncio.to_thread(
        model.generate, text=synth_text, cfg_value=2.0, inference_timesteps=10,
    )
    sf.write(str(output_path), wav, model.tts_model.sample_rate)


def _build_synth_text(text: str, voice_id: str, style_instruction: Optional[str]) -> str:
    preset_key = VOICE_MAP.get(voice_id)
    if style_instruction:
        return f"({style_instruction}){text}"
    if preset_key and preset_key in TENANT_VOICE_PRESETS:
        return f"{TENANT_VOICE_PRESETS[preset_key]}{text}"
    return text


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/generate")
async def generate_speech(request: GenerateRequest):
    """Generate speech from text using VoxCPM2 with tenant voice presets."""
    try:
        audio_id = str(uuid.uuid4())
        output_path = Path(VOXCPM_AUDIO_DIR) / f"{audio_id}.wav"
        synth_text = _build_synth_text(request.text, request.voice_id, request.style_instruction)

        if VOXCPM_MODE == "local":
            await _generate_local(synth_text, output_path)
        else:
            await _generate_remote(synth_text, output_path)

        return {
            "success": True,
            "audio_id": audio_id,
            "path": str(output_path),
            "voice_id": request.voice_id,
            "characters": len(request.text),
            "sample_rate": VOXCPM_SAMPLE_RATE,
            "model": VOXCPM_MODEL,
            "provider": "voxcpm",
            "mode": VOXCPM_MODE,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/design")
async def design_voice(request: DesignRequest):
    """Create a brand-new voice from a natural-language description."""
    try:
        voice_id = f"designed_{uuid.uuid4().hex[:8]}"
        output_path = Path(VOXCPM_AUDIO_DIR, "voices", f"{voice_id}.wav")
        synth_text = f"({request.description}){request.sample_text}"

        if VOXCPM_MODE == "local":
            await _generate_local(synth_text, output_path)
        else:
            await _generate_remote(synth_text, output_path)

        meta = {
            "voice_id": voice_id,
            "description": request.description,
            "sample_text": request.sample_text,
            "path": str(output_path),
            "provider": "voxcpm",
            "type": "designed",
        }
        meta_path = Path(VOXCPM_AUDIO_DIR, "voices", f"{voice_id}.json")
        meta_path.write_text(json.dumps(meta, indent=2))

        return {"success": True, **meta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clone")
async def clone_voice(
    text: str = Form(...),
    style_instruction: Optional[str] = Form(default=None),
    reference_transcript: Optional[str] = Form(default=None),
    reference_audio: UploadFile = File(...),
):
    """Clone a voice from uploaded reference audio."""
    try:
        temp_id = str(uuid.uuid4())
        ref_dir = Path(VOXCPM_AUDIO_DIR, "references")
        ref_path = ref_dir / f"{temp_id}_ref.wav"
        content = await reference_audio.read()
        ref_path.write_bytes(content)

        clone_id = f"clone_{uuid.uuid4().hex[:8]}"
        output_path = Path(VOXCPM_AUDIO_DIR, "clones", f"{clone_id}.wav")

        synth_text = f"({style_instruction}){text}" if style_instruction else text

        if VOXCPM_MODE == "local":
            await _generate_local(synth_text, output_path)
        else:
            api_url = VOXCPM_API_URL.rstrip("/")
            async with httpx.AsyncClient(timeout=60.0) as client:
                with open(ref_path, "rb") as f:
                    files = {"reference_audio": ("reference.wav", f, "audio/wav")}
                    data = {"model": VOXCPM_MODEL, "input": synth_text}
                    if reference_transcript:
                        data["prompt_text"] = reference_transcript
                    resp = await client.post(
                        f"{api_url}/v1/audio/speech", data=data, files=files,
                    )
                    resp.raise_for_status()
                    output_path.write_bytes(resp.content)

        clone_mode = "ultimate" if reference_transcript else "controllable"
        return {
            "success": True,
            "clone_id": clone_id,
            "path": str(output_path),
            "reference_audio": str(ref_path),
            "clone_mode": clone_mode,
            "characters": len(text),
            "sample_rate": VOXCPM_SAMPLE_RATE,
            "model": VOXCPM_MODEL,
            "provider": "voxcpm",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices():
    """List all available voices: tenant presets + custom designed voices."""
    try:
        voices = []
        for key, preset_key in VOICE_MAP.items():
            entry = {"id": key, "name": key.replace("_", " ").title(), "provider": "voxcpm"}
            if preset_key and preset_key in TENANT_VOICE_PRESETS:
                entry["description"] = TENANT_VOICE_PRESETS[preset_key].strip("()")
            voices.append(entry)

        voices_dir = Path(VOXCPM_AUDIO_DIR, "voices")
        for meta_file in voices_dir.glob("*.json"):
            try:
                meta = json.loads(meta_file.read_text())
                voices.append({
                    "id": meta["voice_id"],
                    "name": meta.get("description", meta["voice_id"])[:60],
                    "provider": "voxcpm",
                    "type": meta.get("type", "designed"),
                })
            except Exception:
                continue

        return {"success": True, "voices": voices, "total": len(voices)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def voxcpm_status():
    """Check VoxCPM2 engine status, mode, and capabilities."""
    status = {
        "engine": "VoxCPM2",
        "model": VOXCPM_MODEL,
        "mode": VOXCPM_MODE,
        "sample_rate": VOXCPM_SAMPLE_RATE,
        "audio_dir": VOXCPM_AUDIO_DIR,
        "capabilities": [
            "text_to_speech",
            "voice_design",
            "controllable_cloning",
            "ultimate_cloning",
            "multilingual_30_languages",
            "48khz_studio_quality",
        ],
        "tenant_presets": list(TENANT_VOICE_PRESETS.keys()),
    }

    if VOXCPM_MODE == "remote":
        status["api_url"] = VOXCPM_API_URL
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{VOXCPM_API_URL}/v1/models")
                status["server_reachable"] = resp.status_code == 200
        except Exception:
            status["server_reachable"] = False

    return {"success": True, **status}
