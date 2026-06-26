"""
Emotion Bus — per-section emotional trajectory for the entire pipeline.

Every engine subscribes to the bus. MMA adjusts groove intensity.
PFA increases vocal expression. PDA increases saturation. One source of truth.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


STORY_ARC_MAP: dict[str, str] = {
    "intro": "setup",
    "verse_1": "conflict",
    "verse_2": "escalation",
    "verse_3": "climax",
    "chorus": "release",
    "bridge": "reflection",
    "pre_chorus": "tension",
    "hook": "release",
    "outro": "resolution",
}


def default_emotion_for_role(role: str, section_index: int, total_sections: int) -> float:
    """Map story role to emotion value 0..1 over the track's arc."""
    arc_values = {
        "setup": 0.20,
        "conflict": 0.40,
        "tension": 0.55,
        "release": 0.80,
        "escalation": 0.65,
        "climax": 0.95,
        "reflection": 0.35,
        "resolution": 0.25,
    }
    return arc_values.get(role, 0.5)


def default_energy_for_role(role: str, section_index: int, total_sections: int) -> float:
    """Separate energy curve — can decouple from emotion."""
    arc_values = {
        "setup": 0.20,
        "conflict": 0.45,
        "tension": 0.60,
        "release": 0.85,
        "escalation": 0.70,
        "climax": 0.90,
        "reflection": 0.30,
        "resolution": 0.15,
    }
    return arc_values.get(role, 0.5)


@dataclass
class SectionEmotion:
    section: str
    role: str
    bar_start: int
    bar_end: int
    emotion: float
    energy: float


@dataclass
class EmotionBus:
    """One source of truth for the track's emotional arc."""

    sections: list[SectionEmotion] = field(default_factory=list)
    total_sections: int = 0

    @classmethod
    def from_timeline(cls, timeline) -> "EmotionBus":
        from .context import Timeline
        if not isinstance(timeline, Timeline):
            raise TypeError("timeline must be a Timeline instance")

        sections: list[SectionEmotion] = []
        for i, entry in enumerate(timeline.entries):
            role = STORY_ARC_MAP.get(entry.section, "conflict")
            emotion = default_emotion_for_role(role, i, len(timeline.entries))
            energy = default_energy_for_role(role, i, len(timeline.entries))

            sections.append(SectionEmotion(
                section=entry.section,
                role=role,
                bar_start=entry.bar_start,
                bar_end=entry.bar_end,
                emotion=round(emotion, 3),
                energy=round(energy, 3),
            ))

        return cls(sections=sections, total_sections=len(sections))

    def get_section(self, section_name: str) -> SectionEmotion | None:
        for s in self.sections:
            if s.section == section_name:
                return s
        return None

    def get_emotion_at_bar(self, bar: int) -> float:
        for s in self.sections:
            if s.bar_start <= bar <= s.bar_end:
                return s.emotion
        return 0.5

    def get_energy_at_bar(self, bar: int) -> float:
        for s in self.sections:
            if s.bar_start <= bar <= s.bar_end:
                return s.energy
        return 0.5

    def to_dict(self) -> dict[str, Any]:
        return {
            "total_sections": self.total_sections,
            "sections": [
                {
                    "section": s.section,
                    "role": s.role,
                    "bars": [s.bar_start, s.bar_end],
                    "emotion": s.emotion,
                    "energy": s.energy,
                }
                for s in self.sections
            ],
        }
