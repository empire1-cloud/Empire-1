from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.sonic_forge import SonicForge

router = APIRouter(prefix="/sonicforge", tags=["SonicForge"])


# ---------------------------------------------------------
# MUSIC GENERATION
# ---------------------------------------------------------
@router.post("/generate")
async def generate_music(
    prompt: str,
    style: str = "default",
    duration: int = 10,
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = SonicForge(db)
        result = await engine.generate(prompt=prompt, style=style, duration=duration)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# STEM SEPARATION
# ---------------------------------------------------------
@router.post("/separate")
async def separate_audio(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = SonicForge(db)
        stems = await engine.separate(file)
        return {"success": True, "stems": stems}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# JOB STATUS
# ---------------------------------------------------------
@router.get("/status")
async def job_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = SonicForge(db)
        status = await engine.get_status(job_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
