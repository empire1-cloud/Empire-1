"""
VoxCPM2 Integration Service — Tokenizer-Free TTS for Empire Universe.

Supports two operational modes:
  - "remote": Calls a VoxCPM server via its OpenAI-compatible HTTP API
              (vLLM-Omni or Nano-vLLM deployment). No GPU required locally.
  - "local":  Loads VoxCPM2 directly via the `voxcpm` Python package.
              Requires NVIDIA GPU with ~8 GB VRAM.

Voice capabilities:
  - Text-to-Speech with context-aware prosody
  - Voice Design from natural-language descriptions
  - Controllable Voice Cloning (reference audio + optional style guidance)
  - Ultimate Cloning (reference audio + transcript for maximum fidelity)
"""

import uuid
import json
import logging
from pathlib import Path
from typing import Optional

import httpx

from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_local_model = None

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


def _ensure_audio_dir() -> Path:
    audio_dir = Path(settings.VOXCPM_AUDIO_DIR)
    try:
        audio_dir.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        logger.warning(f"Could not create directory {audio_dir}: {e}")
    return audio_dir


def _get_local_model():
    global _local_model
    if _local_model is not None:
        return _local_model
    try:
        from voxcpm import VoxCPM
        _local_model = VoxCPM.from_pretrained(
            settings.VOXCPM_MODEL,
            load_denoiser=False,
        )
        logger.info("VoxCPM2 local model loaded: %s", settings.VOXCPM_MODEL)
        return _local_model
    except Exception:
        logger.exception("Failed to load local VoxCPM2 model")
        raise


class VoxCPMService:
    """
    Unified VoxCPM2 service used by FastAPI routers.
    Delegates to remote HTTP API or local model based on VOXCPM_MODE.
    """

    def __init__(self):
        self.mode = settings.VOXCPM_MODE
        self.audio_dir = _ensure_audio_dir()
        self.voices_dir = self.audio_dir / "voices"
        try:
            self.voices_dir.mkdir(exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory {self.voices_dir}: {e}")
        self.clones_dir = self.audio_dir / "clones"
        try:
            self.clones_dir.mkdir(exist_ok=True)
        except OSError as e:
            logger.warning(f"Could not create directory {self.clones_dir}: {e}")

    async def generate_speech(
        self,
        text: str,
        voice_id: str = "default",
        style_instruction: Optional[str] = None,
    ) -> dict:
        """
        Generate speech from text.
        Optionally apply a voice preset or custom style instruction.
        """
        audio_id = str(uuid.uuid4())
        output_path = self.audio_dir / f"{audio_id}.wav"

        preset_key = VOICE_MAP.get(voice_id)
        if style_instruction:
            synth_text = f"({style_instruction}){text}"
        elif preset_key and preset_key in TENANT_VOICE_PRESETS:
            synth_text = f"{TENANT_VOICE_PRESETS[preset_key]}{text}"
        else:
            synth_text = text

        if self.mode == "local":
            await self._generate_local(synth_text, output_path)
        else:
            await self._generate_remote(synth_text, output_path)

        return {
            "audio_id": audio_id,
            "path": str(output_path),
            "voice_id": voice_id,
            "characters": len(text),
            "sample_rate": settings.VOXCPM_SAMPLE_RATE,
            "model": settings.VOXCPM_MODEL,
            "provider": "voxcpm",
            "mode": self.mode,
        }

    async def design_voice(
        self,
        description: str,
        sample_text: str = "Hello, this is a voice design preview.",
    ) -> dict:
        """
        Create a brand-new voice from a natural-language description.
        No reference audio needed — VoxCPM2's Voice Design capability.
        """
        voice_id = f"designed_{uuid.uuid4().hex[:8]}"
        output_path = self.voices_dir / f"{voice_id}.wav"

        synth_text = f"({description}){sample_text}"

        if self.mode == "local":
            await self._generate_local(synth_text, output_path)
        else:
            await self._generate_remote(synth_text, output_path)

        meta = {
            "voice_id": voice_id,
            "description": description,
            "sample_text": sample_text,
            "path": str(output_path),
            "provider": "voxcpm",
            "type": "designed",
        }
        meta_path = self.voices_dir / f"{voice_id}.json"
        meta_path.write_text(json.dumps(meta, indent=2))

        return meta

    async def clone_voice(
        self,
        reference_audio_path: str,
        text: str,
        style_instruction: Optional[str] = None,
        reference_transcript: Optional[str] = None,
    ) -> dict:
        """
        Clone a voice from reference audio.
        - Without transcript: Controllable Cloning
        - With transcript: Ultimate Cloning (maximum fidelity)
        """
        clone_id = f"clone_{uuid.uuid4().hex[:8]}"
        output_path = self.clones_dir / f"{clone_id}.wav"

        if style_instruction:
            synth_text = f"({style_instruction}){text}"
        else:
            synth_text = text

        if self.mode == "local":
            await self._clone_local(
                synth_text, reference_audio_path, output_path,
                reference_transcript=reference_transcript,
            )
        else:
            await self._clone_remote(
                synth_text, reference_audio_path, output_path,
                reference_transcript=reference_transcript,
            )

        clone_mode = "ultimate" if reference_transcript else "controllable"
        return {
            "clone_id": clone_id,
            "path": str(output_path),
            "reference_audio": reference_audio_path,
            "clone_mode": clone_mode,
            "characters": len(text),
            "sample_rate": settings.VOXCPM_SAMPLE_RATE,
            "model": settings.VOXCPM_MODEL,
            "provider": "voxcpm",
        }

    async def list_voices(self) -> list:
        voices = []
        for key, preset_key in VOICE_MAP.items():
            entry = {"id": key, "name": key.replace("_", " ").title(), "provider": "voxcpm"}
            if preset_key and preset_key in TENANT_VOICE_PRESETS:
                entry["description"] = TENANT_VOICE_PRESETS[preset_key].strip("()")
            voices.append(entry)

        for meta_file in self.voices_dir.glob("*.json"):
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

        return voices

    async def get_status(self) -> dict:
        status = {
            "engine": "VoxCPM2",
            "model": settings.VOXCPM_MODEL,
            "mode": self.mode,
            "sample_rate": settings.VOXCPM_SAMPLE_RATE,
            "audio_dir": str(self.audio_dir),
            "capabilities": [
                "text_to_speech",
                "voice_design",
                "controllable_cloning",
                "ultimate_cloning",
                "multilingual_30_languages",
                "48khz_studio_quality",
            ],
        }

        if self.mode == "remote":
            status["api_url"] = settings.VOXCPM_API_URL
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.get(f"{settings.VOXCPM_API_URL}/v1/models")
                    status["server_reachable"] = resp.status_code == 200
            except Exception:
                status["server_reachable"] = False
        else:
            status["gpu_loaded"] = _local_model is not None

        return status

    # ----- Local model methods -----

    async def _generate_local(self, text: str, output_path: Path):
        import asyncio
        import soundfile as sf
        model = _get_local_model()
        wav = await asyncio.to_thread(
            model.generate,
            text=text,
            cfg_value=2.0,
            inference_timesteps=10,
        )
        sf.write(str(output_path), wav, model.tts_model.sample_rate)

    async def _clone_local(
        self, text: str, ref_path: str, output_path: Path,
        reference_transcript: Optional[str] = None,
    ):
        import asyncio
        import soundfile as sf
        model = _get_local_model()
        kwargs = {"text": text, "reference_wav_path": ref_path}
        if reference_transcript:
            kwargs["prompt_wav_path"] = ref_path
            kwargs["prompt_text"] = reference_transcript
        wav = await asyncio.to_thread(model.generate, **kwargs)
        sf.write(str(output_path), wav, model.tts_model.sample_rate)

    # ----- Remote API methods -----

    async def _generate_remote(self, text: str, output_path: Path):
        api_url = settings.VOXCPM_API_URL.rstrip("/")
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{api_url}/v1/audio/speech",
                json={
                    "model": settings.VOXCPM_MODEL,
                    "input": text,
                    "voice": settings.VOXCPM_DEFAULT_VOICE,
                },
            )
            resp.raise_for_status()
            output_path.write_bytes(resp.content)

    async def _clone_remote(
        self, text: str, ref_path: str, output_path: Path,
        reference_transcript: Optional[str] = None,
    ):
        api_url = settings.VOXCPM_API_URL.rstrip("/")
        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(ref_path, "rb") as f:
                files = {"reference_audio": ("reference.wav", f, "audio/wav")}
                data = {
                    "model": settings.VOXCPM_MODEL,
                    "input": text,
                }
                if reference_transcript:
                    data["prompt_text"] = reference_transcript
                resp = await client.post(
                    f"{api_url}/v1/audio/speech",
                    data=data,
                    files=files,
                )
                resp.raise_for_status()
                output_path.write_bytes(resp.content)
