from fastapi import APIRouter, HTTPException
from app.vertexai.music_client import query_music_engine

router = APIRouter(prefix="/api/my_vertex_universe", tags=["My Vertex Universe"])

@router.post("/generate")
def generate_from_vertex(prompt: str):
    """
    Generate content using your Vertex AI model for this universe.
    """
    try:
        result = query_music_engine({"prompt": prompt})
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
