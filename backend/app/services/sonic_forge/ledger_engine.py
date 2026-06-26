"""
Ledger Engine — VICS royalty tracking plan.

Records every creator, asset, and attribution for the VICS blockchain.
No transactions executed — just structured ledger entries.
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine

logger = logging.getLogger(__name__)


@dataclass
class LedgerEntry:
    asset_id: str = ""
    asset_type: str = ""
    creator_id: str = ""
    role: str = ""            # composer, lyricist, performer, producer
    share_pct: float = 0.0
    usd_value: float = 0.0


@dataclass
class LedgerPlan:
    entries: list[LedgerEntry] = field(default_factory=list)
    total_estimated_usd: float = 0.0
    session_id: str = ""


@register_engine
class LedgerEngine(BaseEngine):
    """DNAProvenance → LedgerPlan. No blockchain transactions."""

    name = "ledger"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        dna = ctx.dna_provenance
        if not dna:
            logger.warning("[Ledger] No DNA provenance — skipping")
            ctx.ledger_plan = LedgerPlan()
            return ctx

        entries: list[LedgerEntry] = []

        for asset in dna.assets:
            creator = dna.creator_id or "anonymous"
            role = "composer"
            if asset.type == "narrative":
                role = "lyricist"
            elif asset.type == "vocal_performance":
                role = "performer"
            elif asset.type == "blueprint":
                role = "producer"

            share = 100.0 / max(1, len(dna.assets))
            usd_val = round(share * 0.01, 4)  # $0.01 per share

            entries.append(LedgerEntry(
                asset_id=asset.id,
                asset_type=asset.type,
                creator_id=creator,
                role=role,
                share_pct=round(share, 2),
                usd_value=usd_val,
            ))

        ctx.ledger_plan = LedgerPlan(
            entries=entries,
            total_estimated_usd=round(sum(e.usd_value for e in entries), 4),
            session_id=dna.session_id,
        )

        logger.info(
            "[Ledger] %d entries | %.4f USD total",
            len(entries), ctx.ledger_plan.total_estimated_usd,
        )

        return ctx
