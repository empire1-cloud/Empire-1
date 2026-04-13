import uuid
import json
import asyncio
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings

def _azure_client():

settings = get_settings()


class SonicForgeCore:
    """
    Sonic Forge — Vertex AI music composition engine (Azure removed).
    Kinetic Audio. SFX + Arcade Ambience + Soundscape layers.
    Generates detailed music/SFX specs and composition briefs
    that drive downstream audio synthesis.
    """

    SYSTEM_PROMPT = """You are SonicForge, an elite music and sound design AI for Southern Lyfestyle Arcade.
You generate detailed, production-ready audio composition briefs, SFX specs, and soundscape architectures.
Your outputs are structured JSON that drive audio synthesis pipelines.
Style DNA: G-Funk, Lowrider Soul, Chicano Rap, Barrio Trap, Corrido Tumbado, Aztec percussion.
Always output valid JSON."""

    async def generate(self, prompt: str, style: str = "g_funk", duration: int = 30) -> dict:
        import vertexai
        from vertexai.generative_models import GenerativeModel, Part
        job_id = str(uuid.uuid4())
        output_dir = Path("/var/sla/audio/music")
        output_dir.mkdir(parents=True, exist_ok=True)

        # Initialize Vertex AI
        vertexai.init(
            project=settings.GOOGLE_PROJECT_ID,
            location=settings.VERTEX_AI_LOCATION,
            credentials=None  # Uses GOOGLE_APPLICATION_CREDENTIALS env var
        )
        model = GenerativeModel(settings.VERTEX_AI_TEXT_MODEL)
        composition_prompt = f"""Generate a detailed audio composition brief for:
Prompt: {prompt}
Style: {style}
Duration: {duration} seconds

Return JSON with: bpm, key, time_signature, instruments[], layers[], mood, fx_chain[], mix_notes, Southern_canon_tags[], production_directives."""
        try:
            response = model.generate_content(
                [
                    Part.from_text(self.SYSTEM_PROMPT),
                    Part.from_text(composition_prompt)
                ],
                generation_config={"temperature": 0.85, "max_output_tokens": 1024},
                stream=False
            )
            brief = json.loads(response.text)
        except Exception as e:
            brief = {"error": str(e)}
        brief_path = output_dir / f"{job_id}_brief.json"
        brief_path.write_text(json.dumps(brief, indent=2))
        return {
            "job_id": job_id,
            "brief_path": str(brief_path),
            "prompt": prompt,
            "style": style,
            "duration": duration,
            "composition_brief": brief,
            "model": settings.VERTEX_AI_TEXT_MODEL,
            "provider": "vertex",
            "status": "brief_ready",
        }

    async def generate_sfx(self, scene: str, intensity: str = "medium") -> dict:
        import vertexai
        from vertexai.generative_models import GenerativeModel, Part
        job_id = str(uuid.uuid4())
        vertexai.init(
            project=settings.GOOGLE_PROJECT_ID,
            location=settings.VERTEX_AI_LOCATION,
            credentials=None
        )
        model = GenerativeModel(settings.VERTEX_AI_TEXT_MODEL)
        sfx_prompt = f"Generate SFX design spec for: {scene}. Intensity: {intensity}. Return JSON with: sfx_layers[], trigger_events[], spatial_mix, reverb_profile, arcade_zone."
        try:
            response = model.generate_content(
                [
                    Part.from_text(self.SYSTEM_PROMPT),
                    Part.from_text(sfx_prompt)
                ],
                generation_config={"temperature": 0.7, "max_output_tokens": 512},
                stream=False
            )
            spec = json.loads(response.text)
        except Exception as e:
            spec = {"error": str(e)}
        return {"job_id": job_id, "scene": scene, "sfx_spec": spec, "status": "spec_ready"}

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
        temp_path = f"/var/sla/audio/stems/{temp_id}_source.wav"
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        return await self.engine.separate(temp_path)

    async def get_status(self, job_id: str) -> dict:
        return await self.engine.get_status(job_id)

    async def generate(self, prompt: str, style: str, duration: int) -> dict:
        job_id = str(uuid.uuid4())
        output_path = f"/var/sla/audio/music/{job_id}.wav"

        # Placeholder file
        Path(output_path).touch()

        return {
            "job_id": job_id,
            "path": output_path,
            "prompt": prompt,
            "style": style,
            "duration": duration,
        }

    async def separate(self, file_path: str) -> dict:
        job_id = str(uuid.uuid4())
        stems_dir = f"/var/sla/audio/stems/{job_id}"
        Path(stems_dir).mkdir(parents=True, exist_ok=True)

        # Placeholder stems
        stems = {
            "drums": f"{stems_dir}/drums.wav",
            "bass": f"{stems_dir}/bass.wav",
            "melody": f"{stems_dir}/melody.wav",
            "vocals": f"{stems_dir}/vocals.wav",
        }

        for p in stems.values():
            Path(p).touch()

        return {
            "job_id": job_id,
            "stems": stems,
        }

    async def get_status(self, job_id: str) -> dict:
        # Placeholder status
        return {
            "job_id": job_id,
            "status": "completed",
        }


# ---------------------------------------------------------
# PUBLIC SERVICE WRAPPER
# ---------------------------------------------------------
class SonicForge:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = SonicForgeCore()

        # Ensure canonical directories exist
        Path("/var/sla/audio/music").mkdir(parents=True, exist_ok=True)
        Path("/var/sla/audio/stems").mkdir(parents=True, exist_ok=True)

    # -----------------------------------------------------
    # MUSIC GENERATION
    # -----------------------------------------------------
    async def generate(self, prompt: str, style: str, duration: int) -> dict:
        return await self.engine.generate(prompt, style, duration)

    # -----------------------------------------------------
    # STEM SEPARATION
    # -----------------------------------------------------
    async def separate(self, file) -> dict:
        temp_id = str(uuid.uuid4())
        temp_path = f"/var/sla/audio/music/{temp_id}_temp.wav"

        # Save uploaded file
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        return await self.engine.separate(temp_path)

    # -----------------------------------------------------
    # JOB STATUS
    # -----------------------------------------------------
    async def get_status(self, job_id: str) -> dict:
        return await self.engine.get_status(job_id)
