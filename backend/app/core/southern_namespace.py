from typing import Optional
from pydantic import BaseModel


class EngineMetadata(BaseModel):
    id: str
    name: str
    credit_cost: int
    enabled_for: list[str]
    description: str
    status: str


# ========================================================
# SOUTHERN CREATIVE ENGINES (20 total)
# ========================================================
SOUTHERN_ENGINES = {
    # Vision Engines
    "vision_smith_mini": EngineMetadata(
        id="vision_smith_mini",
        name="VisionSmithMini",
        credit_cost=8,
        enabled_for=["Southern"],
        description="Southern-styled image generation with cultural aesthetics",
        status="active",
    ),
    "sonic_forge_mini": EngineMetadata(
        id="sonic_forge_mini",
        name="SonicForgeMini",
        credit_cost=12,
        enabled_for=["Southern"],
        description="Southern-styled music generation (trap, soul, g-funk)",
        status="active",
    ),
    "voice_king_mini": EngineMetadata(
        id="voice_king_mini",
        name="VoiceKingMini",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Southern voice synthesis with accent modeling",
        status="active",
    ),
    # Cultural Engines
    "slang_engine": EngineMetadata(
        id="slang_engine",
        name="SlangEngine",
        credit_cost=2,
        enabled_for=["Southern"],
        description="Generate cultural slang and terminology",
        status="active",
    ),
    "outfit_engine": EngineMetadata(
        id="outfit_engine",
        name="OutfitEngine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Generate outfit combinations for characters",
        status="active",
    ),
    "character_engine": EngineMetadata(
        id="character_engine",
        name="CharacterEngine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Character management and customization",
        status="active",
    ),
    "mode_engine": EngineMetadata(
        id="mode_engine",
        name="ModeEngine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Game mode configuration and presets",
        status="active",
    ),
    "theme_engine": EngineMetadata(
        id="theme_engine",
        name="ThemeEngine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Theme generation with Southern color palettes",
        status="active",
    ),
    "vibe_engine": EngineMetadata(
        id="vibe_engine",
        name="VibeEngine",
        credit_cost=2,
        enabled_for=["Southern"],
        description="Vibe preset generation (grind, flow, chill, hype)",
        status="active",
    ),
    "region_engine": EngineMetadata(
        id="region_engine",
        name="RegionEngine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Regional content packs (ATL, HOU, NOLA, MIA)",
        status="active",
    ),
    "filter_engine": EngineMetadata(
        id="filter_engine",
        name="FilterEngine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Photo/video filter generation",
        status="active",
    ),
    "dj_engine": EngineMetadata(
        id="dj_engine",
        name="DJEngine",
        credit_cost=10,
        enabled_for=["Southern"],
        description="DJ mix generation and playback",
        status="active",
    ),
    "beat_maker_engine": EngineMetadata(
        id="beat_maker_engine",
        name="BeatMakerEngine",
        credit_cost=8,
        enabled_for=["Southern"],
        description="Beat pattern generation",
        status="active",
    ),
    "character_creator_engine": EngineMetadata(
        id="character_creator_engine",
        name="CharacterCreatorEngine",
        credit_cost=6,
        enabled_for=["Southern"],
        description="Full character creation with archetypes",
        status="active",
    ),
    "seasonal_engine": EngineMetadata(
        id="seasonal_engine",
        name="SeasonalEngine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Seasonal content generation",
        status="active",
    ),
    "story_engine": EngineMetadata(
        id="story_engine",
        name="StoryEngine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Narrative/story generation",
        status="active",
    ),
    "art_direction_engine": EngineMetadata(
        id="art_direction_engine",
        name="ArtDirectionEngine",
        credit_cost=6,
        enabled_for=["Southern"],
        description="Art direction and style guidance",
        status="active",
    ),
    "pack_builder_engine": EngineMetadata(
        id="pack_builder_engine",
        name="PackBuilderEngine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Build themed content packs",
        status="active",
    ),
    "asset_engine": EngineMetadata(
        id="asset_engine",
        name="AssetEngine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Asset management and delivery",
        status="active",
    ),
    # Pipeline Orchestrator
    "pipeline_orchestrator": EngineMetadata(
        id="pipeline_orchestrator",
        name="PipelineOrchestrator",
        credit_cost=15,
        enabled_for=["Southern"],
        description="Multi-engine pipeline execution",
        status="active",
    ),
}


# ========================================================
# SOUTHERN PIPELINES (20 total)
# ========================================================
SOUTHERN_PIPELINES = {
    "character_creation_pipeline": {
        "id": "character_creation_pipeline",
        "name": "Character Creation Pipeline",
        "steps": [
            {"engine": "character_creator_engine", "action": "create"},
            {"engine": "outfit_engine", "action": "generate"},
            {"engine": "vibe_engine", "action": "assign"},
        ],
        "description": "Full character creation with outfit and vibe",
    },
    "theme_pack_pipeline": {
        "id": "theme_pack_pipeline",
        "name": "Theme Pack Pipeline",
        "steps": [
            {"engine": "theme_engine", "action": "generate"},
            {"engine": "filter_engine", "action": "apply"},
        ],
        "description": "Generate themed visual pack",
    },
    "mode_pack_pipeline": {
        "id": "mode_pack_pipeline",
        "name": "Mode Pack Pipeline",
        "steps": [
            {"engine": "mode_engine", "action": "configure"},
            {"engine": "vibe_engine", "action": "assign"},
        ],
        "description": "Create game mode with vibe",
    },
    "slang_pack_pipeline": {
        "id": "slang_pack_pipeline",
        "name": "Slang Pack Pipeline",
        "steps": [
            {"engine": "slang_engine", "action": "generate"},
            {"engine": "voice_king_mini", "action": "speak"},
        ],
        "description": "Generate slang pack with audio",
    },
    "outfit_pack_pipeline": {
        "id": "outfit_pack_pipeline",
        "name": "Outfit Pack Pipeline",
        "steps": [
            {"engine": "outfit_engine", "action": "generate"},
            {"engine": "vision_smith_mini", "action": "visualize"},
        ],
        "description": "Generate outfit pack with visuals",
    },
    "region_pack_pipeline": {
        "id": "region_pack_pipeline",
        "name": "Region Pack Pipeline",
        "steps": [
            {"engine": "region_engine", "action": "load"},
            {"engine": "theme_engine", "action": "apply"},
            {"engine": "sonic_forge_mini", "action": "generate_music"},
        ],
        "description": "Create region-specific content pack",
    },
    "dj_mode_pipeline": {
        "id": "dj_mode_pipeline",
        "name": "DJ Mode Pipeline",
        "steps": [
            {"engine": "dj_engine", "action": "mix"},
            {"engine": "beat_maker_engine", "action": "generate"},
        ],
        "description": "Generate DJ mix with beats",
    },
    "beat_maker_pipeline": {
        "id": "beat_maker_pipeline",
        "name": "Beat Maker Pipeline",
        "steps": [
            {"engine": "beat_maker_engine", "action": "create"},
            {"engine": "sonic_forge_mini", "action": "refine"},
        ],
        "description": "Create and refine beat",
    },
    "filter_pack_pipeline": {
        "id": "filter_pack_pipeline",
        "name": "Filter Pack Pipeline",
        "steps": [
            {"engine": "filter_engine", "action": "generate"},
            {"engine": "vision_smith_mini", "action": "preview"},
        ],
        "description": "Generate filter pack with preview",
    },
    "character_story_pipeline": {
        "id": "character_story_pipeline",
        "name": "Character Story Pipeline",
        "steps": [
            {"engine": "character_engine", "action": "load"},
            {"engine": "story_engine", "action": "generate"},
            {"engine": "voice_king_mini", "action": "narrate"},
        ],
        "description": "Generate character backstory with narration",
    },
    "seasonal_pack_pipeline": {
        "id": "seasonal_pack_pipeline",
        "name": "Seasonal Pack Pipeline",
        "steps": [
            {"engine": "seasonal_engine", "action": "generate"},
            {"engine": "theme_engine", "action": "apply"},
            {"engine": "sonic_forge_mini", "action": "generate_music"},
        ],
        "description": "Create seasonal content pack",
    },
    "creator_mode_pipeline": {
        "id": "creator_mode_pipeline",
        "name": "Creator Mode Pipeline",
        "steps": [
            {"engine": "character_creator_engine", "action": "create"},
            {"engine": "art_direction_engine", "action": "direct"},
            {"engine": "pack_builder_engine", "action": "build"},
        ],
        "description": "Full creator mode experience",
    },
    "photo_style_pipeline": {
        "id": "photo_style_pipeline",
        "name": "Photo Style Pipeline",
        "steps": [
            {"engine": "filter_engine", "action": "apply"},
            {"engine": "vision_smith_mini", "action": "enhance"},
        ],
        "description": "Apply Southern style to photos",
    },
    "video_style_pipeline": {
        "id": "video_style_pipeline",
        "name": "Video Style Pipeline",
        "steps": [
            {"engine": "filter_engine", "action": "apply_video"},
            {"engine": "sonic_forge_mini", "action": "generate_music"},
            {"engine": "voice_king_mini", "action": "add_vo"},
        ],
        "description": "Style video with music and VO",
    },
    "vibe_pack_pipeline": {
        "id": "vibe_pack_pipeline",
        "name": "Vibe Pack Pipeline",
        "steps": [
            {"engine": "vibe_engine", "action": "generate"},
            {"engine": "sonic_forge_mini", "action": "generate_music"},
            {"engine": "filter_engine", "action": "apply"},
        ],
        "description": "Create complete vibe pack",
    },
    "lowrider_fusion_pipeline": {
        "id": "lowrider_fusion_pipeline",
        "name": "Lowrider Fusion Pipeline",
        "steps": [
            {"engine": "vision_smith_mini", "action": "generate_car"},
            {"engine": "sonic_forge_mini", "action": "generate_sound"},
            {"engine": "theme_engine", "action": "apply_lowrider"},
        ],
        "description": "Generate lowrider content",
    },
    "anime_fusion_pipeline": {
        "id": "anime_fusion_pipeline",
        "name": "Anime Fusion Pipeline",
        "steps": [
            {"engine": "character_creator_engine", "action": "create_anime"},
            {"engine": "art_direction_engine", "action": "direct_anime"},
        ],
        "description": "Create anime-style character",
    },
    "sgv_culture_pipeline": {
        "id": "sgv_culture_pipeline",
        "name": "SGV Culture Pipeline",
        "steps": [
            {"engine": "region_engine", "action": "load_sgv"},
            {"engine": "slang_engine", "action": "generate_sgv"},
            {"engine": "sonic_forge_mini", "action": "generate_sgv_music"},
        ],
        "description": "San Gabriel Valley cultural content",
    },
    "story_mode_pipeline": {
        "id": "story_mode_pipeline",
        "name": "Story Mode Pipeline",
        "steps": [
            {"engine": "story_engine", "action": "generate"},
            {"engine": "voice_king_mini", "action": "narrate"},
            {"engine": "sonic_forge_mini", "action": "generate_ambient"},
        ],
        "description": "Generate story mode content",
    },
    "full_arcade_pipeline": {
        "id": "full_arcade_pipeline",
        "name": "Full Arcade Pipeline",
        "steps": [
            {"engine": "character_creator_engine", "action": "create"},
            {"engine": "outfit_engine", "action": "generate"},
            {"engine": "mode_engine", "action": "configure"},
            {"engine": "vibe_engine", "action": "assign"},
            {"engine": "sonic_forge_mini", "action": "generate_music"},
            {"engine": "theme_engine", "action": "apply"},
        ],
        "description": "Complete arcade experience generation",
    },
}


# ========================================================
# HELPER FUNCTIONS
# ========================================================
def get_southern_engine(engine_id: str) -> Optional[EngineMetadata]:
    return SOUTHERN_ENGINES.get(engine_id)


def list_southern_engines() -> list[EngineMetadata]:
    return list(SOUTHERN_ENGINES.values())


def get_southern_pipeline(pipeline_id: str) -> Optional[dict]:
    return SOUTHERN_PIPELINES.get(pipeline_id)


def list_southern_pipelines() -> list[dict]:
    return list(SOUTHERN_PIPELINES.values())


def calculate_pipeline_cost(pipeline_id: str) -> int:
    pipeline = SOUTHERN_PIPELINES.get(pipeline_id)
    if not pipeline:
        return 0
    
    total = 0
    for step in pipeline["steps"]:
        engine = SOUTHERN_ENGINES.get(step["engine"])
        if engine:
            total += engine.credit_cost
    
    return total
