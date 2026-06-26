from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import uuid

from fastapi import HTTPException


REPO_ROOT = Path(__file__).resolve().parents[3]

# Canonical Execution Engine: ~/projects/sla113/OMNI_AGENT/
# State files are read from the canonical location when available,
# falling back to local copy for backward compatibility.
SLA113_EE = REPO_ROOT.parent / "sla113" / "OMNI_AGENT"
STATE_DIR = SLA113_EE / "state" if SLA113_EE.exists() else REPO_ROOT / "omni_agent" / "state"
DEFAULT_STATE_FILE = STATE_DIR / "tasks.json"

UNIVERSE_ALIASES = {
    "empire": "empire",
    "empire1": "empire",
    "southern": "southern",
    "southern_lyfestyle": "southern",
    "arcade": "southern",
    "lyrica": "lyrica3",
    "lyrica3": "lyrica3",
    "sl_universal": "lyrica3",
    "cultura": "cultura",
    "sla113": "sla113",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_universe(value: Optional[str]) -> str:
    key = (value or "empire").strip().lower().replace("-", "_")
    return UNIVERSE_ALIASES.get(key, "empire")


def state_file_for_universe(universe: str) -> Path:
    normalized = normalize_universe(universe)
    if normalized == "empire":
        return DEFAULT_STATE_FILE
    return STATE_DIR / f"tasks.{normalized}.json"


def chat_file_for_universe(universe: str) -> Path:
    normalized = normalize_universe(universe)
    return STATE_DIR / f"chat.{normalized}.jsonl"


def _read_json(path: Path) -> Dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as fh:
            return json.load(fh)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"invalid omni state json: {exc}") from exc


def load_state(universe: str) -> Dict[str, Any]:
    target = state_file_for_universe(universe)
    if target.exists():
        state = _read_json(target)
        state["_state_file"] = str(target)
        state["_state_scope"] = normalize_universe(universe)
        return state

    if not DEFAULT_STATE_FILE.exists():
        raise HTTPException(status_code=404, detail=f"omni state file not found: {DEFAULT_STATE_FILE}")

    state = _read_json(DEFAULT_STATE_FILE)
    state["_state_file"] = str(DEFAULT_STATE_FILE)
    state["_state_scope"] = "default_fallback"
    return state


def ensure_state_for_write(universe: str) -> Dict[str, Any]:
    target = state_file_for_universe(universe)
    if target.exists():
        state = _read_json(target)
        state["_state_file"] = str(target)
        state["_state_scope"] = normalize_universe(universe)
        return state

    if not DEFAULT_STATE_FILE.exists():
        raise HTTPException(status_code=404, detail=f"omni state file not found: {DEFAULT_STATE_FILE}")

    base = _read_json(DEFAULT_STATE_FILE)
    base["exported_at"] = utc_now()
    for task in base.get("tasks", []):
        if isinstance(task, dict) and not task.get("universe"):
            task["universe"] = normalize_universe(universe)

    STATE_DIR.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as fh:
        json.dump(base, fh, indent=2)
        fh.write("\n")

    base["_state_file"] = str(target)
    base["_state_scope"] = normalize_universe(universe)
    return base


def save_state(state: Dict[str, Any]) -> None:
    state_file = state.get("_state_file")
    if not state_file:
        raise HTTPException(status_code=500, detail="missing _state_file in omni state payload")

    path = Path(state_file)
    payload = dict(state)
    payload.pop("_state_file", None)
    payload.pop("_state_scope", None)

    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)
        fh.write("\n")


def task_list(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    tasks = state.get("tasks")
    if not isinstance(tasks, list):
        return []
    return tasks


def recent_runs(state: Dict[str, Any]) -> List[Dict[str, Any]]:
    runs = state.get("recent_runs")
    if not isinstance(runs, list):
        return []
    return runs


def summary_metrics(tasks: List[Dict[str, Any]], runs: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(tasks)
    done = sum(1 for t in tasks if t.get("status") == "done")
    blocked = sum(1 for t in tasks if str(t.get("status", "")).startswith("blocked"))
    pending = total - done - blocked

    scored = [float(r.get("cohesion_score")) for r in runs if r.get("cohesion_score") is not None]
    avg_score = round(sum(scored) / len(scored), 2) if scored else None

    minutes_per_task_manual = 60
    hourly_rate = 100
    hours_saved = round((done * minutes_per_task_manual) / 60.0, 2)
    roi_weekly_usd = round(hours_saved * hourly_rate, 2)

    return {
        "total_tasks": total,
        "done_tasks": done,
        "pending_tasks": pending,
        "blocked_tasks": blocked,
        "completion_rate": round((done / total) * 100, 2) if total else 0.0,
        "avg_cohesion_score": avg_score,
        "hours_saved_weekly": hours_saved,
        "roi_weekly_usd": roi_weekly_usd,
    }


def run_next(universe: str, actor: str, mode: str) -> Dict[str, Any]:
    state = ensure_state_for_write(universe)
    tasks = task_list(state)
    runs = recent_runs(state)

    next_task = next((t for t in tasks if t.get("status") in {"pending", "todo", "open"}), None)
    if not next_task:
        return {
            "status": "noop",
            "message": "No pending tasks to run.",
            "universe": normalize_universe(universe),
            "timestamp": utc_now(),
        }

    run_id = uuid.uuid4().hex
    started_at = utc_now()

    next_task["status"] = "done"
    next_task["updated_at"] = started_at
    next_task["closed_at"] = started_at
    next_task["universe"] = normalize_universe(universe)

    run_record = {
        "run_id": run_id,
        "task_id": next_task.get("id"),
        "started_at": started_at,
        "ended_at": started_at,
        "mode": mode,
        "final_status": "done",
        "cohesion_score": 88.0,
        "summary": f"auto-run by {actor}",
    }
    runs.insert(0, run_record)

    state["exported_at"] = utc_now()
    state["tasks"] = tasks
    state["recent_runs"] = runs[:50]
    save_state(state)

    return {
        "status": "done",
        "universe": normalize_universe(universe),
        "task": next_task,
        "run": run_record,
        "metrics": summary_metrics(tasks, runs),
        "timestamp": utc_now(),
    }


def append_chat_event(universe: str, event: Dict[str, Any]) -> None:
    path = chat_file_for_universe(universe)
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = dict(event)
    payload["universe"] = normalize_universe(universe)
    payload.setdefault("timestamp", utc_now())
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload, ensure_ascii=True) + "\n")


def get_chat_events(universe: str, limit: int = 100) -> Dict[str, Any]:
    path = chat_file_for_universe(universe)
    if not path.exists():
        return {
            "universe": normalize_universe(universe),
            "count": 0,
            "events": [],
            "state_file": str(path),
            "timestamp": utc_now(),
        }

    lines = path.read_text(encoding="utf-8").splitlines()
    selected = lines[-max(1, min(limit, 500)) :]
    events: List[Dict[str, Any]] = []
    for line in selected:
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError:
            continue

    return {
        "universe": normalize_universe(universe),
        "count": len(events),
        "events": events,
        "state_file": str(path),
        "timestamp": utc_now(),
    }
