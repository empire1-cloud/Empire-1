from typing import Optional, Dict, Any
import uuid


class SouthernEnginePackService:
    """Service for executing Southern Engine Pack engines with chaining."""
    
    def __init__(self):
        from ..core.engine_namespace import CANON_ENGINES, UNIVERSAL_ENGINES
        self.canon_engines = CANON_ENGINES
        self.universal_engines = UNIVERSAL_ENGINES

    # ========================================================
    # ENGINE EXECUTION (Single Engine)
    # ========================================================
    async def execute_engine(
        self,
        engine_id: str,
        tenant_id: str,
        role: str,
        context: Dict[str, Any],
        overrides: Optional[Dict[str, Any]] = None,
        theme: str = "southern",
    ) -> dict:
        """Execute a single engine and return output."""
        overrides = overrides or {}
        
        # Route to appropriate engine method
        if engine_id in self.canon_engines:
            return await self._execute_canon(engine_id, context, overrides)
        elif engine_id in self.universal_engines:
            return await self._execute_universal(engine_id, theme, context, overrides)
        else:
            return {"error": f"Unknown engine: {engine_id}"}

    # ========================================================
    # CANON 5 EXECUTION (Identity Layer)
    # ========================================================
    async def _execute_canon(
        self,
        engine_id: str,
        context: Dict[str, Any],
        overrides: Dict[str, Any],
    ) -> dict:
        """Execute Canon 5 engine (always returns canon_lock=True)."""
        
        if engine_id == "canon_identity_v1":
            return {
                "engine_id": "canon_identity_v1",
                "text": f"Playful rooted identity generated for {context.get('role', 'player')}",
                "metadata": {
                    "identity_tags": ["playful_rooted", "southern_lyfestyle", "sgv"],
                    "emotion_tags": [],
                    "symbol_tags": [],
                    "sgv_tags": context.get("context", {}).get("situation", "").split() or ["el_monte", "sgv"],
                    "music_tags": [],
                    "theme_tags": [],
                    "style_tags": [],
                    "world_tags": [],
                    "character_tags": [],
                    "challenge_tags": [],
                    "progression_tags": [],
                    "reward_tags": [],
                    "canon_lock": True,
                },
                "credit_cost": self.canon_engines["canon_identity_v1"].credit_cost,
            }
        
        elif engine_id == "canon_emotion_v1":
            return {
                "engine_id": "canon_emotion_v1",
                "text": f"Southern emotional tone generated",
                "metadata": {
                    "identity_tags": [],
                    "emotion_tags": ["heartbreak", "bloom", "nostalgia", "wednesday_vibe"],
                    "symbol_tags": [],
                    "sgv_tags": [],
                    "music_tags": [],
                    "theme_tags": [],
                    "style_tags": [],
                    "world_tags": [],
                    "character_tags": [],
                    "challenge_tags": [],
                    "progression_tags": [],
                    "reward_tags": [],
                    "canon_lock": True,
                },
                "credit_cost": self.canon_engines["canon_emotion_v1"].credit_cost,
            }
        
        elif engine_id == "canon_music_v1":
            return {
                "engine_id": "canon_music_v1",
                "text": f"Music cue generated for era: {overrides.get('era', '90s')}",
                "metadata": {
                    "identity_tags": [],
                    "emotion_tags": ["nostalgia", "melancholy", "hype"],
                    "symbol_tags": [],
                    "sgv_tags": [],
                    "music_tags": ["oldies", "old_school", "rap", "wednesday"],
                    "theme_tags": [],
                    "style_tags": [],
                    "world_tags": [],
                    "character_tags": [],
                    "challenge_tags": [],
                    "progression_tags": [],
                    "reward_tags": [],
                    "canon_lock": True,
                },
                "credit_cost": self.canon_engines["canon_music_v1"].credit_cost,
            }
        
        elif engine_id == "canon_symbol_v1":
            return {
                "engine_id": "canon_symbol_v1",
                "text": "Rose + Water Tower symbols generated",
                "metadata": {
                    "identity_tags": [],
                    "emotion_tags": [],
                    "symbol_tags": ["rose", "water_tower", "sunset", "crown", "chain"],
                    "sgv_tags": [],
                    "music_tags": [],
                    "theme_tags": [],
                    "style_tags": [],
                    "world_tags": [],
                    "character_tags": [],
                    "challenge_tags": [],
                    "progression_tags": [],
                    "reward_tags": [],
                    "canon_lock": True,
                },
                "credit_cost": self.canon_engines["canon_symbol_v1"].credit_cost,
            }
        
        elif engine_id == "canon_sgv_v1":
            return {
                "engine_id": "canon_sgv_v1",
                "text": "SGV story generated",
                "metadata": {
                    "identity_tags": [],
                    "emotion_tags": [],
                    "symbol_tags": [],
                    "sgv_tags": ["el_monte", "san_gabriel", "rosemead", "arcadia"],
                    "music_tags": [],
                    "theme_tags": [],
                    "style_tags": [],
                    "world_tags": [],
                    "character_tags": [],
                    "challenge_tags": [],
                    "progression_tags": [],
                    "reward_tags": [],
                    "canon_lock": True,
                },
                "credit_cost": self.canon_engines["canon_sgv_v1"].credit_cost,
            }
        
        return {"error": f"Canon engine not implemented: {engine_id}"}

    # ========================================================
    # UNIVERSAL 15 EXECUTION (Production Layer)
    # ========================================================
    async def _execute_universal(
        self,
        engine_id: str,
        theme: str,
        context: Dict[str, Any],
        overrides: Dict[str, Any],
    ) -> dict:
        """Execute Universal 15 engine with theme parameter."""
        
        base_metadata = {
            "theme_tags": [theme],
            "canon_lock": False,
        }
        
        if engine_id == "univ_mission_v1":
            return {
                "engine_id": engine_id,
                "text": f"Mission generated for theme: {theme}",
                "metadata": {
                    **base_metadata,
                    "mission_objectives": ["Help community rise", "Start business", "Bring family together"],
                    "challenge_tags": ["medium_difficulty"],
                    "reward_tags": ["experience", "recognition"],
                    "progression_tags": ["level_up"],
                },
                "credit_cost": self.universal_engines[engine_id].credit_cost,
            }
        
        elif engine_id == "univ_story_arc_v1":
            return {
                "engine_id": engine_id,
                "text": f"Story arc generated for theme: {theme}",
                "metadata": {
                    **base_metadata,
                    "arc_stages": ["The Spark", "The Struggle", "The Victory"],
                    "emotion_tags": ["hope", "determination"],
                    "world_tags": ["urban", "neighborhood"],
                    "character_tags": ["protagonist", "mentor"],
                },
                "credit_cost": self.universal_engines[engine_id].credit_cost,
            }
        
        elif engine_id == "univ_character_v1":
            return {
                "engine_id": engine_id,
                "text": f"Character generated for theme: {theme}",
                "metadata": {
                    **base_metadata,
                    "character_tags": ["the_ment_hustler", "the_underdog"],
                    "style_tags": ["street", "urban"],
                    "world_tags": ["city", "suburbs"],
                },
                "credit_cost": self.universal_engines[engine_id].credit_cost,
            }
        
        # ... (other universal engines follow same pattern)
        
        return {
            "engine_id": engine_id,
            "text": f"Universal output for theme: {theme}",
            "metadata": base_metadata,
            "credit_cost": self.universal_engines.get(engine_id, {}).credit_cost or 4,
        }

    # ========================================================
    # ENGINE CHAINING (Canon 5 → Universal 15)
    # ========================================================
    async def execute_chain(
        self,
        canon_engines: list[str],
        universal_engines: list[str],
        tenant_id: str,
        role: str,
        theme: str,
        context: Dict[str, Any],
    ) -> dict:
        """
        Execute engine chain: Canon 5 outputs feed into Universal 15.
        Universal outputs inherit Canon metadata (canon_lock from Canon).
        """
        chain_id = str(uuid.uuid4())
        
        # Step 1: Execute Canon engines (identity layer)
        canon_outputs = []
        combined_metadata = {
            "identity_tags": [],
            "emotion_tags": [],
            "symbol_tags": [],
            "sgv_tags": [],
            "music_tags": [],
        }
        
        for canon_engine in canon_engines:
            output = await self.execute_engine(
                engine_id=canon_engine,
                tenant_id=tenant_id,
                role=role,
                context=context,
                theme=theme,
            )
            canon_outputs.append(output)
            
            # Merge Canon metadata
            if "metadata" in output:
                for key in combined_metadata:
                    if key in output["metadata"]:
                        combined_metadata[key].extend(output["metadata"][key])
        
        # Step 2: Execute Universal engines (production layer)
        universal_outputs = []
        for univ_engine in universal_engines:
            output = await self.execute_engine(
                engine_id=univ_engine,
                tenant_id=tenant_id,
                role=role,
                context=context,
                theme=theme,
            )
            
            # Inject Canon metadata into Universal output
            output["metadata"]["canon_metadata"] = combined_metadata
            output["metadata"]["canon_lock"] = True  # Canon always overrides
            universal_outputs.append(output)
        
        # Calculate total credit cost
        total_credits = sum(o.get("credit_cost", 0) for o in canon_outputs)
        total_credits += sum(o.get("credit_cost", 0) for o in universal_outputs)
        
        return {
            "chain_id": chain_id,
            "theme": theme,
            "tenant_id": tenant_id,
            "role": role,
            "canon_outputs": canon_outputs,
            "universal_outputs": universal_outputs,
            "merged_metadata": combined_metadata,
            "total_credits": total_credits,
            "canon_lock": True,  # Final output is canon-locked
        }

    # ========================================================
    # OS MERGE (SLA113 Final Output)
    # ========================================================
    async def os_merge(
        self,
        tenant_id: str,
        role: str,
        theme: str = "southern",
        context: Optional[Dict[str, Any]] = None,
    ) -> dict:
        """
        SLA113 merges Canon metadata + Universal content into final OS output.
        Canon 5 always overrides Universal 15 for identity, tone, symbols, SGV, music.
        """
        context = context or {}
        
        # Execute full chain
        result = await self.execute_chain(
            canon_engines=["canon_identity_v1", "canon_emotion_v1", "canon_music_v1"],
            universal_engines=["univ_mission_v1", "univ_story_arc_v1", "univ_character_v1"],
            tenant_id=tenant_id,
            role=role,
            theme=theme,
            context=context,
        )
        
        return {
            "success": True,
            "engine": "sla113_os_merge",
            "text": f"Southern OS output merged for theme: {theme}",
            "metadata": {
                # Canon metadata (always overrides)
                "identity_tags": result["merged_metadata"]["identity_tags"],
                "emotion_tags": result["merged_metadata"]["emotion_tags"],
                "symbol_tags": result["merged_metadata"]["symbol_tags"],
                "sgv_tags": result["merged_metadata"]["sgv_tags"],
                "music_tags": result["merged_metadata"]["music_tags"],
                # Universal content (theme-adaptive)
                "mission": result["universal_outputs"][0]["metadata"] if len(result["universal_outputs"]) > 0 else {},
                "story_arc": result["universal_outputs"][1]["metadata"] if len(result["universal_outputs"]) > 1 else {},
                "character": result["universal_outputs"][2]["metadata"] if len(result["universal_outputs"]) > 2 else {},
                # Final flags
                "theme": theme,
                "canon_lock": True,
                "engine_chain": "canon_5_universal_15",
            },
            "credit_cost": result["total_credits"],
            "chain_id": result["chain_id"],
        }


# Singleton
southern_engine_pack_service = SouthernEnginePackService()
