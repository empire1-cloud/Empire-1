from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.voice_king import VoiceKing

router = APIRouter(prefix="/voice", tags=["VoiceKing"])


# ---------------------------------------------------------
# TEXT → SPEECH
# ---------------------------------------------------------
@router.post("/generate")
async def generate_speech(
    text: str,
    voice_id: str = "default",
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VoiceKing(db)
        audio_url = await engine.generate(text=text, voice_id=voice_id)
        return {"success": True, "audio_url": audio_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# VOICE CLONING
# ---------------------------------------------------------
@router.post("/clone")
async def clone_voice(
    voice_name: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VoiceKing(db)
        voice_id = await engine.clone(file=file, voice_name=voice_name)
        return {"success": True, "voice_id": voice_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# LIST VOICES
# ---------------------------------------------------------
@router.get("/voices")
async def list_voices(
    db: AsyncSession = Depends(get_db),
):
    try:
        engine = VoiceKing(db)
        voices = await engine.list_voices()
        return {"success": True, "voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# LIST VOICE PROFILES (for user)
# ---------------------------------------------------------
@router.get("/list_profiles/{user_id}")
async def list_voice_profiles(user_id: str):
    return {
        "status": "success",
        "message": "Voice profiles retrieved",
        "data": [
            {
                "id": "profile_1",
                "user_id": user_id,
                "name": "My Voice Clone",
                "voice_id": "cloned_voice_1",
                "description": "Custom cloned voice",
                "created_at": "2024-01-01T00:00:00Z",
                "is_active": True
            },
            {
                "id": "profile_2",
                "user_id": user_id,
                "name": "Narrator Voice",
                "voice_id": "voice_1",
                "description": "Professional narrator preset",
                "created_at": "2024-01-01T00:00:00Z",
                "is_active": True
            }
        ]
    }


# ---------------------------------------------------------
# VOICE CREDITS
# ---------------------------------------------------------
@router.get("/credits/{user_id}")
async def get_voice_credits(user_id: str):
    return {
        "status": "success",
        "message": "Voice credits retrieved",
        "data": {
            "user_id": user_id,
            "credits_remaining": 500,
            "credits_used": 250,
            "subscription_tier": "professional"
        }
    }
