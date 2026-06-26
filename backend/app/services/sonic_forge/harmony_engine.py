"""
Harmony Engine — Arrangement + Emotion Bus + Preset → Musical Graph.

The Musical Graph is the shared harmonic source of truth. MMA consumes it
for drum fills and ghost notes. Instrument Engine consumes it for bass,
pads, keys, strings, and leads. Neither invents its own harmony.
"""

from __future__ import annotations

import uuid
import logging
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .preset_manager import load_preset

logger = logging.getLogger(__name__)


# ── Musical Graph Data Model ────────────────────────────────────────────────

@dataclass
class SectionChord:
    section: str
    chords: list[str]
    bar_start: int
    bar_end: int
    progression_type: str = "diatonic"


@dataclass
class CadencePoint:
    bar: int
    chord: str
    type: str = "perfect"  # perfect, plagal, deceptive, half


@dataclass
class BasslineTarget:
    bar: int
    note: str
    octave: int
    duration: str = "whole"  # whole, half, quarter, eighth
    articulation: str = "legato"


@dataclass
class TensionPoint:
    bar: int
    value: float = 0.0
    type: str = "harmonic"  # harmonic, rhythmic, melodic


@dataclass
class Motif:
    id: str = ""
    name: str = ""
    notes: list[str] = field(default_factory=list)
    rhythm: list[float] = field(default_factory=list)
    sections: list[str] = field(default_factory=list)


@dataclass
class CountermelodyRegion:
    section: str
    bar_start: int
    bar_end: int
    density: float = 0.5  # 0-1 how active
    octave_offset: int = 1


@dataclass
class MusicalGraph:
    key: str = ""
    mode: str = ""
    scale: list[str] = field(default_factory=list)
    bpm: int = 90
    time_signature: str = "4/4"
    section_chords: list[SectionChord] = field(default_factory=list)
    cadence_points: list[CadencePoint] = field(default_factory=list)
    bassline_targets: list[BasslineTarget] = field(default_factory=list)
    tension_curve: list[TensionPoint] = field(default_factory=list)
    motifs: list[Motif] = field(default_factory=list)
    voicing_rules: dict = field(default_factory=dict)
    pad_density: float = 0.5
    countermelody_regions: list[CountermelodyRegion] = field(default_factory=list)


PROGRESSION_TYPES: dict[str, str] = {
    "default": "diatonic",
    "verse": "diatonic",
    "chorus": "elevated",
    "bridge": "borrowed",
    "intro": "pedal",
    "outro": "pedal",
    "pre_chorus": "sequential",
    "hook": "elevated",
}

TENSION_CHORDS: dict[str, list[str]] = {
    "Ebm": ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db"],
    "Cmin": ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
    "Dmin": ["D", "E", "F", "G", "A", "Bb", "C"],
    "G":    ["G", "A", "B", "C", "D", "E", "F#"],
    "Ab":   ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    "Fmin": ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
}


def _resolve_chord_for_tension(base_chord: str, tension: float) -> str:
    """Add tension extensions based on emotion value."""
    root = base_chord.rstrip("mM")
    quality = "m" if base_chord.endswith("m") and not base_chord.endswith("maj") else ""
    if tension > 0.8:
        return f"{root}{quality}7sus4"
    elif tension > 0.6:
        return f"{root}{quality}7"
    elif tension > 0.4:
        return f"{root}{quality}9" if random() > 0.5 else base_chord
    return base_chord


from random import random


@register_engine
class HarmonyEngine(BaseEngine):
    """Emotion Bus + Preset → Musical Graph. No audio generated."""

    name = "harmony"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        preset = load_preset(ctx.style)
        ctx.preset = preset

        scale = preset.scale
        bpm = ctx.blueprint.targets["bpm"]
        key = ctx.blueprint.targets["key"]
        time_sig = ctx.blueprint.targets.get("time_signature", "4/4")

        emotion_bus = ctx.emotion_bus
        if emotion_bus is None:
            raise RuntimeError("HarmonyEngine requires EmotionBus — run NarrativeEngine first")

        section_chords: list[SectionChord] = []
        cadence_points: list[CadencePoint] = []
        bassline_targets: list[BasslineTarget] = []
        tension_curve: list[TensionPoint] = []
        countermelody_regions: list[CountermelodyRegion] = []

        for entry in ctx.timeline.entries:
            sec_name = entry.section
            prog_type = PROGRESSION_TYPES.get(sec_name, "diatonic")
            chords = list(preset.chords.get(sec_name, preset.chords["default"]))

            sec_emotion = emotion_bus.get_section(sec_name)
            emotion = sec_emotion.emotion if sec_emotion else 0.5

            # Extend chords with tension based on emotion
            extended = [_resolve_chord_for_tension(c, emotion) for c in chords]

            section_chords.append(SectionChord(
                section=sec_name,
                chords=extended,
                bar_start=entry.bar_start,
                bar_end=entry.bar_end,
                progression_type=prog_type,
            ))

            # Tension points per bar within section
            for bar in range(entry.bar_start, entry.bar_end + 1):
                bar_emotion = emotion_bus.get_emotion_at_bar(bar)
                tension_curve.append(TensionPoint(
                    bar=bar,
                    value=round(bar_emotion, 3),
                    type="harmonic",
                ))

            # Cadence at the end of each section
            if entry.bar_end > entry.bar_start:
                last_chord = extended[-1] if extended else chords[-1]
                cadence_type = "perfect" if sec_name.startswith("chorus") else \
                               "half" if sec_name.startswith("verse") else \
                               "deceptive" if sec_name == "bridge" else \
                               "plagal"
                cadence_points.append(CadencePoint(
                    bar=entry.bar_end,
                    chord=last_chord,
                    type=cadence_type,
                ))

            # Bassline from chord roots
            root_note = chords[0].rstrip("mM789")
            bass_root = root_note
            bass_octave = 2 if preset.bass_profile.get("octave", 2) == 2 else 1
            bassline_targets.append(BasslineTarget(
                bar=entry.bar_start,
                note=bass_root,
                octave=bass_octave,
                duration=preset.bass_profile.get("rhythm", "whole"),
                articulation=preset.bass_profile.get("articulation", "legato"),
            ))

            # Countermelody regions
            if sec_name.startswith("chorus") or sec_name == "bridge":
                countermelody_regions.append(CountermelodyRegion(
                    section=sec_name,
                    bar_start=entry.bar_start,
                    bar_end=entry.bar_end,
                    density=0.7 if sec_name.startswith("chorus") else 0.5,
                ))

        # Generate motifs from scale
        motifs = _generate_motifs(scale, ctx.timeline)

        ctx.musical_graph = MusicalGraph(
            key=key,
            mode=preset.mode,
            scale=scale,
            bpm=bpm,
            time_signature=time_sig,
            section_chords=section_chords,
            cadence_points=cadence_points,
            bassline_targets=bassline_targets,
            tension_curve=tension_curve,
            motifs=motifs,
            voicing_rules={
                "spread": "close" if preset.mode == "minor" else "open",
                "doubling": "root" if bpm > 120 else "third",
                "voice_lead": "smooth",
            },
            pad_density=preset.pad_profile.get("density", 0.5),
            countermelody_regions=countermelody_regions,
        )

        logger.info(
            "[Harmony] %s %s | %d sections | %d chords | %d motifs",
            key, preset.mode, len(section_chords), sum(len(c.chords) for c in section_chords),
            len(motifs),
        )

        return ctx


def _generate_motifs(scale: list[str], timeline) -> list[Motif]:
    """Build simple scale-based motifs for key sections."""
    motifs: list[Motif] = []
    for i, entry in enumerate(timeline.entries):
        if not (entry.section.startswith("verse") or entry.section.startswith("chorus")):
            continue
        root_idx = i % 3
        notes = [scale[root_idx % len(scale)],
                 scale[(root_idx + 2) % len(scale)],
                 scale[(root_idx + 4) % len(scale)],
                 scale[(root_idx + 6) % len(scale)]]
        rhythm = [0.5, 0.25, 0.25, 0.5] if entry.section.startswith("verse") else [0.25, 0.25, 0.25, 0.25]
        motifs.append(Motif(
            id=str(uuid.uuid4()),
            name=f"{entry.section}_motif",
            notes=notes,
            rhythm=rhythm,
            sections=[entry.section],
        ))
    return motifs
