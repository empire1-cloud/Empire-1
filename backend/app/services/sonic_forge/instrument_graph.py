"""
Instrument Graph — structured musical data output by the Instrument Engine.

Each InstrumentTrack contains MIDI events, automation, articulation, and
effects. No audio — structured data ready for any renderer.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .context import EngineContext


@dataclass
class MidiEvent:
    note: int = 60
    velocity: int = 100
    start_sec: float = 0.0
    duration_sec: float = 0.5
    channel: int = 0


@dataclass
class AutomationPoint:
    time_sec: float = 0.0
    value: float = 0.0
    target: str = "volume"  # cutoff, resonance, volume, pan, reverb


@dataclass
class InstrumentTrack:
    id: str = ""
    name: str = ""
    role: str = ""          # drums, bass, pads, keys, lead, strings, fx
    engine: str = ""        # builder name / version
    midi_events: list[MidiEvent] = field(default_factory=list)
    automation: list[AutomationPoint] = field(default_factory=list)
    articulation: str = "legato"
    effects: list[str] = field(default_factory=list)


@dataclass
class InstrumentGraph:
    tracks: dict[str, InstrumentTrack] = field(default_factory=dict)

    @property
    def total_tracks(self) -> int:
        return len(self.tracks)

    @property
    def total_midi_events(self) -> int:
        return sum(len(t.midi_events) for t in self.tracks.values())

    def get(self, role: str) -> InstrumentTrack | None:
        return self.tracks.get(role)


# ── Builder Plugin System ──────────────────────────────────────────────────

class InstrumentBuilder(ABC):
    """Each builder produces exactly one InstrumentTrack."""

    name: str = ""
    role: str = ""

    @abstractmethod
    async def build(self, ctx: EngineContext) -> InstrumentTrack: ...


INSTRUMENT_BUILDERS: dict[str, type[InstrumentBuilder]] = {}


def register_instrument(role: str):
    """Decorator: @register_instrument('bass') class MyBassBuilder: ..."""
    def decorator(cls: type[InstrumentBuilder]) -> type[InstrumentBuilder]:
        cls.role = role
        INSTRUMENT_BUILDERS[role] = cls
        return cls

    return decorator
