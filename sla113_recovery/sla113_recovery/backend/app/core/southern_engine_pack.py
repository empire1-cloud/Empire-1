from typing import Optional
from pydantic import BaseModel


class SouthernEngineMetadata(BaseModel):
    id: str
    name: str
    credit_cost: int
    enabled_for: list[str]
    description: str
    status: str
    type: str  # "canon" or "universal"


# ========================================================
# CANON 5 (SOUTHERN-ONLY) - Non-universal, Southern identity
# ========================================================
CANON_ENGINES = {
    "playful_rooted_identity": SouthernEngineMetadata(
        id="playful_rooted_identity",
        name="Playful Rooted Identity Engine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Generates playful rooted identity tags for Southern characters",
        status="active",
        type="canon",
    ),
    "southern_emotional": SouthernEngineMetadata(
        id="southern_emotional",
        name="Southern Lyfestyle Emotional Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates emotional tone and sentiment for Southern content",
        status="active",
        type="canon",
    ),
    "rose_water_tower": SouthernEngineMetadata(
        id="rose_water_tower",
        name="Rose + Water Tower Symbol Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Generates Southern symbol combinations (rose, water tower, etc.)",
        status="active",
        type="canon",
    ),
    "sgv_story": SouthernEngineMetadata(
        id="sgv_story",
        name="SGV Story Engine",
        credit_cost=6,
        enabled_for=["Southern"],
        description="Generates San Gabriel Valley cultural stories and narratives",
        status="active",
        type="canon",
    ),
    "music_cue": SouthernEngineMetadata(
        id="music_cue",
        name="Music Cue Engine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Generates oldies/old school/rap music cues and references",
        status="active",
        type="canon",
    ),
}


# ========================================================
# UNIVERSAL 15 (Theme-adaptive)
# ========================================================
UNIVERSAL_ENGINES = {
    "universal_mission": SouthernEngineMetadata(
        id="universal_mission",
        name="Universal Mission Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates mission objectives (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_story_arc": SouthernEngineMetadata(
        id="universal_story_arc",
        name="Universal Story Arc Engine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Generates story arcs (anime, horror, wizard, sci-fi, fantasy, Southern)",
        status="active",
        type="universal",
    ),
    "universal_character": SouthernEngineMetadata(
        id="universal_character",
        name="Universal Character Engine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Generates character archetypes (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_outfit": SouthernEngineMetadata(
        id="universal_outfit",
        name="Universal Outfit Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Generates outfit combinations (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_world": SouthernEngineMetadata(
        id="universal_world",
        name="Universal World Engine",
        credit_cost=6,
        enabled_for=["Southern"],
        description="Generates world-building content (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_visual_style": SouthernEngineMetadata(
        id="universal_visual_style",
        name="Universal Visual Style Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates visual style guidance (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_dialogue": SouthernEngineMetadata(
        id="universal_dialogue",
        name="Universal Dialogue Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates dialogue scripts (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_lore": SouthernEngineMetadata(
        id="universal_lore",
        name="Universal Lore Engine",
        credit_cost=5,
        enabled_for=["Southern"],
        description="Generates lore and backstory (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_event": SouthernEngineMetadata(
        id="universal_event",
        name="Universal Event Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates in-game events (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_challenge": SouthernEngineMetadata(
        id="universal_challenge",
        name="Universal Challenge Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates challenge content (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_progression": SouthernEngineMetadata(
        id="universal_progression",
        name="Universal Progression Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Generates progression systems (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_reward": SouthernEngineMetadata(
        id="universal_reward",
        name="Universal Reward Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Generates rewards and achievements (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_title_screen": SouthernEngineMetadata(
        id="universal_title_screen",
        name="Universal Title Screen Engine",
        credit_cost=4,
        enabled_for=["Southern"],
        description="Generates title screen content (theme-adaptive)",
        status="active",
        type="universal",
    ),
    "universal_theme_filter": SouthernEngineMetadata(
        id="universal_theme_filter",
        name="Universal Theme Filter Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Applies theme filters to content",
        status="active",
        type="universal",
    ),
    "universal_emotion_filter": SouthernEngineMetadata(
        id="universal_emotion_filter",
        name="Universal Emotion Filter Engine",
        credit_cost=3,
        enabled_for=["Southern"],
        description="Applies emotion filters to content",
        status="active",
        type="universal",
    ),
}


# ========================================================
# COMBINED ENGINE REGISTRY
# ========================================================
SOUTHERN_ENGINE_PACK = {**CANON_ENGINES, **UNIVERSAL_ENGINES}


# ========================================================
# HELPER FUNCTIONS
# ========================================================
def get_engine(engine_id: str) -> Optional[SouthernEngineMetadata]:
    return SOUTHERN_ENGINE_PACK.get(engine_id)


def list_engines(engine_type: Optional[str] = None) -> list[SouthernEngineMetadata]:
    if engine_type == "canon":
        return list(CANON_ENGINES.values())
    elif engine_type == "universal":
        return list(UNIVERSAL_ENGINES.values())
    return list(SOUTHERN_ENGINE_PACK.values())


def get_canon_engines() -> list[SouthernEngineMetadata]:
    return list(CANON_ENGINES.values())


def get_universal_engines() -> list[SouthernEngineMetadata]:
    return list(UNIVERSAL_ENGINES.values())


def calculate_credits(engine_ids: list[str]) -> int:
    total = 0
    for eid in engine_ids:
        engine = SOUTHERN_ENGINE_PACK.get(eid)
        if engine:
            total += engine.credit_cost
    return total
