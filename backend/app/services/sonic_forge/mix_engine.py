"""
Mix Engine — blend plan for all tracks into a stereo mix bus.

Consumes DSPGraph + Preset → MixPlan. No audio processed.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)


@dataclass
class MixBus:
    role: str = ""
    gain_db: float = 0.0
    pan: float = 0.0
    mute: bool = False
    solo: bool = False
    send_reverb: float = 0.0
    send_delay: float = 0.0


@dataclass
class MixPlan:
    buses: dict[str, MixBus] = field(default_factory=dict)
    master_gain_db: float = -1.0


@register_engine
class MixEngine(BaseEngine):
    """DSPGraph + Preset → MixPlan."""

    name = "mix"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        mix_from_preset = ctx.preset.mix if ctx.preset else {}

        buses: dict[str, MixBus] = {}
        roles = ["drums", "bass", "pads", "keys", "lead", "strings", "fx"]

        for role in roles:
            gain_key = f"{role}_db"
            gain = float(mix_from_preset.get(gain_key, -6))
            buses[role] = MixBus(
                role=role,
                gain_db=gain,
                pan=_default_pan(role),
                send_reverb=0.2 if role in ("lead", "strings", "pads") else 0.05,
                send_delay=0.15 if role == "lead" else 0.0,
            )

        ctx.mix_plan = MixPlan(
            buses=buses,
            master_gain_db=float(mix_from_preset.get("master_gain_db", -1.0)),
        )

        logger.info("[Mix] %d buses | master=%.1fdB", len(buses), ctx.mix_plan.master_gain_db)
        return ctx


def _default_pan(role: str) -> float:
    mapping = {
        "kick": 0.0, "snare": 0.0, "hihat": 0.2,
        "drums": 0.0, "bass": 0.0, "pads": -0.1,
        "keys": 0.15, "lead": 0.0, "strings": -0.2,
        "fx": 0.3,
    }
    return mapping.get(role, 0.0)
