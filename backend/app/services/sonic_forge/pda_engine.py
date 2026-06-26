"""
PDA Engine — DSP effects planner.

Consumes InstrumentGraph + EmotionBus + Preset → DSPGraph.
Each track gets an FX chain with per-section parameter automation.
"""

from __future__ import annotations

import uuid
import logging
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)


@dataclass
class DSPParameter:
    time_sec: float = 0.0
    value: float = 0.0


@dataclass
class DSPUnit:
    type: str = ""           # comp, eq, reverb, delay, saturator, limiter
    enabled: bool = True
    params: dict[str, list[DSPParameter]] = field(default_factory=dict)


@dataclass
class DSPTrack:
    role: str = ""
    units: list[DSPUnit] = field(default_factory=list)
    dry_wet: float = 1.0
    gain_db: float = 0.0


@dataclass
class DSPGraph:
    tracks: dict[str, DSPTrack] = field(default_factory=dict)


ROLE_FX_DEFAULTS: dict[str, list[dict[str, Any]]] = {
    "drums": [
        {"type": "comp", "params": {"threshold": -12, "ratio": 4.0}},
        {"type": "eq",   "params": {"low": -2, "high": 3}},
        {"type": "reverb", "params": {"room": 0.15, "decay": 1.2}},
    ],
    "bass": [
        {"type": "eq",       "params": {"sub": 3, "low_mid": -2}},
        {"type": "saturator","params": {"drive": 2.0, "mix": 0.3}},
    ],
    "pads": [
        {"type": "reverb",   "params": {"room": 0.7, "decay": 3.0}},
        {"type": "eq",       "params": {"high": -3, "low": -4}},
        {"type": "chorus",   "params": {"rate": 0.5, "depth": 0.4}},
    ],
    "keys": [
        {"type": "comp",     "params": {"threshold": -16, "ratio": 3.0}},
        {"type": "reverb",   "params": {"room": 0.3, "decay": 1.5}},
    ],
    "lead": [
        {"type": "comp",     "params": {"threshold": -14, "ratio": 3.5}},
        {"type": "delay",    "params": {"time": 120, "feedback": 0.25}},
        {"type": "reverb",   "params": {"room": 0.4, "decay": 2.0}},
    ],
    "strings": [
        {"type": "reverb",   "params": {"room": 0.8, "decay": 4.0}},
        {"type": "chorus",   "params": {"rate": 0.3, "depth": 0.6}},
    ],
    "fx": [
        {"type": "reverb",   "params": {"room": 0.9, "decay": 5.0}},
        {"type": "delay",    "params": {"time": 240, "feedback": 0.4}},
    ],
}


@register_engine
class PDAEngine(BaseEngine):
    """InstrumentGraph + EmotionBus → DSPGraph. No audio processed."""

    name = "pda"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        ig = ctx.instrument_graph
        if not ig or not ig.tracks:
            logger.warning("[PDA] No instrument graph — skipping")
            ctx.dsp_graph = DSPGraph()
            return ctx

        tracks: dict[str, DSPTrack] = {}

        for role, track in ig.tracks.items():
            fx_list = ROLE_FX_DEFAULTS.get(role, [])
            units: list[DSPUnit] = []

            for fx_def in fx_list:
                params: dict[str, list[DSPParameter]] = {}
                for param_name, base_val in fx_def.get("params", {}).items():
                    params[param_name] = [
                        DSPParameter(time_sec=0.0, value=float(base_val))
                    ]
                units.append(DSPUnit(
                    type=fx_def["type"],
                    params=params,
                ))

            emotion_bus = ctx.emotion_bus
            if emotion_bus and role in ("lead", "fx", "pads"):
                for u in units:
                    if u.type == "reverb":
                        for sec in emotion_bus.sections:
                            mid_bar = (sec.bar_start + sec.bar_end) / 2
                            time = mid_bar * (60 / ctx.musical_graph.bpm) * 4
                            decay = DSPParameter(time_sec=time, value=1.0 + sec.emotion * 3.0)
                            u.params.setdefault("decay", []).append(decay)
                            room = DSPParameter(time_sec=time, value=0.3 + sec.energy * 0.5)
                            u.params.setdefault("room", []).append(room)

            tracks[role] = DSPTrack(
                role=role,
                units=units,
                gain_db=0.0,
            )

        ctx.dsp_graph = DSPGraph(tracks=tracks)

        logger.info(
            "[PDA] %d tracks with DSP chains", len(tracks),
        )

        return ctx
