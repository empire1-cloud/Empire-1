"""
Soulfire Creative OS Module (Prototype Integration)
- Handles emotional grammar, dialect rules, and music generation for Soulfire universe
- Calls Vertex AI music engine via vertexai/music_client.py
- Strictly isolated from Game OS and other universes
"""

from vertexai.music_client import query_music_engine


def generate_music(prompt: str):
    """
    Generate music using Vertex AI for Soulfire universe.
    Args:
        prompt: The creative prompt or instructions.
    Returns:
        The AI-generated music metadata or result.
    """
    payload = {"prompt": prompt}
    return query_music_engine(payload)

# Example usage:
# result = generate_music("Generate a Chicano Soul track with late-pocket rhythm")
