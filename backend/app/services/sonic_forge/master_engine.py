"""
Master Engine — final bus processing plan.

Consumes MixPlan + Preset → MasterPlan. No audio processed.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)


@dataclass
class MasterPlan:
    lufs_target: float = -14.0
    true_peak_db: float = -1.0
    limiter_type: str = "standard"
    comp_ratio: float = 2.5
    eq_curve: dict[str, float] = field(default_factory=lambda: {
        "sub": 0.0, "low": 0.0, "low_mid": 0.0,
        "high_mid": 0.0, "high": 0.0, "air": 0.0,
    })
    stereo_width: float = 1.0


@register_engine
class MasterEngine(BaseEngine):
    """MixPlan + Preset → MasterPlan."""

    name = "master"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        master_cfg = ctx.preset.master if ctx.preset else {}

        ctx.master_plan = MasterPlan(
            lufs_target=float(master_cfg.get("lufs_target", -14.0)),
            true_peak_db=float(master_cfg.get("true_peak", -1.0)),
            limiter_type=str(master_cfg.get("limiter", "standard")),
            comp_ratio=float(ctx.preset.mix.get("comp_ratio", 2.5) if ctx.preset else 2.5),
            eq_curve={
                "sub": 1.0, "low": 0.0, "low_mid": -0.5,
                "high_mid": 0.5, "high": 1.0, "air": 1.5,
            },
        )

        logger.info(
            "[Master] LUFS=%s | true_peak=%s | limiter=%s",
            ctx.master_plan.lufs_target, ctx.master_plan.true_peak_db,
            ctx.master_plan.limiter_type,
        )

        return ctx
