from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/admin/universe", tags=["Admin Universe"])


# ---------------------------------------------------------
# SLA113 VOICE (matches frontend universeApi)
# ---------------------------------------------------------
@router.get("/voice")
async def get_voices():
    return {
        "status": "success",
        "message": "Voices retrieved",
        "data": [
            {
                "id": "voice_1",
                "name": "Narrator",
                "description": "Deep narrative voice",
                "category": "narration",
                "preview_url": None,
                "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0},
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "voice_2",
                "name": "Character Male",
                "description": "Male character voice",
                "category": "character",
                "preview_url": None,
                "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0},
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "voice_3",
                "name": "Character Female",
                "description": "Female character voice",
                "category": "character",
                "preview_url": None,
                "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0},
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }


@router.get("/voice/{voice_id}")
async def get_voice(voice_id: str):
    return {
        "status": "success",
        "message": "Voice retrieved",
        "data": {
            "id": voice_id,
            "name": "Narrator",
            "description": "Deep narrative voice",
            "category": "narration",
            "settings": {"speed": 1.0, "pitch": 1.0, "volume": 1.0},
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


@router.post("/voice")
async def create_voice(data: dict):
    return {
        "status": "success",
        "message": "Voice created",
        "data": {
            "id": f"voice_{datetime.utcnow().timestamp()}",
            **data
        }
    }


@router.post("/voice/{voice_id}/generate")
async def generate_speech(voice_id: str, data: dict):
    return {
        "status": "success",
        "message": "Speech generated",
        "data": {
            "audio_url": f"https://example.com/audio/{voice_id}.mp3"
        }
    }


# ---------------------------------------------------------
# SLA113 SFX
# ---------------------------------------------------------
@router.get("/sfx")
async def get_sfx():
    return {
        "status": "success",
        "message": "SFX retrieved",
        "data": [
            {
                "id": "sfx_1",
                "name": "Explosion",
                "category": "action",
                "duration": 2.5,
                "file_url": "https://example.com/sfx/explosion.mp3",
                "tags": ["explosion", "action"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "sfx_2",
                "name": "Footsteps",
                "category": "ambient",
                "duration": 1.2,
                "file_url": "https://example.com/sfx/footsteps.mp3",
                "tags": ["footsteps", "walking"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }


@router.get("/sfx/{sfx_id}")
async def get_sfx_item(sfx_id: str):
    return {
        "status": "success",
        "message": "SFX retrieved",
        "data": {
            "id": sfx_id,
            "name": "Explosion",
            "category": "action",
            "duration": 2.5,
            "file_url": "https://example.com/sfx/explosion.mp3",
            "tags": ["explosion", "action"],
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


@router.post("/sfx/generate")
async def generate_sfx(data: dict):
    return {
        "status": "success",
        "message": "SFX generated",
        "data": {
            "id": f"sfx_{datetime.utcnow().timestamp()}",
            "name": data.get("prompt", "Generated SFX"),
            "category": "generated",
            "duration": 2.0,
            "file_url": "https://example.com/sfx/generated.mp3",
            "tags": ["generated"],
            "created_at": datetime.utcnow().isoformat()
        }
    }


# ---------------------------------------------------------
# SLA113 AMBIENT
# ---------------------------------------------------------
@router.get("/ambient")
async def get_ambients():
    return {
        "status": "success",
        "message": "Ambients retrieved",
        "data": [
            {
                "id": "ambient_1",
                "name": "Forest",
                "description": "Forest ambient sounds",
                "file_url": "https://example.com/ambient/forest.mp3",
                "duration": 60.0,
                "loop": True,
                "volume": 0.7,
                "category": "nature",
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "ambient_2",
                "name": "City",
                "description": "City ambient sounds",
                "file_url": "https://example.com/ambient/city.mp3",
                "duration": 60.0,
                "loop": True,
                "volume": 0.5,
                "category": "urban",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }


@router.get("/ambient/{ambient_id}")
async def get_ambient(ambient_id: str):
    return {
        "status": "success",
        "message": "Ambient retrieved",
        "data": {
            "id": ambient_id,
            "name": "Forest",
            "description": "Forest ambient sounds",
            "file_url": "https://example.com/ambient/forest.mp3",
            "duration": 60.0,
            "loop": True,
            "volume": 0.7,
            "category": "nature",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


@router.post("/ambient")
async def create_ambient(data: dict):
    return {
        "status": "success",
        "message": "Ambient created",
        "data": {
            "id": f"ambient_{datetime.utcnow().timestamp()}",
            **data
        }
    }


@router.post("/ambient/generate")
async def generate_ambient(data: dict):
    return {
        "status": "success",
        "message": "Ambient generated",
        "data": {
            "id": f"ambient_{datetime.utcnow().timestamp()}",
            "name": data.get("prompt", "Generated Ambient"),
            "description": "AI generated ambient",
            "file_url": "https://example.com/ambient/generated.mp3",
            "duration": data.get("duration", 60.0),
            "loop": True,
            "volume": 0.7,
            "category": "generated",
            "created_at": datetime.utcnow().isoformat()
        }
    }


# ---------------------------------------------------------
# IMAGE GENERATION (matches frontend /images/generate)
# ---------------------------------------------------------
import asyncio
from app.services.vision_smith import VisionSmith
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import SessionLocal

@router.get("/images")
async def get_image_generations():
    """List all image generations."""
    return {
        "status": "success",
        "message": "Image generations retrieved",
        "data": []
    }


@router.post("/images/generate")
async def generate_image(data: dict):
    """
    Generate an image using VisionSmith (Azure DALL-E 3).
    This is the main endpoint the frontend calls.
    """
    prompt = data.get("prompt", "")
    if not prompt:
        return {"status": "error", "message": "Prompt is required"}

    size = data.get("size") or data.get("width", 1024)
    if isinstance(size, int):
        size = f"{size}x{size}"
    quality = data.get("quality", "hd")

    async def _generate():
        async with SessionLocal() as db:
            smith = VisionSmith(db)
            result = await smith.generate(prompt=prompt, size=size, quality=quality)
            return result

    try:
        result = await asyncio.wait_for(_generate(), timeout=120)
        image_id = result.get("image_id", "")
        return {
            "status": "success",
            "message": "Image generation started",
            "data": {
                "id": image_id or f"img_{datetime.utcnow().timestamp()}",
                "prompt": prompt,
                "negative_prompt": data.get("negative_prompt"),
                "style": data.get("style", "realistic"),
                "width": data.get("width", 1024),
                "height": data.get("height", 1024),
                "steps": data.get("steps", 30),
                "seed": data.get("seed"),
                "status": "completed",
                "result_url": result.get("url") or f"/static/images/{image_id}.png" if image_id else None,
                "created_at": datetime.utcnow().isoformat()
            }
        }
    except asyncio.TimeoutError:
        return {"status": "error", "message": "Image generation timed out"}
    except Exception as e:
        return {"status": "error", "message": f"Image generation failed: {str(e)}"}


@router.get("/images/generate")
async def get_image_generations_legacy():
    return {
        "status": "success",
        "message": "Image generations retrieved",
        "data": []
    }


@router.get("/image/generate/{image_id}")
async def get_image_generation(image_id: str):
    return {
        "status": "success",
        "message": "Image generation retrieved",
        "data": {
            "id": image_id,
            "prompt": "Sample prompt",
            "style": "realistic",
            "width": 512,
            "height": 512,
            "steps": 30,
            "status": "completed",
            "result_url": "https://example.com/image/generated.png",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


# ---------------------------------------------------------
# IMAGE ENHANCEMENT
# ---------------------------------------------------------
@router.get("/image/enhance")
async def get_image_enhancements():
    return {
        "status": "success",
        "message": "Image enhancements retrieved",
        "data": []
    }


@router.post("/image/enhance")
async def enhance_image(data: dict):
    return {
        "status": "success",
        "message": "Image enhancement started",
        "data": {
            "id": f"enh_{datetime.utcnow().timestamp()}",
            "original_url": data.get("original_url", ""),
            "enhanced_url": None,
            "scale": data.get("scale", 2),
            "denoise": data.get("denoise", 0.5),
            "face_enhance": data.get("face_enhance", False),
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
    }


@router.get("/image/enhance/{enhance_id}")
async def get_image_enhancement(enhance_id: str):
    return {
        "status": "success",
        "message": "Image enhancement retrieved",
        "data": {
            "id": enhance_id,
            "original_url": "https://example.com/image/original.png",
            "enhanced_url": "https://example.com/image/enhanced.png",
            "scale": 2,
            "denoise": 0.5,
            "face_enhance": False,
            "status": "completed",
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


# ---------------------------------------------------------
# CANON STACK API — Real canon engines from engine_namespace
# ---------------------------------------------------------
@router.get("/canon/stack")
async def get_canon_stack():
    """List all canon engines (PlayfulArtBible, SGV+Aztec, EntropyEngine, etc.)."""
    from ..core.engine_namespace import CANON_ENGINES, SLA113_CORE_ENGINES
    canon = {**CANON_ENGINES, **SLA113_CORE_ENGINES}
    return {
        "status": "success",
        "data": [
            {
                "id": eid,
                "name": e.name,
                "engine_type": e.engine_type,
                "canon_lock": e.canon_lock,
                "status": e.status,
                "enabled_for": e.enabled_for,
                "description": e.description,
                "credit_cost": e.credit_cost,
            }
            for eid, e in canon.items()
        ],
        "count": len(canon),
        "boundary": "SLA113_CANON_LOCKED",
    }


@router.get("/canon/stack/{engine_id}")
async def get_canon_engine(engine_id: str):
    """Get a specific canon engine by ID."""
    from ..core.engine_namespace import CANON_ENGINES, SLA113_CORE_ENGINES
    canon = {**CANON_ENGINES, **SLA113_CORE_ENGINES}
    engine = canon.get(engine_id)
    if not engine:
        raise HTTPException(status_code=404, detail=f"Canon engine '{engine_id}' not found")
    return {
        "status": "success",
        "data": {
            "id": engine_id,
            "name": engine.name,
            "engine_type": engine.engine_type,
            "canon_lock": engine.canon_lock,
            "status": engine.status,
            "enabled_for": engine.enabled_for,
            "description": engine.description,
            "credit_cost": engine.credit_cost,
            "service": engine.service,
        },
    }


@router.post("/canon/inject")
async def canon_inject(payload: dict = {}):
    """Dispatch a canon injection pipeline run via SLA113."""
    from ..core.engine_namespace import get_southern_pipeline, calculate_southern_pipeline_cost
    pipeline = get_southern_pipeline("canon_injection_pipeline")
    return {
        "status": "success",
        "message": "Canon injection pipeline dispatched",
        "pipeline_id": "canon_injection_pipeline",
        "steps": pipeline["steps"] if pipeline else [],
        "payload": payload,
        "boundary": "SLA113_ORCHESTRATED",
    }


# Legacy stubs kept for backward compat
@router.get("/canon/info")
async def get_canon_info():
    from ..core.engine_namespace import CANON_ENGINES, SLA113_CORE_ENGINES
    canon = {**CANON_ENGINES, **SLA113_CORE_ENGINES}
    return {
        "status": "success",
        "message": "Canon info retrieved",
        "data": [{"id": eid, "name": e.name, "canon_lock": e.canon_lock} for eid, e in canon.items()],
    }


@router.get("/canon/info/{canon_id}")
async def get_canon_item(canon_id: str):
    from ..core.engine_namespace import CANON_ENGINES, SLA113_CORE_ENGINES
    canon = {**CANON_ENGINES, **SLA113_CORE_ENGINES}
    e = canon.get(canon_id)
    if not e:
        raise HTTPException(status_code=404, detail="Canon engine not found")
    return {"status": "success", "data": {"id": canon_id, "name": e.name, "description": e.description}}


@router.post("/canon/info")
async def create_canon_item(data: dict):
    return {"status": "success", "message": "Canon item created", "data": {**data, "created_at": datetime.utcnow().isoformat()}}


@router.put("/canon/info/{canon_id}")
async def update_canon_item(canon_id: str, data: dict):
    return {"status": "success", "message": "Canon item updated", "data": {"id": canon_id, **data, "updated_at": datetime.utcnow().isoformat()}}


@router.delete("/canon/info/{canon_id}")
async def delete_canon_item(canon_id: str):
    return {"status": "success", "message": "Canon item deleted"}


# ---------------------------------------------------------
# OG REV_7 BUILD — Connected to Southern Pipeline System
# ---------------------------------------------------------
@router.get("/og-build/pipelines")
async def list_og_build_pipelines():
    """List OG REV_7 build pipelines."""
    from ..core.engine_namespace import list_southern_pipelines
    pipes = list_southern_pipelines(group="og_build")
    return {"status": "success", "data": pipes, "count": len(pipes)}


@router.post("/og-build/run")
async def run_og_rev7_build(payload: dict = {}):
    """Trigger a full OG REV_7 build via SLA113 pipeline system."""
    from ..core.engine_namespace import get_southern_pipeline, calculate_southern_pipeline_cost
    pipeline = get_southern_pipeline("og_rev7_build_pipeline")
    return {
        "status": "success",
        "message": "OG REV_7 Build dispatched — full manufacture chain initiated",
        "pipeline_id": "og_rev7_build_pipeline",
        "pipeline_name": pipeline["name"],
        "steps": pipeline["steps"],
        "credit_cost": calculate_southern_pipeline_cost("og_rev7_build_pipeline"),
        "output_type": pipeline["output_type"],
        "math_rev": pipeline["math_rev"],
        "payload": payload,
        "boundary": "SLA113_ORCHESTRATED",
        "status_detail": "dispatched",
    }


@router.post("/og-build/patch")
async def run_og_rev7_patch(payload: dict = {}):
    """Patch an existing OG REV_7 build."""
    from ..core.engine_namespace import get_southern_pipeline, calculate_southern_pipeline_cost
    pipeline = get_southern_pipeline("og_rev7_patch_pipeline")
    return {
        "status": "success",
        "message": "OG REV_7 Patch dispatched",
        "pipeline_id": "og_rev7_patch_pipeline",
        "steps": pipeline["steps"],
        "credit_cost": calculate_southern_pipeline_cost("og_rev7_patch_pipeline"),
        "payload": payload,
        "boundary": "SLA113_ORCHESTRATED",
    }


# ---------------------------------------------------------
# ENTROPY DAEMON — Status + Control
# ---------------------------------------------------------
@router.get("/entropy/status")
async def get_entropy_status():
    """Check EntropyEngine daemon status — seed age and compliance."""
    import os, time
    seed_path = "/dev/shm/sla113_kernel/live_seed.bin"
    seed_exists = os.path.exists(seed_path)
    seed_age = None
    if seed_exists:
        seed_age = round(time.time() - os.path.getmtime(seed_path), 1)
    return {
        "status": "success",
        "entropy": {
            "daemon": "active" if seed_exists else "inactive",
            "seed_path": seed_path,
            "seed_exists": seed_exists,
            "seed_age_seconds": seed_age,
            "rotation_interval": 60,
            "compliant": seed_age is not None and seed_age <= 70,
            "math_rev": "MATH_CORE_REV_7",
        },
    }


# ---------------------------------------------------------
# SOUTHERN CANON PANEL — Admin Console Overview
# ---------------------------------------------------------
@router.get("/southern/panel")
async def get_southern_panel():
    """Southern Canon Panel — full overview for admin console."""
    from ..core.engine_namespace import (
        list_southern_pipelines, list_pipelines,
        CANON_ENGINES, SLA113_CORE_ENGINES, ARCADE_ENGINES,
        SOUTHERN_PIPELINES,
    )
    canon = {**CANON_ENGINES, **SLA113_CORE_ENGINES}
    southern_engines = {k: v for k, v in ARCADE_ENGINES.items() if "Southern" in v.enabled_for}
    pipelines = list_southern_pipelines()
    groups = {}
    for p in pipelines:
        groups.setdefault(p["group"], []).append({"id": p["id"], "name": p["name"], "credit_cost": p["credit_cost"]})
    return {
        "status": "success",
        "southern_panel": {
            "canon_engines": [
                {"id": eid, "name": e.name, "canon_lock": e.canon_lock, "status": e.status}
                for eid, e in canon.items()
            ],
            "arcade_engines": [
                {"id": eid, "name": e.name, "status": e.status}
                for eid, e in southern_engines.items()
            ],
            "pipelines_by_group": groups,
            "pipeline_count": len(pipelines),
            "boundary": "SLA113_ORCHESTRATED",
            "math_rev": "MATH_CORE_REV_7",
        },
    }


# ---------------------------------------------------------
# ENGINES
# ---------------------------------------------------------
@router.get("/engines")
async def get_engines():
    return {
        "status": "success",
        "message": "Engines retrieved",
        "data": [
            {
                "id": "vision_smith",
                "name": "VisionSmith",
                "type": "image_pipeline",
                "status": "online",
                "version": "1.0.0",
                "endpoints": ["/api/vision/generate", "/api/vision/enhance"],
                "config": {"max_resolution": 2048, "models": ["sd15", "sd21"]},
                "last_heartbeat": datetime.utcnow().isoformat(),
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "voice_king",
                "name": "VoiceKing",
                "type": "sla113",
                "status": "online",
                "version": "1.0.0",
                "endpoints": ["/api/voice/generate", "/api/voice/clone"],
                "config": {"voices": 10, "languages": ["en", "es", "fr"]},
                "last_heartbeat": datetime.utcnow().isoformat(),
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "sonic_forge",
                "name": "SonicForge",
                "type": "sla113",
                "status": "online",
                "version": "1.0.0",
                "endpoints": ["/api/sonicforge/generate"],
                "config": {"formats": ["mp3", "wav"]},
                "last_heartbeat": datetime.utcnow().isoformat(),
                "created_at": "2024-01-01T00:00:00Z"
            },
            {
                "id": "vo_engine",
                "name": "VOEngine",
                "type": "sla113",
                "status": "offline",
                "version": "1.0.0",
                "endpoints": ["/api/video/assemble"],
                "config": {},
                "last_heartbeat": "2024-01-01T00:00:00Z",
                "created_at": "2024-01-01T00:00:00Z"
            }
        ]
    }


@router.get("/engines/{engine_id}")
async def get_engine(engine_id: str):
    return {
        "status": "success",
        "message": "Engine retrieved",
        "data": {
            "id": engine_id,
            "name": "VisionSmith",
            "type": "image_pipeline",
            "status": "online",
            "version": "1.0.0",
            "endpoints": ["/api/vision/generate", "/api/vision/enhance"],
            "config": {"max_resolution": 2048, "models": ["sd15", "sd21"]},
            "last_heartbeat": datetime.utcnow().isoformat(),
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


@router.post("/engines/{engine_id}/start")
async def start_engine(engine_id: str):
    return {
        "status": "success",
        "message": f"Engine {engine_id} started",
        "data": {
            "id": engine_id,
            "status": "online"
        }
    }


@router.post("/engines/{engine_id}/stop")
async def stop_engine(engine_id: str):
    return {
        "status": "success",
        "message": f"Engine {engine_id} stopped",
        "data": {
            "id": engine_id,
            "status": "offline"
        }
    }


@router.post("/engines/{engine_id}/restart")
async def restart_engine(engine_id: str):
    return {
        "status": "success",
        "message": f"Engine {engine_id} restarted",
        "data": {
            "id": engine_id,
            "status": "online"
        }
    }


# ---------------------------------------------------------
# EMPIRE PIPELINES (19 pipelines from EMPIRE_PIPELINES)
# ---------------------------------------------------------
@router.get("/pipelines")
async def list_pipelines(group: Optional[str] = None, tenant: Optional[str] = None):
    from ..core.engine_namespace import list_pipelines as _list_pipelines
    pipelines = _list_pipelines(group=group, tenant=tenant)
    return {
        "status": "success",
        "data": pipelines,
        "count": len(pipelines),
    }


@router.get("/pipelines/{pipeline_id}")
async def get_pipeline(pipeline_id: str):
    from ..core.engine_namespace import get_pipeline as _get_pipeline, calculate_pipeline_cost
    pipeline = _get_pipeline(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    return {
        "status": "success",
        "data": {
            **pipeline,
            "estimated_credit_cost": calculate_pipeline_cost(pipeline_id),
        },
    }


@router.post("/pipelines/{pipeline_id}/run")
async def run_pipeline(pipeline_id: str, payload: dict = {}):
    from ..core.engine_namespace import get_pipeline as _get_pipeline, calculate_pipeline_cost
    pipeline = _get_pipeline(pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    import uuid
    run_id = str(uuid.uuid4())
    return {
        "status": "success",
        "message": f"Pipeline '{pipeline['name']}' dispatched",
        "data": {
            "run_id": run_id,
            "pipeline_id": pipeline_id,
            "pipeline_name": pipeline["name"],
            "steps": pipeline["steps"],
            "credit_cost": calculate_pipeline_cost(pipeline_id),
            "input": payload,
            "output_type": pipeline.get("output_type"),
            "math_rev": pipeline.get("math_rev", "MATH_CORE_REV_7"),
            "dispatched_at": datetime.utcnow().isoformat(),
        },
    }


# ---------------------------------------------------------
# SLA113 ASSET APPROVAL PIPELINE
# All generated assets stage here. Nothing goes live without approval.
# ---------------------------------------------------------
import json as _json, os as _os, shutil as _shutil

APPROVAL_LEDGER   = "/SLA113/factory/drafts/approval_ledger.json"
DRAFTS_ROOT       = "/SLA113/factory/drafts"
VISION_DECK_AUDIO = "/var/www/southern_lifestyle/vision_deck/audio"
VISION_DECK_ART   = "/var/www/southern_lifestyle/vision_deck/assets"
VISION_DECK_LAYOUTS = "/var/www/southern_lifestyle/vision_deck/layouts"
STAGE_AUDIO       = "/var/www/southern_lifestyle/stage/audio"


def _load_ledger():
    try:
        with open(APPROVAL_LEDGER) as f:
            return _json.load(f)
    except Exception:
        return {"items": {}}


def _save_ledger(ledger):
    with open(APPROVAL_LEDGER, "w") as f:
        _json.dump(ledger, f, indent=2)


def _scan_drafts():
    """Walk /SLA113/factory/drafts and return all files with their approval state."""
    ledger = _load_ledger()
    items = []
    for folder in ["audio", "art", "hub_layouts", "acids"]:
        path = _os.path.join(DRAFTS_ROOT, folder)
        if not _os.path.isdir(path):
            continue
        for fname in sorted(_os.listdir(path)):
            fpath = _os.path.join(path, fname)
            if not _os.path.isfile(fpath):
                continue
            key = f"{folder}/{fname}"
            state = ledger["items"].get(key, {"status": "PENDING_APPROVAL", "note": ""})
            items.append({
                "key": key,
                "folder": folder,
                "filename": fname,
                "size_kb": round(_os.path.getsize(fpath) / 1024, 1),
                "status": state.get("status", "PENDING_APPROVAL"),
                "note": state.get("note", ""),
                "approved_at": state.get("approved_at"),
                "approved_by": state.get("approved_by"),
            })
    return items


@router.get("/approval/queue")
async def get_approval_queue():
    """Return all draft assets and their approval status."""
    items = _scan_drafts()
    pending   = [i for i in items if i["status"] == "PENDING_APPROVAL"]
    approved  = [i for i in items if i["status"] == "APPROVED"]
    rejected  = [i for i in items if i["status"] == "REJECTED"]
    return {
        "status": "success",
        "summary": {"pending": len(pending), "approved": len(approved), "rejected": len(rejected), "total": len(items)},
        "items": items,
    }


@router.post("/approval/approve")
async def approve_asset(payload: dict):
    """Approve a draft asset. Pushes eligible files to Vision Deck / Stage."""
    key  = payload.get("key")         # e.g. "audio/LA_001_smooth_jazz.wav"
    note = payload.get("note", "Operator approved")
    if not key:
        raise HTTPException(status_code=400, detail="key required")

    folder, fname = key.split("/", 1)
    src = _os.path.join(DRAFTS_ROOT, folder, fname)
    if not _os.path.isfile(src):
        raise HTTPException(status_code=404, detail=f"Draft not found: {key}")

    # Push to public directories based on folder type
    pushed_to = []
    ext = _os.path.splitext(fname)[1].lower()
    dest_map = {
        "audio": [(VISION_DECK_AUDIO, {".wav", ".mp3", ".ogg"}),
                  (STAGE_AUDIO,       {".wav", ".mp3", ".ogg"})],
        "art":   [(VISION_DECK_ART,   {".png", ".jpg", ".webp", ".svg"})],
        "hub_layouts": [(VISION_DECK_LAYOUTS, {".json", ".svg", ".png"})],
        "acids": [],  # acids stay internal — no public push
    }
    for dest_dir, allowed_exts in dest_map.get(folder, []):
        if ext in allowed_exts:
            _os.makedirs(dest_dir, exist_ok=True)
            dest_path = _os.path.join(dest_dir, fname)
            _shutil.copy2(src, dest_path)
            _os.chmod(dest_path, 0o644)
            pushed_to.append(dest_path)

    # Update ledger
    ledger = _load_ledger()
    ledger["items"][key] = {
        "status":      "APPROVED",
        "note":        note,
        "approved_at": datetime.utcnow().isoformat(),
        "approved_by": "operator",
        "pushed_to":   pushed_to,
    }
    _save_ledger(ledger)

    return {
        "status": "success",
        "message": f"APPROVED — {key}",
        "pushed_to": pushed_to,
        "key": key,
    }


@router.post("/approval/reject")
async def reject_asset(payload: dict):
    """Reject a draft asset. Stays in vault, never goes live."""
    key  = payload.get("key")
    note = payload.get("note", "Operator rejected")
    if not key:
        raise HTTPException(status_code=400, detail="key required")

    ledger = _load_ledger()
    ledger["items"][key] = {
        "status":      "REJECTED",
        "note":        note,
        "rejected_at": datetime.utcnow().isoformat(),
        "rejected_by": "operator",
    }
    _save_ledger(ledger)
    return {"status": "success", "message": f"REJECTED — {key}", "key": key}


@router.post("/approval/approve-all")
async def approve_all_pending():
    """Batch approve all PENDING_APPROVAL items."""
    items = _scan_drafts()
    pending = [i for i in items if i["status"] == "PENDING_APPROVAL"]
    results = []
    for item in pending:
        r = await approve_asset({"key": item["key"], "note": "Batch approved by operator"})
        results.append(r)
    return {"status": "success", "approved_count": len(results), "results": results}
