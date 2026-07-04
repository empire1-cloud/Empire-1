from __future__ import annotations

import json
import os
from typing import Any, Dict, List


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data", "empire_os_cofounder")
DATA_DIR = os.path.normpath(DATA_DIR)

_STORES = {
    "audit": "audit.json",
    "briefs": "briefs.json",
    "queue": "queue.json",
    "cycles": "cycles.json",
    "activity": "activity.json",
    "receipts": "receipts.json",
    "summaries": "summaries.json",
}


def ensure_store() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    for filename in _STORES.values():
        path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as handle:
                json.dump([], handle)


def load_json_store(name: str) -> List[Dict[str, Any]]:
    path = os.path.join(DATA_DIR, _STORES.get(name, f"{name}.json"))
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except (json.JSONDecodeError, FileNotFoundError):
        return []
    return payload if isinstance(payload, list) else []


def save_json_store(name: str, records: List[Dict[str, Any]]) -> None:
    ensure_store()
    path = os.path.join(DATA_DIR, _STORES.get(name, f"{name}.json"))
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(records, handle, indent=2)
        handle.write("\n")


def append_audit_record(record: Dict[str, Any], *, max_records: int = 500) -> Dict[str, Any]:
    records = load_json_store("audit")
    records.append(record)
    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("audit", records)
    return record


def append_brief_record(record: Dict[str, Any], *, max_records: int = 100) -> Dict[str, Any]:
    records = load_json_store("briefs")
    records.append(record)
    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("briefs", records)
    return record


def write_latest_brief_markdown(content: str) -> str:
    ensure_store()
    path = os.path.join(DATA_DIR, "latest_brief.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)
    return path


def append_cycle_record(record: Dict[str, Any], *, max_records: int = 100) -> Dict[str, Any]:
    records = load_json_store("cycles")
    records.append(record)
    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("cycles", records)
    return record


def upsert_queue_items(items: List[Dict[str, Any]], *, max_records: int = 500) -> Dict[str, Any]:
    records = load_json_store("queue")
    inserted = 0
    updated = 0
    inserted_items: List[Dict[str, Any]] = []
    updated_items: List[Dict[str, Any]] = []

    by_key = {
        (str(record.get("type", "")), str(record.get("title", "")).strip().lower()): index
        for index, record in enumerate(records)
    }

    for item in items:
        key = (str(item.get("type", "")), str(item.get("title", "")).strip().lower())
        if key in by_key:
            idx = by_key[key]
            existing = records[idx]
            existing.update({
                "updated_at": item.get("updated_at"),
                "priority": item.get("priority", existing.get("priority")),
                "reason": item.get("reason", existing.get("reason")),
                "suggested_step": item.get("suggested_step", existing.get("suggested_step")),
                "agent": item.get("agent", existing.get("agent")),
                "lane": item.get("lane", existing.get("lane")),
                "handler": item.get("handler", existing.get("handler")),
                "status": existing.get("status", "open"),
            })
            updated += 1
            updated_items.append(existing)
        else:
            records.append(item)
            by_key[key] = len(records) - 1
            inserted += 1
            inserted_items.append(item)

    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("queue", records)
    return {
        "inserted": inserted,
        "updated": updated,
        "count": len(records),
        "inserted_items": inserted_items,
        "updated_items": updated_items,
    }


def get_queue_records() -> List[Dict[str, Any]]:
    return load_json_store("queue")


def get_queue_item(item_id: str) -> Dict[str, Any] | None:
    for item in get_queue_records():
        if str(item.get("id")) == str(item_id):
            return item
    return None


def save_queue_records(records: List[Dict[str, Any]]) -> None:
    save_json_store("queue", records)


def update_queue_item(item_id: str, updates: Dict[str, Any]) -> Dict[str, Any] | None:
    records = get_queue_records()
    for index, item in enumerate(records):
        if str(item.get("id")) == str(item_id):
            item.update(updates)
            item["updated_at"] = updates.get("updated_at", item.get("updated_at"))
            records[index] = item
            save_queue_records(records)
            return item
    return None


def transition_queue_item(
    item_id: str,
    *,
    to_status: str,
    actor: str,
    reason: str,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any] | None:
    records = get_queue_records()
    for index, item in enumerate(records):
        if str(item.get("id")) != str(item_id):
            continue
        now = metadata.get("updated_at") if metadata else None
        if not now:
            from datetime import datetime, timezone

            now = datetime.now(timezone.utc).isoformat()
        transitions = item.get("transitions", [])
        transitions.append(
            {
                "from_status": item.get("status", "open"),
                "to_status": to_status,
                "actor": actor,
                "reason": reason,
                "timestamp": now,
            }
        )
        item["status"] = to_status
        item["updated_at"] = now
        item["last_actor"] = actor
        item["last_reason"] = reason
        item["transitions"] = transitions
        if metadata:
            item.update(metadata)
        records[index] = item
        save_queue_records(records)
        return item
    return None


def claim_queue_item(item_id: str, *, actor: str, execution_id: str, reason: str) -> Dict[str, Any] | None:
    item = get_queue_item(item_id)
    if not item or str(item.get("status", "open")).lower() != "open":
        return None
    return transition_queue_item(
        item_id,
        to_status="claimed",
        actor=actor,
        reason=reason,
        metadata={"claimed_by": actor, "execution_id": execution_id},
    )


def append_activity_event(event: Dict[str, Any], *, max_records: int = 1000) -> Dict[str, Any]:
    records = load_json_store("activity")
    records.append(event)
    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("activity", records)
    return event


def append_receipt(record: Dict[str, Any], *, max_records: int = 1000) -> Dict[str, Any]:
    records = load_json_store("receipts")
    records.append(record)
    if len(records) > max_records:
        records = records[-max_records:]
    save_json_store("receipts", records)
    return record


def append_summary_record(record: Dict[str, Any], *, max_records: int = 365) -> Dict[str, Any]:
    records = load_json_store("summaries")
    records.insert(0, record)
    if len(records) > max_records:
        records = records[:max_records]
    save_json_store("summaries", records)
    return record


def write_latest_loop_markdown(content: str) -> str:
    ensure_store()
    path = os.path.join(DATA_DIR, "latest_loop.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)
    return path


def write_latest_survival_markdown(content: str) -> str:
    ensure_store()
    path = os.path.join(DATA_DIR, "latest_survival.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)
    return path


def write_latest_operating_summary_markdown(content: str) -> str:
    ensure_store()
    path = os.path.join(DATA_DIR, "latest_operating_summary.md")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)
    return path
