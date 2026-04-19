# VoxCPM2 GPU Deployment (Modal)

Serverless GPU deployment for VoxCPM2 voice synthesis. Scales to zero when idle — you only pay when generating audio.

## Quick Start

```bash
# 1. Install Modal
pip install modal

# 2. Authenticate (one-time, opens browser)
modal setup

# 3. Deploy
cd backend
modal deploy deploy/modal_voxcpm.py
```

After deploy, Modal prints your endpoint URL. It looks like:
```
https://YOUR_WORKSPACE--empire-voxcpm2-voxcpm2server-generate.modal.run
```

## Connect to Empire Backend

Set the Modal endpoint URL in your backend environment:

```bash
export VOXCPM_API_URL="https://YOUR_WORKSPACE--empire-voxcpm2-voxcpm2server-generate.modal.run"
```

The VoxCPM integration in the backend will automatically call this URL for voice generation.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/generate` | Generate speech (OpenAI-compatible) |
| GET | `/health` | Health check |
| GET | `/models` | List models (compatibility) |

## Costs

| Tier | GPU | Cost | Notes |
|------|-----|------|-------|
| Free | L4 | $30/mo credits | ~30,000 voice clips |
| Pro | L4 | $0.70/hr GPU time | Only when generating |

A typical 10-second voice clip takes ~3 seconds to generate = ~$0.001 per clip.

## Testing

```bash
# Health check
curl https://YOUR_ENDPOINT/health

# Generate speech
curl -X POST https://YOUR_ENDPOINT/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello from Empire Universe", "voice": "default"}' \
  --output test.wav
```

## Development

For local testing without deploying:
```bash
modal serve deploy/modal_voxcpm.py
```
This creates a temporary endpoint that live-reloads on file changes.
