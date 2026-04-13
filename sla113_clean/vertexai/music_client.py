"""
Vertex AI Music Business Client (genai-app-slaudiomaster-1-1775607248160-00005-m79)
This module provides an isolated interface for SLA113 to interact with the Vertex AI music business engine.

- Only import/use in Creative OS logic (never Game OS)
- Insert your credentials and endpoint details as needed
"""

import os
from typing import Any, Dict
import requests


# Easily switch between prod and pre-prod endpoints
VERTEX_ENDPOINT = os.getenv(
    "VERTEX_MUSIC_ENDPOINT",
    "https://ais-pre-qcfkli3t5tacuykvwfiaw3-543463570189.us-east1.run.app"  # Default to pre-prod
)
API_KEY = os.getenv("VERTEX_MUSIC_API_KEY", "")  # Set your API key or use service account


def query_music_engine(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Send a request to the Vertex AI music engine.
    Args:
        payload: The JSON payload for the music business logic.
    Returns:
        The JSON response from Vertex AI.
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{VERTEX_ENDPOINT}/v1/music", json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

# Example usage (should be called only from Creative OS logic):
# result = query_music_engine({"prompt": "Generate a Chicano Soul track"})
