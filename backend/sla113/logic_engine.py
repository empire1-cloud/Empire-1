"""SLA113 Logic Engine - AI Game Math and Mechanics Generation"""
import os
import json
import time
import uuid
import logging
from typing import Dict, Any, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)


LOGIC_TEMPLATES = {
    "fish_shooter": {
        "mechanics": ["weapon_types", "fish_values", "hit_detection", "multipliers", "boss_mechanics"],
        "rtp": {"target": 96.5, "variance": "medium-high"},
        "economy": ["coin_earn_rates", "weapon_costs", "upgrade_paths"],
    },
    "slot_machine": {
        "mechanics": ["reel_config", "paylines", "wild_mechanics", "scatter_trigger", "bonus_rounds", "free_spins"],
        "rtp": {"target": 96.0, "variance": "medium"},
        "paytable": ["symbol_values", "combo_multipliers", "jackpot_tiers"],
    },
    "crash_game": {
        "mechanics": ["multiplier_curve", "crash_probability", "cashout_mechanics", "auto_cashout"],
        "rtp": {"target": 97.0, "variance": "high"},
        "economy": ["min_max_bets", "house_edge", "payout_limits"],
    },
    "platformer": {
        "mechanics": ["physics_config", "jump_params", "enemy_ai", "collision_rules", "power_up_effects"],
        "levels": ["difficulty_curve", "spawn_rates", "checkpoint_spacing"],
        "scoring": ["point_values", "combo_system", "time_bonuses"],
    },
    "puzzle": {
        "mechanics": ["match_rules", "board_generation", "cascade_logic", "special_pieces", "objectives"],
        "levels": ["difficulty_progression", "move_limits", "star_thresholds"],
        "scoring": ["base_points", "combo_multipliers", "time_bonus"],
    },
}


async def generate_logic(
    project: Dict[str, Any],
    logic_type: str = "mechanics",
    difficulty: str = "medium",
    custom_requirements: Optional[str] = None,
) -> Dict[str, Any]:
    """Generate game logic and math specifications."""
    start = time.time()
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise ValueError("EMERGENT_LLM_KEY not configured")

    game_type = project.get("game_type", "platformer")
    templates = LOGIC_TEMPLATES.get(game_type, {})
    type_refs = templates.get(logic_type, [])

    system_prompt = (
        "You are SLA113, an expert game mathematician and mechanics designer. "
        "You generate precise, balanced game logic specifications with real numbers. "
        "Always respond with valid JSON only, no markdown. "
        f"Game Type: {project.get('game_type_info', {}).get('name', game_type)} "
        f"Difficulty: {difficulty} Project: {project.get('name', 'Untitled')}"
    )

    prompts_by_type = {
        "mechanics": (
            f"Generate complete game mechanics specification for this {game_type} game. "
            f"Reference areas: {json.dumps(type_refs)}. "
            "Include core_loop, mechanics, state_machine, input_map, difficulty_scaling."
        ),
        "rtp": (
            f"Generate RTP proof for this {game_type} game. "
            f"Target RTP: {templates.get('rtp', {}).get('target', 96.0)}%. "
            f"Variance: {templates.get('rtp', {}).get('variance', 'medium')}. "
            "Include target_rtp, calculated_rtp, house_edge, variance_profile, hit_frequency, max_win_multiplier, simulation_results, certification_notes."
        ),
        "paytable": (
            "Generate a complete paytable. Include symbols, special_symbols, bonus_triggers, jackpot_tiers, payline_patterns."
        ),
        "scoring": (
            "Generate a scoring system. Include base_scores, combo_system, bonus_events, leaderboard_tiers, progression_curve."
        ),
        "levels": (
            f"Generate level design for {game_type} with difficulty={difficulty}. Include total_levels, difficulty_curve, level_specs, boss_levels, unlock_requirements."
        ),
        "economy": (
            f"Generate in-game economy for {game_type}. Reference: {json.dumps(templates.get('economy', []))}. "
            "Include currencies, pricing_tiers, earn_rates, sink_ratio, monetization_hooks, session_economics."
        ),
        "rng": (
            "Generate RNG specification. Include algorithm, seed_strategy, distribution_tables, fairness_proof, anti_manipulation, audit_trail."
        ),
    }

    user_prompt = custom_requirements or prompts_by_type.get(logic_type, prompts_by_type["mechanics"])

    chat = LlmChat(
        api_key=api_key,
        session_id=f"sla113-logic-{uuid.uuid4().hex[:8]}",
        system_message=system_prompt,
    )
    chat.with_model("openai", "gpt-4o-mini")

    raw = await chat.send_message(UserMessage(text=user_prompt))

    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1].rsplit("```", 1)[0]
        specs = json.loads(cleaned)
    except json.JSONDecodeError:
        specs = {"raw_output": raw, "logic_type": logic_type}

    elapsed = round(time.time() - start, 2)

    return {
        "project_id": project.get("id", ""),
        "logic_type": logic_type,
        "difficulty": difficulty,
        "specs": specs,
        "generation_time": elapsed,
    }
