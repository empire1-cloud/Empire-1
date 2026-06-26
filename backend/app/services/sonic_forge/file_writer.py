"""File writer — exports pipeline output to disk (MIDI, JSON, project)."""

from __future__ import annotations

import json
import logging
import struct
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .context import EngineContext
from .instrument_graph import InstrumentTrack

logger = logging.getLogger(__name__)


def write_project(ctx: EngineContext, project_dir: str | Path) -> Path:
    """Write MIDI + JSON files into an existing project directory."""
    root = Path(project_dir)

    _write_midi_stems(ctx, root)
    _write_project_manifest(ctx, root)
    _write_instrument_graph_json(ctx, root)
    _write_vocal_plan_json(ctx, root)

    logger.info("[Writer] MIDI + JSON → %s", root)
    return root


def _ticks_per_beat(bpm: int) -> int:
    return 480  # standard PPQN


def _midi_note_on(dt: int, note: int, vel: int) -> bytes:
    return struct.pack(">I", dt)[1:] + bytes([0x90, note & 0x7F, vel & 0x7F])


def _midi_note_off(dt: int, note: int) -> bytes:
    return struct.pack(">I", dt)[1:] + bytes([0x80, note & 0x7F, 0x00])


def _midi_end_of_track() -> bytes:
    return bytes([0x00, 0xFF, 0x2F, 0x00])


def _midi_tempo(bpm: int) -> bytes:
    """Meta event: set tempo (microseconds per quarter note)."""
    us_per_beat = int(60_000_000 / bpm)
    return bytes([0x00, 0xFF, 0x51, 0x03, 
                  (us_per_beat >> 16) & 0xFF,
                  (us_per_beat >> 8) & 0xFF,
                  us_per_beat & 0xFF])


def _midi_track_name(name: str) -> bytes:
    data = name.encode()
    return bytes([0x00, 0xFF, 0x03, len(data)]) + data


def _seconds_to_ticks(sec: float, bpm: int) -> int:
    """Convert seconds to MIDI ticks at given BPM."""
    beat_dur = 60.0 / bpm
    beats = sec / beat_dur
    return int(beats * _ticks_per_beat(bpm))


def _build_midi_track(track: InstrumentTrack, bpm: int) -> bytes:
    events = bytearray()

    # Sort events by start time
    sorted_events = sorted(track.midi_events, key=lambda e: e.start_sec)

    prev_ticks = 0
    for me in sorted_events:
        ticks = _seconds_to_ticks(me.start_sec, bpm)
        dur_ticks = _seconds_to_ticks(me.duration_sec, bpm)
        dt = max(0, ticks - prev_ticks)
        prev_ticks = ticks

        events.extend(_midi_note_on(dt, me.note, me.velocity))
        events.extend(_midi_note_off(dur_ticks, me.note))
        prev_ticks = ticks  # note off handled with relative delta

    events.extend(_midi_end_of_track())
    return bytes(events)


def _write_midi_stems(ctx: EngineContext, root: Path) -> None:
    midi_dir = root / "midi"
    midi_dir.mkdir(exist_ok=True)
    bpm = ctx.musical_graph.bpm if ctx.musical_graph else ctx.blueprint.targets["bpm"]
    ppqn = _ticks_per_beat(bpm)

    ig = ctx.instrument_graph
    if not ig:
        return

    for role, track in ig.tracks.items():
        if not track.midi_events:
            continue

        track_data = _build_midi_track(track, bpm)
        header = struct.pack(">4sIHHH", b"MThd", 6, 0, 1, ppqn)
        tempo_track = _midi_track_name("Tempo") + _midi_tempo(bpm) + _midi_end_of_track()
        tempo_chunk = struct.pack(">4sI", b"MTrk", len(tempo_track)) + tempo_track
        track_chunk = struct.pack(">4sI", b"MTrk", len(track_data)) + track_data

        path = midi_dir / f"{role}.mid"
        path.write_bytes(header + tempo_chunk + track_chunk)
        logger.debug("[Writer] %s — %d events", path.name, len(track.midi_events))

    logger.info("[Writer] MIDI stems: %d files", len(list(midi_dir.glob("*.mid"))))


def _write_project_manifest(ctx: EngineContext, root: Path) -> None:
    manifest = {
        "project_id": ctx.job_id or str(uuid.uuid4()),
        "prompt": ctx.prompt,
        "style": ctx.style,
        "creator_id": ctx.creator_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "blueprint": {
            "genre": ctx.blueprint.intent.get("genre", ""),
            "mood": ctx.blueprint.intent.get("mood", ""),
            "bpm": ctx.blueprint.targets.get("bpm", 90),
            "key": ctx.blueprint.targets.get("key", "Fmin"),
        },
        "timeline": {
            "total_bars": ctx.timeline.total_bars,
            "total_duration_sec": ctx.timeline.total_duration_sec,
        },
        "narrative": {
            "segments": len(ctx.narrative_segments),
            "speakers": list(set(s.speaker for s in ctx.narrative_segments)),
        },
        "musical_graph": {
            "key": ctx.musical_graph.key if ctx.musical_graph else "",
            "mode": ctx.musical_graph.mode if ctx.musical_graph else "",
            "sections": len(ctx.musical_graph.section_chords) if ctx.musical_graph else 0,
        },
        "performance": {
            "events": len(ctx.performance.events) if ctx.performance else 0,
        },
        "instrument_graph": {
            "tracks": {role: len(t.midi_events) for role, t in ctx.instrument_graph.tracks.items()} if ctx.instrument_graph else {},
        },
        "vocal_performance": {
            "phrases": len(ctx.vocal_performance.phrases) if ctx.vocal_performance else 0,
        },
        "dsp": {
            "tracks": len(ctx.dsp_graph.tracks) if ctx.dsp_graph else 0,
        },
        "export": {
            "files": [{"role": f.role, "format": f.format} for f in ctx.export_plan.files] if ctx.export_plan else [],
        },
        "ledger": {
            "entries": len(ctx.ledger_plan.entries) if ctx.ledger_plan else 0,
            "total_usd": ctx.ledger_plan.total_estimated_usd if ctx.ledger_plan else 0.0,
        },
    }

    path = root / "project_manifest.json"
    path.write_text(json.dumps(manifest, indent=2))
    logger.info("[Writer] Manifest written: %s", path.name)


def _write_instrument_graph_json(ctx: EngineContext, root: Path) -> None:
    ig = ctx.instrument_graph
    if not ig:
        return

    data: dict[str, list[dict[str, Any]]] = {}
    for role, track in ig.tracks.items():
        data[role] = [
            {
                "note": e.note,
                "velocity": e.velocity,
                "start_sec": round(e.start_sec, 3),
                "duration_sec": round(e.duration_sec, 3),
            }
            for e in track.midi_events
        ]

    path = root / "instrument_graph.json"
    path.write_text(json.dumps(data, indent=2))
    logger.info("[Writer] Instruments JSON: %s", path.name)


def _write_vocal_plan_json(ctx: EngineContext, root: Path) -> None:
    vrp = ctx.vocal_render_plan
    if not vrp or not vrp.segments:
        return

    data = [
        {
            "phrase_index": s.phrase_index,
            "text": s.text,
            "voice_profile": s.voice_profile,
            "start_sec": s.start_sec,
            "duration_sec": s.duration_sec,
            "emotion_intensity": s.emotion_intensity,
            "pitch_bend": [[round(t, 3), round(p, 1)] for t, p in s.pitch_bend],
            "dynamics": [[round(t, 3), round(v, 3)] for t, v in s.dynamics],
        }
        for s in vrp.segments
    ]

    path = root / "vocal_render_plan.json"
    path.write_text(json.dumps(data, indent=2))
    logger.info("[Writer] Vocal plan JSON: %s", path.name)
