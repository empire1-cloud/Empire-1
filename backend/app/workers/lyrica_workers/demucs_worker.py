"""
HTDemucs worker — hardened subprocess orchestration.

- Uses sys.executable (venv-safe).
- Optional timeout; safe stderr decoding.
- Resolves and validates input paths; verifies stem outputs exist.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, Optional


class DemucsOrchestrator:
    """Splits master audio into 4 stems via demucs CLI."""

    def __init__(self, output_dir: str = "/tmp/stems", *, timeout_sec: Optional[int] = 3600) -> None:
        self.output_dir = str(Path(output_dir).resolve())
        self.timeout_sec = timeout_sec
        os.makedirs(self.output_dir, exist_ok=True)

    @staticmethod
    def _validate_input_path(input_master_path: str) -> str:
        p = Path(input_master_path).expanduser()
        try:
            p = p.resolve(strict=True)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Input not found: {input_master_path}") from e
        if not p.is_file():
            raise ValueError(f"Not a file: {p}")
        suffix = p.suffix.lower()
        if suffix not in {".wav", ".mp3", ".flac", ".m4a", ".ogg"}:
            raise ValueError(f"Unsupported audio extension: {suffix}")
        return str(p)

    def separate_stems(self, input_master_path: str) -> Dict[str, str]:
        input_master_path = self._validate_input_path(input_master_path)

        exe = sys.executable or "python"
        command = [
            exe,
            "-m",
            "demucs.separate",
            "-n",
            "htdemucs_ft",
            "--float32",
            "-o",
            self.output_dir,
            input_master_path,
        ]

        try:
            proc = subprocess.run(
                command,
                check=True,
                capture_output=True,
                timeout=self.timeout_sec,
            )
        except subprocess.TimeoutExpired as e:
            err = e.stderr.decode("utf-8", errors="replace") if e.stderr else ""
            raise TimeoutError(f"Demucs timed out after {self.timeout_sec}s: {err}") from e
        except subprocess.CalledProcessError as e:
            stderr = (
                e.stderr.decode("utf-8", errors="replace")
                if isinstance(e.stderr, (bytes, bytearray))
                else str(e.stderr or "")
            )
            stdout = (
                e.stdout.decode("utf-8", errors="replace")
                if isinstance(e.stdout, (bytes, bytearray))
                else str(e.stdout or "")
            )
            raise RuntimeError(f"Demucs failed (exit {e.returncode}): {stderr or stdout}") from e
        else:
            if proc.stderr:
                # demucs may log progress to stderr; non-fatal
                _ = proc.stderr.decode("utf-8", errors="replace")

        base_name = Path(input_master_path).stem
        stem_folder = Path(self.output_dir) / "htdemucs_ft" / base_name

        stems = {
            "vocals": stem_folder / "vocals.wav",
            "bass": stem_folder / "bass.wav",
            "drums": stem_folder / "drums.wav",
            "other": stem_folder / "other.wav",
        }
        missing = [k for k, v in stems.items() if not v.is_file()]
        if missing:
            raise FileNotFoundError(
                f"Expected stems not found under {stem_folder}: {missing}. "
                "Install demucs and ensure the model ran successfully."
            )

        return {k: str(v.resolve()) for k, v in stems.items()}
