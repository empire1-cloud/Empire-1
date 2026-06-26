"""
Preset Manager — centralized style configuration for the entire pipeline.

Every engine reads from the same preset, ensuring consistent production
choices across harmony, drums, bass, pads, mix, and master.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Preset:
    name: str
    genre: str
    mood: str
    key: str
    scale: list[str]
    mode: str

    chords: dict[str, list[str]] = field(default_factory=dict)
    drum_kit: dict[str, Any] = field(default_factory=dict)
    bass_profile: dict[str, Any] = field(default_factory=dict)
    pad_profile: dict[str, Any] = field(default_factory=dict)
    mix: dict[str, Any] = field(default_factory=dict)
    master: dict[str, Any] = field(default_factory=dict)


SCALES: dict[str, tuple[str, list[str]]] = {
    "Ebm": ("minor", ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db", "Eb"]),
    "Cmin": ("minor", ["C", "D", "Eb", "F", "G", "Ab", "Bb", "C"]),
    "Dmin": ("minor", ["D", "E", "F", "G", "A", "Bb", "C", "D"]),
    "G": ("major", ["G", "A", "B", "C", "D", "E", "F#", "G"]),
    "Ab": ("major", ["Ab", "Bb", "C", "Db", "Eb", "F", "G", "Ab"]),
    "Fmin": ("minor", ["F", "G", "Ab", "Bb", "C", "Db", "Eb", "F"]),
}


PRESETS: dict[str, Preset] = {
    "g_funk": Preset(
        name="g_funk", genre="West Coast G-Funk", mood="Laid-back smooth",
        key="Ebm", scale=SCALES["Ebm"][1], mode=SCALES["Ebm"][0],
        chords={
            "default": ["Ebm", "Abm", "Db", "Gb"],
            "verse": ["Ebm", "Db", "Abm", "Gb"],
            "chorus": ["Gb", "Db", "Ebm", "Abm"],
            "bridge": ["Bbm", "Gb", "Db", "Abm"],
            "intro": ["Ebm", "Abm"],
            "outro": ["Ebm", "Db", "Gb"],
        },
        drum_kit={
            "kick": {"pattern": "classic", "velocity": 100, "swing": 0.15},
            "snare": {"pattern": "backbeat", "velocity": 90, "swing": 0.10},
            "hihat": {"pattern": "16th_swing", "velocity": 70, "swing": 0.20},
            "rimshot": {"pattern": "ghost", "velocity": 50, "swing": 0.15},
            "crash": {"pattern": "section_ends", "velocity": 95},
        },
        bass_profile={
            "pattern": "syncopated_eighth", "octave": 2,
            "rhythm": "funk", "articulation": "bounced",
        },
        pad_profile={
            "type": "analog_warm", "density": 0.6, "filter": "lowpass_24db",
            "modulation": "lfo_slow", "reverb": "hall",
        },
        mix={"kick_db": -3, "snare_db": -5, "bass_db": -2, "pad_db": -8,
             "vox_db": -1, "master_gain_db": -1, "comp_ratio": 2.5},
        master={"lufs_target": -14.0, "true_peak": -1.0, "limiter": "standard"},
    ),
    "trap": Preset(
        name="trap", genre="Modern Trap", mood="Aggressive hype",
        key="Cmin", scale=SCALES["Cmin"][1], mode=SCALES["Cmin"][0],
        chords={
            "default": ["Cm", "Ab", "Eb", "Fm"],
            "verse": ["Cm", "Fm", "Ab", "Eb"],
            "chorus": ["Ab", "Eb", "Fm", "Cm"],
            "bridge": ["G", "Ab", "Eb", "Fm"],
            "intro": ["Cm", "Ab"],
            "outro": ["Cm", "Fm", "Ab"],
        },
        drum_kit={
            "kick": {"pattern": "808_roll", "velocity": 105, "swing": 0.05},
            "snare": {"pattern": "trap_clap", "velocity": 95, "swing": 0.05},
            "hihat": {"pattern": "triplet_16th", "velocity": 65, "swing": 0.08},
            "crash": {"pattern": "section_starts", "velocity": 100},
            "rimshot": {"pattern": "sparse", "velocity": 55},
        },
        bass_profile={
            "pattern": "808_legato", "octave": 1,
            "rhythm": "half_note", "articulation": "sustained",
        },
        pad_profile={
            "type": "digital_air", "density": 0.4, "filter": "bandpass",
            "modulation": "lfo_fast", "reverb": "plate",
        },
        mix={"kick_db": -2, "snare_db": -4, "bass_db": -1, "pad_db": -10,
             "vox_db": -2, "master_gain_db": -0.5, "comp_ratio": 3.0},
        master={"lufs_target": -12.0, "true_peak": -0.5, "limiter": "aggressive"},
    ),
    "boom_bap": Preset(
        name="boom_bap", genre="Classic Boom Bap", mood="Raw storytelling",
        key="Dmin", scale=SCALES["Dmin"][1], mode=SCALES["Dmin"][0],
        chords={
            "default": ["Dm", "Gm", "C", "F"],
            "verse": ["Dm", "Bb", "F", "C"],
            "chorus": ["F", "C", "Dm", "Bb"],
            "bridge": ["Gm", "Bb", "F", "C"],
            "intro": ["Dm", "Gm"],
            "outro": ["Dm", "C", "Bb"],
        },
        drum_kit={
            "kick": {"pattern": "hard_boom", "velocity": 105, "swing": 0.12},
            "snare": {"pattern": "crack_bap", "velocity": 100, "swing": 0.10},
            "hihat": {"pattern": "8th_swing", "velocity": 65, "swing": 0.18},
            "rimshot": {"pattern": "ghost", "velocity": 45, "swing": 0.15},
        },
        bass_profile={
            "pattern": "walking_eighth", "octave": 2,
            "rhythm": "syncopated", "articulation": "plucked",
        },
        pad_profile={
            "type": "vintage_keys", "density": 0.5, "filter": "lowpass_12db",
            "modulation": "tremolo_slow", "reverb": "spring",
        },
        mix={"kick_db": -4, "snare_db": -3, "bass_db": -3, "pad_db": -9,
             "vox_db": -1, "master_gain_db": -1.5, "comp_ratio": 2.0},
        master={"lufs_target": -14.0, "true_peak": -1.0, "limiter": "standard"},
    ),
    "corrido": Preset(
        name="corrido", genre="Corrido Tumbado", mood="Narrative storytelling",
        key="G", scale=SCALES["G"][1], mode=SCALES["G"][0],
        chords={
            "default": ["G", "C", "D", "Em"],
            "verse": ["G", "D", "Em", "C"],
            "chorus": ["C", "G", "D", "Em"],
            "bridge": ["Am", "C", "G", "D"],
            "intro": ["G", "C", "D"],
            "outro": ["G", "D", "C", "G"],
        },
        drum_kit={
            "kick": {"pattern": "banda", "velocity": 95, "swing": 0.05},
            "snare": {"pattern": "tarola", "velocity": 90, "swing": 0.05},
            "hihat": {"pattern": "8th_straight", "velocity": 60},
            "rimshot": {"pattern": "accent", "velocity": 80},
        },
        bass_profile={
            "pattern": "tuba_root", "octave": 2,
            "rhythm": "quarter", "articulation": "pizzicato",
        },
        pad_profile={
            "type": "accordion_sim", "density": 0.5, "filter": "bandpass",
            "modulation": "none", "reverb": "chamber",
        },
        mix={"kick_db": -3, "snare_db": -4, "bass_db": -2, "pad_db": -7,
             "vox_db": -1, "master_gain_db": -1, "comp_ratio": 2.0},
        master={"lufs_target": -13.0, "true_peak": -1.0, "limiter": "standard"},
    ),
    "melodic": Preset(
        name="melodic", genre="Melodic Rap/R&B", mood="Emotional vulnerable",
        key="Ab", scale=SCALES["Ab"][1], mode=SCALES["Ab"][0],
        chords={
            "default": ["Ab", "Fm", "Db", "Eb"],
            "verse": ["Ab", "Db", "Fm", "Eb"],
            "chorus": ["Db", "Eb", "Ab", "Fm"],
            "bridge": ["Bbm", "Db", "Ab", "Eb"],
            "pre_chorus": ["Fm", "Db", "Eb", "Ab"],
            "intro": ["Ab", "Fm"],
            "outro": ["Ab", "Db", "Eb", "Ab"],
        },
        drum_kit={
            "kick": {"pattern": "trap_lite", "velocity": 90, "swing": 0.10},
            "snare": {"pattern": "soft_clap", "velocity": 80, "swing": 0.08},
            "hihat": {"pattern": "16th_shuffle", "velocity": 55, "swing": 0.15},
            "rimshot": {"pattern": "sparse", "velocity": 40},
        },
        bass_profile={
            "pattern": "sub_sustained", "octave": 1,
            "rhythm": "half_notes", "articulation": "legato",
        },
        pad_profile={
            "type": "synth_strings", "density": 0.7, "filter": "lowpass_24db",
            "modulation": "lfo_slow", "reverb": "hall_large",
        },
        mix={"kick_db": -4, "snare_db": -6, "bass_db": -2, "pad_db": -6,
             "vox_db": -1, "master_gain_db": -1, "comp_ratio": 2.5},
        master={"lufs_target": -13.0, "true_peak": -1.0, "limiter": "standard"},
    ),
    "west_coast": Preset(
        name="west_coast", genre="West Coast Soul", mood="Reflective late-night",
        key="Fmin", scale=SCALES["Fmin"][1], mode=SCALES["Fmin"][0],
        chords={
            "default": ["Fm", "Bbm", "Eb", "Ab"],
            "verse": ["Fm", "Ab", "Eb", "Bbm"],
            "chorus": ["Ab", "Eb", "Fm", "Db"],
            "bridge": ["C", "Fm", "Eb", "Ab"],
            "intro": ["Fm", "Bbm"],
            "outro": ["Fm", "Eb", "Ab", "Fm"],
        },
        drum_kit={
            "kick": {"pattern": "classic", "velocity": 95, "swing": 0.15},
            "snare": {"pattern": "backbeat", "velocity": 85, "swing": 0.12},
            "hihat": {"pattern": "16th_swing", "velocity": 60, "swing": 0.18},
            "rimshot": {"pattern": "ghost", "velocity": 45, "swing": 0.12},
        },
        bass_profile={
            "pattern": "syncopated_eighth", "octave": 2,
            "rhythm": "funk", "articulation": "bounced",
        },
        pad_profile={
            "type": "analog_warm", "density": 0.65, "filter": "lowpass_24db",
            "modulation": "lfo_slow", "reverb": "hall",
        },
        mix={"kick_db": -3, "snare_db": -5, "bass_db": -2, "pad_db": -8,
             "vox_db": -1, "master_gain_db": -1, "comp_ratio": 2.5},
        master={"lufs_target": -14.0, "true_peak": -1.0, "limiter": "standard"},
    ),
}


def load_preset(style: str) -> Preset:
    return PRESETS.get(style, PRESETS["west_coast"])
