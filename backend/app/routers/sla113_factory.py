"""
Factory Status API - Heartbeat for SLA113 Foundry
"""
from fastapi import APIRouter, Header
from typing import Optional
from datetime import datetime
import psutil
import os

router = APIRouter(prefix="/api/factory", tags=["Factory"])

# In-memory state (replace with Redis/DB in production)
class FactoryState:
    generation_mode: str = "cloud"  # 'local' or 'cloud'
    queue_count: int = 0
    pending: int = 0
    completed: int = 0
    errors: int = 0
    last_asset: str = ""
    daemon_status: str = "online"

factory_state = FactoryState()

def get_system_stats():
    """Get real-time CPU and RAM usage."""
    cpu = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory().percent
    return {"cpu": cpu, "ram": ram}

@router.get("/status")
async def get_factory_status(x_tenant_id: Optional[str] = Header(None)):
    """
    Heartbeat endpoint for AdminHeartbeat component.
    Polled every 10 seconds via SWR/React Query.
    """
    stats = get_system_stats()
    
    return {
        "success": True,
        "timestamp": datetime.utcnow().isoformat(),
        "system": {
            "cpu": round(stats["cpu"], 1),
            "ram": round(stats["ram"], 1),
        },
        "factory": {
            "queue_count": factory_state.queue_count,
            "pending": factory_state.pending,
            "completed": factory_state.completed,
            "errors": factory_state.errors,
            "last_asset": factory_state.last_asset,
            "daemon_status": factory_state.daemon_status,
            "generation_mode": factory_state.generation_mode,
        }
    }

@router.post("/mode")
async def set_generation_mode(
    mode: str = "cloud",
    x_tenant_id: Optional[str] = Header(None)
):
    """
    Toggle between local and cloud generation.
    """
    if mode not in ["local", "cloud"]:
        return {"success": False, "error": "Invalid mode"}
    
    factory_state.generation_mode = mode
    return {
        "success": True,
        "generation_mode": factory_state.generation_mode,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.post("/queue/add")
async def add_to_queue(
    prompt: str,
    x_tenant_id: Optional[str] = Header(None)
):
    """
    Add a prompt to the queue.
    """
    factory_state.queue_count += 1
    factory_state.pending += 1
    
    return {
        "success": True,
        "queue_count": factory_state.queue_count,
        "pending": factory_state.pending,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.post("/queue/complete")
async def complete_queue_item(
    asset_path: str,
    x_tenant_id: Optional[str] = Header(None)
):
    """
    Mark a queue item as completed.
    """
    if factory_state.queue_count > 0:
        factory_state.queue_count -= 1
    if factory_state.pending > 0:
        factory_state.pending -= 1
    
    factory_state.completed += 1
    factory_state.last_asset = asset_path
    
    return {
        "success": True,
        "queue_count": factory_state.queue_count,
        "pending": factory_state.pending,
        "completed": factory_state.completed,
        "last_asset": factory_state.last_asset,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.post("/queue/error")
async def queue_error(
    error_message: str,
    x_tenant_id: Optional[str] = Header(None)
):
    """
    Record a queue error.
    """
    if factory_state.queue_count > 0:
        factory_state.queue_count -= 1
    if factory_state.pending > 0:
        factory_state.pending -= 1
    
    factory_state.errors += 1
    
    return {
        "success": True,
        "errors": factory_state.errors,
        "timestamp": datetime.utcnow().isoformat(),
    }

@router.get("/health")
async def factory_health(x_tenant_id: Optional[str] = Header(None)):
    """
    Quick health check for the factory.
    """
    return {
        "status": "healthy",
        "daemon": factory_state.daemon_status,
        "generation_mode": factory_state.generation_mode,
        "timestamp": datetime.utcnow().isoformat(),
    }
