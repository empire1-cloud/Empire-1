"""
Team-scoped execution receipt service.

This evolves the original Mongo execution logger into the authoritative
execution receipt path for HIC work while preserving the existing history API
surface.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from database import execution_logs_collection, pipelines_collection, users_collection
from models import ExecutionLogQuery
from services.audit_service import create_audit_log


def _sanitize_for_mongo(data: Any) -> Any:
    """Sanitize data for MongoDB storage (handle non-serializable types)."""
    if data is None:
        return None
    if isinstance(data, dict):
        return {k: _sanitize_for_mongo(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_sanitize_for_mongo(item) for item in data]
    if isinstance(data, (str, int, float, bool)):
        return data
    if isinstance(data, datetime):
        return data.isoformat()
    return str(data)


def build_idempotency_key(
    *,
    team_id: str,
    user_id: str,
    endpoint: Optional[str],
    method: Optional[str],
    input_data: Dict[str, Any],
    provided_key: Optional[str] = None,
) -> str:
    """Build a stable idempotency key when the caller does not provide one."""
    if provided_key:
        return provided_key.strip()

    normalized = json.dumps(_sanitize_for_mongo(input_data), sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(
        f"{team_id}:{user_id}:{method or 'POST'}:{endpoint or ''}:{normalized}".encode("utf-8")
    ).hexdigest()
    return f"auto_{digest}"


async def get_execution_by_idempotency_key(team_id: str, idempotency_key: str) -> Optional[Dict[str, Any]]:
    """Lookup an execution receipt by team + idempotency key."""
    if not idempotency_key:
        return None
    return await execution_logs_collection().find_one({
        "team_id": team_id,
        "idempotency_key": idempotency_key,
    })


async def get_execution_by_execution_id(execution_id: str) -> Optional[Dict[str, Any]]:
    """Lookup an execution receipt by execution ID."""
    return await execution_logs_collection().find_one({"execution_id": execution_id})


async def create_execution_receipt(
    *,
    team_id: str,
    user_id: str,
    engine: str,
    input_data: Dict[str, Any],
    source: str = "api",
    pipeline_id: Optional[str] = None,
    endpoint: Optional[str] = None,
    method: Optional[str] = None,
    execution_id: Optional[str] = None,
    idempotency_key: Optional[str] = None,
    request_type: str = "engine",
    requested_target: Optional[str] = None,
    auth_type: Optional[str] = None,
    api_key_id: Optional[str] = None,
    api_key_name: Optional[str] = None,
    step_statuses: Optional[list[Dict[str, Any]]] = None,
    retry_counts: Optional[Dict[str, int]] = None,
) -> Dict[str, Any]:
    """
    Create the authoritative execution receipt document.

    If idempotency collides, the existing durable record is returned.
    """
    now = datetime.now(timezone.utc)
    execution_id = execution_id or str(uuid.uuid4())
    log_doc = {
        "execution_id": execution_id,
        "team_id": team_id,
        "user_id": user_id,
        "engine": engine,
        "pipeline_id": pipeline_id,
        "request_type": request_type,
        "requested_target": requested_target or engine,
        "input_data": _sanitize_for_mongo(input_data),
        "output_data": None,
        "error_message": None,
        "status": "pending",
        "final_state": "pending",
        "source": source,
        "duration_ms": 0,
        "endpoint": endpoint,
        "method": method,
        "idempotency_key": idempotency_key,
        "auth_type": auth_type,
        "api_key_id": api_key_id,
        "api_key_name": api_key_name,
        "step_statuses": _sanitize_for_mongo(step_statuses or []),
        "retry_counts": _sanitize_for_mongo(retry_counts or {}),
        "receipt_references": {},
        "created_at": now,
        "started_at": now,
        "completed_at": None,
    }

    try:
        result = await execution_logs_collection().insert_one(log_doc)
        log_doc["_id"] = result.inserted_id
        log_doc["_created"] = True
        return log_doc
    except DuplicateKeyError:
        existing = await get_execution_by_idempotency_key(team_id, idempotency_key or "")
        if existing:
            existing["_created"] = False
            return existing
        raise


async def mark_execution_state(
    execution_id: str,
    *,
    status: str,
    final_state: Optional[str] = None,
    output_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    duration_ms: Optional[int] = None,
    step_statuses: Optional[list[Dict[str, Any]]] = None,
    retry_counts: Optional[Dict[str, int]] = None,
    response_status_code: Optional[int] = None,
    receipt_references: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    """Update execution receipt state in place."""
    updates: Dict[str, Any] = {
        "status": status,
        "final_state": final_state or status,
    }
    if output_data is not None:
        updates["output_data"] = _sanitize_for_mongo(output_data)
    if error_message is not None:
        updates["error_message"] = error_message
    if duration_ms is not None:
        updates["duration_ms"] = duration_ms
    if step_statuses is not None:
        updates["step_statuses"] = _sanitize_for_mongo(step_statuses)
    if retry_counts is not None:
        updates["retry_counts"] = _sanitize_for_mongo(retry_counts)
    if response_status_code is not None:
        updates["receipt_references.response_status_code"] = response_status_code
    if receipt_references is not None:
        updates["receipt_references"] = _sanitize_for_mongo(receipt_references)
    if status in {"success", "error", "cancelled", "replayed"}:
        updates["completed_at"] = datetime.now(timezone.utc)

    await execution_logs_collection().update_one(
        {"execution_id": execution_id},
        {"$set": updates},
    )
    return await get_execution_by_execution_id(execution_id)


async def finalize_execution_receipt(
    execution_id: str,
    *,
    team_id: str,
    user_id: str,
    engine: str,
    status: str,
    duration_ms: int,
    output_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    step_statuses: Optional[list[Dict[str, Any]]] = None,
    retry_counts: Optional[Dict[str, int]] = None,
    response_status_code: Optional[int] = None,
) -> Optional[Dict[str, Any]]:
    """Finalize execution receipt and attach audit-log references."""
    audit_log_id = await create_audit_log(
        user_id=user_id,
        team_id=team_id,
        action="engine.execute",
        resource_type="engine",
        resource_id=engine,
        details={
            "engine": engine,
            "status": status,
            "duration_ms": duration_ms,
        },
    )

    receipt = await mark_execution_state(
        execution_id,
        status=status,
        final_state=status,
        output_data=output_data,
        error_message=error_message,
        duration_ms=duration_ms,
        step_statuses=step_statuses,
        retry_counts=retry_counts,
        response_status_code=response_status_code,
    )
    await execution_logs_collection().update_one(
        {"execution_id": execution_id},
        {
            "$set": {
                "receipt_references.audit_log_id": audit_log_id,
            }
        },
    )
    return await get_execution_by_execution_id(execution_id)


async def log_execution(
    team_id: str,
    user_id: str,
    engine: str,
    input_data: Dict[str, Any],
    output_data: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    duration_ms: int = 0,
    source: str = "direct",
    pipeline_id: Optional[str] = None,
    endpoint: Optional[str] = None,
    method: Optional[str] = None,
) -> str:
    """
    Compatibility wrapper for legacy callers.
    Creates one authoritative Mongo receipt and finalizes it immediately.
    """
    receipt = await create_execution_receipt(
        team_id=team_id,
        user_id=user_id,
        engine=engine,
        input_data=input_data,
        source=source,
        pipeline_id=pipeline_id,
        endpoint=endpoint,
        method=method,
        requested_target=engine,
        request_type="pipeline" if pipeline_id else "engine",
    )
    await finalize_execution_receipt(
        receipt["execution_id"],
        team_id=team_id,
        user_id=user_id,
        engine=engine,
        status="success" if error_message is None else "error",
        duration_ms=duration_ms,
        output_data=output_data,
        error_message=error_message,
        response_status_code=200 if error_message is None else 500,
    )
    return str(receipt["_id"])


def _summarize_data(data: Any, max_length: int = 100) -> Optional[str]:
    """Create a brief summary of data for display."""
    if data is None:
        return None

    if isinstance(data, dict):
        keys = list(data.keys())[:3]
        summary = ", ".join(f"{k}: ..." for k in keys)
        if len(data) > 3:
            summary += f" (+{len(data) - 3} more)"
        return summary

    if isinstance(data, str):
        if len(data) > max_length:
            return data[:max_length] + "..."
        return data

    return str(data)[:max_length]


async def get_team_execution_logs(team_id: str, query: ExecutionLogQuery) -> Dict[str, Any]:
    """Get execution logs for a team with filtering and pagination."""
    filter_query = {"team_id": team_id}

    if query.engine:
        filter_query["engine"] = {"$regex": query.engine, "$options": "i"}
    if query.pipeline_id:
        filter_query["pipeline_id"] = query.pipeline_id
    if query.status:
        filter_query["status"] = query.status
    if query.source:
        filter_query["source"] = query.source
    if query.start_date:
        filter_query["created_at"] = {"$gte": query.start_date}
    if query.end_date:
        if "created_at" in filter_query:
            filter_query["created_at"]["$lte"] = query.end_date
        else:
            filter_query["created_at"] = {"$lte": query.end_date}

    total = await execution_logs_collection().count_documents(filter_query)
    cursor = execution_logs_collection().find(filter_query).sort("created_at", -1).skip(query.offset).limit(query.limit)
    logs = await cursor.to_list(length=query.limit)

    result = []
    for log in logs:
        response = {
            "id": str(log["_id"]),
            "team_id": log["team_id"],
            "user_id": log["user_id"],
            "engine": log["engine"],
            "execution_id": log.get("execution_id"),
            "idempotency_key": log.get("idempotency_key"),
            "pipeline_id": log.get("pipeline_id"),
            "request_type": log.get("request_type", "engine"),
            "requested_target": log.get("requested_target"),
            "input_summary": _summarize_data(log.get("input_data")),
            "output_summary": _summarize_data(log.get("output_data")),
            "error_message": log.get("error_message"),
            "status": log["status"],
            "final_state": log.get("final_state", log["status"]),
            "source": log.get("source", "direct"),
            "duration_ms": log.get("duration_ms", 0),
            "endpoint": log.get("endpoint"),
            "method": log.get("method"),
            "auth_type": log.get("auth_type"),
            "api_key_id": log.get("api_key_id"),
            "api_key_name": log.get("api_key_name"),
            "step_statuses": log.get("step_statuses", []),
            "retry_counts": log.get("retry_counts", {}),
            "receipt_references": log.get("receipt_references", {}),
            "created_at": log["created_at"].isoformat() if isinstance(log["created_at"], datetime) else log["created_at"],
            "started_at": log["started_at"].isoformat() if log.get("started_at") and isinstance(log["started_at"], datetime) else log.get("started_at"),
            "completed_at": log["completed_at"].isoformat() if log.get("completed_at") and isinstance(log["completed_at"], datetime) else log.get("completed_at"),
        }

        if log["user_id"]:
            user = await users_collection().find_one({"_id": ObjectId(log["user_id"])}, {"email": 1})
            if user:
                response["user_email"] = user["email"]

        if log.get("pipeline_id"):
            pipeline = await pipelines_collection().find_one({"_id": ObjectId(log["pipeline_id"])}, {"name": 1})
            if pipeline:
                response["pipeline_name"] = pipeline["name"]

        result.append(response)

    return {
        "logs": result,
        "total": total,
        "limit": query.limit,
        "offset": query.offset,
    }


async def get_team_execution_stats(team_id: str) -> Dict[str, Any]:
    """Get execution statistics for a team."""
    total = await execution_logs_collection().count_documents({"team_id": team_id})
    success = await execution_logs_collection().count_documents({"team_id": team_id, "status": "success"})
    errors = await execution_logs_collection().count_documents({"team_id": team_id, "status": "error"})

    if total == 0:
        return {
            "total_executions": 0,
            "success_count": 0,
            "error_count": 0,
            "success_rate": 0,
            "avg_duration_ms": 0,
            "engines": {},
        }

    pipeline = [
        {"$match": {"team_id": team_id}},
        {"$group": {"_id": None, "avg_duration": {"$avg": "$duration_ms"}}},
    ]
    avg_result = await execution_logs_collection().aggregate(pipeline).to_list(1)
    avg_duration = avg_result[0]["avg_duration"] if avg_result else 0

    engine_pipeline = [
        {"$match": {"team_id": team_id}},
        {"$group": {"_id": "$engine", "count": {"$sum": 1}}},
    ]
    engine_result = await execution_logs_collection().aggregate(engine_pipeline).to_list(100)
    engines = {r["_id"]: r["count"] for r in engine_result if r["_id"]}

    return {
        "total_executions": total,
        "success_count": success,
        "error_count": errors,
        "success_rate": round(success / total * 100, 1),
        "avg_duration_ms": round(avg_duration or 0, 0),
        "engines": engines,
    }


async def get_execution_log_detail(team_id: str, log_id: str) -> Optional[Dict[str, Any]]:
    """Get full details of a single execution log."""
    if not ObjectId.is_valid(log_id):
        return None

    log = await execution_logs_collection().find_one({
        "_id": ObjectId(log_id),
        "team_id": team_id,
    })
    if not log:
        return None

    result = {
        "id": str(log["_id"]),
        "team_id": log["team_id"],
        "user_id": log["user_id"],
        "engine": log["engine"],
        "execution_id": log.get("execution_id"),
        "idempotency_key": log.get("idempotency_key"),
        "pipeline_id": log.get("pipeline_id"),
        "request_type": log.get("request_type", "engine"),
        "requested_target": log.get("requested_target"),
        "input_data": log.get("input_data"),
        "output_data": log.get("output_data"),
        "error_message": log.get("error_message"),
        "status": log["status"],
        "final_state": log.get("final_state", log["status"]),
        "source": log.get("source", "direct"),
        "duration_ms": log.get("duration_ms", 0),
        "endpoint": log.get("endpoint"),
        "method": log.get("method"),
        "auth_type": log.get("auth_type"),
        "api_key_id": log.get("api_key_id"),
        "api_key_name": log.get("api_key_name"),
        "step_statuses": log.get("step_statuses", []),
        "retry_counts": log.get("retry_counts", {}),
        "receipt_references": log.get("receipt_references", {}),
        "created_at": log["created_at"].isoformat() if isinstance(log["created_at"], datetime) else log["created_at"],
        "started_at": log["started_at"].isoformat() if log.get("started_at") and isinstance(log["started_at"], datetime) else log.get("started_at"),
        "completed_at": log["completed_at"].isoformat() if log.get("completed_at") and isinstance(log["completed_at"], datetime) else log.get("completed_at"),
    }

    if log["user_id"]:
        user = await users_collection().find_one(
            {"_id": ObjectId(log["user_id"])},
            {"email": 1, "first_name": 1, "last_name": 1},
        )
        if user:
            result["user_email"] = user["email"]
            result["user_name"] = f"{user['first_name']} {user['last_name']}"

    return result
