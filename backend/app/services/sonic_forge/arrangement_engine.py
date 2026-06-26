"""
Arrangement Engine — Timeline + Blueprint → TrackGraph.

Decides what every engine produces at every moment. No audio generated.
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
class EnergySegment:
    section: str
    bar_start: int
    bar_end: int
    energy: float


@dataclass
class Track:
    id: str = ""
    name: str = ""
    role: str = ""          # drums, bass, pad, lead_vox, harmony_vox, fx
    engine: str = ""        # mma, pfa, pda, voice_king
    start_bar: int = 1
    end_bar: int = 1
    energy_segments: list[EnergySegment] = field(default_factory=list)
    effects: list[str] = field(default_factory=list)


@dataclass
class TrackGraph:
    tracks: list[Track] = field(default_factory=list)
    bpm: int = 90
    key: str = "Fmin"
    time_signature: str = "4/4"


# ── Section-level energy profiles per genre ──────────────────────────────────

SECTION_ENERGY: dict[str, dict[str, float]] = {
    # (genre_key) → {section_name → energy 0..1}
    "g_funk": {
        "intro": 0.25, "verse_1": 0.45, "chorus": 0.80,
        "verse_2": 0.55, "bridge": 0.30, "outro": 0.15,
    },
    "trap": {
        "intro": 0.30, "hook": 0.85, "verse_1": 0.60,
        "verse_2": 0.70, "bridge": 0.35, "outro": 0.10,
    },
    "boom_bap": {
        "intro": 0.20, "verse_1": 0.50, "chorus": 0.75,
        "verse_2": 0.55, "bridge": 0.35, "outro": 0.15,
    },
    "corrido": {
        "intro": 0.25, "verse_1": 0.40, "chorus": 0.70,
        "verse_2": 0.45, "bridge": 0.30, "outro": 0.20,
    },
    "melodic": {
        "intro": 0.20, "verse_1": 0.40, "pre_chorus": 0.55,
        "chorus": 0.85, "verse_2": 0.50, "bridge": 0.65,
        "outro": 0.15,
    },
    "west_coast": {
        "intro": 0.20, "verse_1": 0.42, "chorus": 0.78,
        "verse_2": 0.52, "bridge": 0.30, "outro": 0.12,
    },
}

# Per-role energy multiplier for each section type
ROLE_ENERGY_MULTIPLIERS: dict[str, dict[str, float]] = {
    "drums":       {"intro": 0.6, "verse": 0.8, "chorus": 1.2, "bridge": 0.5, "outro": 0.4},
    "bass":        {"intro": 0.5, "verse": 0.9, "chorus": 1.2, "bridge": 0.6, "outro": 0.3},
    "pad":         {"intro": 0.8, "verse": 0.7, "chorus": 1.1, "bridge": 1.0, "outro": 0.6},
    "lead_vox":    {"intro": 0.0, "verse": 1.0, "chorus": 1.3, "bridge": 0.9, "outro": 0.3},
    "harmony_vox": {"intro": 0.0, "verse": 0.0, "chorus": 1.0, "bridge": 0.8, "outro": 0.0},
    "fx":          {"intro": 0.3, "verse": 0.2, "chorus": 0.6, "bridge": 0.5, "outro": 0.4},
}

TRACK_TEMPLATES: dict[str, list[dict[str, Any]]] = {
    "g_funk": [
        {"role": "drums", "engine": "mma", "effects": ["comp", "reverb_room"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq", "saturator"]},
        {"role": "pad", "engine": "mma", "effects": ["reverb_hall", "lowpass"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["de-esser", "comp", "reverb_vocal"]},
        {"role": "harmony_vox", "engine": "voice_king", "effects": ["comp", "reverb_vocal"]},
        {"role": "fx", "engine": "pda", "effects": ["delay", "reverb"]},
    ],
    "trap": [
        {"role": "drums", "engine": "mma", "effects": ["comp", "saturator"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq", "distortion"]},
        {"role": "pad", "engine": "mma", "effects": ["reverb_hall", "lowpass"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["de-esser", "comp", "reverb_vocal"]},
        {"role": "fx", "engine": "pda", "effects": ["delay", "reverb", "stutter"]},
    ],
    "west_coast": [
        {"role": "drums", "engine": "mma", "effects": ["comp", "reverb_room"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq", "saturator"]},
        {"role": "pad", "engine": "mma", "effects": ["reverb_hall", "lowpass"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["de-esser", "comp", "reverb_vocal"]},
        {"role": "harmony_vox", "engine": "voice_king", "effects": ["comp", "reverb_vocal"]},
        {"role": "fx", "engine": "pda", "effects": ["delay", "reverb"]},
    ],
    "boom_bap": [
        {"role": "drums", "engine": "mma", "effects": ["comp", "saturator"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq"]},
        {"role": "pad", "engine": "mma", "effects": ["reverb_hall"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["de-esser", "comp", "reverb_vocal"]},
        {"role": "fx", "engine": "pda", "effects": ["delay", "reverb"]},
    ],
    "corrido": [
        {"role": "drums", "engine": "mma", "effects": ["comp"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["comp", "reverb_vocal"]},
        {"role": "harmony_vox", "engine": "voice_king", "effects": ["comp"]},
        {"role": "fx", "engine": "pda", "effects": ["reverb"]},
    ],
    "melodic": [
        {"role": "drums", "engine": "mma", "effects": ["comp", "reverb_room"]},
        {"role": "bass", "engine": "mma", "effects": ["sub_eq", "saturator"]},
        {"role": "pad", "engine": "mma", "effects": ["reverb_hall", "lowpass", "lfo"]},
        {"role": "lead_vox", "engine": "voice_king", "effects": ["de-esser", "comp", "reverb_vocal", "harmony"]},
        {"role": "harmony_vox", "engine": "voice_king", "effects": ["comp", "reverb_vocal"]},
        {"role": "fx", "engine": "pda", "effects": ["delay", "reverb", "riser"]},
    ],
}


def _section_key(entry_section: str) -> str:
    """Map any section name to its base type for energy lookups."""
    for base in ["verse", "chorus", "intro", "bridge", "outro", "hook"]:
        if base in entry_section:
            return base
    return entry_section


@register_engine
class ArrangementEngine(BaseEngine):
    """Timeline + Blueprint → TrackGraph with per-section energy."""

    name = "arrangement"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        bp = ctx.blueprint
        tl = ctx.timeline
        genre = bp.intent.get("genre", "")
        genre_key = _resolve_genre_key(genre, ctx.style)

        section_energy_map = SECTION_ENERGY.get(genre_key, SECTION_ENERGY["west_coast"])
        track_templates = TRACK_TEMPLATES.get(genre_key, TRACK_TEMPLATES["west_coast"])

        tracks: list[Track] = []

        for tmpl in track_templates:
            role = tmpl["role"]
            engine = tmpl["engine"]
            effects = tmpl["effects"]
            segments: list[EnergySegment] = []

            for entry in tl.entries:
                base = _section_key(entry.section)
                base_energy = section_energy_map.get(entry.section, 0.5)
                role_mult = ROLE_ENERGY_MULTIPLIERS.get(role, {}).get(base, 1.0)
                energy = round(min(base_energy * role_mult, 1.0), 3)

                segments.append(EnergySegment(
                    section=entry.section,
                    bar_start=entry.bar_start,
                    bar_end=entry.bar_end,
                    energy=energy,
                ))

            track = Track(
                id=str(uuid.uuid4()),
                name=f"{role}_{genre_key}",
                role=role,
                engine=engine,
                start_bar=segments[0].bar_start if segments else 1,
                end_bar=segments[-1].bar_end if segments else 1,
                energy_segments=segments,
                effects=effects,
            )
            tracks.append(track)

        ctx.arrangement = TrackGraph(
            tracks=tracks,
            bpm=bp.targets["bpm"],
            key=bp.targets["key"],
            time_signature=bp.targets["time_signature"],
        )

        total_tracks = len(tracks)
        total_segments = sum(len(t.energy_segments) for t in tracks)
        logger.info(
            "[Arrangement] %d tracks | %d energy segments | %s",
            total_tracks, total_segments, genre_key,
        )

        return ctx


def _resolve_genre_key(genre: str, style: str) -> str:
    """Map free-text genre to a known profile key."""
    genre_lower = genre.lower()
    for key in TRACK_TEMPLATES:
        if key in genre_lower:
            return key
    if style in TRACK_TEMPLATES:
        return style
    return "west_coast"
