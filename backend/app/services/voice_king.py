import uuid
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import get_settings

settings = get_settings()

# Azure TTS voice map — Bio-Digital Signal identity
VOICE_MAP = {
    "default":       "alloy",
    "narrator":      "onyx",
    "female":        "nova",
    "character":     "echo",
    "announcer":     "fable",
    "southern":      "shimmer",
}


def _azure_client():
    from openai import AzureOpenAI
    return AzureOpenAI(
        api_key=settings.AZURE_OPENAI_KEY,
        azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )


class VoiceKingCore:
    """
    Voice King — Azure OpenAI TTS-HD.
    Bio-Digital Signal. High-end Vocal Synthesis.
    Character dialogue and Narrator protocols.
    """

    async def generate(self, text: str, voice_id: str = "default") -> dict:
        audio_id = str(uuid.uuid4())
        output_dir = Path("/var/sla/audio/voices")
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{audio_id}.mp3"

        voice = VOICE_MAP.get(voice_id, "alloy")
        client = _azure_client()

        response = client.audio.speech.create(
            model=settings.AZURE_TTS_DEPLOYMENT,
            voice=voice,
            input=text,
        )
        response.stream_to_file(str(output_path))

        return {
            "audio_id": audio_id,
            "path": str(output_path),
            "voice": voice,
            "voice_id": voice_id,
            "characters": len(text),
            "model": "tts-hd",
            "provider": "azure",
        }

    async def list_voices(self) -> list:
        return [
            {"id": k, "name": k.title(), "azure_voice": v}
            for k, v in VOICE_MAP.items()
        ]

    async def clone(self, file_path: str, voice_name: str) -> dict:
        """
        Azure TTS does not support voice cloning natively.
        Stores the reference audio and maps to closest voice profile.
        """
        voice_id = f"custom_{voice_name}_{uuid.uuid4().hex[:8]}"
        meta_path = Path(f"/var/sla/audio/voices/{voice_id}.json")
        import json
        meta_path.write_text(json.dumps({
            "voice_id": voice_id,
            "name": voice_name,
            "source_file": file_path,
            "mapped_voice": "shimmer",
            "status": "registered",
        }))
        return {"voice_id": voice_id, "name": voice_name, "status": "registered"}


class VoiceKing:
    """Public service wrapper used by FastAPI routers."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = VoiceKingCore()
        Path("/var/sla/audio/voices").mkdir(parents=True, exist_ok=True)

    async def generate(self, text: str, voice_id: str = "default") -> dict:
        return await self.engine.generate(text, voice_id)

    async def clone(self, file, voice_name: str) -> dict:
        temp_id = str(uuid.uuid4())
        temp_path = f"/var/sla/audio/voices/{temp_id}_ref.wav"
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        return await self.engine.clone(temp_path, voice_name)

    async def list_voices(self) -> list:
        return await self.engine.list_voices()

    async def generate(self, text: str, voice_id: str) -> str:
        audio_id = str(uuid.uuid4())
        output_path = f"/var/sla/audio/voices/{audio_id}.wav"

        # Placeholder file
        Path(output_path).touch()

        return output_path

    async def clone(self, file_path: str, voice_name: str) -> str:
        voice_id = f"{voice_name}-{uuid.uuid4()}"
        output_path = f"/var/sla/audio/voices/{voice_id}.json"

        # Placeholder file representing cloned voice metadata
        Path(output_path).touch()

        return voice_id

    async def list_voices(self) -> list:
        # Placeholder voice list
        return [
            {"id": "default", "name": "Default Voice"},
        ]


# ---------------------------------------------------------
# PUBLIC SERVICE WRAPPER
# ---------------------------------------------------------
class VoiceKing:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.engine = VoiceKingCore()

        # Ensure canonical directories exist
        Path("/var/sla/audio/voices").mkdir(parents=True, exist_ok=True)

    # -----------------------------------------------------
    # TEXT → SPEECH
    # -----------------------------------------------------
    async def generate(self, text: str, voice_id: str = "default") -> str:
        return await self.engine.generate(text, voice_id)

    # -----------------------------------------------------
    # VOICE CLONING
    # -----------------------------------------------------
    async def clone(self, file, voice_name: str) -> str:
        temp_id = str(uuid.uuid4())
        temp_path = f"/var/sla/audio/voices/{temp_id}_temp.wav"

        # Save uploaded file
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        return await self.engine.clone(temp_path, voice_name)

    # -----------------------------------------------------
    # LIST VOICES
    # -----------------------------------------------------
    async def list_voices(self) -> list:
        return await self.engine.list_voices()
