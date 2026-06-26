"""
Persona Registry — vocal character definitions for the Narrative Engine.

Persona dictates speaker, phrasing, voice profile, and emotional archetype.
PFA renders the performance; the Narrative Engine chooses who speaks.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Persona:
    name: str
    voice_profile: str
    emotional_profile: str
    phrasing: str
    archetype: str
    default_emotion: float = 0.5
    default_energy: float = 0.5
    performance_tags: list[str] = field(default_factory=list)
    rhyme_preference: str = "alternating"


PERSONAS: dict[str, Persona] = {
    "SANCHA_V1": Persona(
        name="SANCHA_V1",
        voice_profile="sancha",
        emotional_profile="siren",
        phrasing="slow",
        archetype="confession",
        default_emotion=0.7,
        default_energy=0.5,
        performance_tags=["adaptive_inhale", "emotional_crack", "vocal_fry"],
        rhyme_preference="alternating",
    ),
    "TOXICO_PRIME": Persona(
        name="TOXICO_PRIME",
        voice_profile="toxico",
        emotional_profile="aggressive",
        phrasing="interruptive",
        archetype="gaslighting",
        default_emotion=0.85,
        default_energy=0.8,
        performance_tags=["glottal_stop", "vocal_pressure", "bass_resonance"],
        rhyme_preference="coupled",
    ),
    "LYRICA_BASE": Persona(
        name="LYRICA_BASE",
        voice_profile="neutral",
        emotional_profile="balanced",
        phrasing="natural",
        archetype="protagonist",
        default_emotion=0.5,
        default_energy=0.5,
        performance_tags=["comp"],
        rhyme_preference="alternating",
    ),
    "ECHO_COLD": Persona(
        name="ECHO_COLD",
        voice_profile="ethereal",
        emotional_profile="distant",
        phrasing="sustained",
        archetype="observer",
        default_emotion=0.25,
        default_energy=0.3,
        performance_tags=["reverb_large", "delay_harmony", "air"],
        rhyme_preference="monorhyme",
    ),
}


def get_persona(name: str) -> Persona:
    return PERSONAS.get(name, PERSONAS["LYRICA_BASE"])
