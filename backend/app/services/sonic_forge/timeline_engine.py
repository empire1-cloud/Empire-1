"""
Timeline Engine — Blueprint → exact section sequence with bar/time positions.

Every downstream engine (lyrics, drums, vocals, fx, export) syncs to this
timeline. No audio generated — just temporal geometry.
"""

from __future__ import annotations

import logging

from .context import EngineContext, Timeline, TimelineEntry
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)


def bars_to_seconds(bpm: int, bars: int) -> float:
    """Convert bars to seconds at given BPM (assuming 4/4)."""
    beats = bars * 4
    return (beats / bpm) * 60


@register_engine
class TimelineEngine(BaseEngine):
    """Blueprint structure → Timeline with bar ranges and timestamps."""

    name = "timeline"

    async def process(self, ctx: EngineContext) -> EngineContext:
        bp = ctx.blueprint
        bpm = bp.targets["bpm"]
        entries: list[TimelineEntry] = []
        bar_cursor = 0
        time_cursor = 0.0

        for section_def in bp.structure:
            section = section_def["section"]
            bars = section_def["bars"]
            bar_start = bar_cursor + 1
            bar_end = bar_cursor + bars
            duration = bars_to_seconds(bpm, bars)
            time_start = time_cursor
            time_end = time_cursor + duration

            entry = TimelineEntry(
                section=section,
                bar_start=bar_start,
                bar_end=bar_end,
                time_start_sec=round(time_start, 3),
                time_end_sec=round(time_end, 3),
                duration_sec=round(duration, 3),
                transitions=_guess_transitions(section, entries),
            )
            entries.append(entry)

            bar_cursor += bars
            time_cursor += duration

        ctx.timeline = Timeline(
            entries=entries,
            total_bars=bar_cursor,
            total_duration_sec=round(time_cursor, 3),
        )

        logger.info(
            "[Timeline] %d sections | %d total bars | %.1fs total | %d BPM",
            len(entries),
            ctx.timeline.total_bars,
            ctx.timeline.total_duration_sec,
            bpm,
        )

        return ctx


def _guess_transitions(section: str, existing: list[TimelineEntry]) -> dict:
    """Heuristic transition tags based on section type."""
    if not existing:
        return {"fade_in": True, "type": "fade", "duration_beats": 1}

    prev = existing[-1].section
    transitions: dict = {"type": "cut", "duration_beats": 0}

    if section.startswith("chorus") and prev.startswith("verse"):
        transitions = {"type": "rise", "duration_beats": 1}
    elif section.startswith("bridge"):
        transitions = {"type": "break", "duration_beats": 2}
    elif section == "outro":
        transitions = {"type": "fade_out", "duration_beats": 2}
    elif section.startswith("verse") and prev.startswith("chorus"):
        transitions = {"type": "drop", "duration_beats": 1}

    return transitions
