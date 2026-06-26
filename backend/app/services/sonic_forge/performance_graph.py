"""
Performance Graph — how the song moves. The MMA Engine's output.

Every downstream engine subscribes: drums, bass, synths, automation,
vocals, and visuals all share the same rhythmic intent.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class RhythmSection:
    """Per-section rhythmic profile — the 'feel' of each section."""
    section: str = ""
    groove: str = "straight"
    swing: float = 0.05
    velocity_curve: list[int] = field(default_factory=lambda: [90, 85, 88, 82])
    ghost_notes: bool = True
    fill_probability: float = 0.15
    transition_fill: bool = True
    humanization_ms: float = 10.0
    density: float = 1.0          # 0-1, how busy
    accent_spread: float = 0.3    # how far accents deviate from median


@dataclass
class PerformanceEvent:
    """Single rhythmic event at a point in time."""
    bar: int = 0
    beat: int = 0
    sixteenth: int = 0
    time_sec: float = 0.0
    velocity: int = 80
    accent: float = 0.5
    timing_offset_ms: float = 0.0
    groove_amount: float = 0.0
    density: float = 1.0
    humanization_ms: float = 10.0
    is_transition: bool = False
    section: str = ""


@dataclass
class PerformanceGraph:
    """Complete rhythmic blueprint — sections + event grid."""
    sections: list[RhythmSection] = field(default_factory=list)
    events: list[PerformanceEvent] = field(default_factory=list)
    bpm: int = 90
    total_bars: int = 0
    total_duration_sec: float = 0.0
