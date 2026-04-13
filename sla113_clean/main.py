"""
SLA113 Hybrid Factory Backend (FastAPI entrypoint)
- Manages all creative universes and Game OS
- Ready for Cloud Run deployment
"""

from fastapi import FastAPI, HTTPException
from creative_os import soulfire

app = FastAPI(title="SLA113 Hybrid Factory Backend")

@app.get("/")
def root():
    return {"status": "ok", "message": "SLA113 Hybrid Factory Backend running"}

@app.post("/api/soulfire/generate-music")
def generate_soulfire_music(prompt: str):
    """Generate music using Soulfire (Vertex AI)"""
    try:
        result = soulfire.generate_music(prompt)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add similar endpoints for ASW, El Coro, Sentinel, SL Universal as you build their logic
