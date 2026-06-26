"""
DNA Engine — metadata provenance tagger.

Tags every asset with creator ID, engine versions, checksums, and
provenance chain for the VICS Ledger.
"""

from __future__ import annotations

import hashlib
import json
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine, ENGINE_REGISTRY

logger = logging.getLogger(__name__)


@dataclass
class DNATag:
    key: str = ""
    value: str = ""
    source: str = ""


@dataclass
class DNAAsset:
    type: str = ""
    id: str = ""
    checksum: str = ""
    tags: list[DNATag] = field(default_factory=list)


@dataclass
class DNAProvenance:
    assets: list[DNAAsset] = field(default_factory=list)
    creator_id: str = ""
    session_id: str = ""
    engine_versions: dict[str, str] = field(default_factory=dict)
    created_at: str = ""


@register_engine
class DNAEngine(BaseEngine):
    """EngineContext → DNAProvenance. No audio generated."""

    name = "dna"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        assets: list[DNAAsset] = []
        session_id = ctx.job_id or str(uuid.uuid4())

        # Tag blueprint
        bp_str = json.dumps({
            "track_id": ctx.blueprint.track_id,
            "intent": ctx.blueprint.intent,
            "structure": ctx.blueprint.structure,
        }, default=str)
        assets.append(DNAAsset(
            type="blueprint", id=ctx.blueprint.track_id,
            checksum=_sha256(bp_str),
            tags=[
                DNATag(key="genre", value=ctx.blueprint.intent.get("genre", ""), source="blueprint"),
                DNATag(key="bpm", value=str(ctx.blueprint.targets.get("bpm", "")), source="blueprint"),
                DNATag(key="key", value=ctx.blueprint.targets.get("key", ""), source="blueprint"),
            ],
        ))

        # Tag narrative
        if ctx.narrative_segments:
            nar_str = json.dumps([{"section": s.section, "speaker": s.speaker} for s in ctx.narrative_segments], default=str)
            assets.append(DNAAsset(
                type="narrative", id=str(uuid.uuid4()),
                checksum=_sha256(nar_str),
                tags=[DNATag(key="segments", value=str(len(ctx.narrative_segments)), source="narrative")],
            ))

        # Tag instrument graph
        ig = ctx.instrument_graph
        if ig and ig.tracks:
            for role, track in ig.tracks.items():
                midi_str = json.dumps([{"n": e.note, "v": e.velocity, "t": round(e.start_sec, 2)} for e in track.midi_events[:100]], default=str)
                assets.append(DNAAsset(
                    type=f"instrument_{role}", id=track.id,
                    checksum=_sha256(midi_str),
                    tags=[
                        DNATag(key="engine", value=track.engine, source="instrument"),
                        DNATag(key="midi_events", value=str(len(track.midi_events)), source="instrument"),
                    ],
                ))

        # Tag vocal performance
        vp = ctx.vocal_performance
        if vp and vp.phrases:
            assets.append(DNAAsset(
                type="vocal_performance", id=str(uuid.uuid4()),
                checksum=_sha256(str(len(vp.phrases))),
                tags=[DNATag(key="phrases", value=str(len(vp.phrases)), source="pfa")],
            ))

        ctx.dna_provenance = DNAProvenance(
            assets=assets,
            creator_id=ctx.creator_id,
            session_id=session_id,
            engine_versions={name: "1.0.0" for name in ENGINE_REGISTRY},
            created_at=datetime.now(timezone.utc).isoformat(),
        )

        logger.info("[DNA] %d assets tagged | creator=%s", len(assets), ctx.creator_id or "anonymous")

        return ctx


def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]
