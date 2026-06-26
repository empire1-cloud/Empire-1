"""
MMA Engine — the motion engine.

Consumes Timeline + TrackGraph + MusicalGraph + EmotionBus + Preset.
Outputs PerformanceGraph — the rhythmic blueprint for every downstream engine.
"""

from __future__ import annotations

import logging
from random import random, uniform, randint
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .performance_graph import PerformanceGraph, RhythmSection, PerformanceEvent

logger = logging.getLogger(__name__)

# ── Groove profiles ─────────────────────────────────────────────────────────

GROOVE_MAP: dict[str, dict[str, Any]] = {
    "straight":   {"swing": 0.03, "humanization": 4,  "offset_pct": 0.0},
    "laid_back":  {"swing": 0.12, "humanization": 12, "offset_pct": 0.04},
    "pushed":     {"swing": 0.05, "humanization": 6,  "offset_pct": -0.03},
    "shuffle":    {"swing": 0.20, "humanization": 8,  "offset_pct": 0.0},
    "swing":      {"swing": 0.15, "humanization": 10, "offset_pct": 0.02},
}

PATTERN_TO_GROOVE: dict[str, str] = {
    "classic": "laid_back",
    "backbeat": "straight",
    "16th_swing": "shuffle",
    "8th_swing": "swing",
    "triplet_16th": "shuffle",
    "hard_boom": "pushed",
    "crack_bap": "pushed",
    "trap_clap": "straight",
    "808_roll": "straight",
    "trap_lite": "laid_back",
    "soft_clap": "straight",
    "banda": "straight",
    "tarola": "straight",
    "16th_shuffle": "shuffle",
    "ghost": "laid_back",
    "sparse": "straight",
    "section_starts": "straight",
    "section_ends": "straight",
    "accent": "pushed",
}

SECTION_GROOVE_OVERRIDE: dict[str, str] = {
    "intro": "laid_back",
    "verse_1": "laid_back",
    "verse_2": "swing",
    "verse_3": "pushed",
    "chorus": "straight",
    "bridge": "laid_back",
    "pre_chorus": "pushed",
    "hook": "straight",
    "outro": "laid_back",
}


def _beat_sec(bpm: int) -> float:
    return 60.0 / bpm


def _sixteenth_sec(bpm: int) -> float:
    return _beat_sec(bpm) / 4.0


@register_engine
class MMAEngine(BaseEngine):
    """Timeline + Harmony → PerformanceGraph. No audio generated."""

    name = "mma"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        bpm = ctx.musical_graph.bpm if ctx.musical_graph else ctx.blueprint.targets["bpm"]
        beat_dur = _beat_sec(bpm)

        emotion_bus = ctx.emotion_bus
        if emotion_bus is None:
            raise RuntimeError("MMA requires EmotionBus — run NarrativeEngine first")

        mg = ctx.musical_graph
        if mg is None:
            raise RuntimeError("MMA requires MusicalGraph — run HarmonyEngine first")

        rhythm_sections: list[RhythmSection] = []
        events: list[PerformanceEvent] = []

        for i, t_entry in enumerate(ctx.timeline.entries):
            sec_name = t_entry.section
            sec_emotion = emotion_bus.get_section(sec_name)
            emotion = sec_emotion.emotion if sec_emotion else 0.5
            energy = sec_emotion.energy if sec_emotion else 0.5

            # Groove from section type or preset
            groove_name = SECTION_GROOVE_OVERRIDE.get(sec_name) or \
                          _preset_groove(ctx) or "straight"
            groove = GROOVE_MAP.get(groove_name, GROOVE_MAP["straight"])
            swing = groove["swing"] + (emotion * 0.05 - 0.025)  # emotion nudges swing
            humanization = groove["humanization"] + (energy * 6 - 3)

            # Fill probability from tension
            avg_tension = _section_avg_tension(mg, sec_name)
            fill_prob = min(0.45, 0.08 + avg_tension * 0.35)

            # Velocity curve from energy
            base_vel = int(70 + energy * 40)
            vel_curve = [
                min(127, base_vel + int(energy * 20)),
                min(127, base_vel - int((1 - energy) * 10)),
                min(127, base_vel + int(energy * 15)),
                min(127, base_vel - 5),
            ]

            density = max(0.3, min(1.0, energy * 0.6 + 0.4))

            rs = RhythmSection(
                section=sec_name,
                groove=groove_name,
                swing=round(swing, 3),
                velocity_curve=vel_curve,
                ghost_notes=energy > 0.35,
                fill_probability=round(fill_prob, 3),
                transition_fill=True,
                humanization_ms=round(humanization, 1),
                density=round(density, 3),
                accent_spread=round(0.2 + energy * 0.3, 3),
            )
            rhythm_sections.append(rs)

            # Generate events
            bar_events = _generate_section_events(
                t_entry, rs, bpm, beat_dur, mg, ctx,
            )
            events.extend(bar_events)

        ctx.performance = PerformanceGraph(
            sections=rhythm_sections,
            events=events,
            bpm=bpm,
            total_bars=ctx.timeline.total_bars,
            total_duration_sec=ctx.timeline.total_duration_sec,
        )

        logger.info(
            "[MMA] %d sections | %d events | %d BPM | groove=%s",
            len(rhythm_sections), len(events), bpm,
            rhythm_sections[0].groove if rhythm_sections else "none",
        )

        return ctx


def _preset_groove(ctx: EngineContext) -> str | None:
    """Derive groove from the preset's primary drum pattern."""
    if not ctx.preset:
        return None
    kit = ctx.preset.drum_kit
    kick_pat = kit.get("kick", {}).get("pattern", "classic")
    return PATTERN_TO_GROOVE.get(kick_pat)


def _section_avg_tension(mg, section: str) -> float:
    """Average harmonic tension across a section."""
    values = [tp.value for tp in mg.tension_curve
              if _bar_to_section(tp.bar, mg) == section]
    if not values:
        return 0.5
    return sum(values) / len(values)


def _bar_to_section(bar: int, mg) -> str:
    for sc in mg.section_chords:
        if sc.bar_start <= bar <= sc.bar_end:
            return sc.section
    return ""


def _generate_section_events(
    t_entry, rs: RhythmSection, bpm: int, beat_dur: float,
    mg, ctx,
) -> list[PerformanceEvent]:
    events: list[PerformanceEvent] = []
    bar_start = t_entry.bar_start
    bar_end = t_entry.bar_end
    time_start = t_entry.time_start_sec
    duration = t_entry.duration_sec
    is_last_section = t_entry.section.endswith("outro")

    for bar in range(bar_start, bar_end + 1):
        bar_frac = (bar - bar_start) / max(1, (bar_end - bar_start))
        bar_time = time_start + bar_frac * duration

        for beat in range(1, 5):
            downbeat = beat == 1
            backbeat = beat == 3
            beat_frac = (beat - 1) / 4
            beat_time = bar_time + beat_frac * _beat_sec(bpm) * 4

            # Transition events at section boundaries
            is_transition = False
            if bar == bar_end and not is_last_section:
                if random() < rs.fill_probability:
                    is_transition = True

            # 16th note grid (1, 2, 3, 4 within each beat)
            for sixteenth in range(1, 5):
                is_on_beat = sixteenth == 1
                is_off_beat = sixteenth == 3  # the "and" of each beat

                # Base velocity from curve, modulated by beat position
                beat_idx = beat - 1
                vel = rs.velocity_curve[beat_idx % len(rs.velocity_curve)]
                if downbeat and is_on_beat:
                    vel = min(127, int(vel * 1.15))
                if backbeat and is_on_beat:
                    vel = min(127, int(vel * 1.10))
                if not is_on_beat:
                    vel = max(20, int(vel * 0.5))
                if not is_on_beat and not is_off_beat:
                    vel = max(10, int(vel * 0.25))

                # Ghost notes (very quiet, on off-beats only)
                if rs.ghost_notes and not is_on_beat and random() < 0.15:
                    vel = max(5, int(vel * 0.15))

                # Swing offset: off-beat 16ths get delayed
                timing_offset = 0.0
                if sixteenth == 3 and rs.swing > 0.03:
                    timing_offset = rs.swing * _sixteenth_sec(bpm) * 1000

                # Humanization jitter
                human_jitter = uniform(-1, 1) * rs.humanization_ms * 0.2

                # Accent
                accent = round(min(1.0, vel / 110), 3)

                # Density filtering — skip some off-beats when density is low
                if not is_on_beat and random() > rs.density:
                    continue

                event = PerformanceEvent(
                    bar=bar,
                    beat=beat,
                    sixteenth=sixteenth,
                    time_sec=round(beat_time + timing_offset / 1000, 4),
                    velocity=min(127, max(1, int(vel))),
                    accent=accent,
                    timing_offset_ms=round(timing_offset + human_jitter, 2),
                    groove_amount=rs.swing,
                    density=rs.density,
                    humanization_ms=round(rs.humanization_ms + abs(human_jitter), 2),
                    is_transition=is_transition,
                    section=t_entry.section,
                )
                events.append(event)

    return events
