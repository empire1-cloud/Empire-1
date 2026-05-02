from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.vo_engine import VOEngine

router = APIRouter(prefix="/video", tags=["Video Engine"])


# ---------------------------------------------------------
# GENERATE VIDEO (STUB)
# ---------------------------------------------------------
@router.post("/generate")
async def generate_video(
    prompt: str,
    duration: int = 10,
    resolution: str = "720p",
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VOEngine(db)
        job_id = await engine.generate_video(prompt, duration, resolution)
        return {"success": True, "job_id": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# JOB STATUS
# ---------------------------------------------------------
@router.get("/status")
async def video_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VOEngine(db)
        status = await engine.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# GET VIDEO FRAMES / METADATA
# ---------------------------------------------------------
@router.get("/frames")
async def get_frames(
    video_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VOEngine(db)
        frames = await engine.get_frames(video_id)
        return {"success": True, "frames": frames}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
