"""
Blueprint Engine — prompt → structured production plan.

No audio. Just intent, structure, targets, and required engines.
Downstream engines use this blueprint to generate actual audio.
"""

from __future__ import annotations

import uuid
import logging
from typing import Any

from .context import Blueprint, EngineContext
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)

STYLE_PROFILES: dict[str, dict[str, Any]] = {
    "g_funk": {
        "genre": "West Coast G-Funk",
        "mood": "Laid-back smooth",
        "structure": [
            {"section": "intro", "bars": 8},
            {"section": "verse_1", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "bridge", "bars": 8},
            {"section": "chorus", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 100, "key": "Ebm", "time_signature": "4/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
    "trap": {
        "genre": "Modern Trap",
        "mood": "Aggressive hype",
        "structure": [
            {"section": "intro", "bars": 4},
            {"section": "hook", "bars": 8},
            {"section": "verse_1", "bars": 16},
            {"section": "hook", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "bridge", "bars": 8},
            {"section": "hook", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 140, "key": "Cmin", "time_signature": "4/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
    "boom_bap": {
        "genre": "Classic Boom Bap",
        "mood": "Raw storytelling",
        "structure": [
            {"section": "intro", "bars": 8},
            {"section": "verse_1", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "bridge", "bars": 8},
            {"section": "chorus", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 90, "key": "Dmin", "time_signature": "4/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
    "corrido": {
        "genre": "Corrido Tumbado",
        "mood": "Narrative storytelling",
        "structure": [
            {"section": "intro", "bars": 4},
            {"section": "verse_1", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "bridge", "bars": 8},
            {"section": "chorus", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 120, "key": "G", "time_signature": "3/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
    "melodic": {
        "genre": "Melodic Rap/R&B",
        "mood": "Emotional vulnerable",
        "structure": [
            {"section": "intro", "bars": 4},
            {"section": "verse_1", "bars": 16},
            {"section": "pre_chorus", "bars": 4},
            {"section": "chorus", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "bridge", "bars": 8},
            {"section": "chorus", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 75, "key": "Ab", "time_signature": "4/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
    "west_coast": {
        "genre": "West Coast Soul",
        "mood": "Reflective late-night",
        "structure": [
            {"section": "intro", "bars": 8},
            {"section": "verse_1", "bars": 16},
            {"section": "chorus", "bars": 8},
            {"section": "verse_2", "bars": 16},
            {"section": "bridge", "bars": 8},
            {"section": "chorus", "bars": 8},
            {"section": "outro", "bars": 4},
        ],
        "targets": {"duration_seconds": 180, "bpm": 90, "key": "Fmin", "time_signature": "4/4"},
        "required_engines": ["mma", "pfa", "pda", "voice_king", "mix", "master", "dna", "ledger", "export"],
    },
}


@register_engine
class BlueprintEngine(BaseEngine):
    """Prompt → structured Blueprint. No audio generated."""

    name = "blueprint"

    async def process(self, ctx: EngineContext) -> EngineContext:
        profile = STYLE_PROFILES.get(ctx.style, STYLE_PROFILES["g_funk"])

        ctx.blueprint = Blueprint(
            track_id=str(uuid.uuid4()),
            creator_id=ctx.creator_id,
            intent={
                "genre": profile["genre"],
                "mood": profile["mood"],
                "theme": ctx.prompt,
                "language": "English",
            },
            structure=profile["structure"],
            targets=profile["targets"],
            required_engines=profile["required_engines"],
        )

        logger.info(
            "[Blueprint] %s — %s | %s %s | %d bars across %d sections",
            ctx.blueprint.track_id,
            ctx.blueprint.intent["genre"],
            ctx.blueprint.targets["key"],
            ctx.blueprint.targets["bpm"],
            sum(s["bars"] for s in ctx.blueprint.structure),
            len(ctx.blueprint.structure),
        )

        return ctx
