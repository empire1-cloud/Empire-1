"""
PFA Engine — Narrative Segments + Musical Graph → VocalPerformance.

PFA is the vocal arrangement engine. It determines pitch, timing, and
expression of every syllable. Voice King renders the result to audio.
No audio generated here.
"""

from __future__ import annotations

import logging
from random import randint
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .vocal_performance import VocalPerformance, VocalPhrase, VocalNote
from .music_utils import chord_to_midi_notes, NOTE_TO_SEMITONE
from .persona_registry import get_persona

logger = logging.getLogger(__name__)

PERSONA_PITCH_RANGE: dict[str, tuple[int, int]] = {
    "SANCHA_V1":    (60, 79),
    "TOXICO_PRIME": (52, 72),
    "LYRICA_BASE":  (55, 76),
    "ECHO_COLD":    (65, 84),
}

PHRASING_SPEED: dict[str, float] = {
    "slow": 0.6,
    "natural": 0.4,
    "interruptive": 0.25,
    "sustained": 0.7,
}


def _scale_notes_for_key(ctx: EngineContext) -> list[int]:
    """Build MIDI note pool from the MusicalGraph scale across vocal octaves."""
    if not (ctx.musical_graph and ctx.musical_graph.scale):
        return list(range(48, 84))
    root_raw = ctx.musical_graph.key.rstrip("mM")
    root_semi = NOTE_TO_SEMITONE.get(root_raw, 0)
    midi_scale: list[int] = []
    for octave_offset in range(3, 6):
        for i, note_name in enumerate(ctx.musical_graph.scale):
            semitone = NOTE_TO_SEMITONE.get(note_name, i)
            midi_scale.append(root_semi + octave_offset * 12 + (semitone - root_semi) % 12)
    return sorted(set(midi_scale))


def _chord_tones_for_section(ctx: EngineContext, section: str) -> list[int]:
    if not ctx.musical_graph:
        return [60, 64, 67]
    for sc in ctx.musical_graph.section_chords:
        if sc.section == section and sc.chords:
            notes = []
            for chord in sc.chords:
                notes.extend(chord_to_midi_notes(chord, 4))
            return notes if notes else [60, 64, 67]
    return [60, 64, 67]


def _section_start(ctx: EngineContext, section: str) -> float:
    for entry in ctx.timeline.entries:
        if entry.section == section:
            return entry.time_start_sec
    return 0.0


def _nearest_scale_note(midi: int, scale_notes: list[int]) -> int:
    if not scale_notes:
        return midi
    return min(scale_notes, key=lambda n: abs(n - midi))


@register_engine
class PFAEngine(BaseEngine):
    """Narrative + Musical Graph + Performance → VocalPerformance."""

    name = "pfa"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        if not ctx.narrative_segments:
            logger.warning("[PFA] No narrative segments — skipping")
            ctx.vocal_performance = VocalPerformance()
            return ctx

        scale_notes = _scale_notes_for_key(ctx)
        all_phrases: list[VocalPhrase] = []
        total_duration = 0.0

        for seg in ctx.narrative_segments:
            phrases = self._build_phrases(seg, ctx, scale_notes)
            all_phrases.extend(phrases)
            if phrases:
                last = phrases[-1]
                total_duration = max(total_duration, last.start_sec + last.duration_sec)

        ctx.vocal_performance = VocalPerformance(
            phrases=all_phrases,
            total_duration_sec=round(total_duration, 3),
            language=ctx.blueprint.intent.get("language", "English"),
        )

        logger.info(
            "[PFA] %d phrases | %.1fs | speaker: %s",
            len(all_phrases), total_duration,
            all_phrases[0].speaker if all_phrases else "none",
        )
        return ctx

    def _build_phrases(self, seg, ctx, scale_notes: list[int]) -> list[VocalPhrase]:
        lines = [l for l in seg.lyrics.strip().split("\n") if l.strip()]
        if not lines:
            return []

        phrases: list[VocalPhrase] = []
        pitch_range = PERSONA_PITCH_RANGE.get(seg.speaker, (55, 76))
        persona = get_persona(seg.speaker)
        phrasing_speed = PHRASING_SPEED.get(persona.phrasing, 0.4)
        section_time = _section_start(ctx, seg.section)
        chord_tones = _chord_tones_for_section(ctx, seg.section)

        for i, line in enumerate(lines):
            words = line.split()
            if not words:
                continue

            notes: list[VocalNote] = []
            line_duration = max(0.5, len(words) * phrasing_speed * 0.5 + seg.emotion * 0.3)
            note_start = section_time + i * (line_duration * 0.85)

            for j, word in enumerate(words):
                syllables = max(1, len(word) // 3 + 1)
                for k in range(syllables):
                    target = chord_tones[j % len(chord_tones)] if chord_tones else pitch_range[0]
                    pitch = _nearest_scale_note(target + randint(-2, 2), scale_notes)
                    pitch = max(pitch_range[0], min(pitch_range[1], pitch))

                    word_duration = line_duration / max(1, len(words) * syllables)
                    dur = word_duration * (1.5 if k == 0 else 0.8)
                    vel = min(127, max(20, int(60 + seg.emotion * 50 + seg.energy * 20)))

                    notes.append(VocalNote(
                        pitch_midi=pitch,
                        start_sec=round(note_start, 3),
                        duration_sec=round(dur, 3),
                        velocity=vel,
                        vibrato_rate=round(4.0 + seg.energy * 3.0, 1),
                        vibrato_depth=round(seg.emotion * 1.5, 2),
                        formant_shift=round((seg.emotion - 0.5) * 0.3, 2),
                        breathiness=round(max(0, 1.0 - seg.energy) * 0.6, 2),
                        glide=k > 0,
                    ))
                    note_start += dur

            phrases.append(VocalPhrase(
                section=seg.section,
                speaker=seg.speaker,
                text=line,
                notes=notes,
                emotion=seg.emotion,
                energy=seg.energy,
                performance_tags=seg.performance_tags,
                start_sec=round(section_time + i * (line_duration * 0.85), 3),
                duration_sec=round(line_duration, 3),
            ))

        return phrases
