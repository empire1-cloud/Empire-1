"""Music utilities — MIDI note conversion, chord parsing, scale helpers."""

from __future__ import annotations

NOTE_TO_SEMITONE: dict[str, int] = {
    "C": 0, "C#": 1, "Db": 1,
    "D": 2, "D#": 3, "Eb": 3,
    "E": 4, "Fb": 4, "F": 5,
    "F#": 6, "Gb": 6, "G": 7,
    "G#": 8, "Ab": 8, "A": 9,
    "A#": 10, "Bb": 10, "B": 11, "Cb": 11,
}

CHORD_INTERVALS: dict[str, list[int]] = {
    "":      [0, 4, 7],       # major
    "m":     [0, 3, 7],       # minor
    "7":     [0, 4, 7, 10],   # dominant 7
    "m7":    [0, 3, 7, 10],   # minor 7
    "maj7":  [0, 4, 7, 11],   # major 7
    "dim":   [0, 3, 6],       # diminished
    "aug":   [0, 4, 8],       # augmented
    "sus2":  [0, 2, 7],       # sus2
    "sus4":  [0, 5, 7],       # sus4
    "7sus4": [0, 5, 7, 10],   # 7sus4
    "9":     [0, 4, 7, 10, 14],  # dominant 9
    "m9":    [0, 3, 7, 10, 14],  # minor 9
    "maj9":  [0, 4, 7, 11, 14],  # major 9
}


def parse_chord(chord_str: str) -> tuple[str, str]:
    """Split 'Fm7' → ('F', 'm7'), 'C' → ('C', ''), 'Bb' → ('Bb', '')."""
    chord_str = chord_str.strip()
    if len(chord_str) >= 2 and chord_str[1] in "#b":
        root = chord_str[:2]
        quality = chord_str[2:]
    else:
        root = chord_str[:1]
        quality = chord_str[1:]
    return root, quality


def chord_to_midi_notes(chord_str: str, octave: int = 3) -> list[int]:
    """Convert a chord name like 'Fm7' to MIDI note numbers."""
    root, quality = parse_chord(chord_str)
    root_semi = NOTE_TO_SEMITONE.get(root)
    if root_semi is None:
        return []
    intervals = CHORD_INTERVALS.get(quality, CHORD_INTERVALS[""])
    return [root_semi + octave * 12 + interval for interval in intervals]


def note_name_to_midi(note: str) -> int | None:
    """Convert 'C4' → 60, 'F#3' → 42, 'Eb5' → 75."""
    note = note.strip()
    if len(note) < 2:
        return None
    if note[1] in "#b":
        root = note[:2]
        octave_str = note[2:]
    else:
        root = note[:1]
        octave_str = note[1:]
    root_semi = NOTE_TO_SEMITONE.get(root)
    if root_semi is None or not octave_str.isdigit():
        return None
    return root_semi + int(octave_str) * 12


def midi_to_note_name(midi: int) -> str:
    """Convert 60 → 'C4', 61 → 'C#4'."""
    note_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    octave = midi // 12 - 1
    note = note_names[midi % 12]
    return f"{note}{octave}"


def scale_notes(root: str, intervals: list[int], octaves: int = 2) -> list[int]:
    """Generate MIDI notes for a scale across multiple octaves."""
    root_semi = NOTE_TO_SEMITONE.get(root)
    if root_semi is None:
        return []
    notes = []
    for octave_offset in range(octaves):
        for interval in intervals:
            notes.append(root_semi + (3 + octave_offset) * 12 + interval)
    return notes
