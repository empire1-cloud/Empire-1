"""Read-only access to ~/.gstack/projects/*.

Every read in this module goes through `_safe_path`, which rejects any
path that escapes the projects root (dot-dot, absolute injection, or a
symlink pointing elsewhere). Transcript directories are denylisted by
name at every layer — the v1 boundary is: timelines, learnings, plans,
reviews, QA receipts, designs YES; conversations and secrets NO.
"""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path

from .redact import redact

TEXT_SUFFIXES = {".md", ".txt", ".json", ".jsonl"}
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
DENY_DIR_NAMES = {"transcripts", "sessions", ".git"}
MAX_CONTENT_BYTES = 256 * 1024

ARTIFACT_KINDS = {
    "ceo-plans": "ceo-plan",
    "checkpoints": "checkpoint",
    "retros": "retro",
    "designs": "design",
}


def gstack_home() -> Path:
    return Path(os.environ.get("GSTACK_HOME", str(Path.home() / ".gstack"))).expanduser()


def projects_root() -> Path:
    return gstack_home() / "projects"


def _safe_path(candidate: Path) -> Path:
    """Resolve and require the path to stay inside the projects root."""
    root = projects_root().resolve()
    resolved = candidate.resolve()
    if not resolved.is_relative_to(root):
        raise PermissionError(f"path escapes gstack projects root: {candidate}")
    for part in resolved.relative_to(root).parts:
        if part in DENY_DIR_NAMES:
            raise PermissionError(f"denylisted path segment: {part}")
    return resolved


def _read_jsonl(path: Path, limit: int | None = None) -> list[dict]:
    try:
        path = _safe_path(path)
        raw = path.read_text(encoding="utf-8", errors="replace")
    except (OSError, PermissionError):
        return []
    rows: list[dict] = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(row, dict):
            rows.append(row)
    if limit is not None:
        rows = rows[-limit:]
    return rows


def list_projects() -> list[dict]:
    root = projects_root()
    if not root.is_dir():
        return []
    out = []
    for entry in sorted(root.iterdir()):
        if not entry.is_dir() or entry.name in DENY_DIR_NAMES:
            continue
        timeline = entry / "timeline.jsonl"
        learnings = entry / "learnings.jsonl"
        last_ts = None
        events = _read_jsonl(timeline)
        if events:
            last_ts = events[-1].get("ts")
        out.append(
            {
                "slug": entry.name,
                "timeline_events": len(events),
                "learnings": sum(1 for _ in _read_jsonl(learnings)),
                "last_activity_ts": last_ts,
            }
        )
    return out


def _project_dirs(project: str | None) -> list[Path]:
    root = projects_root()
    if not root.is_dir():
        return []
    if project:
        candidate = root / project
        try:
            candidate = _safe_path(candidate)
        except PermissionError:
            return []
        return [candidate] if candidate.is_dir() else []
    return [p for p in sorted(root.iterdir()) if p.is_dir() and p.name not in DENY_DIR_NAMES]


def activity(project: str | None = None, limit: int = 100) -> list[dict]:
    events: list[dict] = []
    for proj in _project_dirs(project):
        for row in _read_jsonl(proj / "timeline.jsonl"):
            row = dict(row)
            row["project"] = proj.name
            events.append(row)
    events.sort(key=lambda e: e.get("ts") or "", reverse=True)
    return events[:limit]


def missions(project: str | None = None, limit: int = 100) -> list[dict]:
    """Derive missions by pairing started/completed timeline events.

    Pairing key is (project, session, skill); an unmatched `started` is an
    ACTIVE mission. Completed missions become RECEIPTED (outcome success)
    or FAILED — never VERIFIED. Verification is Engine 07's job.
    """
    open_missions: dict[tuple, dict] = {}
    done: list[dict] = []
    for proj in _project_dirs(project):
        for row in _read_jsonl(proj / "timeline.jsonl"):
            key = (proj.name, row.get("session"), row.get("skill"))
            if row.get("event") == "started":
                open_missions[key] = {
                    "project": proj.name,
                    "skill": row.get("skill"),
                    "branch": row.get("branch"),
                    "session": row.get("session"),
                    "started_ts": row.get("ts"),
                    "status": "ACTIVE",
                    "verification": "pending",
                }
            elif row.get("event") == "completed":
                mission = open_missions.pop(
                    key,
                    {
                        "project": proj.name,
                        "skill": row.get("skill"),
                        "branch": row.get("branch"),
                        "session": row.get("session"),
                        "started_ts": None,
                        "verification": "pending",
                    },
                )
                outcome = row.get("outcome") or "unknown"
                mission["completed_ts"] = row.get("ts")
                mission["duration_s"] = row.get("duration_s")
                mission["outcome"] = outcome
                mission["status"] = "RECEIPTED" if outcome == "success" else "FAILED" if outcome == "error" else "EXECUTED"
                done.append(mission)
    result = list(open_missions.values()) + done
    result.sort(key=lambda m: m.get("completed_ts") or m.get("started_ts") or "", reverse=True)
    return result[:limit]


def learnings(project: str | None = None, limit: int = 200) -> list[dict]:
    rows: list[dict] = []
    for proj in _project_dirs(project):
        for row in _read_jsonl(proj / "learnings.jsonl"):
            row = dict(row)
            row["project"] = proj.name
            if isinstance(row.get("insight"), str):
                row["insight"] = redact(row["insight"])
            rows.append(row)
    rows.sort(key=lambda r: r.get("ts") or "", reverse=True)
    return rows[:limit]


def artifacts(project: str | None = None, limit: int = 200) -> list[dict]:
    found: list[dict] = []
    for proj in _project_dirs(project):
        for dirname, kind in ARTIFACT_KINDS.items():
            base = proj / dirname
            if not base.is_dir():
                continue
            for path in sorted(base.rglob("*")):
                if not path.is_file():
                    continue
                suffix = path.suffix.lower()
                if suffix not in TEXT_SUFFIXES | IMAGE_SUFFIXES:
                    continue
                try:
                    safe = _safe_path(path)
                    stat = safe.stat()
                except (OSError, PermissionError):
                    continue
                rel = safe.relative_to(projects_root() / proj.name)
                found.append(
                    {
                        "project": proj.name,
                        "kind": kind,
                        "id": str(rel),
                        "name": path.name,
                        "bytes": stat.st_size,
                        "modified_ts": stat.st_mtime,
                        "media": "image" if suffix in IMAGE_SUFFIXES else "text",
                    }
                )
        # decisions ledger is a single well-known file
        decisions = proj / "decisions.active.json"
        if decisions.is_file():
            stat = decisions.stat()
            found.append(
                {
                    "project": proj.name,
                    "kind": "decisions",
                    "id": "decisions.active.json",
                    "name": "decisions.active.json",
                    "bytes": stat.st_size,
                    "modified_ts": stat.st_mtime,
                    "media": "text",
                }
            )
    found.sort(key=lambda a: a["modified_ts"], reverse=True)
    return found[:limit]


def evidence(project: str | None = None, limit: int = 200) -> list[dict]:
    """Review findings and QA receipts: `<branch>-reviews.jsonl` files."""
    rows: list[dict] = []
    for proj in _project_dirs(project):
        for path in sorted(proj.glob("*-reviews.jsonl")):
            branch = re.sub(r"-reviews\.jsonl$", "", path.name)
            for row in _read_jsonl(path):
                row = dict(row)
                row["project"] = proj.name
                row["branch"] = row.get("branch") or branch
                row["receipt_type"] = "review"
                rows.append(row)
    rows.sort(key=lambda r: r.get("ts") or "", reverse=True)
    return rows[:limit]


@dataclass
class ArtifactContent:
    id: str
    project: str
    media: str
    content: str = ""
    truncated: bool = field(default=False)


def artifact_content(project: str, artifact_id: str) -> ArtifactContent:
    path = _safe_path(projects_root() / project / artifact_id)
    if not path.is_file():
        raise FileNotFoundError(artifact_id)
    suffix = path.suffix.lower()
    if suffix in IMAGE_SUFFIXES:
        # Images are listed but not inlined in v1; the Control Plane links them.
        return ArtifactContent(id=artifact_id, project=project, media="image")
    if suffix not in TEXT_SUFFIXES:
        raise PermissionError(f"suffix not allowlisted: {suffix}")
    raw = path.read_bytes()
    truncated = len(raw) > MAX_CONTENT_BYTES
    text = raw[:MAX_CONTENT_BYTES].decode("utf-8", errors="replace")
    return ArtifactContent(
        id=artifact_id,
        project=project,
        media="text",
        content=redact(text),
        truncated=truncated,
    )


def timeline_fingerprint() -> str:
    """Cheap change token: mtimes+sizes of every timeline file."""
    parts = []
    for proj in _project_dirs(None):
        t = proj / "timeline.jsonl"
        if t.is_file():
            stat = t.stat()
            parts.append(f"{proj.name}:{stat.st_mtime_ns}:{stat.st_size}")
    return "|".join(parts)
