import json
import os
import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings

settings = get_settings()


class SonicForgeCore:
    """
    Sonic Forge — Sovereign music composition engine.
    Generates composition briefs locally by default (no API needed).
    Falls back to OpenAI then Vertex AI only if configured.
    """

    SYSTEM_PROMPT = """You are SonicForge, an elite music and sound design AI for Southern Lyfestyle Arcade.
You generate detailed, production-ready audio composition briefs, SFX specs, and soundscape architectures.
Your outputs are structured JSON that drive audio synthesis pipelines.
Style DNA: G-Funk, Lowrider Soul, Chicano Rap, Barrio Trap, Corrido Tumbado, Aztec percussion.
Always output valid JSON."""

    COMPOSITION_PROMPT_TEMPLATE = """Generate a detailed audio composition brief for:
Prompt: {prompt}
Style: {style}
Duration: {duration} seconds

Return JSON with: bpm, key, time_signature, instruments[], layers[], mood, fx_chain[], mix_notes, Southern_canon_tags[], production_directives."""

    SFX_PROMPT_TEMPLATE = "Generate SFX design spec for: {scene}. Intensity: {intensity}. Return JSON with: sfx_layers[], trigger_events[], spatial_mix, reverb_profile, arcade_zone."

    async def _call_vertex(self, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.85) -> str | None:
        try:
            import vertexai
            from vertexai.generative_models import GenerativeModel, Part

            vertexai.init(
                project=settings.GOOGLE_PROJECT_ID,
                location=settings.VERTEX_AI_LOCATION,
                credentials=None,
            )
            model = GenerativeModel(settings.VERTEX_AI_TEXT_MODEL)
            response = model.generate_content(
                [Part.from_text(self.SYSTEM_PROMPT), Part.from_text(user_prompt)],
                generation_config={"temperature": temperature, "max_output_tokens": max_tokens},
                stream=False,
            )
            return response.text
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Vertex AI call failed: {e}")
            return None

    async def _call_openai(self, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.85) -> str | None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            return None
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=key)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=temperature,
                response_format={"type": "json_object"},
            )
            return response.choices[0].message.content
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"OpenAI call failed: {e}")
            return None

    @staticmethod
    def _generate_local_brief(prompt: str, style: str = "g_funk", duration: int = 30) -> dict:
        """Sovereign fallback — generates a composition brief locally without any API call."""
        style_profiles = {
            "g_funk": {"bpm": 100, "key": "Ebm", "time_signature": "4/4",
                "instruments": ["synth_bass", "wurlitzer", "funk_guitar", "talkbox", "808_drums"],
                "layers": ["intro", "verse", "chorus", "verse", "bridge", "chorus", "outro"],
                "mood": "laid_back_smooth", "fx_chain": ["tape_saturation", "spring_reverb", "phaser"],
                "production_directives": ["West Coast G-Funk bounce", "syncopated bass line", "clean verse vocal, harmonized hook"]},
            "trap": {"bpm": 140, "key": "Cmin", "time_signature": "4/4",
                "instruments": ["808_bass", "hihat_rolls", "snare_trap", "synth_pluck", "vocal_chops"],
                "layers": ["intro", "hook", "verse", "hook", "verse", "bridge", "hook", "outro"],
                "mood": "aggressive_hype", "fx_chain": ["hard_limiter", "sidechain_compression", "stereo_spread"],
                "production_directives": ["Trap hi-hat rolls on every 16th", "heavy 808 slides", "call-and-response ad-libs"]},
            "boom_bap": {"bpm": 90, "key": "Dmin", "time_signature": "4/4",
                "instruments": ["acoustic_kick", "snare_rimshot", "jazz_piano", "double_bass", "scratch_turntable"],
                "layers": ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
                "mood": "raw_storytelling", "fx_chain": ["vinyl_crackle", "tube_saturation", "reverb_plate"],
                "production_directives": ["Boom-bap kick-snare pattern", "dusty sample aesthetic", "punchy drum transients"]},
            "corrido": {"bpm": 120, "key": "G", "time_signature": "3/4",
                "instruments": ["acoustic_guitar", "tuba", "accordion", "snare_drum", "vocal_harmony"],
                "layers": ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
                "mood": "narrative_storytelling", "fx_chain": ["room_reverb", "guitar_chorus", "vocal_delay"],
                "production_directives": ["3/4 waltz feel", "narrative verse structure", "regional Mexican authenticity"]},
            "melodic": {"bpm": 75, "key": "Ab", "time_signature": "4/4",
                "instruments": ["piano", "strings", "808_bass", "hihat", "snare"],
                "layers": ["intro", "verse", "pre_chorus", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
                "mood": "emotional_vulnerable", "fx_chain": ["vocal_verb", "piano_reverb", "tape_warmth"],
                "production_directives": ["Emotional vocal delivery", "build-up to chorus", "sparse intro, full arrangement outro"]},
        }
        profile = style_profiles.get(style, style_profiles["g_funk"])
        genre_tags = {"g_funk": "Southern California G-Funk", "trap": "Modern Trap",
            "boom_bap": "Classic Boom Bap", "corrido": "Corrido Tumbado", "melodic": "Melodic Rap/R&B"}

        return {
            "bpm": profile["bpm"],
            "key": profile["key"],
            "time_signature": profile["time_signature"],
            "instruments": profile["instruments"],
            "layers": profile["layers"],
            "mood": profile["mood"],
            "fx_chain": profile["fx_chain"],
            "mix_notes": f"Style: {genre_tags.get(style, style)}. {profile['production_directives'][0]}. "
                        f"Duration: {duration}s. Southern canon: Lowrider soul aesthetic, barrio-premium mix.",
            "Southern_canon_tags": [style, "lowrider_soul", "barrio_premium", "sovereign_generation"],
            "production_directives": profile["production_directives"],
            "prompt_interpretation": f"Local generator — prompt '{prompt[:60]}...' interpreted as {style} style",
        }

    async def _generate_brief(self, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.85) -> dict:
        import re
        style_match = re.search(r'Style:\s*(\S+)', user_prompt)
        style = style_match.group(1) if style_match else "g_funk"
        duration_match = re.search(r'Duration:\s*(\d+)', user_prompt)
        duration = int(duration_match.group(1)) if duration_match else 30
        prompt_match = re.search(r'Prompt:\s*(.+?)(?:\n|$)', user_prompt)
        prompt = prompt_match.group(1) if prompt_match else user_prompt

        brief = self._generate_local_brief(prompt, style, duration)
        provider = "sovereign_local"

        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            text = await self._call_openai(user_prompt, max_tokens, temperature)
            if text:
                try:
                    brief = json.loads(text)
                    provider = "openai"
                except (json.JSONDecodeError, TypeError):
                    pass

        return {**brief, "provider": provider}

    async def generate(self, prompt: str, style: str = "g_funk", duration: int = 30) -> dict:
        job_id = str(uuid.uuid4())
        output_dir = Path("/var/sla/audio/music")
        output_dir.mkdir(parents=True, exist_ok=True)

        composition_prompt = self.COMPOSITION_PROMPT_TEMPLATE.format(prompt=prompt, style=style, duration=duration)
        brief = await self._generate_brief(composition_prompt, max_tokens=1024, temperature=0.85)

        brief_path = output_dir / f"{job_id}_brief.json"
        brief_path.write_text(json.dumps(brief, indent=2))
        return {
            "job_id": job_id,
            "brief_path": str(brief_path),
            "prompt": prompt,
            "style": style,
            "duration": duration,
            "composition_brief": brief,
            "provider": brief.get("provider", "unknown"),
            "status": "brief_ready",
        }

    async def generate_sfx(self, scene: str, intensity: str = "medium") -> dict:
        job_id = str(uuid.uuid4())
        sfx_prompt = self.SFX_PROMPT_TEMPLATE.format(scene=scene, intensity=intensity)
        spec = await self._generate_brief(sfx_prompt, max_tokens=512, temperature=0.7)

        return {"job_id": job_id, "scene": scene, "sfx_spec": spec, "provider": spec.get("provider"), "status": "spec_ready"}

    async def separate(self, file_path: str) -> dict:
        job_id = str(uuid.uuid4())
        stems_dir = Path(f"/var/sla/audio/stems/{job_id}")
        stems_dir.mkdir(parents=True, exist_ok=True)
        return {
            "job_id": job_id,
            "source": file_path,
            "stems_dir": str(stems_dir),
            "status": "queued",
            "note": "Stem separation requires Demucs — submit to audio processing queue",
        }

    async def get_status(self, job_id: str) -> dict:
        brief_path = Path(f"/var/sla/audio/music/{job_id}_brief.json")
        return {
            "job_id": job_id,
            "status": "completed" if brief_path.exists() else "not_found",
            "brief_exists": brief_path.exists(),
        }


class SonicForge:
    """Public service wrapper used by FastAPI routers."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = SonicForgeCore()
        Path("/var/sla/audio/music").mkdir(parents=True, exist_ok=True)
        Path("/var/sla/audio/stems").mkdir(parents=True, exist_ok=True)

    async def generate(self, prompt: str, style: str = "g_funk", duration: int = 30) -> dict:
        return await self.engine.generate(prompt, style, duration)

    async def generate_sfx(self, scene: str, intensity: str = "medium") -> dict:
        return await self.engine.generate_sfx(scene, intensity)

    async def separate(self, file) -> dict:
        temp_id = str(uuid.uuid4())
        temp_path = f"/var/sla/audio/music/{temp_id}_temp.wav"
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        return await self.engine.separate(temp_path)

    async def get_status(self, job_id: str) -> dict:
        return await self.engine.get_status(job_id)
