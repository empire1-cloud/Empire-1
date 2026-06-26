"""
Export Engine — real file output.

Writes MIDI, WAV stems, mix, master, vocal TTS, and project manifest.
"""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from dataclasses import dataclass, field
from typing import Any

from .context import EngineContext
from .engine_registry import BaseEngine, register_engine
from .file_writer import write_project as write_midi_json
from .audio_renderer import render_project as render_audio

logger = logging.getLogger(__name__)


@dataclass
class ExportFile:
    format: str = "wav"
    role: str = ""
    path: str = ""


@dataclass
class ExportPlan:
    files: list[ExportFile] = field(default_factory=list)
    project_path: str = ""


OUTPUT_ROOT = Path(os.getenv("SONIC_FORGE_OUTPUT", "/tmp/sonic_forge_output"))


@register_engine
class ExportEngine(BaseEngine):
    """EngineContext → real files on disk (MIDI, WAV, MP3, JSON)."""

    name = "export"
    version = "1.0.0"

    async def process(self, ctx: EngineContext) -> EngineContext:
        output_dir = OUTPUT_ROOT
        output_dir.mkdir(parents=True, exist_ok=True)

        project_id = ctx.job_id or uuid.uuid4().hex[:8]
        project_dir = output_dir / f"sonic_forge_{project_id}"
        project_dir.mkdir(parents=True, exist_ok=True)

        try:
            write_midi_json(ctx, project_dir)
        except Exception as e:
            logger.warning("[Export] MIDI write failed: %s", e)

        if os.getenv("SONIC_FORGE_RENDER_AUDIO", "0") == "1":
            try:
                render_audio(ctx, project_dir)
            except Exception as e:
                logger.exception("[Export] Audio render failed: %s", e)
        else:
            logger.info("[Export] Audio rendering disabled (set SONIC_FORGE_RENDER_AUDIO=1)")

        all_files: list[ExportFile] = []
        for f in sorted(project_dir.rglob("*")):
            if f.is_file() and f.suffix in (".wav", ".mid", ".json", ".mp3"):
                all_files.append(ExportFile(
                    format=f.suffix.lstrip("."),
                    role=f.stem,
                    path=str(f.relative_to(output_dir)),
                ))

        ctx.export_plan = ExportPlan(
            files=all_files,
            project_path=str(project_dir),
        )

        logger.info("[Export] %d real files → %s", len(all_files), project_dir)
        return ctx
