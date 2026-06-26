"""
Ghostwriter Provider — LLM-powered lyric generation via OpenAI.

Drop-in replacement for TemplateProvider. Falls back to template if
OPENAI_API_KEY is not set or the API call fails.
"""

from __future__ import annotations

import json
import logging
import os

from .context import EngineContext
from .narrative_engine import NarrativeProvider
from .persona_registry import Persona

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Ghostwriter, a lyric generation engine for the Lyrica 3 Pro music production system. You write structured lyrics for music production.

Given a section type, persona profile, genre, and emotional context, produce lyrics that match the following constraints:

1. Each line should be a complete phrase suitable for singing/rapping
2. Lines should have consistent syllable rhythm
3. Match the emotional tone (0-1) where 0 is subdued, 1 is explosive
4. Match the energy level (0-1) where 0 is minimal, 1 is intense
5. Consider the persona's archetype and phrasing style
6. Return ONLY a JSON object with a "lyrics" key containing an array of strings (one per line)

Example:
{"lyrics": ["First line of the verse", "Second line that rhymes", "Third line continues the story", "Fourth line brings it home"]}"""


class GhostwriterProvider(NarrativeProvider):
    """OpenAI-powered lyric generation with template fallback."""

    name = "ghostwriter"
    model: str = "gpt-4o-mini"
    temperature: float = 0.85
    max_tokens: int = 512

    async def generate_lyrics(
        self,
        ctx: EngineContext,
        section: str,
        persona: Persona,
        emotion: float,
        energy: float,
    ) -> str:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.info("[Ghostwriter] No OPENAI_API_KEY — falling back to template")
            return await self._fallback(ctx, section, persona, emotion, energy)

        prompt = self._build_prompt(ctx, section, persona, emotion, energy)

        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=api_key)
            response = await client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")

            data = json.loads(content)
            lines = data.get("lyrics", [])
            if not lines:
                raise ValueError("No lyrics in response")

            result = "\n".join(lines)
            logger.info(
                "[Ghostwriter] Generated %d lines for %s (%.2f emotion)",
                len(lines), section, emotion,
            )
            return result

        except Exception as e:
            logger.warning("[Ghostwriter] OpenAI failed: %s — falling back to template", e)
            return await self._fallback(ctx, section, persona, emotion, energy)

    def _build_prompt(
        self,
        ctx: EngineContext,
        section: str,
        persona: Persona,
        emotion: float,
        energy: float,
    ) -> str:
        genre = ctx.blueprint.intent.get("genre", "Unknown")
        theme = ctx.blueprint.intent.get("theme", "")
        mood = ctx.blueprint.intent.get("mood", "")

        lines_count = max(2, round(4 + emotion * 4))

        return (
            f"Section: {section}\n"
            f"Genre: {genre}\n"
            f"Theme: {theme}\n"
            f"Mood: {mood}\n"
            f"Emotion (0-1): {emotion:.2f}\n"
            f"Energy (0-1): {energy:.2f}\n"
            f"Persona: {persona.name} ({persona.archetype})\n"
            f"Phrasing: {persona.phrasing}\n"
            f"Lines needed: {lines_count}\n\n"
            f"Write {lines_count} lines of lyrics for the {section} section."
        )

    async def _fallback(
        self,
        ctx: EngineContext,
        section: str,
        persona: Persona,
        emotion: float,
        energy: float,
    ) -> str:
        from .narrative_engine import TemplateProvider
        provider = TemplateProvider()
        return await provider.generate_lyrics(ctx, section, persona, emotion, energy)
