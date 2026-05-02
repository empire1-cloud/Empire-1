from typing import Optional, Dict, Any, List
from pydantic import BaseModel


# ========================================================
# UI MODULE SCHEMAS
# ========================================================
class UIModuleMetadata(BaseModel):
    id: str
    name: str
    module_type: str  # "visual" | "audio"
    consumes_tags: List[str]
    outputs: Dict[str, Any]


# ========================================================
# VISUAL MODULES
# ========================================================
VISUAL_MODULES = {
    "g_funk_ui": UIModuleMetadata(
        id="g_funk_ui",
        name="G-Funk UI Generator",
        module_type="visual",
        consumes_tags=["style_tags", "theme_tags", "world_tags", "symbol_tags", "identity_tags"],
        outputs={
            "ui_components": ["badge", "card", "button", "modal", "hero"],
            "fonts": ["Syne", "Inter", "Space Grotesk"],
            "colors": ["#D4AF37", "#1A0B2E", "#F5E6D3"],
        },
    ),
    "arcade_os_ui": UIModuleMetadata(
        id="arcade_os_ui",
        name="Arcade OS UI",
        module_type="visual",
        consumes_tags=["style_tags", "theme_tags", "world_tags", "character_tags"],
        outputs={
            "ui_screens": ["title", "gameplay", "inventory", "settings"],
            "layout": "arcade_vertical",
        },
    ),
    "operator_console_ui": UIModuleMetadata(
        id="operator_console_ui",
        name="Operator Console UI",
        module_type="visual",
        consumes_tags=["style_tags", "world_tags", "progression_tags"],
        outputs={
            "ui_screens": ["dashboard", "engines", "tenants", "billing"],
            "layout": "console_dashboard",
        },
    ),
    "universe_console_ui": UIModuleMetadata(
        id="universe_console_ui",
        name="Universe Console UI",
        module_type="visual",
        consumes_tags=["style_tags", "theme_tags", "world_tags"],
        outputs={
            "ui_screens": ["canon_editor", "registry", "pipeline_inspector"],
            "layout": "universe_map",
        },
    ),
    "tenant_ui": UIModuleMetadata(
        id="tenant_ui",
        name="Tenant UI",
        module_type="visual",
        consumes_tags=["theme_tags", "world_tags", "reward_tags"],
        outputs={
            "ui_screens": ["profile", "workspace", "billing"],
            "layout": "saas_dashboard",
        },
    ),
}


# ========================================================
# AUDIO MODULES
# ========================================================
AUDIO_MODULES = {
    "audioking": UIModuleMetadata(
        id="audioking",
        name="AudioKing (SFX + Ambience)",
        module_type="audio",
        consumes_tags=["music_tags", "emotion_tags", "theme_tags", "scene_description", "intensity"],
        outputs={
            "audio_types": ["sfx", "ambience", "foley"],
            "formats": ["wav", "mp3"],
        },
    ),
    "voiceking": UIModuleMetadata(
        id="voiceking",
        name="VoiceKing (TTS + Voice Routing)",
        module_type="audio",
        consumes_tags=["music_tags", "emotion_tags", "theme_tags", "character_tags"],
        outputs={
            "voice_types": ["tts", "vo", "narrative"],
            "accents": ["southern", "neutral", "latino"],
        },
    ),
    "sonicforge": UIModuleMetadata(
        id="sonicforge",
        name="SonicForge (Music Cues + Stems)",
        module_type="audio",
        consumes_tags=["music_tags", "emotion_tags", "theme_tags", "scene_description"],
        outputs={
            "audio_types": ["music_cue", "stem", "loop"],
            "formats": ["wav", "mp3", "stem_4"],
        },
    ),
}


# ========================================================
# COMBINED MODULES
# ========================================================
ALL_OS_MODULES = {**VISUAL_MODULES, **AUDIO_MODULES}


# ========================================================
# HELPER FUNCTIONS
# ========================================================
def get_module(module_id: str) -> Optional[UIModuleMetadata]:
    return ALL_OS_MODULES.get(module_id)


def list_modules(module_type: Optional[str] = None) -> List[UIModuleMetadata]:
    if module_type:
        return [m for m in ALL_OS_MODULES.values() if m.module_type == module_type]
    return list(ALL_OS_MODULES.values())
