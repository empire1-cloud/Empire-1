from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.vision_smith import VisionSmith

router = APIRouter(prefix="/vision", tags=["VisionSmith"])


# ---------------------------------------------------------
# TEXT → IMAGE
# ---------------------------------------------------------
@router.post("/generate")
async def generate_image(
    prompt: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        engine = VisionSmith(db)
        result = await engine.generate(prompt)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# UPSCALE IMAGE
# ---------------------------------------------------------
@router.post("/upscale")
async def upscale_image(
    scale: int = 2,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        engine = VisionSmith(db)
        result = await engine.upscale(file, scale)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# METADATA
# ---------------------------------------------------------
@router.get("/metadata")
async def get_metadata(
    image_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        engine = VisionSmith(db)
        metadata = await engine.get_metadata(image_id)
        return {"success": True, "metadata": metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
