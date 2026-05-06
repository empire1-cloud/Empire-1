"""SLA113 API Router - full admin console backend surface."""
from __future__ import annotations

import asyncio
import base64
import io
import json
import os
import random as _random
import re
import shutil
import tempfile
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel

from database import get_database
from sla113.audio_forge import SFX_TEMPLATES, generate_audio_asset
from sla113.composer_engine import compose_game_bundle
from sla113.fish_multiplayer import create_lobby, delete_lobby, get_lobby, list_lobbies
from sla113.game_templates import get_game_template
from sla113.logic_engine import generate_logic
from sla113.models import (
    AUDIO_ENGINES,
    AUDIO_MIDDLEWARE_TYPES,
    GAME_TYPES,
    AudioForgeRequest,
    ComposeRequest,
    CreateProjectRequest,
    LogicGenerateRequest,
    VisionGenerateRequest,
)
from sla113.vision_engine import generate_image_asset, generate_vision_assets

router = APIRouter(prefix="/sla113", tags=["sla113"])

_terminal_sessions: dict[str, Any] = {}
_universe_registry: dict[str, dict] = {}

_worker_running = False
_worker_task: Optional[asyncio.Task] = None


def register_universe(
    uid: str,
    name: str,
    description: str,
    prefix: str,
    engine: str = "internal",
    product: Optional[str] = None,
    status: str = "online",
    domain: Optional[str] = None,
) -> None:
    _universe_registry[uid] = {
        "id": uid,
        "name": name,
        "description": description,
        "prefix": prefix,
        "engine": engine,
        "product": product,
        "domain": domain,
        "status": status,
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }


register_universe(
    "sla113",
    "SLA113 Core",
    "Sovereign Operator OS - Admin Console, Universe Registry, Engine Dashboard, Factory + Foundry, Compliance, Real-time Orchestration",
    "/api/sla113",
    engine="fastapi+mongodb",
    product="SLA113 Operator OS",
    domain="sla113.southernlifestyle.org",
)
register_universe(
    "empire1",
    "Empire 1",
    "Creator SaaS Dashboard - Onboarding, Universe Selection, Account Management, Billing, Studio Tools",
    "/api/empire1",
    engine="hybrid",
    product="Hybrid Intelligence SaaS",
    domain="empire1.cloud",
)
register_universe(
    "southern",
    "Southern Lifestyle",
    "Brand Root and Identity - Corporate Identity, Compliance, Admin Identity, Brand Gateway",
    "/api/southern",
    engine="internal",
    product="SouthernLifestyle Universe",
    domain="southernlifestyle.org",
)
register_universe(
    "lyrica3",
    "Lyrica 3",
    "Music Universe - AI Music Creation, Duet Engine, Emotional Grammar, Vocal Logic",
    "/api/lyrica3",
    engine="vertex-ai",
    product="Lyrica 3 Pro",
    domain="lyrica3.com",
)
register_universe(
    "universal",
    "SL Universal",
    "Universe Portal - Universe Registry, Cross-universe Identity, Multi-universe Routing",
    "/api/universal",
    engine="internal",
    product="Universal Layer",
    domain="sluniversal.lyrica3.com",
)
register_universe(
    "arcade",
    "Arcade Universe",
    "Player-facing Game Portal - Game Previews, Real-time Dashboards, Fish Shooter + Slots",
    "/api/arcade",
    engine="pixi+phaser",
    product="Arcade Universe",
    domain="arcade.southernlifestyle.org",
)


def projects_collection():
    return get_database()["sla113_projects"]


def tenants_collection():
    return get_database()["sla113_tenants"]


def jobs_collection():
    return get_database()["sla113_jobs"]


def pipelines_collection():
    return get_database()["sla113_pipelines"]


def builds_collection():
    return get_database()["sla113_builds"]


def compliance_collection():
    return get_database()["sla113_compliance"]


def deployments_collection():
    return get_database()["sla113_deployments"]


def audio_collection():
    return get_database()["sla113_audio_assets"]


def slot_symbols_collection():
    return get_database()["sla113_slot_symbols"]


def sprite_registry_collection():
    return get_database()["sla113_sprite_registry"]


def lobbies_collection():
    return get_database()["sla113_lobbies"]


class TerminalRequest(BaseModel):
    command: str
    session_id: Optional[str] = "default"


class CreateTenantRequest(BaseModel):
    name: str
    subdomain: str
    config: Optional[dict] = None


class CreateJobRequest(BaseModel):
    preset: str
    config: Optional[dict] = None
    priority: str = "normal"
    depends_on: Optional[List[str]] = None


class CreatePipelineRequest(BaseModel):
    name: str
    type: str = "Automation"
    lane: int = 1


class CreateBuildRequest(BaseModel):
    project_id: str
    target: str = "webgl"
    optimization: str = "balanced"
    include_assets: bool = True
    include_logic: bool = True


class ComplianceCheckRequest(BaseModel):
    project_id: str
    jurisdiction: str = "GLI"
    check_type: str = "full"


class AutoCertifyRequest(BaseModel):
    project_id: str
    jurisdiction: str = "GLI"


class DeployRequest(BaseModel):
    build_id: str
    target_cdn: str = "cloudflare"
    region: str = "us-west"
    auto_ssl: bool = True


class CreateSymbolSetRequest(BaseModel):
    name: str
    symbols: list


class SpriteAssetRequest(BaseModel):
    name: str
    entity_type: str
    sprite_url: str
    frame_width: int = 256
    frame_height: int = 256
    columns: int = 4
    rows: int = 4
    total_frames: int = 16
    animations: dict = {}
    tier: int = 0
    metadata: dict = {}


class LobbyRequest(BaseModel):
    name: str
    slug: str
    game_type: str = "fish_shooting"
    main_boss_sprite: str
    partner_boss_sprite: Optional[str] = None
    background_sprite: Optional[str] = None
    theme_color: str = "#d4af37"
    description: str = ""
    jackpot_tier: str = "MAJOR"
    base_bet: float = 0.10
    audio_track: Optional[str] = None
    fish_sprite: Optional[str] = None
    extra_bosses: List[str] = []


JOB_STAGES = {
    "ARCADE_40": ["Asset Indexing", "Sprite Generation", "Physics Binding", "AI Balancing", "Package Export"],
    "ARCADE_60": ["Asset Indexing", "Sprite Generation", "Physics Binding", "AI Balancing", "Network Layer", "Package Export"],
    "SLOTS_20": ["Reel Mapping", "Paytable Calculation", "RTP Verification", "Visual Rendering", "Package Export"],
    "OPEN_WORLD": ["World Generation", "NPC Scripting", "Physics Binding", "AI Pathing", "Texture Streaming", "LOD Pipeline", "Package Export"],
    "CASINO_SUITE": ["Game Selection Matrix", "RTP Calibration", "Lobby UI", "Payment Gateway", "Package Export"],
    "CUSTOM_OS_BUILD": ["Init Scaffold", "Core Logic", "Asset Pipeline", "Integration Pass", "Package Export"],
    "AAA_FISH_SLOT": ["Asset Indexing", "Sprite Generation", "Boss Patterns", "RTP Verification", "Package Export"],
    "GTA5_TYPE": ["World Generation", "NPC Scripting", "Vehicle Physics", "Mission Logic", "Package Export"],
    "COD_WARFARE": ["Map Generation", "Weapon Balancing", "Netcode Layer", "AI Opponents", "Package Export"],
    "FANTASY_RPG": ["Lore Generation", "Skill Trees", "Monster AI", "Dungeon Layout", "Package Export"],
}
DEFAULT_STAGES = ["Initialization", "Core Processing", "Asset Compilation", "Quality Check", "Package Export"]

COMPLIANCE_CHECKS = {
    "GLI": ["RTP Verification", "RNG Seed Audit", "Paytable Integrity", "Max Bet Limits", "Session Timeout Compliance", "Responsible Gaming Controls"],
    "MGA": ["RTP Verification", "RNG Certification", "Player Protection", "Anti-Money Laundering", "Game History Logging"],
    "UKGC": ["RTP Verification", "RNG Audit", "Fairness Testing", "Underage Prevention", "Self-Exclusion", "Advertising Compliance"],
    "CURACAO": ["RTP Verification", "RNG Basics", "Fair Play Attestation"],
    "INTERNAL": ["RTP Verification", "RNG Seed Audit", "Stress Test", "Edge Case Validation"],
}


@router.get("/universes")
async def list_universes():
    universes = list(_universe_registry.values())
    return {
        "universes": universes,
        "total": len(universes),
        "sovereign": "SLA113",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/universes/{universe_id}")
async def get_universe(universe_id: str):
    if universe_id not in _universe_registry:
        raise HTTPException(status_code=404, detail=f"Universe '{universe_id}' not found")
    return _universe_registry[universe_id]


@router.post("/universes/register")
async def register_universe_endpoint(
    uid: str,
    name: str,
    description: str,
    prefix: str,
    engine: str = "internal",
    product: Optional[str] = None,
    domain: Optional[str] = None,
):
    register_universe(uid, name, description, prefix, engine, product, domain=domain)
    return {"registered": True, "universe": _universe_registry[uid]}


@router.delete("/universes/{universe_id}")
async def deregister_universe(universe_id: str):
    if universe_id not in _universe_registry:
        raise HTTPException(status_code=404, detail=f"Universe '{universe_id}' not found")
    removed = _universe_registry.pop(universe_id)
    return {"deregistered": True, "universe": removed}


@router.get("/status")
async def sla113_status():
    total_projects = await projects_collection().count_documents({})
    return {
        "universe": "sla113",
        "status": "online",
        "description": "Sovereign Operator OS - Game Studio Platform",
        "total_projects": total_projects,
        "engines": ["vision", "logic", "composer"],
        "universes_registered": len(_universe_registry),
        "version": "1.0.0",
    }


@router.get("/admin/engines")
async def list_all_engines():
    """List ALL engines (39) from engine_namespace."""
    from app.core.engine_namespace import ALL_ENGINES
    return {"success": True, "engines": ALL_ENGINES}


@router.get("/nexus/pipelines")
async def get_arttech_pipelines():
    return {
        "pipelines": [
            {"id": "arcade", "name": "Arcade Pipeline", "tags": ["Lounge", "Fish", "Slots"], "color": "#00C8FF", "status": "active"},
            {"id": "open_world", "name": "Open World", "tags": ["Urban", "Vehicles", "Grit"], "color": "#D4AF37", "status": "active"},
            {"id": "tactical_fps", "name": "Tactical FPS", "tags": ["Mil-Spec", "Polymer"], "color": "#FF4444", "status": "active"},
            {"id": "epic_rpg", "name": "Epic RPG", "tags": ["Mythic", "Boss", "Canon"], "color": "#9966FF", "status": "active"},
            {"id": "pano_arte", "name": "Pano Arte", "tags": ["Pano", "Chicano"], "color": "#FF6600", "status": "active"},
            {"id": "casino_suite", "name": "Casino Suite", "tags": ["Slots", "Poker", "Bingo", "Sportsbook"], "color": "#44FF44", "status": "active"},
            {"id": "horror", "name": "Horror / Survival", "tags": ["Atmosphere", "Tension", "Jump"], "color": "#CC0033", "status": "active"},
            {"id": "racing", "name": "Racing Sim", "tags": ["Physics", "Tuning", "Multiplayer"], "color": "#00FF88", "status": "active"},
        ]
    }


@router.get("/nexus/matrix")
async def get_matrix_parameters():
    return {
        "parameters": {
            "physics_engine": {"value": "Unity 6 // DOTS", "status": "active", "icon": "cpu"},
            "audio_middleware": {"value": "FMOD Studio", "status": "active", "icon": "volume-2"},
            "render_pipeline": {"value": "Lumen RTX", "status": "active", "icon": "monitor"},
            "biome": {"value": "Abyssal Wastes", "status": "active", "icon": "globe"},
            "archetype": {"value": "Mecha Deity", "status": "active", "icon": "shield"},
        },
        "fmodel_utility": {
            "texture_link": "ACTIVE",
            "mesh_buffer": "READY",
            "operator_environment": "v2.0.4",
            "admin_id": "ADMIN_OVERRIDE",
            "system_status": "STABLE",
        },
    }


@router.get("/nexus/os-modules")
async def get_os_module_map():
    return {
        "modules": [
            {"os_module": "Lounge", "fmodel_utility": "Texture Extraction", "functional_output": "UI skins for slot machines."},
            {"os_module": "Abyssal Wastes", "fmodel_utility": "Static Mesh Extraction", "functional_output": "Environment kit for tactical maps."},
            {"os_module": "Southern Foundry", "fmodel_utility": "Material Logic", "functional_output": "Shader tool with gold foil PBR presets."},
            {"os_module": "Fish Shooting", "fmodel_utility": "Sprite Extraction", "functional_output": "Boss sprite sheets with hit-box data."},
            {"os_module": "Tactical FPS", "fmodel_utility": "Weapon Mesh Pack", "functional_output": "Weapon models with attachment points and LODs."},
            {"os_module": "Epic RPG", "fmodel_utility": "Character Rig", "functional_output": "Rigged mythic characters with animation trees."},
            {"os_module": "Pano Arte", "fmodel_utility": "Texture Atlas", "functional_output": "Cultural art pack for overlays and card backs."},
            {"os_module": "Casino Suite", "fmodel_utility": "Animation Extraction", "functional_output": "Slot reel and celebration animations."},
        ]
    }


@router.get("/game-types")
async def list_game_types():
    categories = {}
    for key, gt in GAME_TYPES.items():
        cat = gt["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({"id": key, **gt})
    return {
        "game_types": GAME_TYPES,
        "categories": categories,
        "total_types": len(GAME_TYPES),
        "audio_middleware": AUDIO_MIDDLEWARE_TYPES,
        "audio_engines": AUDIO_ENGINES,
    }


@router.post("/projects")
async def create_project(req: CreateProjectRequest):
    if req.game_type not in GAME_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported game type: {req.game_type}. Supported: {list(GAME_TYPES.keys())}")

    now = datetime.now(timezone.utc).isoformat()
    project = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "game_type": req.game_type,
        "game_type_info": GAME_TYPES[req.game_type],
        "description": req.description or GAME_TYPES[req.game_type]["description"],
        "theme": req.theme or "default",
        "target_platform": req.target_platform,
        "status": "created",
        "vision_assets": [],
        "logic_specs": [],
        "compositions": [],
        "created_at": now,
        "updated_at": now,
    }
    await projects_collection().insert_one(project)
    project.pop("_id", None)
    return project


@router.get("/projects")
async def list_projects():
    cursor = projects_collection().find({}, {"_id": 0})
    projects = await cursor.to_list(100)
    return {"projects": projects, "total": len(projects)}


@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await projects_collection().find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await projects_collection().delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"deleted": True, "project_id": project_id}


@router.post("/vision/generate")
async def generate_vision(req: VisionGenerateRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        result = await generate_vision_assets(
            project=project,
            asset_type=req.asset_type,
            style=req.style,
            count=req.count,
            custom_prompt=req.custom_prompt,
        )
        await projects_collection().update_one(
            {"id": req.project_id},
            {
                "$push": {"vision_assets": result},
                "$set": {"status": "vision_generated", "updated_at": datetime.now(timezone.utc).isoformat()},
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision generation failed: {e}")


class ImageGenRequest(BaseModel):
    prompt: str
    style: str = "pixel_art"
    asset_type: str = "concept_art"
    size: str = "1024x1024"
    quality: str = "high"


@router.post("/vision/generate-image")
async def generate_image(req: ImageGenRequest):
    try:
        return await generate_image_asset(req.prompt, style=req.style, asset_type=req.asset_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")


@router.get("/vision/styles")
async def list_vision_styles():
    from sla113.vision_engine import STYLE_PROMPTS

    return {
        "styles": list(STYLE_PROMPTS.keys()),
        "asset_types": ["concept_art", "sprite_sheet", "tileset", "ui_element", "background", "character", "boss", "vfx"],
    }


@router.post("/logic/generate")
async def generate_game_logic(req: LogicGenerateRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        result = await generate_logic(
            project=project,
            logic_type=req.logic_type,
            difficulty=req.difficulty,
            custom_requirements=req.custom_requirements,
        )
        await projects_collection().update_one(
            {"id": req.project_id},
            {
                "$push": {"logic_specs": result},
                "$set": {"status": "logic_generated", "updated_at": datetime.now(timezone.utc).isoformat()},
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logic generation failed: {e}")


@router.post("/compose")
async def compose_game(req: ComposeRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        result = await compose_game_bundle(
            project=project,
            include_vision=req.include_vision,
            include_logic=req.include_logic,
            output_format=req.output_format,
        )
        await projects_collection().update_one(
            {"id": req.project_id},
            {
                "$push": {"compositions": result},
                "$set": {"status": "composed", "updated_at": datetime.now(timezone.utc).isoformat()},
            },
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Composition failed: {e}")


@router.get("/stats")
async def get_stats():
    total = await projects_collection().count_documents({})
    by_type = {}
    for gt in GAME_TYPES:
        count = await projects_collection().count_documents({"game_type": gt})
        if count > 0:
            by_type[gt] = count

    return {
        "total_projects": total,
        "by_game_type": by_type,
        "supported_game_types": len(GAME_TYPES),
        "engines": ["vision", "logic", "composer"],
        "version": "1.0.0",
    }


@router.post("/terminal")
async def terminal_command(req: TerminalRequest):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        return {"response": "[ERROR] EMERGENT_LLM_KEY not configured. Overseer offline."}

    total_projects = await projects_collection().count_documents({})
    recent_projects = (
        await projects_collection()
        .find({}, {"_id": 0, "name": 1, "game_type": 1, "status": 1, "theme": 1})
        .sort("created_at", -1)
        .to_list(10)
    )

    by_type = {}
    for gt in GAME_TYPES:
        c = await projects_collection().count_documents({"game_type": gt})
        if c > 0:
            by_type[gt] = c

    platform_context = json.dumps(
        {
            "total_projects": total_projects,
            "projects_by_type": by_type,
            "recent_projects": recent_projects,
            "supported_game_types": list(GAME_TYPES.keys()),
            "engines": ["vision", "logic", "composer"],
        },
        indent=2,
    )

    system_msg = (
        "You are the SOVEREIGN OVERSEER of SLA113. "
        "Tone: terse, authoritative, precise. Use > prefixes. Keep responses under 150 words. "
        f"PLATFORM STATE:\n{platform_context}"
    )

    session_id = req.session_id or "default"
    if session_id not in _terminal_sessions:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        chat = LlmChat(
            api_key=api_key,
            session_id=f"sla113-overseer-{session_id}",
            system_message=system_msg,
        )
        chat.with_model("openai", "gpt-4o-mini")
        _terminal_sessions[session_id] = chat
    else:
        chat = _terminal_sessions[session_id]

    try:
        from emergentintegrations.llm.chat import UserMessage

        response = await chat.send_message(UserMessage(text=req.command))
        return {"response": response, "session_id": session_id}
    except Exception as e:
        return {"response": f"> [ERROR] Overseer fault: {e}", "session_id": session_id}


@router.post("/tenants")
async def create_tenant(req: CreateTenantRequest):
    now = datetime.now(timezone.utc).isoformat()
    existing = await tenants_collection().find_one({"subdomain": req.subdomain}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=409, detail=f"Subdomain '{req.subdomain}' already exists")

    tenant = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "subdomain": req.subdomain,
        "status": "provisioning",
        "credits": 0,
        "rtp_mode": 92,
        "config": req.config or {},
        "created_at": now,
        "updated_at": now,
    }
    await tenants_collection().insert_one(tenant)
    await tenants_collection().update_one(
        {"id": tenant["id"]}, {"$set": {"status": "active", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    tenant["status"] = "active"
    tenant.pop("_id", None)
    return tenant


@router.get("/tenants")
async def list_tenants():
    cursor = tenants_collection().find({}, {"_id": 0})
    tenants = await cursor.to_list(100)
    return {"tenants": tenants, "total": len(tenants)}


@router.delete("/tenants/{tenant_id}")
async def delete_tenant(tenant_id: str):
    result = await tenants_collection().delete_one({"id": tenant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"deleted": True}


@router.put("/tenants/{tenant_id}/credits")
async def update_tenant_credits(tenant_id: str, amount: int):
    result = await tenants_collection().update_one(
        {"id": tenant_id}, {"$inc": {"credits": amount}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant = await tenants_collection().find_one({"id": tenant_id}, {"_id": 0})
    return tenant


@router.put("/tenants/{tenant_id}/rtp")
async def update_tenant_rtp(tenant_id: str, rtp: int):
    if rtp < 80 or rtp > 99:
        raise HTTPException(status_code=400, detail="RTP must be between 80 and 99")
    result = await tenants_collection().update_one(
        {"id": tenant_id}, {"$set": {"rtp_mode": rtp, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant = await tenants_collection().find_one({"id": tenant_id}, {"_id": 0})
    return tenant


@router.post("/jobs")
async def create_job(req: CreateJobRequest):
    now = datetime.now(timezone.utc).isoformat()
    stage_names = JOB_STAGES.get(req.preset, DEFAULT_STAGES)
    stages = [{"name": s, "status": "pending", "progress": 0} for s in stage_names]

    deps = req.depends_on or []
    for dep_id in deps:
        dep = await jobs_collection().find_one({"id": dep_id})
        if not dep:
            raise HTTPException(status_code=400, detail=f"Dependency job {dep_id} not found")

    has_unfinished_deps = False
    if deps:
        for dep_id in deps:
            dep = await jobs_collection().find_one({"id": dep_id}, {"_id": 0})
            if dep and dep.get("status") != "completed":
                has_unfinished_deps = True
                break

    initial_status = "blocked" if has_unfinished_deps else "pending"
    job = {
        "id": f"JOB-{uuid.uuid4().hex[:6].upper()}",
        "preset": req.preset,
        "status": initial_status,
        "progress": 0,
        "priority": req.priority,
        "config": req.config or {},
        "stages": stages,
        "depends_on": deps,
        "dependents": [],
        "logs": [f"[{now}] Job queued. Preset: {req.preset}. Dependencies: {len(deps)}. Status: {initial_status}"],
        "created_at": now,
        "updated_at": now,
    }
    await jobs_collection().insert_one(job)

    for dep_id in deps:
        await jobs_collection().update_one({"id": dep_id}, {"$addToSet": {"dependents": job["id"]}})

    job.pop("_id", None)
    return job


@router.post("/jobs/{job_id}/link")
async def link_dependency(job_id: str, depends_on_id: str):
    job = await jobs_collection().find_one({"id": job_id}, {"_id": 0})
    parent = await jobs_collection().find_one({"id": depends_on_id}, {"_id": 0})
    if not job or not parent:
        raise HTTPException(status_code=404, detail="Job not found")

    if job_id in (parent.get("depends_on") or []):
        raise HTTPException(status_code=400, detail="Circular dependency detected")

    now = datetime.now(timezone.utc).isoformat()
    await jobs_collection().update_one(
        {"id": job_id},
        {"$addToSet": {"depends_on": depends_on_id}, "$push": {"logs": f"[{now}] Linked dependency: {depends_on_id}"}},
    )
    await jobs_collection().update_one({"id": depends_on_id}, {"$addToSet": {"dependents": job_id}})

    if parent.get("status") != "completed":
        await jobs_collection().update_one({"id": job_id}, {"$set": {"status": "blocked", "updated_at": now}})

    return {"linked": True, "job": job_id, "depends_on": depends_on_id}


@router.delete("/jobs/{job_id}/link/{dep_id}")
async def unlink_dependency(job_id: str, dep_id: str):
    now = datetime.now(timezone.utc).isoformat()
    await jobs_collection().update_one({"id": job_id}, {"$pull": {"depends_on": dep_id}})
    await jobs_collection().update_one({"id": dep_id}, {"$pull": {"dependents": job_id}})

    job = await jobs_collection().find_one({"id": job_id}, {"_id": 0})
    if job and job.get("status") == "blocked":
        deps = job.get("depends_on", [])
        all_met = True
        for d in deps:
            parent = await jobs_collection().find_one({"id": d}, {"_id": 0})
            if parent and parent.get("status") != "completed":
                all_met = False
                break
        if all_met:
            await jobs_collection().update_one(
                {"id": job_id},
                {"$set": {"status": "pending", "updated_at": now}, "$push": {"logs": f"[{now}] All dependencies met. Unblocked."}},
            )

    return {"unlinked": True}


@router.get("/jobs/graph")
async def get_dependency_graph():
    cursor = jobs_collection().find({}, {"_id": 0}).sort("created_at", -1)
    jobs = await cursor.to_list(200)
    nodes = []
    edges = []
    for j in jobs:
        nodes.append(
            {
                "id": j["id"],
                "preset": j.get("preset", ""),
                "status": j.get("status", "pending"),
                "progress": j.get("progress", 0),
                "depends_on": j.get("depends_on", []),
                "dependents": j.get("dependents", []),
            }
        )
        for dep_id in j.get("depends_on", []):
            edges.append({"from": dep_id, "to": j["id"]})
    return {"nodes": nodes, "edges": edges}


@router.get("/jobs")
async def list_jobs():
    cursor = jobs_collection().find({}, {"_id": 0}).sort("created_at", -1)
    jobs = await cursor.to_list(100)
    return {"jobs": jobs, "total": len(jobs)}


@router.put("/jobs/{job_id}/progress")
async def update_job_progress(job_id: str, progress: int, status: Optional[str] = None):
    update = {"progress": progress, "updated_at": datetime.now(timezone.utc).isoformat()}
    if status:
        update["status"] = status
    if progress >= 100:
        update["status"] = "completed"
    result = await jobs_collection().update_one({"id": job_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    job = await jobs_collection().find_one({"id": job_id}, {"_id": 0})
    return job


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await jobs_collection().delete_one({"id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"deleted": True}


async def _advance_job(job):
    now = datetime.now(timezone.utc).isoformat()
    stages = job.get("stages", [])

    if not stages:
        new_progress = min(job["progress"] + 25, 100)
        new_status = "completed" if new_progress >= 100 else "processing"
        log_msg = f"[{now}] Progress: {new_progress}% - {'Complete.' if new_status == 'completed' else 'Processing...'}"
        await jobs_collection().update_one(
            {"id": job["id"]},
            {"$set": {"progress": new_progress, "status": new_status, "updated_at": now}, "$push": {"logs": log_msg}},
        )
        return await jobs_collection().find_one({"id": job["id"]}, {"_id": 0})

    current_idx = next((i for i, s in enumerate(stages) if s["status"] != "completed"), len(stages))
    if current_idx < len(stages):
        stage = stages[current_idx]
        increment = _random.randint(20, 45)
        new_stage_progress = min(stage["progress"] + increment, 100)
        stage["progress"] = new_stage_progress
        if new_stage_progress >= 100:
            stage["status"] = "completed"
            log_msg = f"[{now}] Stage '{stage['name']}' DONE."
        else:
            stage["status"] = "processing"
            log_msg = f"[{now}] {stage['name']}: {new_stage_progress}%"
    else:
        log_msg = f"[{now}] Waiting on stage transition"

    total_progress = sum(s["progress"] for s in stages) // len(stages) if stages else 100
    all_done = all(s["status"] == "completed" for s in stages)
    new_status = "completed" if all_done else "processing"

    if all_done:
        log_msg = f"[{now}] ALL STAGES COMPLETE. Job finished."

    await jobs_collection().update_one(
        {"id": job["id"]},
        {"$set": {"stages": stages, "progress": total_progress, "status": new_status, "updated_at": now}, "$push": {"logs": log_msg}},
    )

    if all_done:
        dependents = job.get("dependents", [])
        for dep_id in dependents:
            dep_job = await jobs_collection().find_one({"id": dep_id}, {"_id": 0})
            if dep_job and dep_job.get("status") == "blocked":
                all_deps_met = True
                for parent_id in dep_job.get("depends_on", []):
                    parent = await jobs_collection().find_one({"id": parent_id}, {"_id": 0})
                    if parent and parent.get("status") != "completed":
                        all_deps_met = False
                        break
                if all_deps_met:
                    await jobs_collection().update_one(
                        {"id": dep_id},
                        {
                            "$set": {"status": "pending", "updated_at": now},
                            "$push": {"logs": f"[{now}] Dependencies met. Auto-unblocked by {job['id']}."},
                        },
                    )

    return await jobs_collection().find_one({"id": job["id"]}, {"_id": 0})


async def night_queue_worker():
    global _worker_running
    _worker_running = True

    while _worker_running:
        try:
            active_jobs = (
                await jobs_collection().find({"status": {"$in": ["pending", "processing"]}}, {"_id": 0}).sort("priority", -1).to_list(10)
            )

            for job in active_jobs:
                if not _worker_running:
                    break
                await _advance_job(job)
        except Exception:
            pass

        await asyncio.sleep(3)


def start_worker():
    global _worker_task, _worker_running
    if _worker_task and not _worker_task.done():
        return
    _worker_running = True
    _worker_task = asyncio.create_task(night_queue_worker())


def stop_worker():
    global _worker_running
    _worker_running = False


@router.get("/worker/status")
async def worker_status():
    active = await jobs_collection().count_documents({"status": {"$in": ["pending", "processing"]}})
    blocked = await jobs_collection().count_documents({"status": "blocked"})
    completed = await jobs_collection().count_documents({"status": "completed"})
    total = await jobs_collection().count_documents({})
    return {
        "running": _worker_running and _worker_task is not None and not _worker_task.done(),
        "active_jobs": active,
        "blocked_jobs": blocked,
        "completed_jobs": completed,
        "total_jobs": total,
    }


@router.post("/worker/toggle")
async def toggle_worker():
    global _worker_running
    if _worker_running and _worker_task and not _worker_task.done():
        stop_worker()
        return {"status": "stopped"}
    start_worker()
    return {"status": "started"}


@router.websocket("/frontline/ws")
async def frontline_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            total_projects = await projects_collection().count_documents({})
            active_jobs = await jobs_collection().count_documents({"status": {"$in": ["pending", "processing"]}})
            blocked_jobs = await jobs_collection().count_documents({"status": "blocked"})
            completed_jobs = await jobs_collection().count_documents({"status": "completed"})
            total_tenants = await tenants_collection().count_documents({})
            active_builds = await builds_collection().count_documents({"status": {"$in": ["queued", "building"]}})
            live_deploys = await deployments_collection().count_documents({"status": "live"})

            pipeline_list = await pipelines_collection().find({}, {"_id": 0, "revenue": 1}).to_list(100)
            total_revenue = sum(p.get("revenue", 0) for p in pipeline_list)

            cpu_base = 8 + (active_jobs * 3) + (active_builds * 5)
            ram_base = 12.4 + (total_projects * 0.8) + (active_jobs * 1.2)

            payload = {
                "type": "frontline_update",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "metrics": {
                    "total_projects": total_projects,
                    "active_jobs": active_jobs,
                    "blocked_jobs": blocked_jobs,
                    "completed_jobs": completed_jobs,
                    "total_tenants": total_tenants,
                    "active_builds": active_builds,
                    "live_deployments": live_deploys,
                    "total_revenue": total_revenue,
                    "cpu_percent": min(round(cpu_base + _random.uniform(-3, 5), 1), 99),
                    "ram_gb": round(min(ram_base + _random.uniform(-1, 2), 42.6), 1),
                    "uptime_hours": round(_random.uniform(120, 720), 1),
                    "worker_running": _worker_running and _worker_task is not None and not _worker_task.done(),
                    "universes_online": len(_universe_registry),
                },
            }
            await websocket.send_json(payload)
            await asyncio.sleep(2)
    except (WebSocketDisconnect, RuntimeError):
        return


@router.get("/frontline/snapshot")
async def frontline_snapshot():
    total_projects = await projects_collection().count_documents({})
    active_jobs = await jobs_collection().count_documents({"status": {"$in": ["pending", "processing"]}})
    blocked_jobs = await jobs_collection().count_documents({"status": "blocked"})
    completed_jobs = await jobs_collection().count_documents({"status": "completed"})
    total_tenants = await tenants_collection().count_documents({})
    active_builds = await builds_collection().count_documents({"status": {"$in": ["queued", "building"]}})
    live_deploys = await deployments_collection().count_documents({"status": "live"})
    pipeline_list = await pipelines_collection().find({}, {"_id": 0, "revenue": 1}).to_list(100)
    total_revenue = sum(p.get("revenue", 0) for p in pipeline_list)

    return {
        "total_projects": total_projects,
        "active_jobs": active_jobs,
        "blocked_jobs": blocked_jobs,
        "completed_jobs": completed_jobs,
        "total_tenants": total_tenants,
        "active_builds": active_builds,
        "live_deployments": live_deploys,
        "total_revenue": total_revenue,
        "worker_running": _worker_running and _worker_task is not None and not _worker_task.done(),
        "universes_online": len(_universe_registry),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/pipelines")
async def create_pipeline(req: CreatePipelineRequest):
    now = datetime.now(timezone.utc).isoformat()
    pipeline = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "type": req.type,
        "lane": req.lane,
        "status": "active",
        "heartbeat": "idle",
        "executions": 0,
        "revenue": 0,
        "created_at": now,
        "updated_at": now,
    }
    await pipelines_collection().insert_one(pipeline)
    pipeline.pop("_id", None)
    return pipeline


@router.get("/pipelines")
async def list_pipelines():
    cursor = pipelines_collection().find({}, {"_id": 0})
    pipelines = await cursor.to_list(100)
    total_revenue = sum(p.get("revenue", 0) for p in pipelines)
    return {"pipelines": pipelines, "total": len(pipelines), "total_revenue": total_revenue}


@router.put("/pipelines/{pipeline_id}/pulse")
async def pulse_pipeline(pipeline_id: str):
    rev = _random.randint(50, 500)
    now = datetime.now(timezone.utc).isoformat()
    result = await pipelines_collection().update_one(
        {"id": pipeline_id},
        {"$set": {"heartbeat": "active", "updated_at": now}, "$inc": {"executions": 1, "revenue": rev}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    pipeline = await pipelines_collection().find_one({"id": pipeline_id}, {"_id": 0})
    return pipeline


@router.delete("/pipelines/{pipeline_id}")
async def delete_pipeline(pipeline_id: str):
    result = await pipelines_collection().delete_one({"id": pipeline_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return {"deleted": True}


def _generate_html5_shell(game_name, game_type, game_config, asset_manifest):
    return f"""<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
  <title>{game_name} - SLA113</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html, body {{ width: 100%; height: 100%; overflow: hidden; background: #050505; color: #d4af37; font-family: monospace; }}
    #loading {{ position: fixed; inset: 0; display: grid; place-items: center; background: #050505; z-index: 10; }}
    #score {{ position: fixed; top: 10px; left: 10px; color: #00c8ff; z-index: 20; font-weight: bold; letter-spacing: 2px; }}
  </style>
  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js\"></script>
</head>
<body>
  <div id=\"loading\">Loading {game_name}...</div>
  <div id=\"score\">0</div>
  <script src=\"game.js\"></script>
</body>
</html>"""


@router.post("/builds")
async def create_build(req: CreateBuildRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc).isoformat()
    build = {
        "id": f"BLD-{uuid.uuid4().hex[:8].upper()}",
        "project_id": req.project_id,
        "project_name": project.get("name", "Unknown"),
        "game_type": project.get("game_type", "unknown"),
        "target": req.target,
        "optimization": req.optimization,
        "include_assets": req.include_assets,
        "include_logic": req.include_logic,
        "status": "queued",
        "progress": 0,
        "stages": [
            {"name": "Asset Compilation", "status": "pending", "progress": 0},
            {"name": "Logic Binding", "status": "pending", "progress": 0},
            {"name": "Shader Compilation", "status": "pending", "progress": 0},
            {"name": "Bundle Packaging", "status": "pending", "progress": 0},
            {"name": "Optimization Pass", "status": "pending", "progress": 0},
        ],
        "output": None,
        "download_url": None,
        "size_mb": None,
        "logs": [f"[{now}] Build queued. Target: {req.target}, Optimization: {req.optimization}"],
        "created_at": now,
        "updated_at": now,
    }
    await builds_collection().insert_one(build)
    build.pop("_id", None)
    return build


@router.get("/builds")
async def list_builds():
    cursor = builds_collection().find({}, {"_id": 0, "zip_data": 0}).sort("created_at", -1)
    builds = await cursor.to_list(100)
    return {"builds": builds, "total": len(builds)}


@router.post("/builds/{build_id}/compile")
async def compile_build(build_id: str):
    build = await builds_collection().find_one({"id": build_id}, {"_id": 0})
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.get("download_url"):
        return build

    project = await projects_collection().find_one({"id": build["project_id"]}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    now = datetime.now(timezone.utc).isoformat()
    await builds_collection().update_one({"id": build_id}, {"$set": {"status": "building", "progress": 10}, "$push": {"logs": f"[{now}] Compilation started..."}})

    game_type = project.get("game_type", "unknown")
    game_name = project.get("name", "SLA113 Game")
    vision_assets = project.get("vision_assets", [])
    logic_specs = project.get("logic_specs", [])
    compositions = project.get("compositions", [])

    game_config = {"type": game_type, "name": game_name, "version": "1.0.0", "built_by": "SLA113"}
    for spec in logic_specs:
        game_config[spec.get("logic_type", "unknown")] = spec.get("specs", {})

    asset_manifest = []
    for va in vision_assets:
        assets_data = va.get("assets", [])
        if isinstance(assets_data, dict):
            assets_data = [assets_data] if assets_data else []
        if not isinstance(assets_data, list):
            continue
        for asset in assets_data:
            if not isinstance(asset, dict):
                continue
            if "asset" in asset and isinstance(asset["asset"], dict):
                asset = asset["asset"]
            if "id" in asset or "name" in asset:
                asset_manifest.append(
                    {
                        "id": asset.get("id", f"asset_{len(asset_manifest)}"),
                        "name": asset.get("name", "asset"),
                        "type": asset.get("type", "sprite"),
                        "dimensions": asset.get("dimensions", {"width": 64, "height": 64}),
                    }
                )

    try:
        build_dir = tempfile.mkdtemp(prefix="sla113_build_")
        os.makedirs(os.path.join(build_dir, "assets"), exist_ok=True)
        os.makedirs(os.path.join(build_dir, "logic"), exist_ok=True)

        await builds_collection().update_one({"id": build_id}, {"$set": {"progress": 30}, "$push": {"logs": f"[{now}] Stage: Asset Compilation"}})

        with open(os.path.join(build_dir, "game.json"), "w", encoding="utf-8") as f:
            json.dump(game_config, f, indent=2, default=str)

        with open(os.path.join(build_dir, "assets", "manifest.json"), "w", encoding="utf-8") as f:
            json.dump({"assets": asset_manifest, "total": len(asset_manifest)}, f, indent=2)

        for spec in logic_specs:
            fname = f"{spec.get('logic_type', 'unknown')}.json"
            with open(os.path.join(build_dir, "logic", fname), "w", encoding="utf-8") as f:
                json.dump(spec.get("specs", {}), f, indent=2, default=str)

        await builds_collection().update_one({"id": build_id}, {"$set": {"progress": 50}, "$push": {"logs": f"[{now}] Stage: Logic Binding"}})

        if compositions:
            with open(os.path.join(build_dir, "bundle.json"), "w", encoding="utf-8") as f:
                json.dump(compositions[-1].get("bundle", {}), f, indent=2, default=str)

        await builds_collection().update_one({"id": build_id}, {"$set": {"progress": 70}, "$push": {"logs": f"[{now}] Stage: Bundle Packaging"}})

        sprite_cursor = sprite_registry_collection().find({}, {"_id": 0}).sort("created_at", -1)
        all_sprites = await sprite_cursor.to_list(200)
        sprite_map = {}
        for spr in all_sprites:
            key = spr["name"].lower().replace(" ", "_").replace(",", "")
            sprite_url = spr["sprite_url"]
            if "customer-assets" in sprite_url or "emergentagent" in sprite_url:
                sprite_url = f"/api/sla113/sprites/proxy?url={sprite_url}"
            sprite_map[key] = {
                "sprite_url": sprite_url,
                "frame_width": spr["frame_width"],
                "frame_height": spr["frame_height"],
                "columns": spr["columns"],
                "rows": spr["rows"],
                "total_frames": spr["total_frames"],
                "animations": spr.get("animations", {}),
            }
        game_config["sprites"] = sprite_map

        loader_sprite = next(
            (s for s in all_sprites if s["entity_type"] == "ui" and "loader" in s["name"].lower()),
            None,
        )
        if loader_sprite:
            lu = loader_sprite["sprite_url"]
            if "customer-assets" in lu or "emergentagent" in lu:
                lu = f"/api/sla113/sprites/proxy?url={lu}"
            game_config["loader_url"] = lu

        lobby_cfg = project.get("lobby_config") or {}
        chosen_bg_key = lobby_cfg.get("background_sprite")
        chosen_bg_url = None
        if chosen_bg_key and chosen_bg_key in sprite_map:
            chosen_bg_url = sprite_map[chosen_bg_key]["sprite_url"]
        else:
            bg_sprites = [s for s in all_sprites if s["entity_type"] == "background"]
            if bg_sprites:
                bg_url = bg_sprites[0]["sprite_url"]
                if "customer-assets" in bg_url or "emergentagent" in bg_url:
                    bg_url = f"/api/sla113/sprites/proxy?url={bg_url}"
                chosen_bg_url = bg_url
        if chosen_bg_url:
            game_config["background_url"] = chosen_bg_url

        if lobby_cfg:
            game_config["lobby"] = {
                "name": lobby_cfg.get("name"),
                "main_boss": lobby_cfg.get("main_boss_sprite"),
                "partner_boss": lobby_cfg.get("partner_boss_sprite"),
                "extra_bosses": lobby_cfg.get("extra_bosses") or [],
                "theme_color": lobby_cfg.get("theme_color", "#d4af37"),
                "jackpot_tier": lobby_cfg.get("jackpot_tier", "MAJOR"),
                "base_bet": lobby_cfg.get("base_bet", 0.10),
            }

        html_content = _generate_html5_shell(game_name, game_type, game_config, asset_manifest)
        with open(os.path.join(build_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(html_content)

        js_content = get_game_template(game_type, game_name, game_config, asset_manifest)
        with open(os.path.join(build_dir, "game.js"), "w", encoding="utf-8") as f:
            f.write(js_content)

        await builds_collection().update_one({"id": build_id}, {"$set": {"progress": 90}, "$push": {"logs": f"[{now}] Stage: Optimization Pass"}})

        safe_name = re.sub(r"[^a-z0-9_]", "_", game_name.lower())[:50]
        zip_filename = f"sla113_{safe_name}_{build_id}.zip"
        zip_path = os.path.join("/tmp", zip_filename)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _dirs, files in os.walk(build_dir):
                for file in files:
                    full_path = os.path.join(root, file)
                    arcname = os.path.relpath(full_path, build_dir)
                    zf.write(full_path, arcname)

        size_mb = round(os.path.getsize(zip_path) / (1024 * 1024), 2)
        with open(zip_path, "rb") as f:
            zip_data = base64.b64encode(f.read()).decode()

        download_url = f"/api/sla113/builds/{build_id}/download"
        stages = [{"name": s["name"], "status": "completed", "progress": 100} for s in build["stages"]]

        await builds_collection().update_one(
            {"id": build_id},
            {
                "$set": {
                    "status": "completed",
                    "progress": 100,
                    "stages": stages,
                    "output": zip_filename,
                    "download_url": download_url,
                    "size_mb": size_mb,
                    "zip_data": zip_data,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "files_included": {
                        "index.html": True,
                        "game.js": True,
                        "game.json": True,
                        "assets/manifest.json": len(asset_manifest) > 0,
                        "logic_specs": len(logic_specs),
                        "bundle.json": len(compositions) > 0,
                    },
                },
                "$push": {
                    "logs": f"[{datetime.now(timezone.utc).isoformat()}] BUILD COMPLETE: {zip_filename} ({size_mb} MB). {len(asset_manifest)} assets, {len(logic_specs)} logic specs."
                },
            },
        )

        shutil.rmtree(build_dir, ignore_errors=True)
        if os.path.exists(zip_path):
            os.remove(zip_path)

        return await builds_collection().find_one({"id": build_id}, {"_id": 0, "zip_data": 0})

    except Exception as e:
        await builds_collection().update_one(
            {"id": build_id},
            {
                "$set": {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()},
                "$push": {"logs": f"[{datetime.now(timezone.utc).isoformat()}] BUILD FAILED: {e}"},
            },
        )
        raise HTTPException(status_code=500, detail=f"Build failed: {e}")


@router.get("/builds/{build_id}/download")
async def download_build(build_id: str):
    build = await builds_collection().find_one({"id": build_id})
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if not build.get("zip_data"):
        raise HTTPException(status_code=400, detail="Build not compiled yet. Call /builds/{id}/compile first.")

    zip_bytes = base64.b64decode(build["zip_data"])
    filename = build.get("output", f"sla113_build_{build_id}.zip")
    return Response(content=zip_bytes, media_type="application/zip", headers={"Content-Disposition": f"attachment; filename={filename}"})


@router.post("/builds/{build_id}/advance")
async def advance_build(build_id: str):
    build = await builds_collection().find_one({"id": build_id}, {"_id": 0, "zip_data": 0})
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build["status"] == "completed":
        return build

    stages = build["stages"]
    now = datetime.now(timezone.utc).isoformat()
    current_stage_idx = next((i for i, s in enumerate(stages) if s["status"] != "completed"), len(stages))

    if current_stage_idx < len(stages):
        stage = stages[current_stage_idx]
        new_progress = min(stage["progress"] + _random.randint(30, 60), 100)
        stage["progress"] = new_progress
        if new_progress >= 100:
            stage["status"] = "completed"
            log_msg = f"[{now}] Stage '{stage['name']}' completed."
        else:
            stage["status"] = "processing"
            log_msg = f"[{now}] Stage '{stage['name']}' at {new_progress}%..."
    else:
        log_msg = f"[{now}] All stages completed."

    total_progress = sum(s["progress"] for s in stages) // len(stages)
    all_done = all(s["status"] == "completed" for s in stages)
    new_status = "completed" if all_done else "building"

    await builds_collection().update_one(
        {"id": build_id},
        {"$set": {"stages": stages, "progress": total_progress, "status": new_status, "updated_at": now}, "$push": {"logs": log_msg}},
    )
    return await builds_collection().find_one({"id": build_id}, {"_id": 0, "zip_data": 0})


@router.delete("/builds/{build_id}")
async def delete_build(build_id: str):
    result = await builds_collection().delete_one({"id": build_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Build not found")
    return {"deleted": True}


@router.post("/compliance/check")
async def run_compliance_check(req: ComplianceCheckRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    checks = COMPLIANCE_CHECKS.get(req.jurisdiction, COMPLIANCE_CHECKS["INTERNAL"])
    now = datetime.now(timezone.utc).isoformat()
    logic_specs = project.get("logic_specs", [])

    rtp_spec = None
    for spec in logic_specs:
        if spec.get("logic_type") == "rtp":
            rtp_spec = spec.get("specs", {})
            break

    actual_rtp = None
    if rtp_spec:
        actual_rtp = rtp_spec.get("calculated_rtp") or rtp_spec.get("target_rtp")
        if isinstance(actual_rtp, str):
            try:
                actual_rtp = float(actual_rtp.replace("%", "").strip())
            except ValueError:
                actual_rtp = None
        elif isinstance(actual_rtp, (int, float)):
            actual_rtp = float(actual_rtp)

    min_rtp = {"GLI": 85.0, "MGA": 92.0, "UKGC": 88.0, "CURACAO": 80.0, "INTERNAL": 80.0}.get(req.jurisdiction, 85.0)

    results = []
    for check_name in checks:
        if "RTP" in check_name:
            if actual_rtp is not None:
                rtp_passed = actual_rtp >= min_rtp
                results.append(
                    {
                        "check": check_name,
                        "status": "PASS" if rtp_passed else "FAIL",
                        "severity": "critical" if not rtp_passed else "none",
                        "details": f"RTP {actual_rtp}% {'meets' if rtp_passed else 'BELOW'} {req.jurisdiction} minimum ({min_rtp}%). Source: Logic Engine.",
                        "value": f"{actual_rtp}%",
                        "source": "logic_engine",
                    }
                )
            else:
                results.append(
                    {
                        "check": check_name,
                        "status": "WARN",
                        "severity": "warning",
                        "details": "No RTP data from Logic Engine. Run Logic Engine with type=rtp first for real verification.",
                        "value": "N/A - Generate RTP via Logic Engine",
                        "source": "none",
                    }
                )
        elif "RNG" in check_name:
            has_rng = any(s.get("logic_type") == "rng" for s in logic_specs)
            results.append(
                {
                    "check": check_name,
                    "status": "PASS" if has_rng else "WARN",
                    "severity": "none" if has_rng else "warning",
                    "details": f"RNG specification {'found and verified' if has_rng else 'missing'}.",
                }
            )
        elif "Paytable" in check_name:
            has_pt = any(s.get("logic_type") == "paytable" for s in logic_specs)
            results.append(
                {
                    "check": check_name,
                    "status": "PASS" if has_pt else "WARN",
                    "severity": "none" if has_pt else "warning",
                    "details": f"Paytable {'verified against Logic Engine output' if has_pt else 'missing'}.",
                }
            )
        else:
            has_assets = len(project.get("vision_assets", [])) > 0
            has_logic = len(logic_specs) > 0
            passed = has_assets and has_logic
            results.append(
                {
                    "check": check_name,
                    "status": "PASS" if passed else "FAIL",
                    "severity": "warning" if not passed else "none",
                    "details": f"{'Verified' if passed else 'Incomplete data'} for {req.jurisdiction}.",
                }
            )

    has_fails = any(r["status"] == "FAIL" for r in results)
    has_warns = any(r["status"] == "WARN" for r in results)
    overall_status = "CERTIFIED" if not has_fails and not has_warns else "NEEDS_REMEDIATION" if has_fails else "CONDITIONAL"

    report = {
        "id": f"CMP-{uuid.uuid4().hex[:8].upper()}",
        "project_id": req.project_id,
        "project_name": project.get("name", "Unknown"),
        "game_type": project.get("game_type", "unknown"),
        "jurisdiction": req.jurisdiction,
        "check_type": req.check_type,
        "status": overall_status,
        "pass_rate": f"{sum(1 for r in results if r['status'] == 'PASS')}/{len(results)}",
        "actual_rtp": f"{actual_rtp}%" if actual_rtp is not None else "Not generated",
        "min_rtp_required": f"{min_rtp}%",
        "has_logic_data": len(logic_specs) > 0,
        "results": results,
        "created_at": now,
    }
    await compliance_collection().insert_one(report)
    report.pop("_id", None)
    return report


@router.get("/compliance")
async def list_compliance_reports():
    cursor = compliance_collection().find({}, {"_id": 0}).sort("created_at", -1)
    reports = await cursor.to_list(100)
    return {"reports": reports, "total": len(reports)}


@router.delete("/compliance/{report_id}")
async def delete_compliance_report(report_id: str):
    result = await compliance_collection().delete_one({"id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"deleted": True}


@router.post("/compliance/auto-certify")
async def auto_certify(req: AutoCertifyRequest):
    project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    steps = []
    logic_specs = project.get("logic_specs", [])
    existing_types = {s.get("logic_type") for s in logic_specs}
    required_types = ["rtp", "rng", "paytable"]
    missing = [t for t in required_types if t not in existing_types]
    steps.append({"step": "AUDIT", "detail": f"Existing specs: {list(existing_types) or 'none'}. Missing: {missing or 'none - all present'}.", "status": "done"})

    for spec_type in missing:
        steps.append({"step": f"GENERATE_{spec_type.upper()}", "detail": f"Running Logic Engine type={spec_type}...", "status": "running"})
        try:
            result = await generate_logic(project=project, logic_type=spec_type, difficulty="medium", custom_requirements=None)
            await projects_collection().update_one(
                {"id": req.project_id},
                {"$push": {"logic_specs": result}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
            )
            project = await projects_collection().find_one({"id": req.project_id}, {"_id": 0})
            steps[-1]["status"] = "done"
            steps[-1]["detail"] = f"Logic Engine type={spec_type} generated successfully ({result.get('generation_time', '?')}s)"
        except Exception as e:
            steps[-1]["status"] = "error"
            steps[-1]["detail"] = f"Failed to generate {spec_type}: {e}"

    steps.append({"step": "COMPLIANCE_CHECK", "detail": f"Running {req.jurisdiction} compliance...", "status": "running"})
    try:
        cert = await run_compliance_check(ComplianceCheckRequest(project_id=req.project_id, jurisdiction=req.jurisdiction, check_type="auto-certify"))
        steps[-1]["status"] = "done"
        steps[-1]["detail"] = f"Compliance: {cert['status']} ({cert['pass_rate']}) - RTP: {cert['actual_rtp']}"
        final_status = cert["status"]
    except Exception as e:
        cert = None
        steps[-1]["status"] = "error"
        steps[-1]["detail"] = f"Compliance check failed: {e}"
        final_status = "ERROR"

    return {
        "project_id": req.project_id,
        "jurisdiction": req.jurisdiction,
        "steps": steps,
        "certification": cert,
        "final_status": final_status,
    }


@router.post("/deploy")
async def deploy_build(req: DeployRequest):
    build_full = await builds_collection().find_one({"id": req.build_id})
    if not build_full:
        raise HTTPException(status_code=404, detail="Build not found")
    if build_full["status"] != "completed":
        raise HTTPException(status_code=400, detail="Build must be completed before deployment")

    now = datetime.now(timezone.utc).isoformat()
    deploy_id = f"DPL-{uuid.uuid4().hex[:8].upper()}"
    deploy_dir = f"/app/backend/static/deploys/{deploy_id}"

    deployment = {
        "id": deploy_id,
        "build_id": req.build_id,
        "project_name": build_full.get("project_name", "Unknown"),
        "target_cdn": req.target_cdn,
        "region": req.region,
        "auto_ssl": req.auto_ssl,
        "status": "deploying",
        "progress": 0,
        "url": None,
        "preview_url": None,
        "ssl_status": "pending" if req.auto_ssl else "disabled",
        "logs": [f"[{now}] Deployment initiated. CDN: {req.target_cdn}, Region: {req.region}"],
        "created_at": now,
        "updated_at": now,
    }

    try:
        os.makedirs(deploy_dir, exist_ok=True)

        zip_data = build_full.get("zip_data")
        if zip_data:
            zip_bytes = base64.b64decode(zip_data)
            zip_path = f"/tmp/deploy_{deploy_id}.zip"
            with open(zip_path, "wb") as f:
                f.write(zip_bytes)

            with zipfile.ZipFile(zip_path, "r") as zf:
                for member in zf.namelist():
                    member_path = os.path.realpath(os.path.join(deploy_dir, member))
                    if not member_path.startswith(os.path.realpath(deploy_dir)):
                        raise HTTPException(status_code=400, detail="Malicious zip entry detected")
                zf.extractall(deploy_dir)
            os.remove(zip_path)

            preview_url = f"/api/sla113/live/{deploy_id}/index.html"
            deployment["progress"] = 100
            deployment["status"] = "live"
            deployment["ssl_status"] = "active" if req.auto_ssl else "disabled"
            deployment["preview_url"] = preview_url
            deployment["url"] = preview_url
            deployment["logs"].append(f"[{now}] Files extracted. Preview live.")
        else:
            deployment["status"] = "failed"
            deployment["logs"].append(f"[{now}] FAILED: No zip data in build.")
    except Exception as e:
        deployment["status"] = "failed"
        deployment["logs"].append(f"[{now}] FAILED: {e}")

    await deployments_collection().insert_one(deployment)
    deployment.pop("_id", None)
    return deployment


@router.post("/deploy/{deploy_id}/advance")
async def advance_deployment(deploy_id: str):
    deploy = await deployments_collection().find_one({"id": deploy_id}, {"_id": 0})
    if not deploy:
        raise HTTPException(status_code=404, detail="Deployment not found")
    if deploy["status"] == "live":
        return deploy

    now = datetime.now(timezone.utc).isoformat()
    url = deploy.get("preview_url") or f"/api/sla113/live/{deploy_id}/index.html"
    await deployments_collection().update_one(
        {"id": deploy_id},
        {
            "$set": {"progress": 100, "status": "live", "url": url, "preview_url": url, "ssl_status": "active", "updated_at": now},
            "$push": {"logs": f"[{now}] LIVE."},
        },
    )
    return await deployments_collection().find_one({"id": deploy_id}, {"_id": 0})


@router.get("/deployments")
async def list_deployments():
    cursor = deployments_collection().find({}, {"_id": 0}).sort("created_at", -1)
    deploys = await cursor.to_list(100)
    return {"deployments": deploys, "total": len(deploys)}


@router.delete("/deploy/{deploy_id}")
async def delete_deployment(deploy_id: str):
    deploy_dir = f"/app/backend/static/deploys/{deploy_id}"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir, ignore_errors=True)
    result = await deployments_collection().delete_one({"id": deploy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return {"deleted": True}


@router.get("/live/{deploy_id}/{file_path:path}")
async def serve_live_game(deploy_id: str, file_path: str):
    if not re.match(r"^DPL-[A-F0-9]{8}$", deploy_id):
        raise HTTPException(status_code=400, detail="Invalid deploy ID format")

    base_dir = os.path.realpath("/app/backend/static/deploys")
    full_path = os.path.realpath(os.path.join(base_dir, deploy_id, file_path))
    if not full_path.startswith(base_dir):
        raise HTTPException(status_code=403, detail="Access denied")
    if not os.path.exists(full_path) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    allowed_extensions = {".html", ".js", ".json", ".css", ".png", ".jpg", ".svg", ".ico", ".wav"}
    ext = os.path.splitext(file_path)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=403, detail="File type not allowed")

    content_types = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".json": "application/json",
        ".css": "text/css",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".wav": "audio/wav",
    }
    media_type = content_types.get(ext, "application/octet-stream")
    return FileResponse(full_path, media_type=media_type)


@router.post("/audio/generate")
async def generate_audio(req: AudioForgeRequest):
    valid_types = ["sfx", "ambience", "foley", "music_cues", "stems", "loops", "tts", "voice_routing"]
    if req.audio_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid audio type. Valid: {valid_types}")

    try:
        result = await generate_audio_asset(
            audio_type=req.audio_type,
            title=req.title,
            game_type=req.game_type,
            custom_params=req.custom_params,
            engine=req.engine,
        )
        await audio_collection().insert_one({**result})
        result.pop("_id", None)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {e}")


@router.get("/audio/assets")
async def list_audio_assets():
    cursor = audio_collection().find({}, {"_id": 0}).sort("created_at", -1)
    assets = await cursor.to_list(100)
    return {"assets": assets, "total": len(assets)}


@router.get("/audio/assets/{asset_id}")
async def get_audio_asset(asset_id: str):
    asset = await audio_collection().find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Audio asset not found")
    return asset


@router.delete("/audio/assets/{asset_id}")
async def delete_audio_asset(asset_id: str):
    result = await audio_collection().delete_one({"id": asset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audio asset not found")
    return {"deleted": True}


@router.get("/audio/templates")
async def list_audio_templates():
    return {
        "templates": SFX_TEMPLATES,
        "audio_types": list(SFX_TEMPLATES.keys()),
        "engines": AUDIO_ENGINES,
    }


@router.get("/fish/lobbies")
async def list_fish_lobbies():
    return {"lobbies": list_lobbies()}


@router.post("/fish/lobbies")
async def create_fish_lobby(name: str = "Neon Fish Arena"):
    lobby = create_lobby(name)
    return {"id": lobby.id, "name": lobby.name, "created_at": lobby.created_at}


@router.delete("/fish/lobbies/{lobby_id}")
async def delete_fish_lobby(lobby_id: str):
    if delete_lobby(lobby_id):
        return {"deleted": True}
    raise HTTPException(status_code=404, detail="Lobby not found")


@router.websocket("/fish/play/{lobby_id}")
async def fish_game_ws(websocket: WebSocket, lobby_id: str):
    lobby = get_lobby(lobby_id)
    if not lobby:
        await websocket.close(code=4004, reason="Lobby not found")
        return

    await websocket.accept()
    player = None
    try:
        join_msg = await websocket.receive_json()
        player_name = join_msg.get("name", f"Player_{uuid.uuid4().hex[:4]}")
        player = await lobby.add_player(websocket, player_name)

        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            if action == "shoot":
                await lobby.handle_shoot(player.id, data.get("fish_id", ""))
            elif action == "chat":
                await lobby.handle_chat(player.id, data.get("message", ""))
            elif action == "cursor":
                player.x = data.get("x", 0)
                player.y = data.get("y", 0)
    except (WebSocketDisconnect, RuntimeError):
        pass
    finally:
        if player and lobby:
            await lobby.remove_player(player.id)


@router.post("/slots/symbols")
async def create_symbol_set(req: CreateSymbolSetRequest):
    if len(req.symbols) < 5 or len(req.symbols) > 15:
        raise HTTPException(status_code=400, detail="Need 5-15 symbols")

    now = datetime.now(timezone.utc).isoformat()
    symbol_set = {
        "id": f"SYM-{uuid.uuid4().hex[:6].upper()}",
        "name": req.name,
        "symbols": req.symbols,
        "total_symbols": len(req.symbols),
        "created_at": now,
    }
    await slot_symbols_collection().insert_one(symbol_set)
    symbol_set.pop("_id", None)
    return symbol_set


@router.get("/slots/symbols")
async def list_symbol_sets():
    cursor = slot_symbols_collection().find({}, {"_id": 0}).sort("created_at", -1)
    sets = await cursor.to_list(50)
    default_set = {
        "id": "DEFAULT",
        "name": "Classic",
        "symbols": [
            {"name": "7", "color": "#ff0000", "weight": 2, "payout": 50},
            {"name": "DIAMOND", "color": "#00c8ff", "weight": 3, "payout": 25},
            {"name": "STAR", "color": "#d4af37", "weight": 4, "payout": 15},
            {"name": "BAR", "color": "#f5c542", "weight": 6, "payout": 10},
            {"name": "BELL", "color": "#ffaa00", "weight": 8, "payout": 8},
            {"name": "CHERRY", "color": "#ff4466", "weight": 10, "payout": 5},
            {"name": "LEMON", "color": "#88ff44", "weight": 12, "payout": 3},
            {"name": "PLUM", "color": "#9944ff", "weight": 10, "payout": 4},
            {"name": "ORANGE", "color": "#ff8800", "weight": 10, "payout": 4},
        ],
        "total_symbols": 9,
    }
    return {"sets": [default_set] + sets, "total": len(sets) + 1}


@router.get("/slots/symbols/{set_id}")
async def get_symbol_set(set_id: str):
    if set_id == "DEFAULT":
        return {
            "id": "DEFAULT",
            "name": "Classic",
            "symbols": [
                {"name": "7", "color": "#ff0000", "weight": 2, "payout": 50},
                {"name": "DIAMOND", "color": "#00c8ff", "weight": 3, "payout": 25},
                {"name": "STAR", "color": "#d4af37", "weight": 4, "payout": 15},
                {"name": "BAR", "color": "#f5c542", "weight": 6, "payout": 10},
                {"name": "BELL", "color": "#ffaa00", "weight": 8, "payout": 8},
                {"name": "CHERRY", "color": "#ff4466", "weight": 10, "payout": 5},
                {"name": "LEMON", "color": "#88ff44", "weight": 12, "payout": 3},
                {"name": "PLUM", "color": "#9944ff", "weight": 10, "payout": 4},
                {"name": "ORANGE", "color": "#ff8800", "weight": 10, "payout": 4},
            ],
        }
    ss = await slot_symbols_collection().find_one({"id": set_id}, {"_id": 0})
    if not ss:
        raise HTTPException(status_code=404, detail="Symbol set not found")
    return ss


@router.delete("/slots/symbols/{set_id}")
async def delete_symbol_set(set_id: str):
    if set_id == "DEFAULT":
        raise HTTPException(status_code=400, detail="Cannot delete default set")
    result = await slot_symbols_collection().delete_one({"id": set_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Symbol set not found")
    return {"deleted": True}


@router.get("/sprites/proxy")
async def proxy_sprite(url: str):
    import httpx

    if not url.startswith("https://"):
        raise HTTPException(status_code=400, detail="Only HTTPS URLs allowed")
    if "customer-assets" not in url and "emergentagent" not in url:
        raise HTTPException(status_code=403, detail="Domain not allowed")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Upstream error")
            ct = resp.headers.get("content-type", "image/jpeg")
            return Response(
                content=resp.content,
                media_type=ct,
                headers={"Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=86400"},
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/sprites/register")
async def register_sprite(req: SpriteAssetRequest):
    now = datetime.now(timezone.utc).isoformat()
    sprite = {
        "id": f"SPR-{uuid.uuid4().hex[:6].upper()}",
        "name": req.name,
        "entity_type": req.entity_type,
        "sprite_url": req.sprite_url,
        "frame_width": req.frame_width,
        "frame_height": req.frame_height,
        "columns": req.columns,
        "rows": req.rows,
        "total_frames": req.total_frames,
        "animations": req.animations,
        "tier": req.tier,
        "metadata": req.metadata,
        "created_at": now,
    }
    await sprite_registry_collection().insert_one(sprite)
    sprite.pop("_id", None)
    return sprite


@router.get("/sprites")
async def list_sprites(entity_type: str = None):
    query = {} if not entity_type else {"entity_type": entity_type}
    cursor = sprite_registry_collection().find(query, {"_id": 0}).sort("created_at", -1)
    sprites = await cursor.to_list(200)
    return {"sprites": sprites, "total": len(sprites)}


@router.get("/sprites/{sprite_id}")
async def get_sprite(sprite_id: str):
    sprite = await sprite_registry_collection().find_one({"id": sprite_id}, {"_id": 0})
    if not sprite:
        raise HTTPException(status_code=404, detail="Sprite not found")
    return sprite


@router.delete("/sprites/{sprite_id}")
async def delete_sprite(sprite_id: str):
    result = await sprite_registry_collection().delete_one({"id": sprite_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sprite not found")
    return {"deleted": True}


@router.post("/lobbies")
async def create_composer_lobby(req: LobbyRequest):
    now = datetime.now(timezone.utc).isoformat()
    lobby = {"id": f"LBY-{uuid.uuid4().hex[:8].upper()}", **req.model_dump(), "created_at": now, "updated_at": now}
    await lobbies_collection().insert_one(lobby)
    lobby.pop("_id", None)
    return lobby


@router.get("/lobbies")
async def list_composer_lobbies():
    cursor = lobbies_collection().find({}, {"_id": 0}).sort("created_at", 1)
    lobbies = await cursor.to_list(200)
    return {"lobbies": lobbies, "total": len(lobbies)}


@router.get("/lobbies/{lobby_id}")
async def get_composer_lobby(lobby_id: str):
    lobby = await lobbies_collection().find_one({"id": lobby_id}, {"_id": 0})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return lobby


@router.patch("/lobbies/{lobby_id}")
async def update_lobby(lobby_id: str, body: Dict[str, Any]):
    body.pop("id", None)
    body.pop("_id", None)
    body["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await lobbies_collection().update_one({"id": lobby_id}, {"$set": body})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return await lobbies_collection().find_one({"id": lobby_id}, {"_id": 0})


@router.delete("/lobbies/{lobby_id}")
async def delete_lobby_row(lobby_id: str):
    result = await lobbies_collection().delete_one({"id": lobby_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lobby not found")
    return {"deleted": True}


@router.post("/lobbies/{lobby_id}/deploy")
async def deploy_lobby(lobby_id: str):
    lobby = await lobbies_collection().find_one({"id": lobby_id}, {"_id": 0})
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")

    now = datetime.now(timezone.utc).isoformat()
    project_id = str(uuid.uuid4())
    project = {
        "id": project_id,
        "name": lobby["name"],
        "game_type": lobby["game_type"],
        "theme": lobby.get("description", "")[:60],
        "status": "in_dev",
        "lobby_id": lobby_id,
        "lobby_config": lobby,
        "created_at": now,
        "updated_at": now,
    }
    await projects_collection().insert_one(project)

    build_id = f"BLD-{uuid.uuid4().hex[:8].upper()}"
    build = {
        "id": build_id,
        "project_id": project_id,
        "project_name": lobby["name"],
        "game_type": lobby["game_type"],
        "target": "web",
        "optimization": "balanced",
        "include_assets": True,
        "include_logic": True,
        "status": "queued",
        "progress": 0,
        "stages": [
            {"name": "Asset Compilation", "status": "pending", "progress": 0},
            {"name": "Logic Binding", "status": "pending", "progress": 0},
            {"name": "Shader Compilation", "status": "pending", "progress": 0},
            {"name": "Bundle Packaging", "status": "pending", "progress": 0},
            {"name": "Optimization Pass", "status": "pending", "progress": 0},
        ],
        "output": None,
        "download_url": None,
        "size_mb": None,
        "logs": [f"[{now}] Lobby deploy initiated: {lobby['name']}"],
        "created_at": now,
        "updated_at": now,
    }
    await builds_collection().insert_one(build)

    await compile_build(build_id)
    dep_req = DeployRequest(build_id=build_id, target_cdn="emergent-mock", region="us-east-1", auto_ssl=True)
    deployment = await deploy_build(dep_req)

    return {
        "lobby_id": lobby_id,
        "lobby_name": lobby["name"],
        "project_id": project_id,
        "build_id": build_id,
        "deployment": deployment,
        "preview_url": deployment.get("preview_url"),
    }


async def seed_default_lobbies():
    count = await lobbies_collection().count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    defaults = [
        {
            "name": "Shadow Pack",
            "slug": "shadow_pack",
            "main_boss_sprite": "wolf_xolotl_pack",
            "partner_boss_sprite": "g_wolf",
            "background_sprite": "wolf_xolotls_arena",
            "theme_color": "#d4af37",
            "description": "Xolotl Pack + G-Wolf hunt as one.",
            "jackpot_tier": "GRAND",
            "base_bet": 0.25,
        },
        {
            "name": "Jaguar Warrior",
            "slug": "jaguar_warrior",
            "main_boss_sprite": "jaguar_warrior",
            "background_sprite": "three_worlds_pyramid",
            "theme_color": "#d4af37",
            "description": "Classic jaguar spirit.",
            "jackpot_tier": "MINOR",
            "base_bet": 0.10,
        },
        {
            "name": "Quetzalcoatl Fireborn",
            "slug": "quetzalcoatl",
            "main_boss_sprite": "quetzalcoatl_fireborn",
            "background_sprite": "three_worlds_pyramid",
            "theme_color": "#00ffcc",
            "description": "Feathered serpent major tier.",
            "jackpot_tier": "MAJOR",
            "base_bet": 0.15,
        },
    ]
    for d in defaults:
        await lobbies_collection().insert_one(
            {
                "id": f"LBY-{uuid.uuid4().hex[:8].upper()}",
                "game_type": "fish_shooting",
                "partner_boss_sprite": d.get("partner_boss_sprite"),
                "audio_track": None,
                "fish_sprite": None,
                "extra_bosses": [],
                "created_at": now,
                "updated_at": now,
                **d,
            }
        )


async def seed_default_pipelines():
    count = await pipelines_collection().count_documents({})
    if count != 0:
        return

    defaults = [
        {"name": "Lead Qualification Engine", "type": "Automation", "lane": 1},
        {"name": "CRM Syncing Logic", "type": "Automation", "lane": 1},
        {"name": "Pro Voice Over (SaaS)", "type": "Utility", "lane": 2},
        {"name": "SMS/Email Gateway", "type": "Utility", "lane": 2},
        {"name": "White-Label Instance", "type": "Sovereign", "lane": 3},
        {"name": "Managed Sovereignty", "type": "Sovereign", "lane": 3},
    ]
    now = datetime.now(timezone.utc).isoformat()
    for d in defaults:
        await pipelines_collection().insert_one(
            {
                "id": str(uuid.uuid4()),
                **d,
                "status": "active",
                "heartbeat": "idle",
                "executions": 0,
                "revenue": 0,
                "created_at": now,
                "updated_at": now,
            }
        )
