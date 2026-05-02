from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

router = APIRouter(prefix="/api/sla113", tags=["sla113"])

QUEUE_FILE = "/root/SLA113/factory/queue.json"
ARCHIVE_DIR = "/root/SLA113/archive/builds"

class BuildRequest(BaseModel):
    game_type: str
    mode: str = "fast"
    custom_prompt: Optional[str] = None

class BuildResponse(BaseModel):
    build_id: str
    game_type: str
    category: str
    status: str
    render_mode: str
    created_at: str

class FactoryStatus(BaseModel):
    queue_length: int
    processing: bool
    current_build: Optional[dict] = None
    last_heartbeat: str
    render_modes: dict

def ensure_queue_file():
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    if not os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE, 'w') as f:
            json.dump([], f)

@router.get("/status", response_model=FactoryStatus)
async def get_factory_status():
    ensure_queue_file()
    
    with open(QUEUE_FILE, 'r') as f:
        queue = json.load(f)
    
    current = None
    processing = False
    for item in queue:
        if item.get('status') == 'processing':
            current = item
            processing = True
            break
    
    return FactoryStatus(
        queue_length=len(queue),
        processing=processing,
        current_build=current,
        last_heartbeat=datetime.now().isoformat(),
        render_modes={"cloud": True, "local": True}
    )

@router.get("/queue", response_model=List[BuildResponse])
async def get_queue():
    ensure_queue_file()
    
    with open(QUEUE_FILE, 'r') as f:
        queue = json.load(f)
    
    return queue

@router.post("/queue-prompt")
async def queue_prompt(request: BuildRequest):
    ensure_queue_file()
    
    import hashlib
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = f"{request.game_type}-{timestamp}"
    build_id = f"SLA113-{hashlib.md5(raw.encode()).hexdigest()[:8].upper()}"
    
    GAME_TYPES = {
        "ARCADE_24": {"name": "24-Target Fish Shooting Arcade", "seats": 24, "volatility": "HIGH", "math": "REV_7_ARCADE"},
        "ARCADE_40": {"name": "40-Target Premium Arcade", "seats": 40, "volatility": "HIGH", "math": "REV_7_ARCADE_PREMIUM"},
        "ARCADE_60": {"name": "60-Target Enterprise Arcade", "seats": 60, "volatility": "HIGH", "math": "REV_7_ARCADE_ENTERPRISE"},
        "SLOTS_10": {"name": "10-Reel Slot Machine Cluster", "seats": 10, "volatility": "MEDIUM", "math": "REV_7_SLOTS"},
        "SLOTS_20": {"name": "20-Reel Slot Machine Cluster", "seats": 20, "volatility": "MEDIUM", "math": "REV_7_SLOTS_PREMIUM"},
        "OPEN_WORLD": {"name": "GTA5-Type Open World", "seats": 100, "volatility": "REAL_TIME", "math": "REV_7_OPEN_WORLD"},
        "TACTICAL_FPS": {"name": "COD/Valorant Tactical Shooter", "seats": 64, "volatility": "LOW_LATENCY", "math": "REV_7_TACTICAL"},
        "RPG_QUEST": {"name": "Progression RPG Quest System", "seats": 50, "volatility": "VARIABLE", "math": "REV_7_RPG"},
        "CASINO_SUITE": {"name": "Full Casino Suite", "seats": 100, "volatility": "ENTERPRISE", "math": "REV_7_CASINO"},
        "PACHINKO": {"name": "Japanese Pachinko Ball Drop", "seats": 80, "volatility": "HIGH", "math": "REV_7_PACHINKO"},
        "LOTTERY": {"name": "Digital Lottery System", "seats": 1000, "volatility": "ENTERPRISE", "math": "REV_7_LOTTERY"},
        "BINGO": {"name": "Digital Bingo Hall", "seats": 100, "volatility": "MEDIUM", "math": "REV_7_BINGO"},
        "SPORTSBOOK": {"name": "Sports Betting Platform", "seats": 500, "volatility": "ENTERPRISE", "math": "REV_7_SPORTSBOOK"},
        "CARD_GAMES": {"name": "Texas Hold'em, Blackjack, Baccarat", "seats": 100, "volatility": "VARIABLE", "math": "REV_7_CARD"},
        "HYBRID_MIX": {"name": "Arcade + Slots + Casino Combo", "seats": 50, "volatility": "MIXED", "math": "REV_7_HYBRID"},
    }
    
    game_info = GAME_TYPES.get(request.game_type, GAME_TYPES["ARCADE_24"])
    
    build = {
        "build_id": build_id,
        "game_type": game_info["name"],
        "seats": game_info["seats"],
        "volatility": game_info["volatility"],
        "math_kernel": game_info["math"],
        "prompt": f"Sovereign game OS: {game_info['name']}",
        "palette": {
            "primary": "#050505",
            "accent": "#D4AF37",
            "highlight": "#00C8FF"
        },
        "render_mode": request.mode,
        "status": "queued",
        "created_at": datetime.now().isoformat()
    }
    
    with open(QUEUE_FILE, 'r') as f:
        queue = json.load(f)
    
    queue.append(build)
    
    with open(QUEUE_FILE, 'w') as f:
        json.dump(queue, f, indent=2)
    
    return {"build": build, "message": "Build queued successfully"}

@router.post("/cancel")
async def cancel_build(build_id: str):
    ensure_queue_file()
    
    with open(QUEUE_FILE, 'r') as f:
        queue = json.load(f)
    
    original_length = len(queue)
    queue = [b for b in queue if b.get('build_id') != build_id]
    
    if len(queue) == original_length:
        raise HTTPException(status_code=404, detail="Build not found")
    
    with open(QUEUE_FILE, 'w') as f:
        json.dump(queue, f, indent=2)
    
    return {"message": "Build cancelled", "build_id": build_id}

@router.get("/builds")
async def get_builds():
    if not os.path.exists(ARCHIVE_DIR):
        return {"builds": []}
    
    builds = []
    for item in os.listdir(ARCHIVE_DIR):
        manifest_path = os.path.join(ARCHIVE_DIR, item, "manifest.json")
        if os.path.exists(manifest_path):
            with open(manifest_path, 'r') as f:
                builds.append(json.load(f))
    
    return {"builds": builds}
