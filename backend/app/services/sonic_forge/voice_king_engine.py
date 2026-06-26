"""
Voice King — real TTS vocal rendering.

Calls OpenAI TTS API to produce actual .mp3 files per vocal segment.
Falls back to silence placeholder if API key is missing or call fails.
"""

from __future__ import annotations

import logging
import os
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .persona_registry import get_persona

logger = logging.getLogger(__name__)

AUDIO_ROOT = Path(os.getenv("SONIC_FORGE_OUTPUT", "/tmp/sonic_forge_output"))


@dataclass
class VocalRenderSegment:
    phrase_index: int = 0
    text: str = ""
    voice_profile: str = "alloy"
    pitch_bend: list[tuple[float, float]] = field(default_factory=list)
    dynamics: list[tuple[float, float]] = field(default_factory=list)
    formant_curve: list[tuple[float, float]] = field(default_factory=list)
    tempo_multiplier: float = 1.0
    emotion_intensity: float = 0.5
    start_sec: float = 0.0
    duration_sec: float = 0.0
    output_path: str = ""


@dataclass
class VocalRenderPlan:
    segments: list[VocalRenderSegment] = field(default_factory=list)
    voice_profile: str = "alloy"
    total_duration_sec: float = 0.0
    sample_rate: int = 48000
    bit_depth: int = 24
    speaker: str = ""


VOICE_MAP: dict[str, str] = {
    "SANCHA_V1":    "nova",
    "TOXICO_PRIME": "onyx",
    "LYRICA_BASE":  "alloy",
    "ECHO_COLD":    "shimmer",
}


def _ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


@register_engine
class VoiceKingEngine(BaseEngine):
    """VocalPerformance → real .mp3 files via OpenAI TTS."""

    name = "voice_king"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        vp = ctx.vocal_performance
        if not vp or not vp.phrases:
            logger.warning("[VoiceKing] No vocal performance — skipping")
            ctx.vocal_render_plan = VocalRenderPlan()
            return ctx

        output_dir = _ensure_dir(AUDIO_ROOT / (ctx.job_id or uuid.uuid4().hex[:8]) / "vocals")
        api_key = os.getenv("OPENAI_API_KEY")
        segments: list[VocalRenderSegment] = []
        total_dur = 0.0
        primary_speaker = vp.phrases[0].speaker if vp.phrases else ""

        for i, phrase in enumerate(vp.phrases):
            voice_profile = VOICE_MAP.get(phrase.speaker, "alloy")

            pitch_bend = [(n.start_sec - phrase.start_sec, n.pitch_midi - 60)
                          for n in phrase.notes if n.pitch_midi != 60]
            dynamics = [(n.start_sec - phrase.start_sec, n.velocity / 127.0)
                        for n in phrase.notes]
            formant_curve = [(n.start_sec - phrase.start_sec, n.formant_shift)
                             for n in phrase.notes if abs(n.formant_shift) > 0.01]

            out_path = output_dir / f"phrase_{i:03d}.mp3"

            if api_key and phrase.text.strip():
                try:
                    await _call_openai_tts(phrase.text, voice_profile, api_key, out_path)
                    logger.debug("[VoiceKing] TTS → %s", out_path.name)
                except Exception as e:
                    logger.warning("[VoiceKing] TTS failed for phrase %d: %s — writing silence", i, e)
                    _write_silence_mp3(out_path)
            else:
                _write_silence_mp3(out_path)

            segments.append(VocalRenderSegment(
                phrase_index=i,
                text=phrase.text,
                voice_profile=voice_profile,
                pitch_bend=pitch_bend,
                dynamics=dynamics,
                formant_curve=formant_curve,
                tempo_multiplier=1.0,
                emotion_intensity=phrase.emotion,
                start_sec=round(phrase.start_sec, 3),
                duration_sec=round(phrase.duration_sec, 3),
                output_path=str(out_path),
            ))
            total_dur = max(total_dur, phrase.start_sec + phrase.duration_sec)

        ctx.vocal_render_plan = VocalRenderPlan(
            segments=segments,
            voice_profile=VOICE_MAP.get(primary_speaker, "alloy"),
            total_duration_sec=round(total_dur, 3),
            speaker=primary_speaker,
        )

        logger.info("[VoiceKing] %d .mp3 files rendered", len(segments))
        return ctx


async def _call_openai_tts(text: str, voice: str, api_key: str, out_path: Path) -> None:
    import httpx
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/audio/speech",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "tts-1",
                "input": text,
                "voice": voice,
                "response_format": "mp3",
            },
        )
        resp.raise_for_status()
        out_path.write_bytes(resp.content)


def _write_silence_mp3(path: Path) -> None:
    """Write a minimal valid MP3 frame as silence placeholder."""
    # MP3 silence frame (1152 samples, 128kbps, 44100Hz)
    frame = bytes([
        0xFF, 0xFB, 0x90, 0x00,  # sync + header
    ] + [0x00] * 413)  # zeroed frame data
    path.write_bytes(frame * 10)
