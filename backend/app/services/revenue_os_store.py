"""MVP JSON file persistence for Revenue OS."""
import json
import os
from typing import Any, List, Optional
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "revenue_os")

_STORES = {
    "commands": "commands.json",
    "receipts": "receipts.json",
    "leads": "leads.json",
    "delivery_receipts": "delivery_receipts.json",
}


def ensure_store():
    os.makedirs(DATA_DIR, exist_ok=True)
    for name in _STORES.values():
        path = os.path.join(DATA_DIR, name)
        if not os.path.exists(path):
            with open(path, "w") as f:
                json.dump([], f)


def load_json_store(name: str) -> List[dict]:
    path = os.path.join(DATA_DIR, _STORES.get(name, f"{name}.json"))
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_json_store(name: str, records: List[dict]):
    path = os.path.join(DATA_DIR, _STORES.get(name, f"{name}.json"))
    ensure_store()
    with open(path, "w") as f:
        json.dump(records, f, indent=2)


def append_record(store: str, record: dict):
    records = load_json_store(store)
    records.append(record)
    save_json_store(store, records)
    return record


def get_record(store: str, record_id: str, id_field: str = "id") -> Optional[dict]:
    records = load_json_store(store)
    for r in records:
        if r.get(id_field) == record_id:
            return r
    return None


def update_record(store: str, record_id: str, updates: dict, id_field: str = "id") -> Optional[dict]:
    records = load_json_store(store)
    for i, r in enumerate(records):
        if r.get(id_field) == record_id:
            records[i].update(updates)
            records[i]["updated_at"] = datetime.now(timezone.utc).isoformat()
            save_json_store(store, records)
            return records[i]
    return None


def list_records(store: str, **filters) -> List[dict]:
    records = load_json_store(store)
    if not filters:
        return records
    result = []
    for r in records:
        match = True
        for k, v in filters.items():
            if r.get(k) != v:
                match = False
                break
        if match:
            result.append(r)
    return result
