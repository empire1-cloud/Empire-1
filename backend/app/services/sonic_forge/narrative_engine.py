"""
Narrative Engine — Arrangement + Emotion Bus → Narrative Segments.

Ghostwriter (LLM) is one provider inside this engine. Template provider
is the sovereign default. No audio, no melody — just performance intent.
"""

from __future__ import annotations

import uuid
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .persona_registry import Persona, get_persona
from .emotion_bus import EmotionBus

logger = logging.getLogger(__name__)


@dataclass
class NarrativeSegment:
    id: str = ""
    section: str = ""
    speaker: str = "LYRICA_BASE"
    intent: str = ""
    emotion: float = 0.5
    energy: float = 0.5
    syllables: list[int] = field(default_factory=list)
    rhyme_scheme: str = "alternating"
    lyrics: str = ""
    performance_tags: list[str] = field(default_factory=list)


# ── Providers ────────────────────────────────────────────────────────────────

class NarrativeProvider(ABC):
    """Plug in Ghostwriter (LLM), human upload, co-write, rewrite, etc."""

    name: str = ""

    @abstractmethod
    async def generate_lyrics(
        self,
        ctx: EngineContext,
        section: str,
        persona: Persona,
        emotion: float,
        energy: float,
    ) -> str: ...


class TemplateProvider(NarrativeProvider):
    """Hardcoded lyric templates per section type. No API calls."""

    name = "template"

    SECTION_TEMPLATES: dict[str, list[str]] = {
        "intro": [
            "The night pulls us under",
            "Shadows move like thunder",
            "I feel the weight of silence",
        ],
        "verse_1": [
            "I've been walking these streets alone",
            "Every corner holds a memory I can't let go",
            "The city lights don't shine like they used to do",
            "Since the day that I lost you",
        ],
        "verse_2": [
            "Now I'm standing at the edge again",
            "Counting all the ways that I could begin",
            "The echo of your voice in the rain",
            "Whispering that nothing stays the same",
        ],
        "verse_3": [
            "The cracks in the pavement tell stories old",
            "Of promises broken and hearts that sold",
            "But I'm still here burning through the night",
            "Looking for a fragment of light",
        ],
        "chorus": [
            "And I rise, rise through the fire",
            "Burning brighter than the stars above",
            "I survive, every scar and every lie",
            "Nothing's gonna break what I'm made of",
        ],
        "bridge": [
            "Maybe time will heal the wounds we made",
            "Maybe love is just a game we played",
            "But in the silence of the fading day",
            "I find the strength to walk away",
        ],
        "pre_chorus": [
            "Can you feel it building up inside",
            "The tension's breaking, no place to hide",
        ],
        "hook": [
            "We go hard, we go loud",
            "Standing tall above the crowd",
        ],
        "outro": [
            "The night fades to gray",
            "I found my way",
            "The end is just another start",
        ],
    }

    async def generate_lyrics(
        self,
        ctx: EngineContext,
        section: str,
        persona: Persona,
        emotion: float,
        energy: float,
    ) -> str:
        templates = self.SECTION_TEMPLATES.get(section, self.SECTION_TEMPLATES["verse_1"])
        # Fold emotion into line count for emotional sections
        line_count = max(2, round(4 + emotion * 4))
        lines = [templates[i % len(templates)] for i in range(line_count)]
        return "\n".join(lines)


_CURRENT_PROVIDER: NarrativeProvider = TemplateProvider()


def set_narrative_provider(provider: NarrativeProvider) -> None:
    global _CURRENT_PROVIDER
    _CURRENT_PROVIDER = provider
    logger.info("[Narrative] Provider set to: %s", provider.name)


# ── Section intent mapping ──────────────────────────────────────────────────

SECTION_INTENT: dict[str, str] = {
    "intro": "Establish atmosphere and emotional tone",
    "verse_1": "Introduce the story and central conflict",
    "verse_2": "Deepen the narrative and escalate stakes",
    "verse_3": "Climax of the story arc",
    "chorus": "Emotional release — repeated core message",
    "bridge": "Reflection and tonal shift",
    "pre_chorus": "Build tension into the chorus",
    "hook": "Memorable repeated phrase",
    "outro": "Resolution and fade",
}


# ── Engine ───────────────────────────────────────────────────────────────────

@register_engine
class NarrativeEngine(BaseEngine):
    """Arrangement + Emotion Bus + Persona → Narrative Segments."""

    name = "narrative"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        emotion_bus = EmotionBus.from_timeline(ctx.timeline)
        ctx.emotion_bus = emotion_bus

        segments: list[NarrativeSegment] = []

        for i, t_entry in enumerate(ctx.timeline.entries):
            section_name = t_entry.section
            sec_emotion = emotion_bus.get_section(section_name)
            emotion = sec_emotion.emotion if sec_emotion else 0.5
            energy = sec_emotion.energy if sec_emotion else 0.5

            persona_name = _pick_persona(ctx, section_name, emotion)
            persona = get_persona(persona_name)

            lyrics = await _CURRENT_PROVIDER.generate_lyrics(
                ctx, section_name, persona, emotion, energy,
            )

            segment = NarrativeSegment(
                id=str(uuid.uuid4()),
                section=section_name,
                speaker=persona.name,
                intent=SECTION_INTENT.get(section_name, "Continue narrative"),
                emotion=round(emotion, 3),
                energy=round(energy, 3),
                syllables=_estimate_syllables(lyrics),
                rhyme_scheme=persona.rhyme_preference,
                lyrics=lyrics,
                performance_tags=_build_performance_tags(persona, emotion, section_name),
            )
            segments.append(segment)

            logger.debug(
                "[Narrative] %s | %s | emotion=%.2f energy=%.2f",
                section_name, persona.name, segment.emotion, segment.energy,
            )

        ctx.narrative_segments = segments
        logger.info(
            "[Narrative] %d segments across %d sections",
            len(segments), ctx.blueprint.structure,
        )

        return ctx


def _pick_persona(ctx: EngineContext, section: str, emotion: float) -> str:
    """Choose persona based on section type and emotion."""
    if section == "intro" or section == "outro":
        return "ECHO_COLD"
    if section == "bridge":
        return "ECHO_COLD" if emotion < 0.5 else "SANCHA_V1"
    if emotion > 0.75:
        return "TOXICO_PRIME"
    if emotion > 0.45:
        return "SANCHA_V1"
    return "LYRICA_BASE"


def _estimate_syllables(lyrics: str) -> list[int]:
    """Rough syllable count per line (vowel-group heuristic)."""
    lines = lyrics.strip().split("\n")
    counts = []
    for line in lines:
        words = line.split()
        count = 0
        for word in words:
            vowels = sum(1 for c in word.lower() if c in "aeiou")
            count += max(1, vowels)
        counts.append(count)
    return counts


def _build_performance_tags(persona: Persona, emotion: float, section: str) -> list[str]:
    """Merge persona defaults with emotion-driven performance tags."""
    tags = list(persona.performance_tags)
    if emotion > 0.75:
        tags.extend(["power", "belt"])
    elif emotion > 0.5:
        tags.extend(["chest"])
    elif emotion < 0.3:
        tags.extend(["breathy", "intimate"])
    if section == "bridge":
        tags.append("falsetto")
    if section == "outro":
        tags.append("fade")
    return list(dict.fromkeys(tags))  # deduplicate, preserve order
