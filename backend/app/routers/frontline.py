"""
FRONTLINE Module - Live Player Feed + Owner Intelligence Override
"""
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random
import uuid

router = APIRouter(prefix="/api/frontline", tags=["FRONTLINE"])

class PlayerEvent(BaseModel):
    event_id: str
    player_id: str
    tenant: str
    event_type: str
    data: dict
    timestamp: str
    severity: str = "INFO"

class OverrideCommand(BaseModel):
    command: str
    target: Optional[str] = None
    parameters: Optional[dict] = None

class CinematicState(BaseModel):
    state: str
    intensity: float
    color: str

class FrontlineState:
    cinematic: CinematicState = CinematicState(state="idle", intensity=0.1, color="#333333")
    god_mode_active: bool = False
    override_log: List[dict] = []
    
    @property
    def pulse_tick(self) -> int:
        return int(datetime.utcnow().timestamp() % 1000)
    
    @property
    def volatility(self) -> float:
        return round(random.uniform(0.3, 0.7), 2)
    
    @property
    def band(self) -> str:
        bands = ["low", "medium", "high", "ultra"]
        return bands[int(datetime.utcnow().timestamp()) % 4]

frontline_state = FrontlineState()

SIMULATED_PLAYERS = [
    {"id": "P-8821", "name": "AZTEC_BOSS_01", "seat": 12, "balance": 28400},
    {"id": "P-9934", "name": "GOLDEN_STRIKE", "seat": 8, "balance": 15200},
    {"id": "P-7712", "name": "NEON_DRAGON", "seat": 3, "balance": 67800},
    {"id": "P-5543", "name": "CRYSTAL_WOLF", "seat": 19, "balance": 32100},
    {"id": "P-3301", "name": "SHADOW_PHOENIX", "seat": 7, "balance": 8900},
]

EVENT_TYPES = [
    {"type": "BET_PLACED", "severity": "INFO"},
    {"type": "WIN_TRIGGERED", "severity": "SUCCESS"},
    {"type": "JACKPOT_HIT", "severity": "CRITICAL"},
    {"type": "SESSION_JOIN", "severity": "INFO"},
    {"type": "SESSION_EXIT", "severity": "INFO"},
    {"type": "BONUS_ACTIVATED", "severity": "WARNING"},
    {"type": "VOLATILITY_SPIKE", "severity": "WARNING"},
    {"type": "RTP_ANOMALY", "severity": "CRITICAL"},
    {"type": "GOD_MODE_INJECTED", "severity": "CRITICAL"},
]

@router.get("/pulse")
async def get_pulse():
    """Live pulse metrics for the frontlines."""
    return {
        "tick": frontline_state.pulse_tick,
        "volatility": frontline_state.volatility,
        "band": frontline_state.band,
        "tempo_ms": random.randint(600, 1200),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/feed")
async def get_live_feed(limit: int = 50):
    """Live player event feed."""
    events = []
    now = datetime.utcnow()
    
    for i in range(min(limit, 20)):
        player = random.choice(SIMULATED_PLAYERS)
        event_type = random.choice(EVENT_TYPES)
        
        event_time = now.replace(microsecond=0)
        
        events.append(PlayerEvent(
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            player_id=player["id"],
            tenant="EMPIRE_ONE",
            event_type=event_type["type"],
            data={
                "player_name": player["name"],
                "seat": player["seat"],
                "balance": player["balance"] + random.randint(-1000, 5000)
            },
            timestamp=event_time.isoformat(),
            severity=event_type["severity"]
        ).model_dump())
    
    events.reverse()
    return {"events": events, "count": len(events)}

@router.get("/cinematic")
async def get_cinematic_state():
    """Current cinematic engine state."""
    return frontline_state.cinematic.model_dump()

@router.post("/cinematic")
async def set_cinematic_state(state: CinematicState):
    """Update cinematic engine state."""
    frontline_state.cinematic = state
    return {"success": True, "state": frontline_state.cinematic.model_dump()}

@router.post("/override")
async def execute_override(cmd: OverrideCommand, x_tenant_id: Optional[str] = Header(None)):
    """Execute God Mode override command."""
    override_record = {
        "command": cmd.command,
        "target": cmd.target,
        "parameters": cmd.parameters,
        "executed_by": x_tenant_id or "OWNER",
        "timestamp": datetime.utcnow().isoformat(),
        "override_id": f"OVER-{uuid.uuid4().hex[:8].upper()}"
    }
    
    frontline_state.override_log.append(override_record)
    frontline_state.god_mode_active = True
    
    if cmd.command == "IDLE":
        frontline_state.cinematic = CinematicState(state="idle", intensity=0.1, color="#333333")
    elif cmd.command == "BUILD":
        frontline_state.cinematic = CinematicState(state="build", intensity=0.4, color="#00C8FF")
    elif cmd.command == "CREST":
        frontline_state.cinematic = CinematicState(state="crest", intensity=0.9, color="#FF2D95")
    elif cmd.command == "RELEASE":
        frontline_state.cinematic = CinematicState(state="release", intensity=0.6, color="#D4AF37")
    
    return {
        "success": True,
        "override": override_record,
        "cinematic": frontline_state.cinematic.model_dump()
    }

@router.get("/overrides")
async def get_override_log(limit: int = 20):
    """Get override command history."""
    return {
        "overrides": frontline_state.override_log[-limit:],
        "god_mode_active": frontline_state.god_mode_active
    }

@router.get("/session")
async def get_session_info():
    """Current session info for the operator."""
    return {
        "session_id": f"SESSION-AZTEC-{random.randint(100, 999)}",
        "active_players": random.randint(40, 120),
        "total_bets_today": random.randint(100000, 500000),
        "revenue_today": round(random.uniform(10000, 80000), 2),
        "rtp_avg": round(random.uniform(92, 98), 2),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/uplink")
async def uplink_chat(payload: UplinkMessage):
    """Empire public site chat uplink with Gemini + safe fallback."""
    from ..services.gemini_service import gemini_service

    tenant = "southern_lyfestyle" if (payload.tenant_id or "").lower().startswith("southern") else "empire1"
    try:
        beat = await gemini_service.generate_beat(tenant)
        core = beat.get("content") if isinstance(beat, dict) else None
        if not core:
            core = "Signal received. Operator uplink stable."
        return {"reply": f"{core}\n\nYou asked: {payload.message}"}
    except Exception:
        return {"reply": f"Signal received. Operator uplink stable.\n\nYou asked: {payload.message}"}
