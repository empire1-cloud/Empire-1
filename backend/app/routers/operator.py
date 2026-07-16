"""Empire Operator — governed multi-worker execution queue with receipts."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal, Optional
import uuid

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from pymongo import ReturnDocument

from database import get_database

router = APIRouter(prefix="/operator", tags=["Empire Operator"])

TaskStatus = Literal["queued", "claimed", "approval_required", "completed", "failed", "blocked"]
RiskLevel = Literal["safe", "approval_required", "forbidden"]

FORBIDDEN_ACTIONS = {
    "admin:shutdown",
    "delete_repository",
    "force_push_protected_branch",
    "read_plaintext_secrets",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    universe: str = Field(min_length=1, max_length=80)
    repository: str = Field(min_length=1, max_length=200)
    action: str = Field(min_length=3, max_length=2000)
    action_type: str = Field(min_length=2, max_length=100)
    priority: int = Field(default=50, ge=0, le=100)
    risk: RiskLevel = "safe"
    metadata: dict[str, Any] = Field(default_factory=dict)


class ClaimRequest(BaseModel):
    worker_id: str = Field(min_length=2, max_length=100)
    capabilities: list[str] = Field(default_factory=list)


class CompletionRequest(BaseModel):
    success: bool
    summary: str = Field(min_length=2, max_length=4000)
    evidence_label: Literal[
        "VERIFIED",
        "NOT_VERIFIED_IN_CONNECTED_SOURCES",
        "NOT_CHECKED",
        "PENDING_FOUNDER_CONFIRMATION",
        "APPROVAL_REQUIRED",
    ]
    evidence: dict[str, Any] = Field(default_factory=dict)


class ApprovalDecision(BaseModel):
    approved: bool
    decided_by: str = Field(min_length=2, max_length=100)
    note: Optional[str] = Field(default=None, max_length=2000)


@router.get("/health")
async def operator_health():
    db = get_database()
    counts = {}
    for status in ["queued", "claimed", "approval_required", "completed", "failed", "blocked"]:
        counts[status] = await db.operator_tasks.count_documents({"status": status})
    return {"success": True, "service": "empire-operator", "queue": counts}


@router.get("/tasks")
async def list_tasks(status: Optional[TaskStatus] = None, limit: int = Query(default=100, ge=1, le=500)):
    db = get_database()
    query = {"status": status} if status else {}
    tasks = await db.operator_tasks.find(query, {"_id": 0}).sort(
        [("priority", -1), ("created_at", 1)]
    ).to_list(limit)
    return {"success": True, "tasks": tasks}


@router.post("/tasks", status_code=201)
async def create_task(task: TaskCreate):
    db = get_database()
    created_at = now_iso()
    risk = task.risk
    if task.action_type in FORBIDDEN_ACTIONS:
        risk = "forbidden"
    status: TaskStatus = "blocked" if risk == "forbidden" else (
        "approval_required" if risk == "approval_required" else "queued"
    )
    document = {
        "id": str(uuid.uuid4()),
        **task.model_dump(),
        "risk": risk,
        "status": status,
        "worker_id": None,
        "created_at": created_at,
        "updated_at": created_at,
        "claimed_at": None,
        "completed_at": None,
        "receipts": [],
    }
    await db.operator_tasks.insert_one(document)
    document.pop("_id", None)
    return {"success": True, "task": document}


@router.post("/workers/claim")
async def claim_next_task(request: ClaimRequest):
    """Atomically claim one safe task so workers can operate concurrently without collisions."""
    db = get_database()
    capability_filter: dict[str, Any] = {}
    if request.capabilities:
        capability_filter = {
            "$or": [
                {"metadata.required_capability": {"$exists": False}},
                {"metadata.required_capability": {"$in": request.capabilities}},
            ]
        }
    query: dict[str, Any] = {"status": "queued", "risk": "safe"}
    query.update(capability_filter)
    claimed_at = now_iso()
    task = await db.operator_tasks.find_one_and_update(
        query,
        {
            "$set": {
                "status": "claimed",
                "worker_id": request.worker_id,
                "claimed_at": claimed_at,
                "updated_at": claimed_at,
            }
        },
        sort=[("priority", -1), ("created_at", 1)],
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    return {"success": True, "task": task}


@router.post("/tasks/{task_id}/approval")
async def decide_approval(task_id: str, decision: ApprovalDecision):
    db = get_database()
    task = await db.operator_tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] != "approval_required":
        raise HTTPException(status_code=409, detail="Task is not awaiting approval")
    new_status: TaskStatus = "queued" if decision.approved else "blocked"
    receipt = {
        "type": "approval_decision",
        "approved": decision.approved,
        "decided_by": decision.decided_by,
        "note": decision.note,
        "timestamp": now_iso(),
    }
    updated = await db.operator_tasks.find_one_and_update(
        {"id": task_id, "status": "approval_required"},
        {
            "$set": {"status": new_status, "risk": "safe" if decision.approved else "forbidden", "updated_at": now_iso()},
            "$push": {"receipts": receipt},
        },
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    return {"success": True, "task": updated}


@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, result: CompletionRequest):
    db = get_database()
    completed_at = now_iso()
    receipt = {
        "id": str(uuid.uuid4()),
        "type": "execution_receipt",
        "success": result.success,
        "summary": result.summary,
        "evidence_label": result.evidence_label,
        "evidence": result.evidence,
        "timestamp": completed_at,
    }
    updated = await db.operator_tasks.find_one_and_update(
        {"id": task_id, "status": "claimed"},
        {
            "$set": {
                "status": "completed" if result.success else "failed",
                "completed_at": completed_at,
                "updated_at": completed_at,
            },
            "$push": {"receipts": receipt},
        },
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    if not updated:
        raise HTTPException(status_code=409, detail="Only a claimed task can be completed")
    return {"success": True, "task": updated}


@router.post("/tasks/{task_id}/release")
async def release_claim(task_id: str, worker_id: str):
    db = get_database()
    updated = await db.operator_tasks.find_one_and_update(
        {"id": task_id, "status": "claimed", "worker_id": worker_id},
        {
            "$set": {
                "status": "queued",
                "worker_id": None,
                "claimed_at": None,
                "updated_at": now_iso(),
            }
        },
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    if not updated:
        raise HTTPException(status_code=409, detail="Claim does not belong to this worker")
    return {"success": True, "task": updated}
