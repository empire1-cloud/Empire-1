"""Vocal Performance — structured vocal data output by PFA.

No audio. Pitch curves, timing, formant shifts, and dynamics
that Voice King renders into actual vocal audio.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class VocalNote:
    pitch_midi: int = 60
    start_sec: float = 0.0
    duration_sec: float = 0.5
    velocity: int = 80
    vibrato_rate: float = 5.0
    vibrato_depth: float = 0.5
    formant_shift: float = 0.0
    breathiness: float = 0.0
    glide: bool = False


@dataclass
class VocalPhrase:
    section: str = ""
    speaker: str = ""
    text: str = ""
    notes: list[VocalNote] = field(default_factory=list)
    emotion: float = 0.5
    energy: float = 0.5
    performance_tags: list[str] = field(default_factory=list)
    start_sec: float = 0.0
    duration_sec: float = 0.0


@dataclass
class VocalPerformance:
    phrases: list[VocalPhrase] = field(default_factory=list)
    total_duration_sec: float = 0.0
    language: str = "English"
