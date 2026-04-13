"""
Vertex AI Engine — Google Cloud AI Platform
Project: disco-amphora-490606-n8
Text generation via Gemini 1.5 Pro + Image generation via Imagen.
"""
import httpx
import json
from typing import Optional
from ..core.config import get_settings

settings = get_settings()

VERTEX_AI_BASE = (
    f"https://{settings.VERTEX_AI_LOCATION}-aiplatform.googleapis.com/v1"
)
TEXT_ENDPOINT = (
    f"{VERTEX_AI_BASE}/projects/{settings.GOOGLE_PROJECT_ID}"
    f"/locations/{settings.VERTEX_AI_LOCATION}"
    f"/publishers/google/models/{settings.VERTEX_AI_TEXT_MODEL}:generateContent"
)
IMAGE_ENDPOINT = (
    f"{VERTEX_AI_BASE}/projects/{settings.GOOGLE_PROJECT_ID}"
    f"/locations/{settings.VERTEX_AI_LOCATION}"
    f"/publishers/google/models/{settings.VERTEX_AI_IMAGE_MODEL}:predict"
)


def _get_access_token() -> str:
    """Fetch GCP access token via metadata server (Cloud Run) or ADC."""
    import subprocess
    result = subprocess.run(
        ["gcloud", "auth", "print-access-token"],
        capture_output=True, text=True, timeout=10
    )
    if result.returncode == 0:
        return result.stdout.strip()
    # Fallback: metadata server (Cloud Run / GCE)
    import urllib.request
    req = urllib.request.Request(
        "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
        headers={"Metadata-Flavor": "Google"},
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read())["access_token"]


def _auth_headers() -> dict:
    token = _get_access_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


class VertexAIEngine:
    """
    Vertex AI Engine — Text (Gemini 1.5 Pro) + Image (Imagen).
    Designed to slot into the Empire-1 hybrid AI stack.
    """

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
    ) -> dict:
        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": system_instruction}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "Understood."}]
            })
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        body = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(
                    TEXT_ENDPOINT,
                    headers=_auth_headers(),
                    json=body,
                    timeout=30.0,
                )
                resp.raise_for_status()
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "text": text.strip(),
                    "model": settings.VERTEX_AI_TEXT_MODEL,
                    "provider": "vertex_ai",
                    "project": settings.GOOGLE_PROJECT_ID,
                    "status": "success",
                }
            except Exception as e:
                return {
                    "text": "",
                    "model": settings.VERTEX_AI_TEXT_MODEL,
                    "provider": "vertex_ai",
                    "status": "error",
                    "error": str(e),
                }

    async def generate_image(
        self,
        prompt: str,
        sample_count: int = 1,
        aspect_ratio: str = "1:1",
    ) -> dict:
        body = {
            "instances": [{"prompt": prompt}],
            "parameters": {
                "sampleCount": sample_count,
                "aspectRatio": aspect_ratio,
            },
        }

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(
                    IMAGE_ENDPOINT,
                    headers=_auth_headers(),
                    json=body,
                    timeout=60.0,
                )
                resp.raise_for_status()
                data = resp.json()
                images = [
                    pred.get("bytesBase64Encoded", "")
                    for pred in data.get("predictions", [])
                ]
                return {
                    "images_b64": images,
                    "count": len(images),
                    "model": settings.VERTEX_AI_IMAGE_MODEL,
                    "provider": "vertex_ai",
                    "project": settings.GOOGLE_PROJECT_ID,
                    "status": "success",
                }
            except Exception as e:
                return {
                    "images_b64": [],
                    "count": 0,
                    "model": settings.VERTEX_AI_IMAGE_MODEL,
                    "provider": "vertex_ai",
                    "status": "error",
                    "error": str(e),
                }


vertex_ai_engine = VertexAIEngine()
