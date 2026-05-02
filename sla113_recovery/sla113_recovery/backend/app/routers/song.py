from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/song", tags=["Song"])


# ---------------------------------------------------------
# SONG PRESETS
# ---------------------------------------------------------
@router.get("/presets")
async def get_presets():
    return {
        "status": "success",
        "message": "Presets retrieved",
        "data": [
            {
                "id": "preset_1",
                "name": "Epic Trailer",
                "category": "trailer",
                "bpm": 140,
                "key": "C minor",
                "instruments": ["strings", "brass", "drums"],
                "mood": "epic",
                "tags": ["trailer", "epic", "cinematic"]
            },
            {
                "id": "preset_2",
                "name": "Chill Lo-Fi",
                "category": "lofi",
                "bpm": 85,
                "key": "F major",
                "instruments": ["piano", "vinyl", "bass"],
                "mood": "chill",
                "tags": ["lofi", "chill", "relaxing"]
            },
            {
                "id": "preset_3",
                "name": "EDM Drop",
                "category": "edm",
                "bpm": 128,
                "key": "A minor",
                "instruments": ["synth", "bass", "drums"],
                "mood": "energetic",
                "tags": ["edm", "electronic", "dance"]
            },
            {
                "id": "preset_4",
                "name": "Cinematic Intro",
                "category": "cinematic",
                "bpm": 60,
                "key": "D minor",
                "instruments": ["piano", "strings", "pad"],
                "mood": "dramatic",
                "tags": ["cinematic", "intro", "dramatic"]
            }
        ]
    }


@router.get("/presets/{preset_id}")
async def get_preset(preset_id: str):
    presets = await get_presets()
    for preset in presets.get("data", []):
        if preset["id"] == preset_id:
            return {
                "status": "success",
                "message": "Preset retrieved",
                "data": preset
            }
    raise HTTPException(status_code=404, detail="Preset not found")


# ---------------------------------------------------------
# MIX PRESETS
# ---------------------------------------------------------
@router.get("/mix-presets")
async def get_mix_presets():
    return {
        "status": "success",
        "message": "Mix presets retrieved",
        "data": [
            {
                "id": "mix_1",
                "name": "Radio Ready",
                "description": "Balanced mix suitable for radio broadcast",
                "settings": {
                    "eq": {"low": 0, "mid": 2, "high": 1},
                    "compression": {"threshold": -18, "ratio": 4},
                    "limiter": {"ceiling": -0.3}
                },
                "category": "broadcast"
            },
            {
                "id": "mix_2",
                "name": "Warm Analog",
                "description": "Vintage analog warmth",
                "settings": {
                    "eq": {"low": 3, "mid": 0, "high": -2},
                    "compression": {"threshold": -12, "ratio": 2},
                    "limiter": {"ceiling": -1}
                },
                "category": "vintage"
            },
            {
                "id": "mix_3",
                "name": "Loud & Punchy",
                "description": "Maximized loudness for club play",
                "settings": {
                    "eq": {"low": 2, "mid": 1, "high": 3},
                    "compression": {"threshold": -6, "ratio": 8},
                    "limiter": {"ceiling": -0.1}
                },
                "category": "club"
            },
            {
                "id": "mix_4",
                "name": "Acoustic Natural",
                "description": "Natural dynamics preserved",
                "settings": {
                    "eq": {"low": 0, "mid": 0, "high": 0},
                    "compression": {"threshold": -20, "ratio": 1.5},
                    "limiter": {"ceiling": -3}
                },
                "category": "acoustic"
            }
        ]
    }


@router.get("/mix-presets/{preset_id}")
async def get_mix_preset(preset_id: str):
    presets = await get_mix_presets()
    for preset in presets.get("data", []):
        if preset["id"] == preset_id:
            return {
                "status": "success",
                "message": "Mix preset retrieved",
                "data": preset
            }
    raise HTTPException(status_code=404, detail="Mix preset not found")


# ---------------------------------------------------------
# SONG STATUS
# ---------------------------------------------------------
@router.get("/status")
async def get_status():
    return {
        "status": "success",
        "message": "Song service status",
        "data": {
            "engine": "sonic_forge",
            "status": "online",
            "gpu_available": True,
            "gpu_name": "NVIDIA RTX 3080",
            "gpu_memory_used_gb": 4.2,
            "gpu_memory_total_gb": 10.0,
            "active_sessions": 3,
            "queued_tasks": 0,
            "last_heartbeat": datetime.utcnow().isoformat()
        }
    }


# ---------------------------------------------------------
# SONG CREDITS
# ---------------------------------------------------------
@router.get("/credits/{user_id}")
async def get_user_credits(user_id: str):
    return {
        "status": "success",
        "message": "User credits retrieved",
        "data": {
            "user_id": user_id,
            "credits_remaining": 1500,
            "credits_used_monthly": 500,
            "credits_total": 2000,
            "subscription_tier": "professional",
            "next_billing_date": "2024-02-01",
            "history": [
                {"date": "2024-01-15", "credits_used": 50, "action": "generate"},
                {"date": "2024-01-14", "credits_used": 150, "action": "generate"},
                {"date": "2024-01-13", "credits_used": 100, "action": "mix"}
            ]
        }
    }


# ---------------------------------------------------------
# SONG GENERATE
# ---------------------------------------------------------
@router.post("/generate")
async def generate_song(data: dict):
    return {
        "status": "success",
        "message": "Song generation started",
        "data": {
            "id": f"song_{datetime.utcnow().timestamp()}",
            "preset_id": data.get("preset_id"),
            "prompt": data.get("prompt"),
            "duration": data.get("duration", 180),
            "status": "processing",
            "result_url": None,
            "created_at": datetime.utcnow().isoformat()
        }
    }


# ---------------------------------------------------------
# SONG MIX
# ---------------------------------------------------------
@router.post("/mix")
async def mix_song(data: dict):
    return {
        "status": "success",
        "message": "Song mixing started",
        "data": {
            "id": f"mix_{datetime.utcnow().timestamp()}",
            "track_urls": data.get("track_urls", []),
            "mix_preset_id": data.get("mix_preset_id"),
            "status": "processing",
            "result_url": None,
            "created_at": datetime.utcnow().isoformat()
        }
    }
