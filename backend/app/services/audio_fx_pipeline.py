"""
Audio Effects Pipeline — Powered by Spotify's Pedalboard.

Applies post-processing effects to raw audio from VoxCPM2 or any source.
Designed for the Empire Universe sonic identity system.

Preset chains tuned for each tenant:
  - Southern Lyfestyle: G-Funk radio (reverb + low-pass + compression)
  - Arcade: Big arena energy (pitch shift + delay + chorus)
  - Empire One: Corporate clarity (light compression + gain)
  - SLA113: Operator aesthetic (high-pass + metallic reverb)
"""

import uuid
import json
import logging
from pathlib import Path
from typing import Optional

import numpy as np
import soundfile as sf

from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

AUDIO_FX_DIR = Path(settings.VOXCPM_AUDIO_DIR) / "fx"
try:
    AUDIO_FX_DIR.mkdir(parents=True, exist_ok=True)
except OSError as e:
    logger.warning(f"Could not create directory {AUDIO_FX_DIR}: {e}")

EFFECT_PRESETS = {
    "southern_radio": {
        "name": "Southern G-Funk Radio",
        "description": "Lowrider radio drop: warm reverb, low-pass, heavy compression",
        "chain": [
            {"type": "lowpass", "cutoff_hz": 8000},
            {"type": "reverb", "room_size": 0.6, "damping": 0.7, "wet_level": 0.35},
            {"type": "compressor", "threshold_db": -20, "ratio": 4.0},
            {"type": "gain", "gain_db": 3.0},
        ],
    },
    "arcade_hype": {
        "name": "Arcade Hype Announcer",
        "description": "Big arena energy: slight pitch up, delay, chorus",
        "chain": [
            {"type": "pitch_shift", "semitones": 1.0},
            {"type": "delay", "delay_seconds": 0.12, "feedback": 0.25, "mix": 0.2},
            {"type": "chorus", "rate_hz": 1.5, "depth": 0.3, "mix": 0.25},
            {"type": "compressor", "threshold_db": -15, "ratio": 3.0},
            {"type": "gain", "gain_db": 4.0},
        ],
    },
    "empire_corporate": {
        "name": "Empire One Corporate",
        "description": "Clean, professional: light compression, subtle gain",
        "chain": [
            {"type": "highpass", "cutoff_hz": 80},
            {"type": "compressor", "threshold_db": -25, "ratio": 2.0},
            {"type": "gain", "gain_db": 2.0},
        ],
    },
    "sla113_operator": {
        "name": "SLA113 Operator",
        "description": "Command-line aesthetic: high-pass, metallic reverb",
        "chain": [
            {"type": "highpass", "cutoff_hz": 300},
            {"type": "reverb", "room_size": 0.3, "damping": 0.2, "wet_level": 0.4},
            {"type": "compressor", "threshold_db": -18, "ratio": 5.0},
        ],
    },
    "narrator_cinematic": {
        "name": "Cinematic Narrator",
        "description": "Rich depth: warm reverb, compression, bass boost",
        "chain": [
            {"type": "highpass", "cutoff_hz": 60},
            {"type": "reverb", "room_size": 0.5, "damping": 0.6, "wet_level": 0.2},
            {"type": "compressor", "threshold_db": -22, "ratio": 3.0},
            {"type": "gain", "gain_db": 2.5},
        ],
    },
    "robotic": {
        "name": "Robotic",
        "description": "Metallic synth feel: chorus, high-pass, reverb",
        "chain": [
            {"type": "highpass", "cutoff_hz": 500},
            {"type": "chorus", "rate_hz": 3.0, "depth": 0.5, "mix": 0.4},
            {"type": "reverb", "room_size": 0.2, "damping": 0.1, "wet_level": 0.5},
        ],
    },
    "echo_chamber": {
        "name": "Echo Chamber",
        "description": "Heavy delay and reverb for dramatic effect",
        "chain": [
            {"type": "delay", "delay_seconds": 0.3, "feedback": 0.5, "mix": 0.35},
            {"type": "reverb", "room_size": 0.8, "damping": 0.4, "wet_level": 0.5},
        ],
    },
    "deep_voice": {
        "name": "Deep Voice",
        "description": "Pitch down with compression for authority",
        "chain": [
            {"type": "pitch_shift", "semitones": -3.0},
            {"type": "compressor", "threshold_db": -20, "ratio": 4.0},
            {"type": "gain", "gain_db": 3.0},
        ],
    },
}


def _build_board(chain: list, sample_rate: int):
    """Build a pedalboard.Pedalboard from a chain spec."""
    from pedalboard import (
        Pedalboard, Reverb, Compressor, Gain,
        HighpassFilter, LowpassFilter, Chorus, Delay, PitchShift,
    )

    plugins = []
    for fx in chain:
        fx_type = fx["type"]
        if fx_type == "reverb":
            plugins.append(Reverb(
                room_size=fx.get("room_size", 0.5),
                damping=fx.get("damping", 0.5),
                wet_level=fx.get("wet_level", 0.3),
            ))
        elif fx_type == "compressor":
            plugins.append(Compressor(
                threshold_db=fx.get("threshold_db", -20),
                ratio=fx.get("ratio", 4.0),
            ))
        elif fx_type == "gain":
            plugins.append(Gain(gain_db=fx.get("gain_db", 0.0)))
        elif fx_type == "highpass":
            plugins.append(HighpassFilter(cutoff_frequency_hz=fx.get("cutoff_hz", 80)))
        elif fx_type == "lowpass":
            plugins.append(LowpassFilter(cutoff_frequency_hz=fx.get("cutoff_hz", 8000)))
        elif fx_type == "chorus":
            plugins.append(Chorus(
                rate_hz=fx.get("rate_hz", 1.0),
                depth=fx.get("depth", 0.25),
                mix=fx.get("mix", 0.25),
            ))
        elif fx_type == "delay":
            plugins.append(Delay(
                delay_seconds=fx.get("delay_seconds", 0.2),
                feedback=fx.get("feedback", 0.3),
                mix=fx.get("mix", 0.25),
            ))
        elif fx_type == "pitch_shift":
            plugins.append(PitchShift(semitones=fx.get("semitones", 0.0)))

    return Pedalboard(plugins)


class AudioFXPipeline:
    """Apply effect chains to audio files."""

    def apply_preset(self, input_path: str, preset_name: str) -> dict:
        """Apply a named preset to an audio file."""
        if preset_name not in EFFECT_PRESETS:
            raise ValueError(f"Unknown preset: {preset_name}. Available: {list(EFFECT_PRESETS.keys())}")

        preset = EFFECT_PRESETS[preset_name]
        return self.apply_chain(input_path, preset["chain"], preset_name=preset_name)

    def apply_chain(
        self,
        input_path: str,
        chain: list,
        preset_name: Optional[str] = None,
    ) -> dict:
        """Apply a custom effect chain to an audio file."""
        audio, sample_rate = sf.read(input_path)

        if audio.ndim == 1:
            audio = audio[np.newaxis, :]
        else:
            audio = audio.T

        audio = audio.astype(np.float32)
        board = _build_board(chain, sample_rate)
        processed = board(audio, sample_rate)

        fx_id = str(uuid.uuid4())
        suffix = f"_{preset_name}" if preset_name else ""
        output_path = AUDIO_FX_DIR / f"{fx_id}{suffix}.wav"
        output_audio = processed.T if processed.ndim > 1 else processed.squeeze()
        sf.write(str(output_path), output_audio, sample_rate)

        return {
            "fx_id": fx_id,
            "input_path": input_path,
            "output_path": str(output_path),
            "preset": preset_name,
            "chain": chain,
            "sample_rate": sample_rate,
        }

    def list_presets(self) -> dict:
        return {
            name: {
                "name": p["name"],
                "description": p["description"],
                "effects_count": len(p["chain"]),
            }
            for name, p in EFFECT_PRESETS.items()
        }
