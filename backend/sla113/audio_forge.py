"""SLA113 Audio Forge Engine - Sound Asset Generation"""
import os
import json
import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


SFX_TEMPLATES = {
    "sfx": {
        "category": "Cinematic Foley",
        "physical_modeling_parameters": {
            "material_density": "aged_carbon_steel",
            "mass_kg": 5000,
            "transient_sharpness": 0.95,
            "decay_tail_ms": 4500,
        },
        "pda_environmental_dsp": {
            "room_type": "subterranean_stone_chamber",
            "reverb_wet_mix": 0.65,
            "low_frequency_rumble_hz": 35,
        },
    },
    "ambience": {
        "category": "Environmental Soundscape",
        "physical_modeling_parameters": {
            "material_density": "organic_air",
            "mass_kg": 0,
            "transient_sharpness": 0.1,
            "decay_tail_ms": 12000,
        },
        "pda_environmental_dsp": {
            "room_type": "open_canyon",
            "reverb_wet_mix": 0.85,
            "low_frequency_rumble_hz": 20,
        },
    },
    "foley": {
        "category": "Cinematic Foley",
        "physical_modeling_parameters": {
            "material_density": "cloth_leather",
            "mass_kg": 2,
            "transient_sharpness": 0.7,
            "decay_tail_ms": 800,
        },
        "pda_environmental_dsp": {
            "room_type": "recording_studio",
            "reverb_wet_mix": 0.15,
            "low_frequency_rumble_hz": 50,
        },
    },
    "music_cues": {
        "category": "Dynamic Music Trigger",
        "physical_modeling_parameters": {
            "material_density": "orchestral_brass",
            "mass_kg": 50,
            "transient_sharpness": 0.6,
            "decay_tail_ms": 6000,
        },
        "pda_environmental_dsp": {
            "room_type": "concert_hall",
            "reverb_wet_mix": 0.55,
            "low_frequency_rumble_hz": 30,
        },
    },
    "stems": {
        "category": "Isolated Track Stem",
        "physical_modeling_parameters": {
            "material_density": "electric_wire",
            "mass_kg": 1,
            "transient_sharpness": 0.8,
            "decay_tail_ms": 3000,
        },
        "pda_environmental_dsp": {
            "room_type": "dry_studio",
            "reverb_wet_mix": 0.05,
            "low_frequency_rumble_hz": 40,
        },
    },
    "loops": {
        "category": "Seamless Loop",
        "physical_modeling_parameters": {
            "material_density": "synthetic_polymer",
            "mass_kg": 0.5,
            "transient_sharpness": 0.5,
            "decay_tail_ms": 2000,
        },
        "pda_environmental_dsp": {
            "room_type": "padded_room",
            "reverb_wet_mix": 0.25,
            "low_frequency_rumble_hz": 45,
        },
    },
}


async def generate_audio_asset(
    audio_type: str,
    title: str,
    game_type: str = "generic",
    custom_params: dict = None,
    engine: str = "FMOD",
):
    """Generate an audio asset specification with physical modeling parameters."""
    vertex_key = os.environ.get("VERTEX_AI_KEY")
    now = datetime.now(timezone.utc).isoformat()
    dna_tag = f"sfx_alpha_{uuid.uuid4().hex[:8]}"

    template = SFX_TEMPLATES.get(audio_type, SFX_TEMPLATES["sfx"])

    phys_params = {**template["physical_modeling_parameters"]}
    dsp_params = {**template["pda_environmental_dsp"]}
    if custom_params:
        if "physical_modeling_parameters" in custom_params:
            phys_params.update(custom_params["physical_modeling_parameters"])
        if "pda_environmental_dsp" in custom_params:
            dsp_params.update(custom_params["pda_environmental_dsp"])

    ai_enhancement = None
    if vertex_key:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage

            api_key = os.environ.get("EMERGENT_LLM_KEY")
            if api_key:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=f"audio-forge-{uuid.uuid4().hex[:6]}",
                    system_message=(
                        "You are an expert game audio engineer specializing in physical modeling synthesis "
                        "and environmental DSP for AAA game production. Output JSON only, no markdown."
                    ),
                )
                chat.with_model("openai", "gpt-4o-mini")

                prompt = (
                    "Generate optimized audio DSP parameters for a game sound effect. "
                    f"Title: {title}. Audio Type: {audio_type}. Game Genre: {game_type}. Engine: {engine}. "
                    f"Base Physical Params: {json.dumps(phys_params)}. Base DSP Params: {json.dumps(dsp_params)}. "
                    "Return JSON with eq_bands, compression, spatial, layering, fmod_event_path."
                )

                response = await chat.send_message(UserMessage(text=prompt))
                cleaned = response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                ai_enhancement = json.loads(cleaned)
        except Exception as e:
            logger.warning("AI audio enhancement failed (non-blocking): %s", e)
            ai_enhancement = None

    asset = {
        "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
        "sfx_metadata": {
            "title": title,
            "category": template["category"],
            "dna_tag_preview": dna_tag,
            "audio_type": audio_type,
            "game_type": game_type,
            "engine": engine,
        },
        "physical_modeling_parameters": phys_params,
        "pda_environmental_dsp": dsp_params,
        "ai_dsp_enhancement": ai_enhancement,
        "vertex_processed": vertex_key is not None,
        "status": "generated",
        "waveform_preview": _generate_waveform_data(audio_type),
        "duration_ms": _estimate_duration(audio_type, phys_params),
        "sample_rate": 48000,
        "bit_depth": 24,
        "channels": 2,
        "format": "wav",
        "created_at": now,
    }

    return asset


def _generate_waveform_data(audio_type: str) -> list:
    import random

    random.seed(hash(audio_type))
    length = 64
    if audio_type in ("ambience", "loops"):
        return [round(random.uniform(0.1, 0.4), 3) for _ in range(length)]
    if audio_type == "sfx":
        return [round(min(1.0, 0.9 * (0.95 ** i) + random.uniform(0, 0.1)), 3) for i in range(length)]
    if audio_type == "foley":
        return [round(random.uniform(0.05, 0.6), 3) for _ in range(length)]
    if audio_type == "music_cues":
        import math

        return [round(abs(math.sin(i * 0.2)) * 0.7 + random.uniform(0, 0.2), 3) for i in range(length)]
    return [round(random.uniform(0.1, 0.7), 3) for _ in range(length)]


def _estimate_duration(audio_type: str, phys_params: dict) -> int:
    base = {
        "sfx": 2000,
        "ambience": 30000,
        "foley": 1500,
        "music_cues": 8000,
        "stems": 15000,
        "loops": 8000,
        "tts": 5000,
        "voice_routing": 3000,
    }
    decay = phys_params.get("decay_tail_ms", 1000)
    return base.get(audio_type, 3000) + decay
