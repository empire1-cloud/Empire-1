"""Instrument builders — produce InstrumentTrack from EngineContext."""

from __future__ import annotations

import uuid
import logging
from typing import Any

from .context import EngineContext
from .instrument_graph import MidiEvent, AutomationPoint, InstrumentTrack, InstrumentBuilder, register_instrument
from .music_utils import chord_to_midi_notes, note_name_to_midi

logger = logging.getLogger(__name__)

# GM drum note map
GM_KICK = 36
GM_SNARE = 38
GM_HH_CLOSED = 42
GM_HH_OPEN = 46
GM_RIMSHOT = 37
GM_CRASH = 49
GM_RIDE = 51
GM_CLAP = 39
GM_TOM_HI = 48
GM_TOM_MID = 45
GM_TOM_LO = 41


def _bpm(ctx: EngineContext) -> int:
    return ctx.musical_graph.bpm if ctx.musical_graph else ctx.blueprint.targets["bpm"]


def _beat_sec(bpm: int) -> float:
    return 60.0 / bpm


# ── Drum Builder ────────────────────────────────────────────────────────────

@register_instrument("drums")
class DrumBuilder(InstrumentBuilder):
    name = "drum_builder"
    role = "drums"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []
        kit = ctx.preset.drum_kit if ctx.preset else {}

        for pe in ctx.performance.events:
            time = pe.time_sec
            vel = pe.velocity

            if pe.beat == 1 and pe.sixteenth == 1:
                # Downbeat kick
                events.append(MidiEvent(note=GM_KICK, velocity=vel, start_sec=time, duration_sec=_beat_sec(bpm) * 0.8))
            elif pe.beat == 3 and pe.sixteenth == 1:
                # Snare backbeat
                snare_vel = min(127, int(vel * 1.1))
                events.append(MidiEvent(note=GM_SNARE, velocity=snare_vel, start_sec=time, duration_sec=_beat_sec(bpm) * 0.6))
            elif pe.beat == 2 and pe.sixteenth == 1:
                # Snare on 2 (G-Funk style)
                events.append(MidiEvent(note=GM_SNARE, velocity=int(vel * 0.85), start_sec=time, duration_sec=_beat_sec(bpm) * 0.6))
            elif pe.sixteenth == 3 and pe.velocity > 30:
                # Off-beat accent → rimshot or open hihat
                note = GM_RIMSHOT if vel > 70 else GM_HH_CLOSED
                events.append(MidiEvent(note=note, velocity=vel, start_sec=time, duration_sec=_beat_sec(bpm) * 0.3))
            elif pe.sixteenth in (2, 4) and pe.velocity > 20:
                # Ghost notes → closed hihat
                events.append(MidiEvent(note=GM_HH_CLOSED, velocity=max(20, vel), start_sec=time, duration_sec=_beat_sec(bpm) * 0.2))

            # Section transition fills
            if pe.is_transition and pe.sixteenth == 1:
                events.append(MidiEvent(note=GM_CRASH, velocity=min(127, int(vel * 1.2)), start_sec=time, duration_sec=_beat_sec(bpm) * 2.0))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="drums",
            role="drums",
            engine=self.name,
            midi_events=events,
            articulation="staccato",
            effects=kit.get("kick", {}).get("effects", ["comp", "reverb_room"]),
        )
        return track


# ── Bass Builder ────────────────────────────────────────────────────────────

def _chord_to_root_midi(chord_str: str, octave: int = 2) -> int:
    notes = chord_to_midi_notes(chord_str, octave)
    return notes[0] if notes else 36


@register_instrument("bass")
class BassBuilder(InstrumentBuilder):
    name = "bass_builder"
    role = "bass"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        beat_dur = _beat_sec(bpm)
        events: list[MidiEvent] = []
        profile = ctx.preset.bass_profile if ctx.preset else {}

        bass_octave = profile.get("octave", 2)
        articulation = profile.get("articulation", "legato")
        dur_mult = 0.9 if articulation == "legato" else 0.5

        # Build per-section bass from chord roots
        for sc in ctx.musical_graph.section_chords:
            root_note = _chord_to_root_midi(sc.chords[0], bass_octave)
            # Play on downbeats using PerformanceGraph timing
            for pe in ctx.performance.events:
                if pe.section != sc.section:
                    continue
                if not (pe.beat == 1 and pe.sixteenth == 1):
                    continue
                dur = beat_dur * 4 * dur_mult
                events.append(MidiEvent(
                    note=root_note,
                    velocity=pe.velocity,
                    start_sec=pe.time_sec,
                    duration_sec=dur,
                ))
                # Octave bounce on 3rd beat for funk
                if pe.beat == 1 and pe.sixteenth == 1:
                    octave_up = root_note + 12
                    events.append(MidiEvent(
                        note=octave_up,
                        velocity=int(pe.velocity * 0.7),
                        start_sec=pe.time_sec + beat_dur * 2,
                        duration_sec=beat_dur * 0.5,
                    ))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="bass",
            role="bass",
            engine=self.name,
            midi_events=events,
            articulation=articulation,
            effects=["sub_eq", "saturator"],
        )
        return track


# ── Pad Builder ─────────────────────────────────────────────────────────────

@register_instrument("pads")
class PadBuilder(InstrumentBuilder):
    name = "pad_builder"
    role = "pads"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []
        density = ctx.musical_graph.pad_density if ctx.musical_graph else 0.5

        for sc in ctx.musical_graph.section_chords:
            notes = []
            for chord in sc.chords:
                notes.extend(chord_to_midi_notes(chord, 3))
            if not notes:
                continue

            # Pads sustain across each bar in the section
            for pe in ctx.performance.events:
                if pe.section != sc.section:
                    continue
                if pe.beat == 1 and pe.sixteenth == 1 and pe.velocity > 40:
                    bar_dur = _beat_sec(bpm) * 4 * 0.95
                    for n in notes:
                        events.append(MidiEvent(
                            note=n,
                            velocity=int(pe.velocity * 0.65),
                            start_sec=pe.time_sec,
                            duration_sec=bar_dur,
                        ))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="pads",
            role="pads",
            engine=self.name,
            midi_events=events,
            articulation="legato",
            effects=["reverb_hall", "lowpass_24db"],
        )
        return track


# ── Keys Builder ────────────────────────────────────────────────────────────

@register_instrument("keys")
class KeysBuilder(InstrumentBuilder):
    name = "keys_builder"
    role = "keys"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []

        for sc in ctx.musical_graph.section_chords:
            for chord in sc.chords:
                notes = chord_to_midi_notes(chord, 4)
                if not notes:
                    continue
                # Chord stabs on 2nd and 4th beat
                for pe in ctx.performance.events:
                    if pe.section != sc.section:
                        continue
                    if pe.beat in (2, 4) and pe.sixteenth == 1 and pe.velocity > 30:
                        stab_dur = _beat_sec(bpm) * 0.25
                        for n in notes:
                            events.append(MidiEvent(
                                note=n,
                                velocity=int(pe.velocity * 0.8),
                                start_sec=pe.time_sec,
                                duration_sec=stab_dur,
                            ))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="keys",
            role="keys",
            engine=self.name,
            midi_events=events,
            articulation="staccato",
            effects=["comp", "reverb_room"],
        )
        return track


# ── Lead Builder ────────────────────────────────────────────────────────────

@register_instrument("lead")
class LeadBuilder(InstrumentBuilder):
    name = "lead_builder"
    role = "lead"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []

        for motif in ctx.musical_graph.motifs:
            # Find performance events matching motif sections
            for pe in ctx.performance.events:
                if pe.section not in motif.sections:
                    continue
                if pe.beat == 1 and pe.sixteenth == 1 and pe.velocity > 30:
                    # Play motif notes
                    for i, note_str in enumerate(motif.notes):
                        note = note_name_to_midi(note_str + "4") or 60
                        dur = motif.rhythm[i] * _beat_sec(bpm) * 2 if i < len(motif.rhythm) else _beat_sec(bpm)
                        events.append(MidiEvent(
                            note=note,
                            velocity=pe.velocity,
                            start_sec=pe.time_sec + sum(motif.rhythm[:i]) * _beat_sec(bpm) if i > 0 else pe.time_sec,
                            duration_sec=dur,
                        ))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="lead",
            role="lead",
            engine=self.name,
            midi_events=events,
            articulation="legato",
            effects=["reverb_vocal", "delay"],
        )
        return track


# ── Strings Builder ─────────────────────────────────────────────────────────

@register_instrument("strings")
class StringsBuilder(InstrumentBuilder):
    name = "strings_builder"
    role = "strings"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []

        # Strings only on chorus and bridge sections
        for sc in ctx.musical_graph.section_chords:
            if not (sc.section.startswith("chorus") or sc.section == "bridge"):
                continue
            notes = []
            for chord in sc.chords:
                notes.extend(chord_to_midi_notes(chord, 4))
                notes.extend(chord_to_midi_notes(chord, 5))  # upper octave
            if not notes:
                continue

            for pe in ctx.performance.events:
                if pe.section != sc.section:
                    continue
                if pe.beat == 1 and pe.sixteenth == 1:
                    bar_dur = _beat_sec(bpm) * 4 * 0.95
                    for n in notes:
                        events.append(MidiEvent(
                            note=n,
                            velocity=int(pe.velocity * 0.5),
                            start_sec=pe.time_sec,
                            duration_sec=bar_dur,
                        ))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="strings",
            role="strings",
            engine=self.name,
            midi_events=events,
            articulation="legato",
            effects=["reverb_large", "chorus"],
        )
        return track


# ── FX Builder ──────────────────────────────────────────────────────────────

@register_instrument("fx")
class FXBuilder(InstrumentBuilder):
    name = "fx_builder"
    role = "fx"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        bpm = _bpm(ctx)
        events: list[MidiEvent] = []
        automation: list[AutomationPoint] = []

        # Risers and impacts at section transitions
        for pe in ctx.performance.events:
            if pe.is_transition:
                # Impact hit
                events.append(MidiEvent(
                    note=GM_CRASH,
                    velocity=min(127, pe.velocity + 10),
                    start_sec=pe.time_sec,
                    duration_sec=_beat_sec(bpm) * 0.1,
                ))
                # Filter sweep automation
                automation.append(AutomationPoint(time_sec=pe.time_sec - 0.5, value=0.2, target="cutoff"))
                automation.append(AutomationPoint(time_sec=pe.time_sec, value=1.0, target="cutoff"))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="fx",
            role="fx",
            engine=self.name,
            midi_events=events,
            automation=automation,
            articulation="staccato",
            effects=["delay", "reverb"],
        )
        return track


# ── Automation Builder ──────────────────────────────────────────────────────

@register_instrument("automation")
class AutomationBuilder(InstrumentBuilder):
    name = "automation_builder"
    role = "automation"

    async def build(self, ctx: EngineContext) -> InstrumentTrack:
        points: list[AutomationPoint] = []
        emotion_bus = ctx.emotion_bus
        if not emotion_bus:
            return InstrumentTrack(id=str(uuid.uuid4()), name="automation", role="automation", engine=self.name)

        # Map EmotionBus energy to filter/volume/reverb automations
        for sec in emotion_bus.sections:
            mid_time = (sec.bar_start + sec.bar_end) / 2
            time_sec = mid_time * (_beat_sec(_bpm(ctx)) * 4)
            points.append(AutomationPoint(time_sec=time_sec, value=round(sec.emotion, 3), target="volume"))
            points.append(AutomationPoint(time_sec=time_sec, value=round(sec.energy, 3), target="cutoff"))
            points.append(AutomationPoint(time_sec=time_sec, value=round(sec.emotion * 0.8, 3), target="reverb"))

        track = InstrumentTrack(
            id=str(uuid.uuid4()),
            name="automation",
            role="automation",
            engine=self.name,
            midi_events=[],
            automation=points,
            effects=[],
        )
        return track
