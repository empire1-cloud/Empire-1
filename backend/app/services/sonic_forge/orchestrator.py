"""
Sonic Forge Orchestrator — master pipeline coordinator.

Each stage receives and returns an EngineContext. Stages are registered
in order and executed sequentially per job.

Pipeline Snapshot: after each stage the context is serialized to disk
for deterministic debugging and replay.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Protocol

from .context import EngineContext

logger = logging.getLogger(__name__)

SNAPSHOT_DIR: Path | None = None


def enable_snapshots(directory: str | Path) -> None:
    global SNAPSHOT_DIR
    SNAPSHOT_DIR = Path(directory)
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("[Snapshot] Enabled → %s", SNAPSHOT_DIR)


class PipelineStage(Protocol):
    """Each stage receives an EngineContext and returns an updated one."""

    name: str

    async def process(self, ctx: EngineContext) -> EngineContext: ...


class SonicForgeOrchestrator:
    """Registers stages and runs them in sequence."""

    _stages: list[PipelineStage] = []

    @classmethod
    def register(cls, stage: PipelineStage) -> None:
        cls._stages.append(stage)
        logger.info("[SonicForge] Registered stage: %s", stage.name)

    @classmethod
    async def run(cls, ctx: EngineContext, snapshot: bool = False) -> EngineContext:
        logger.info("[SonicForge] Starting job (style=%s)", ctx.style)

        for i, stage in enumerate(cls._stages):
            stage_name = stage.name
            logger.info("[SonicForge] Stage %02d: %s", i, stage_name)
            try:
                ctx = await stage.process(ctx)
            except Exception as e:
                logger.exception("[SonicForge] Stage %s failed", stage_name)
                raise RuntimeError(f"{stage_name}: {e}") from e

            if snapshot:
                _write_snapshot(ctx, i, stage_name)

        logger.info("[SonicForge] Job complete")
        return ctx

    @classmethod
    def reset(cls) -> None:
        cls._stages.clear()


def _write_snapshot(ctx: EngineContext, index: int, stage_name: str) -> None:
    if SNAPSHOT_DIR is None:
        return
    path = SNAPSHOT_DIR / f"{index:03d}_{stage_name}.json"
    snapshot = _serialize_context(ctx)
    path.write_text(json.dumps(snapshot, indent=2, default=str))
    logger.debug("[Snapshot] Wrote %s", path.name)


def _serialize_context(ctx: EngineContext) -> dict:
    """Recursively serialize EngineContext to JSON-safe dicts."""
    result = {}
    for key, val in ctx.__dict__.items():
        if hasattr(val, "__dataclass_fields__"):
            result[key] = _dataclass_to_dict(val)
        elif isinstance(val, list):
            result[key] = [_dataclass_to_dict(v) if hasattr(v, "__dataclass_fields__") else v for v in val]
        elif isinstance(val, dict):
            result[key] = str(val)  # flatten complex dicts
        else:
            result[key] = val
    return result


def _dataclass_to_dict(obj) -> dict:
    d = {}
    for key, val in obj.__dict__.items():
        if hasattr(val, "__dataclass_fields__"):
            d[key] = _dataclass_to_dict(val)
        elif isinstance(val, list):
            d[key] = [_dataclass_to_dict(v) if hasattr(v, "__dataclass_fields__") else str(v) for v in val]
        else:
            d[key] = val
    return d
