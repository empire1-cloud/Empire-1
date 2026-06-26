"""
Render Manifest — contract between the composition pipeline and the
rendering pipeline (PFA, Voice King, PDA, Mix, Master, Export).

Each renderer reads the manifest to determine what to render and in what order.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class RenderManifest:
    project_id: str = ""
    tempo: int = 90
    key: str = "Fmin"
    preset: str = "west_coast"
    tracks: dict[str, str] = field(default_factory=dict)
    render_order: list[str] = field(default_factory=lambda: [
        "drums", "bass", "pads", "keys", "lead", "strings", "fx", "automation",
        "vocals", "mix", "master",
    ])
    created_at: str = ""
    version: str = "1.0.0"


def build_render_manifest(ctx) -> RenderManifest:
    ig = ctx.instrument_graph

    tracks: dict[str, str] = {}
    for role, track in ig.tracks.items():
        filename = f"{role}.mid"
        tracks[role] = filename

    # Narrative segments → vocal track
    if hasattr(ctx, "narrative_segments") and ctx.narrative_segments:
        tracks["vocals"] = "lead_vocal.json"

    return RenderManifest(
        project_id=str(uuid.uuid4()),
        tempo=ctx.musical_graph.bpm if ctx.musical_graph else ctx.blueprint.targets["bpm"],
        key=ctx.blueprint.targets["key"],
        preset=ctx.style,
        tracks=tracks,
        render_order=[
            "drums", "bass", "pads", "keys", "lead", "strings", "fx", "vocals", "mix", "master",
        ],
        created_at=datetime.now(timezone.utc).isoformat(),
    )
