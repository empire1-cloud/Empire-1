"""
VoxCPM2 — Modal GPU Deployment for Empire Universe.

Deploys VoxCPM2 as a serverless GPU endpoint on Modal.
Scales to zero when idle ($0 cost), spins up on demand (~5s cold start).

Usage:
  1. pip install modal
  2. modal setup              # authenticate (one-time)
  3. modal deploy deploy/modal_voxcpm.py   # deploy persistent endpoint

The endpoint URL will be printed after deploy. Set it as VOXCPM_API_URL
in your backend environment.

Estimated cost: ~$0.001 per generation (L4 GPU, ~3s per clip).
Free tier: $30/month credits = ~30,000 voice clips.
"""

import modal
import io

app = modal.App("empire-voxcpm2")

voxcpm_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "voxcpm",
        "soundfile",
        "numpy",
        "fastapi[standard]",
    )
)

CACHE_DIR = "/cache/voxcpm2"
model_volume = modal.Volume.from_name("voxcpm2-weights", create_if_missing=True)


@app.cls(
    image=voxcpm_image,
    gpu="L4",
    timeout=300,
    container_idle_timeout=120,
    volumes={CACHE_DIR: model_volume},
)
@modal.concurrent(max_inputs=4)
class VoxCPM2Server:
    """Serverless VoxCPM2 inference on Modal."""

    @modal.enter()
    def load_model(self):
        from voxcpm import VoxCPM
        self.model = VoxCPM.from_pretrained(
            "openbmb/VoxCPM2",
            load_denoiser=False,
            cache_dir=CACHE_DIR,
        )
        self.sample_rate = self.model.tts_model.sample_rate

    @modal.fastapi_endpoint(method="POST")
    def generate(self, request: dict):
        """
        OpenAI-compatible TTS endpoint.

        Body: {"model": "openbmb/VoxCPM2", "input": "text to speak", "voice": "default"}
        Returns: WAV audio bytes
        """
        import numpy as np
        import soundfile as sf
        from fastapi.responses import Response

        text = request.get("input", "")
        if not text:
            return {"error": "input text is required"}

        reference_wav = request.get("reference_wav_path")
        prompt_text = request.get("prompt_text")

        kwargs = {
            "text": text,
            "cfg_value": 2.0,
            "inference_timesteps": 10,
        }
        if reference_wav:
            kwargs["reference_wav_path"] = reference_wav
        if prompt_text:
            kwargs["prompt_wav_path"] = reference_wav
            kwargs["prompt_text"] = prompt_text

        wav = self.model.generate(**kwargs)

        buf = io.BytesIO()
        sf.write(buf, wav, self.sample_rate, format="WAV")
        buf.seek(0)

        return Response(
            content=buf.read(),
            media_type="audio/wav",
            headers={"X-Sample-Rate": str(self.sample_rate)},
        )

    @modal.fastapi_endpoint(method="GET")
    def health(self):
        return {
            "status": "healthy",
            "engine": "VoxCPM2",
            "model": "openbmb/VoxCPM2",
            "sample_rate": self.sample_rate,
            "gpu": "L4",
            "provider": "modal",
        }


@app.function(image=voxcpm_image)
@modal.fastapi_endpoint(method="GET")
def models():
    """GET /v1/models — compatibility endpoint for status checks."""
    return {
        "data": [
            {
                "id": "openbmb/VoxCPM2",
                "object": "model",
                "owned_by": "openbmb",
            }
        ]
    }
