"""
Instrument Engine — orchestrates builders around the shared Musical Graph.

Each builder (bass, drums, pads, keys, lead, strings, fx, automation)
reads the same context and produces an InstrumentTrack. No audio.
"""

from __future__ import annotations

import logging
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .instrument_graph import InstrumentGraph, InstrumentBuilder, INSTRUMENT_BUILDERS

logger = logging.getLogger(__name__)

ROLE_ORDER: list[str] = [
    "drums", "bass", "pads", "keys", "lead", "strings", "fx", "automation",
]


@register_engine
class InstrumentEngine(BaseEngine):
    """Runs all registered instrument builders. Outputs InstrumentGraph."""

    name = "instrument"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        tracks: dict[str, InstrumentTrack] = {}

        for role in ROLE_ORDER:
            builder_cls = INSTRUMENT_BUILDERS.get(role)
            if builder_cls is None:
                logger.debug("[Instrument] No builder for role=%s, skipping", role)
                continue

            try:
                builder: InstrumentBuilder = builder_cls()
                track = await builder.build(ctx)
                tracks[role] = track
                logger.info(
                    "[Instrument] %s → %s | %d MIDI events | %d automation points",
                    role, builder.name, len(track.midi_events), len(track.automation),
                )
            except Exception as e:
                logger.warning("[Instrument] %s builder failed: %s", role, e)
                continue

        ctx.instrument_graph = InstrumentGraph(tracks=tracks)

        logger.info(
            "[Instrument] %d tracks | %d total MIDI events",
            ctx.instrument_graph.total_tracks,
            ctx.instrument_graph.total_midi_events,
        )

        return ctx
