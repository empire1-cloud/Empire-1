from __future__ import annotations

import asyncio
from collections import Counter
from datetime import datetime, timezone
import json
import os
import time
from typing import Any, Dict, List, Optional
import uuid

from app.services.empire_gtm_layer import generate_weekly_gtm_update, load_gtm_context
from app.services.omni_service import load_state, normalize_universe, recent_runs, summary_metrics, task_list
from app.services.revenue_os_store import load_json_store
from app.services.system_health import system_health_service
from app.services.empire_os_cofounder import state as cofounder_state
from app.services.empire_os_cofounder.state import (
    append_audit_record,
    append_activity_event,
    append_brief_record,
    append_cycle_record,
    append_receipt,
    append_summary_record,
    claim_queue_item,
    ensure_store,
    get_queue_item,
    get_queue_records,
    load_json_store as load_cofounder_store,
    transition_queue_item,
    update_queue_item,
    upsert_queue_items,
    write_latest_brief_markdown,
    write_latest_loop_markdown,
    write_latest_operating_summary_markdown,
    write_latest_survival_markdown,
)


class EmpireOSCoFounderService:
    """Read-only co-founder routines for briefs and daily goals."""

    def __init__(self, universe: str = "empire"):
        self.universe = normalize_universe(universe)
        ensure_store()

    async def get_brief(self) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        risks = self._derive_risks(snapshot)
        next_action = self._pick_next_action(snapshot, risks)

        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "summary": self._build_summary(snapshot, risks, next_action),
            "snapshot": snapshot,
            "risks": risks,
            "next_action": next_action,
        }
        markdown = self._render_brief_markdown(payload)
        markdown_path = write_latest_brief_markdown(markdown)
        payload["artifact"] = {
            "type": "markdown",
            "path": markdown_path,
            "preview": markdown.splitlines()[:8],
        }
        append_brief_record({
            "generated_at": payload["generated_at"],
            "universe": self.universe,
            "summary": payload["summary"],
            "next_action": next_action,
            "risk_count": len(risks),
            "markdown_path": markdown_path,
        })
        self._record_audit("brief", payload, action_count=0)
        return payload

    async def get_goals(self) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        risks = self._derive_risks(snapshot)
        goals = self._derive_goals(snapshot, risks)

        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "goal_count": len(goals),
            "goals": goals,
        }
        self._record_audit("goals", payload, action_count=0)
        return payload

    async def get_watchdog(self) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        alerts = self._derive_alerts(snapshot)
        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "alert_count": len(alerts),
            "alerts": alerts,
            "healthy": not any(alert["severity"] in {"high", "critical"} for alert in alerts),
        }
        self._record_audit("watchdog", payload, action_count=0)
        return payload

    async def get_audit(self, limit: int = 50) -> Dict[str, Any]:
        records = load_cofounder_store("audit")
        selected = records[-max(1, min(limit, 500)) :]
        return {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "count": len(selected),
            "entries": list(reversed(selected)),
        }

    async def get_latest_brief(self) -> Dict[str, Any]:
        briefs = load_cofounder_store("briefs")
        latest = briefs[-1] if briefs else None
        return {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "latest": latest,
        }

    async def get_queue(self, limit: int = 50, status: Optional[str] = None) -> Dict[str, Any]:
        queue = get_queue_records()
        if status:
            queue = [item for item in queue if str(item.get("status", "")).lower() == status.lower()]
        queue = sorted(
            queue,
            key=lambda item: (
                self._priority_rank(str(item.get("priority", "medium"))),
                item.get("updated_at", ""),
            ),
        )
        selected = queue[: max(1, min(limit, 500))]
        return {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "count": len(selected),
            "items": selected,
        }

    async def get_activity(self, limit: int = 100) -> Dict[str, Any]:
        records = load_cofounder_store("activity")
        selected = records[-max(1, min(limit, 1000)) :]
        return {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "count": len(selected),
            "events": list(reversed(selected)),
        }

    async def run_queue_item(self, item_id: str, actor: str = "cofounder") -> Dict[str, Any]:
        queue_item = get_queue_item(item_id)
        if not queue_item:
            return {
                "status": "error",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "error": f"Queue item {item_id} was not found.",
            }

        if str(queue_item.get("status", "open")).lower() != "open":
            return {
                "status": "error",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "error": f"Queue item {item_id} is not open.",
                "queue_item": queue_item,
            }

        handler = str(queue_item.get("handler") or "").strip()
        policy_class = self._policy_classify(queue_item)
        execution_id = f"EX-{uuid.uuid4().hex[:10].upper()}"
        started_at = self._utc_now()
        receipt = {
            "execution_id": execution_id,
            "queue_item_id": item_id,
            "handler": handler or None,
            "policy_class": policy_class,
            "started_at": started_at,
            "completed_at": None,
            "inputs_used": {
                "title": queue_item.get("title"),
                "type": queue_item.get("type"),
                "priority": queue_item.get("priority"),
                "reason": queue_item.get("reason"),
                "suggested_step": queue_item.get("suggested_step"),
            },
            "action_taken": None,
            "files_or_records_changed": [],
            "verification": None,
            "final_status": None,
            "error": None,
            "approval_required": policy_class == "approval_required",
        }

        if policy_class == "approval_required":
            item = transition_queue_item(
                item_id,
                to_status="approval_required",
                actor=actor,
                reason="Execution halted because this item requires human approval.",
                metadata={"execution_id": execution_id},
            )
            event = self._activity_event(
                "approval_requested",
                queue_item=item or queue_item,
                execution_id=execution_id,
                actor=actor,
                policy_class=policy_class,
                detail="Queue item requires human approval before any external-facing action.",
            )
            append_activity_event(event)
            receipt["completed_at"] = self._utc_now()
            receipt["action_taken"] = "Execution refused pending approval."
            receipt["verification"] = {"status": "not_run", "reason": "approval_required"}
            receipt["final_status"] = "approval_required"
            append_receipt(receipt)
            self._record_audit("run_queue_item", {"summary": "approval_required", "queue_item": item or queue_item}, action_count=0)
            return {
                "status": "ok",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "queue_item": item or queue_item,
                "receipt": receipt,
            }

        if policy_class == "forbidden":
            item = transition_queue_item(
                item_id,
                to_status="failed",
                actor=actor,
                reason="Execution refused because the handler is not registered or policy forbids it.",
                metadata={"execution_id": execution_id},
            )
            event = self._activity_event(
                "execution_failed",
                queue_item=item or queue_item,
                execution_id=execution_id,
                actor=actor,
                policy_class=policy_class,
                detail="Queue item references an unknown or forbidden handler.",
            )
            append_activity_event(event)
            receipt["completed_at"] = self._utc_now()
            receipt["action_taken"] = "Execution refused because the handler is not registered."
            receipt["verification"] = {"status": "not_run", "reason": "forbidden"}
            receipt["final_status"] = "failed"
            receipt["error"] = "Unknown or forbidden handler."
            append_receipt(receipt)
            self._record_audit("run_queue_item", {"summary": "execution_failed", "queue_item": item or queue_item}, action_count=0)
            return {
                "status": "ok",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "queue_item": item or queue_item,
                "receipt": receipt,
            }

        claimed = claim_queue_item(
            item_id,
            actor=actor,
            execution_id=execution_id,
            reason="Claimed for safe co-founder execution.",
        )
        if not claimed:
            return {
                "status": "error",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "error": f"Queue item {item_id} could not be claimed.",
            }

        append_activity_event(
            self._activity_event(
                "queue_item_claimed",
                queue_item=claimed,
                execution_id=execution_id,
                actor=actor,
                policy_class=policy_class,
                detail="Queue item claimed for execution.",
            )
        )

        in_progress = transition_queue_item(
            item_id,
            to_status="in_progress",
            actor=actor,
            reason="Starting registered handler execution.",
            metadata={"execution_id": execution_id},
        ) or claimed
        append_activity_event(
            self._activity_event(
                "execution_started",
                queue_item=in_progress,
                execution_id=execution_id,
                actor=actor,
                policy_class=policy_class,
                detail=f"Running handler {handler}.",
            )
        )

        registry = self._action_registry()
        entry = registry[handler]
        try:
            execution_result = await entry["run"](in_progress, execution_id)
            verifying_item = transition_queue_item(
                item_id,
                to_status="verifying",
                actor=actor,
                reason="Handler finished; verification started.",
                metadata={"execution_id": execution_id},
            ) or in_progress
            append_activity_event(
                self._activity_event(
                    "verification_started",
                    queue_item=verifying_item,
                    execution_id=execution_id,
                    actor=actor,
                    policy_class=policy_class,
                    detail=f"Verifying handler {handler} output.",
                )
            )
            verification = await entry["verify"](verifying_item, execution_result, execution_id)
            receipt["action_taken"] = execution_result.get("action_taken")
            receipt["files_or_records_changed"] = execution_result.get("files_or_records_changed", [])
            receipt["verification"] = verification

            if verification.get("ok"):
                completed = transition_queue_item(
                    item_id,
                    to_status="done",
                    actor=actor,
                    reason="Handler output verified successfully.",
                    metadata={
                        "execution_id": execution_id,
                        "last_receipt_id": execution_id,
                        "last_result": execution_result.get("summary"),
                    },
                ) or verifying_item
                append_activity_event(
                    self._activity_event(
                        "execution_completed",
                        queue_item=completed,
                        execution_id=execution_id,
                        actor=actor,
                        policy_class=policy_class,
                        detail=f"Handler {handler} completed successfully.",
                    )
                )
                receipt["completed_at"] = self._utc_now()
                receipt["final_status"] = "done"
                append_receipt(receipt)
                self._record_audit("run_queue_item", {"summary": "execution_completed", "queue_item": completed}, action_count=1)
                return {
                    "status": "ok",
                    "module": "empire_os_cofounder",
                    "universe": self.universe,
                    "generated_at": self._utc_now(),
                    "queue_item": completed,
                    "receipt": receipt,
                }

            failed = transition_queue_item(
                item_id,
                to_status="failed",
                actor=actor,
                reason="Verification failed after handler execution.",
                metadata={"execution_id": execution_id},
            ) or verifying_item
            append_activity_event(
                self._activity_event(
                    "execution_failed",
                    queue_item=failed,
                    execution_id=execution_id,
                    actor=actor,
                    policy_class=policy_class,
                    detail=f"Handler {handler} failed verification.",
                )
            )
            receipt["completed_at"] = self._utc_now()
            receipt["final_status"] = "failed"
            receipt["error"] = verification.get("error") or "Verification failed."
            append_receipt(receipt)
            self._record_audit("run_queue_item", {"summary": "execution_failed", "queue_item": failed}, action_count=1)
            return {
                "status": "ok",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "queue_item": failed,
                "receipt": receipt,
            }
        except Exception as exc:
            failed = transition_queue_item(
                item_id,
                to_status="failed",
                actor=actor,
                reason="Handler raised an exception.",
                metadata={"execution_id": execution_id},
            ) or in_progress
            append_activity_event(
                self._activity_event(
                    "execution_failed",
                    queue_item=failed,
                    execution_id=execution_id,
                    actor=actor,
                    policy_class=policy_class,
                    detail=str(exc),
                )
            )
            receipt["completed_at"] = self._utc_now()
            receipt["final_status"] = "failed"
            receipt["error"] = str(exc)
            receipt["action_taken"] = "Handler raised an exception."
            receipt["verification"] = {"ok": False, "status": "exception"}
            append_receipt(receipt)
            self._record_audit("run_queue_item", {"summary": "execution_failed", "queue_item": failed}, action_count=1)
            return {
                "status": "ok",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "queue_item": failed,
                "receipt": receipt,
            }

    async def run_next_safe(self, actor: str = "cofounder") -> Dict[str, Any]:
        queue = sorted(
            [item for item in get_queue_records() if str(item.get("status", "open")).lower() == "open"],
            key=lambda item: (
                self._priority_rank(str(item.get("priority", "medium"))),
                item.get("updated_at", ""),
            ),
        )
        next_item = self._select_next_safe_item(queue)
        if not next_item:
            return {
                "status": "ok",
                "module": "empire_os_cofounder",
                "universe": self.universe,
                "generated_at": self._utc_now(),
                "message": "No eligible safe queue item is available.",
                "eligible_count": 0,
            }
        result = await self.run_queue_item(str(next_item.get("id")), actor=actor)
        result["selected_item_id"] = next_item.get("id")
        return result

    async def run_autonomous_cycle(
        self,
        *,
        max_actions_per_cycle: int = 3,
        max_cycle_seconds: int = 20,
        cooldown_seconds: float = 0.1,
        max_retries_per_item: int = 1,
        stuck_age_seconds: int = 300,
        actor: str = "cofounder",
        refresh_planning: bool = True,
    ) -> Dict[str, Any]:
        cycle_id = f"AUTO-{uuid.uuid4().hex[:8].upper()}"
        started_at = self._utc_now()
        started_monotonic = time.monotonic()
        summary = {
            "cycle_id": cycle_id,
            "actions_attempted": 0,
            "actions_completed": 0,
            "actions_failed": 0,
            "items_blocked": 0,
            "approvals_required": 0,
            "sources_unavailable": [],
            "highest_remaining_priority": None,
            "next_recommended_founder_decision": None,
            "stop_reason": None,
            "receipts": [],
            "blocked_item_ids": [],
        }

        append_activity_event({
            "event_type": "cycle_started",
            "timestamp": started_at,
            "universe": self.universe,
            "cycle_id": cycle_id,
            "mode": "autonomous_safe",
            "detail": "Autonomous safe cycle started.",
        })

        blocked_items = self._block_stuck_items(actor=actor, cycle_id=cycle_id, age_threshold_seconds=stuck_age_seconds)
        summary["items_blocked"] = len(blocked_items)
        summary["blocked_item_ids"] = [item["id"] for item in blocked_items]

        current_snapshot = await self._build_snapshot()
        summary["sources_unavailable"] = self._sources_unavailable(current_snapshot)

        planning_payload = None
        if refresh_planning:
            planning_payload = await self.run_loop()
        else:
            await self.get_brief()

        consecutive_failures = 0
        stop_reason = "no_eligible_safe_work"

        while True:
            elapsed = time.monotonic() - started_monotonic
            if summary["actions_attempted"] >= max_actions_per_cycle:
                stop_reason = "action_limit_reached"
                break
            if elapsed >= max_cycle_seconds:
                stop_reason = "cycle_time_limit_reached"
                break

            open_queue = self._sorted_open_queue()
            if not open_queue:
                stop_reason = "no_eligible_safe_work"
                break

            next_item = open_queue[0]
            policy_class = self._policy_classify(next_item)
            summary["highest_remaining_priority"] = next_item.get("priority")

            if policy_class == "approval_required":
                result = await self.run_queue_item(str(next_item["id"]), actor=actor)
                summary["actions_attempted"] += 1
                summary["approvals_required"] += 1
                summary["receipts"].append(result.get("receipt"))
                stop_reason = "approval_required"
                break

            if policy_class == "forbidden":
                result = await self.run_queue_item(str(next_item["id"]), actor=actor)
                summary["actions_attempted"] += 1
                summary["actions_failed"] += 1
                summary["receipts"].append(result.get("receipt"))
                stop_reason = "forbidden_item_encountered"
                break

            retry_count = 0
            final_result: Dict[str, Any] | None = None
            while True:
                summary["actions_attempted"] += 1
                final_result = await self.run_queue_item(str(next_item["id"]), actor=actor)
                receipt = final_result.get("receipt", {})
                if receipt:
                    summary["receipts"].append(receipt)

                if receipt.get("final_status") == "done":
                    summary["actions_completed"] += 1
                    consecutive_failures = 0
                    break

                if receipt.get("final_status") == "approval_required":
                    summary["approvals_required"] += 1
                    stop_reason = "approval_required"
                    break

                summary["actions_failed"] += 1
                consecutive_failures += 1
                if (
                    retry_count < max_retries_per_item
                    and self._should_retry_receipt(receipt)
                ):
                    retry_count += 1
                    self._requeue_for_retry(str(next_item["id"]), actor=actor, retry_count=retry_count)
                    if cooldown_seconds > 0:
                        await asyncio.sleep(cooldown_seconds)
                    continue
                break

            if not final_result:
                stop_reason = "execution_failed"
                break

            final_status = final_result.get("receipt", {}).get("final_status")
            if final_status == "approval_required":
                stop_reason = "approval_required"
                break
            if policy_class == "forbidden":
                stop_reason = "forbidden_item_encountered"
                break
            if consecutive_failures >= max(1, max_retries_per_item + 1):
                stop_reason = "repeated_verification_failures"
                break

            if cooldown_seconds > 0:
                await asyncio.sleep(cooldown_seconds)

        remaining = self._sorted_open_queue()
        summary["highest_remaining_priority"] = remaining[0]["priority"] if remaining else None
        summary["stop_reason"] = stop_reason
        final_brief = await self.get_brief()
        summary["next_recommended_founder_decision"] = final_brief.get("next_action", {}).get("suggested_step")
        completed_at = self._utc_now()
        summary_record = {
            **summary,
            "generated_at": completed_at,
            "universe": self.universe,
            "planning_cycle_id": planning_payload.get("cycle_id") if planning_payload else None,
        }
        summary_markdown = self._render_operating_summary_markdown(summary_record)
        summary_path = write_latest_operating_summary_markdown(summary_markdown)
        append_summary_record({
            **summary_record,
            "artifact_path": summary_path,
        })
        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": completed_at,
            "cycle_id": cycle_id,
            "mode": "autonomous_safe",
            "summary": summary_record,
            "artifact": {"type": "markdown", "path": summary_path},
        }
        self._record_audit(
            "run_autonomous_cycle",
            {"summary": f"Autonomous cycle stopped because {stop_reason}.", **payload},
            action_count=summary["actions_attempted"],
        )
        return payload

    async def run_loop(self) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        risks = self._derive_risks(snapshot)
        alerts = self._derive_alerts(snapshot)
        goals = self._derive_goals(snapshot, risks)
        next_action = self._pick_next_action(snapshot, risks)
        cycle_id = f"COF-{uuid.uuid4().hex[:8].upper()}"
        cycle_started_at = self._utc_now()

        strategy_agent = self._strategy_agent(snapshot, risks, goals, next_action)
        marketing_agent = self._marketing_agent(snapshot)
        ops_agent = self._ops_agent(snapshot, alerts)

        queue_items = strategy_agent["queue_items"] + marketing_agent["queue_items"] + ops_agent["queue_items"]
        queue_result = upsert_queue_items(queue_items)
        append_activity_event({
            "event_type": "cycle_started",
            "timestamp": cycle_started_at,
            "universe": self.universe,
            "cycle_id": cycle_id,
            "mode": "read_only_planning",
            "detail": "Co-founder planning cycle started.",
        })
        for item in queue_result.get("inserted_items", []):
            append_activity_event(
                self._activity_event(
                    "queue_item_created",
                    queue_item=item,
                    cycle_id=cycle_id,
                    actor="cofounder",
                    policy_class=self._policy_classify(item),
                    detail="Queue item created during co-founder planning cycle.",
                )
            )
        loop_markdown = self._render_loop_markdown(
            cycle_id=cycle_id,
            strategy_agent=strategy_agent,
            marketing_agent=marketing_agent,
            ops_agent=ops_agent,
            queue_items=queue_items,
        )
        markdown_path = write_latest_loop_markdown(loop_markdown)

        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "cycle_id": cycle_id,
            "mode": "read_only_planning",
            "strategy_agent": strategy_agent["payload"],
            "marketing_agent": marketing_agent["payload"],
            "ops_agent": ops_agent["payload"],
            "queue_result": queue_result,
            "artifact": {
                "type": "markdown",
                "path": markdown_path,
            },
        }
        append_cycle_record({
            "cycle_id": cycle_id,
            "generated_at": payload["generated_at"],
            "universe": self.universe,
            "queue_result": queue_result,
            "artifact_path": markdown_path,
            "top_mission": strategy_agent["payload"]["mission"],
        })
        self._record_audit("run_loop", payload, action_count=len(queue_items))
        return payload

    async def run_survival_loop(self) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        brief = await self.get_brief()
        offer = self._survival_offer(snapshot)
        outreach = self._survival_outreach(offer)
        queue_items = self._survival_queue(offer)
        queue_result = upsert_queue_items(queue_items)
        cycle_id = f"SURV-{uuid.uuid4().hex[:8].upper()}"
        append_activity_event({
            "event_type": "cycle_started",
            "timestamp": self._utc_now(),
            "universe": self.universe,
            "cycle_id": cycle_id,
            "mode": "survival_revenue",
            "detail": "Emergency survival revenue loop started.",
        })
        for item in queue_result.get("inserted_items", []):
            append_activity_event(
                self._activity_event(
                    "queue_item_created",
                    queue_item=item,
                    cycle_id=cycle_id,
                    actor="cofounder",
                    policy_class=self._policy_classify(item),
                    detail="Queue item created during survival revenue planning.",
                )
            )

        artifact = self._render_survival_markdown(
            brief=brief,
            offer=offer,
            outreach=outreach,
            queue_items=queue_items,
        )
        artifact_path = write_latest_survival_markdown(artifact)

        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "mode": "survival_revenue",
            "cash_mission": offer["mission"],
            "offer": offer,
            "outreach": outreach,
            "queue_result": queue_result,
            "queue_preview": queue_items[:5],
            "artifact": {
                "type": "markdown",
                "path": artifact_path,
            },
        }
        append_cycle_record({
            "cycle_id": cycle_id,
            "generated_at": payload["generated_at"],
            "universe": self.universe,
            "queue_result": queue_result,
            "artifact_path": artifact_path,
            "top_mission": offer["mission"],
            "mode": "survival_revenue",
        })
        self._record_audit("run_survival_loop", payload, action_count=len(queue_items))
        return payload

    async def run_safe_loop(self) -> Dict[str, Any]:
        brief = await self.get_brief()
        goals = await self.get_goals()
        watchdog = await self.get_watchdog()

        actions_taken: List[Dict[str, Any]] = []
        if watchdog.get("alert_count", 0) > 0:
            actions_taken.append({
                "type": "alert_scan",
                "status": "completed",
                "detail": f"Processed {watchdog['alert_count']} watchdog alert(s) in read-only mode.",
            })
        if goals.get("goal_count", 0) > 0:
            actions_taken.append({
                "type": "goal_rank",
                "status": "completed",
                "detail": f"Ranked {goals['goal_count']} daily goal(s).",
            })

        payload = {
            "status": "ok",
            "module": "empire_os_cofounder",
            "universe": self.universe,
            "generated_at": self._utc_now(),
            "mode": "read_only",
            "actions_taken": actions_taken,
            "next_action": brief.get("next_action"),
            "top_alert": watchdog.get("alerts", [None])[0],
            "recommended_queue": self._recommended_queue(brief, goals, watchdog),
        }
        self._record_audit("run_safe_loop", payload, action_count=len(actions_taken))
        return payload

    def _strategy_agent(
        self,
        snapshot: Dict[str, Any],
        risks: List[Dict[str, Any]],
        goals: List[Dict[str, str]],
        next_action: Dict[str, Any],
    ) -> Dict[str, Any]:
        mission = goals[0]["title"] if goals else "Maintain execution rhythm"
        priorities = [goal["title"] for goal in goals[:3]]
        queue_items = [
            self._queue_item(
                agent="strategy",
                lane="strategy",
                item_type="daily_goal",
                title=goal["title"],
                priority=goal["priority"],
                reason=goal["reason"],
                suggested_step=goal["suggested_step"],
                handler=self._handler_for_goal(goal),
            )
            for goal in goals[:3]
        ]
        payload = {
            "mission": mission,
            "priorities": priorities,
            "top_risks": risks[:3],
            "next_action": next_action,
        }
        return {"payload": payload, "queue_items": queue_items}

    def _marketing_agent(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        revenue = snapshot["revenue_os"]
        gtm = snapshot["gtm"]
        recent_commands = load_json_store("commands")
        recent_leads = load_json_store("leads")
        update = generate_weekly_gtm_update(load_gtm_context(), recent_commands[-10:], recent_leads[-20:])

        queue_items: List[Dict[str, Any]] = []
        if revenue.get("lead_count", 0) == 0:
            queue_items.append(self._queue_item(
                agent="marketing",
                lane="pipeline",
                item_type="lead_generation",
                title="Generate first outbound lead batch",
                priority="high",
                reason="Revenue OS shows no lead pipeline yet.",
                suggested_step="Create 10 target accounts and stage the first outbound sequence.",
                handler="prepare_outreach_batch",
            ))
        if gtm.get("active_campaigns", 0) == 0:
            queue_items.append(self._queue_item(
                agent="marketing",
                lane="gtm",
                item_type="campaign_activation",
                title="Activate one GTM campaign",
                priority="medium",
                reason="Campaign structures exist but none are active.",
                suggested_step="Promote the best-fit draft campaign into an active test this week.",
                handler="prepare_campaign_draft",
            ))
        if revenue.get("lead_count", 0) > 0 and revenue.get("paid_leads", 0) == 0:
            queue_items.append(self._queue_item(
                agent="marketing",
                lane="conversion",
                item_type="conversion_push",
                title="Push warmest lead toward payment",
                priority="high",
                reason="Leads exist but none have converted to paid yet.",
                suggested_step="Prepare the strongest offer + outreach follow-up for the warmest lead.",
                handler="prepare_outreach_batch",
            ))

        payload = {
            "focus": update.get("recommended_focus", "Focus on top-fit ICP segment"),
            "action_items": update.get("recommended_action_items", [])[:5],
            "metrics": update.get("metrics", {}),
        }
        return {"payload": payload, "queue_items": queue_items}

    def _ops_agent(self, snapshot: Dict[str, Any], alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        queue_items: List[Dict[str, Any]] = []
        for alert in alerts[:3]:
            queue_items.append(self._queue_item(
                agent="ops",
                lane="operations",
                item_type=alert["type"],
                title=alert["message"],
                priority=self._priority_from_severity(alert["severity"]),
                reason=alert["message"],
                suggested_step=alert["suggested_step"],
                handler=self._handler_for_alert(alert),
            ))

        omni = snapshot["omni"]
        blocked = omni.get("metrics", {}).get("blocked_tasks", 0) if omni.get("available") else 0
        payload = {
            "health": snapshot["system_health"].get("overall_status", snapshot["system_health"].get("status", "unknown")),
            "blocked_tasks": blocked,
            "alerts_processed": len(alerts),
        }
        return {"payload": payload, "queue_items": queue_items}

    async def _build_snapshot(self) -> Dict[str, Any]:
        omni = self._safe_omni_snapshot()
        system_health = await self._safe_system_health()
        crm = await self._safe_crm_snapshot()
        business = await self._safe_business_snapshot()
        gtm = self._safe_gtm_snapshot()
        revenue_os = self._safe_revenue_os_snapshot()

        return {
            "omni": omni,
            "system_health": system_health,
            "crm": crm,
            "business": business,
            "gtm": gtm,
            "revenue_os": revenue_os,
        }

    def _safe_omni_snapshot(self) -> Dict[str, Any]:
        try:
            state = load_state(self.universe)
            tasks = task_list(state)
            runs = recent_runs(state)
            metrics = summary_metrics(tasks, runs)
            statuses = Counter(str(task.get("status", "unknown")).lower() for task in tasks)
            blocked = [task for task in tasks if str(task.get("status", "")).startswith("blocked")][:5]
            return {
                "available": True,
                "state_file": state.get("_state_file"),
                "metrics": metrics,
                "task_status_counts": dict(statuses),
                "blocked_tasks": blocked,
                "recent_runs": runs[:5],
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    async def _safe_system_health(self) -> Dict[str, Any]:
        try:
            report = await asyncio.wait_for(system_health_service.get_full_health_report(), timeout=5.0)
            return {"available": True, **report}
        except Exception as exc:
            return {"available": False, "status": "unknown", "error": str(exc)}

    async def _safe_crm_snapshot(self) -> Dict[str, Any]:
        try:
            from database.connection import get_database

            db = get_database()
            leads = await db.crm_leads.find({}, {"_id": 0, "pipeline_stage": 1, "value": 1, "lane": 1, "updated_at": 1}).to_list(500)
            stage_counts = Counter(str(lead.get("pipeline_stage", "lead")).lower() for lead in leads)
            pipeline_value = sum(
                float(lead.get("value", 0) or 0)
                for lead in leads
                if str(lead.get("pipeline_stage", "")).lower() in {"qualified", "proposal", "negotiation", "onboarding"}
            )
            return {
                "available": True,
                "total_leads": len(leads),
                "stage_counts": dict(stage_counts),
                "pipeline_value": round(pipeline_value, 2),
                "active_clients": stage_counts.get("active", 0),
                "stale_leads_estimate": self._count_stale_records(leads, "updated_at", days=14),
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    async def _safe_business_snapshot(self) -> Dict[str, Any]:
        try:
            from database.connection import get_database

            db = get_database()
            total_users = await db.users.count_documents({})
            active_teams = await db.teams.count_documents({"is_active": True})
            crm_leads = await db.crm_leads.count_documents({})
            active_clients = await db.crm_leads.count_documents({"pipeline_stage": "active"})
            execution_logs = await db.execution_logs.count_documents({})
            return {
                "available": True,
                "total_users": total_users,
                "active_teams": active_teams,
                "crm_leads": crm_leads,
                "active_clients": active_clients,
                "conversion_rate": round((active_clients / max(crm_leads, 1)) * 100, 1),
                "execution_logs": execution_logs,
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    def _safe_gtm_snapshot(self) -> Dict[str, Any]:
        try:
            context = load_gtm_context()
            campaigns = context.get("campaigns", [])
            scoring_outputs = context.get("scoring_outputs", [])
            weekly_updates = context.get("weekly_updates", [])
            active_campaigns = [
                campaign for campaign in campaigns if str(campaign.get("status", "")).lower() == "active"
            ]
            draft_campaigns = [
                campaign for campaign in campaigns if str(campaign.get("status", "")).lower() == "draft"
            ]
            return {
                "available": True,
                "campaign_count": len(campaigns),
                "active_campaigns": len(active_campaigns),
                "draft_campaigns": len(draft_campaigns),
                "recent_scores": len(scoring_outputs),
                "weekly_updates": len(weekly_updates),
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    def _safe_revenue_os_snapshot(self) -> Dict[str, Any]:
        try:
            leads = load_json_store("leads")
            commands = load_json_store("commands")
            receipts = load_json_store("receipts")
            paid_leads = [lead for lead in leads if lead.get("status") == "paid"]
            pipeline_value = sum(float(lead.get("estimated_value", 0) or 0) for lead in leads)
            paid_value = sum(float(lead.get("actual_value", 0) or 0) for lead in paid_leads)
            return {
                "available": True,
                "lead_count": len(leads),
                "command_count": len(commands),
                "receipt_count": len(receipts),
                "paid_leads": len(paid_leads),
                "pipeline_value": round(pipeline_value, 2),
                "paid_value": round(paid_value, 2),
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)}

    def _derive_risks(self, snapshot: Dict[str, Any]) -> List[Dict[str, Any]]:
        risks: List[Dict[str, Any]] = []

        system_health = snapshot["system_health"]
        overall_status = system_health.get("overall_status") or system_health.get("status")
        if overall_status and overall_status != "healthy":
            risks.append({
                "severity": "high",
                "type": "system_health",
                "message": f"System health is {overall_status}.",
            })

        omni = snapshot["omni"]
        blocked = omni.get("metrics", {}).get("blocked_tasks", 0) if omni.get("available") else 0
        if blocked:
            risks.append({
                "severity": "high" if blocked >= 3 else "medium",
                "type": "blocked_execution",
                "message": f"{blocked} omni task(s) are blocked.",
            })

        crm = snapshot["crm"]
        stale_leads = crm.get("stale_leads_estimate", 0) if crm.get("available") else 0
        if stale_leads:
            risks.append({
                "severity": "medium",
                "type": "stale_pipeline",
                "message": f"{stale_leads} CRM lead(s) look stale.",
            })

        gtm = snapshot["gtm"]
        if gtm.get("available") and gtm.get("campaign_count", 0) > 0 and gtm.get("active_campaigns", 0) == 0:
            risks.append({
                "severity": "medium",
                "type": "gtm_inactive",
                "message": "GTM campaigns exist but none are active.",
            })

        revenue_os = snapshot["revenue_os"]
        if revenue_os.get("available") and revenue_os.get("lead_count", 0) > 0 and revenue_os.get("paid_leads", 0) == 0:
            risks.append({
                "severity": "medium",
                "type": "revenue_conversion",
                "message": "Revenue OS has leads but no paid conversions yet.",
            })

        if not risks:
            risks.append({
                "severity": "low",
                "type": "steady_state",
                "message": "No immediate high-signal risk detected from current adapters.",
            })

        return risks

    def _derive_alerts(self, snapshot: Dict[str, Any]) -> List[Dict[str, Any]]:
        alerts: List[Dict[str, Any]] = []

        system_health = snapshot["system_health"]
        if not system_health.get("available"):
            alerts.append(self._alert("medium", "health_adapter", "System health adapter is unavailable.", "Inspect infrastructure configuration or service reachability."))
        else:
            overall_status = system_health.get("overall_status")
            if overall_status == "unhealthy":
                alerts.append(self._alert("critical", "system_health", "One or more core services are unhealthy.", "Review the full health report before new execution.")) 
            elif overall_status == "degraded":
                alerts.append(self._alert("high", "system_health", "Core services are degraded.", "Stabilize degraded dependencies before pushing new work.")) 

        omni = snapshot["omni"]
        if not omni.get("available"):
            alerts.append(self._alert("high", "omni_unavailable", "Canonical omni state is unavailable.", "Restore omni state visibility before trusting autonomous execution."))
        else:
            blocked_tasks = omni.get("metrics", {}).get("blocked_tasks", 0)
            pending_tasks = omni.get("metrics", {}).get("pending_tasks", 0)
            if blocked_tasks >= 3:
                alerts.append(self._alert("high", "blocked_tasks", f"{blocked_tasks} omni tasks are blocked.", "Resolve top blocked tasks to restore execution flow."))
            elif blocked_tasks > 0:
                alerts.append(self._alert("medium", "blocked_tasks", f"{blocked_tasks} omni task(s) are blocked.", "Review blocked tasks and add missing context."))
            if pending_tasks >= 10:
                alerts.append(self._alert("medium", "task_backlog", f"Pending omni backlog is {pending_tasks}.", "Use the safe loop to prioritize the next verified task."))

        crm = snapshot["crm"]
        if crm.get("available"):
            stale_leads = crm.get("stale_leads_estimate", 0)
            if stale_leads >= 5:
                alerts.append(self._alert("high", "stale_leads", f"{stale_leads} CRM leads look stale.", "Move stale leads forward or close them cleanly."))
            elif stale_leads > 0:
                alerts.append(self._alert("medium", "stale_leads", f"{stale_leads} CRM lead(s) look stale.", "Review stale lead follow-ups."))
            if crm.get("total_leads", 0) == 0:
                alerts.append(self._alert("high", "empty_pipeline", "CRM has no leads.", "Shift effort to immediate pipeline creation."))
        else:
            alerts.append(self._alert("medium", "crm_adapter", "CRM adapter is unavailable.", "Check MongoDB initialization and CRM collections."))

        gtm = snapshot["gtm"]
        if gtm.get("available"):
            if gtm.get("campaign_count", 0) > 0 and gtm.get("active_campaigns", 0) == 0:
                alerts.append(self._alert("medium", "gtm_inactive", "GTM campaigns exist but none are active.", "Promote one campaign into an active test."))
            if gtm.get("draft_campaigns", 0) >= 3:
                alerts.append(self._alert("low", "gtm_drafts", f"{gtm['draft_campaigns']} GTM campaigns remain in draft.", "Cull or activate drafts to reduce drift."))
        else:
            alerts.append(self._alert("low", "gtm_adapter", "GTM adapter is unavailable.", "Check local GTM context files."))

        revenue_os = snapshot["revenue_os"]
        if revenue_os.get("available"):
            if revenue_os.get("lead_count", 0) > 0 and revenue_os.get("paid_leads", 0) == 0:
                alerts.append(self._alert("medium", "revenue_conversion", "Revenue OS has leads but no paid conversions.", "Focus on the warmest lead and conversion artifact."))
        else:
            alerts.append(self._alert("low", "revenue_os_adapter", "Revenue OS adapter is unavailable.", "Check Revenue OS JSON stores."))

        return alerts

    def _derive_goals(self, snapshot: Dict[str, Any], risks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        goals: List[Dict[str, Any]] = []

        if any(risk["type"] == "system_health" for risk in risks):
            goals.append(self._goal(
                "Stabilize system health",
                "Review degraded or unhealthy components before shipping more work.",
                "high",
                "Investigate the unhealthy component summary in the co-founder brief.",
            ))

        omni = snapshot["omni"]
        pending = omni.get("metrics", {}).get("pending_tasks", 0) if omni.get("available") else 0
        blocked = omni.get("metrics", {}).get("blocked_tasks", 0) if omni.get("available") else 0
        if blocked:
            goals.append(self._goal(
                "Unblock autonomous execution",
                f"Reduce blocked omni tasks so the execution loop can keep moving. Current blocked count: {blocked}.",
                "high",
                "Resolve the top blocked omni task or tighten its task text and context.",
            ))
        elif pending:
            goals.append(self._goal(
                "Ship the next verified task",
                f"Use the canonical omni loop to close the highest-priority pending task. Current pending count: {pending}.",
                "high",
                "Run the next safe omni task through analyst, developer, and evaluator.",
            ))

        crm = snapshot["crm"]
        if crm.get("available") and crm.get("total_leads", 0) == 0:
            goals.append(self._goal(
                "Create top-of-funnel motion",
                "There are no CRM leads yet. Priority should shift to revenue and pipeline creation.",
                "high",
                "Generate or import the first lead batch and define the first active outreach push.",
            ))
        elif crm.get("available") and crm.get("stale_leads_estimate", 0) > 0:
            goals.append(self._goal(
                "Move stale leads forward",
                f"Stale leads are accumulating in CRM. Current estimate: {crm.get('stale_leads_estimate', 0)}.",
                "medium",
                "Review stale leads, update statuses, and schedule follow-up actions.",
            ))

        gtm = snapshot["gtm"]
        if gtm.get("available") and gtm.get("active_campaigns", 0) == 0:
            goals.append(self._goal(
                "Activate one GTM lane",
                "Campaign structure exists, but there is no currently active outbound motion.",
                "medium",
                "Promote one draft campaign into an active test with a clear buyer segment.",
            ))

        revenue_os = snapshot["revenue_os"]
        if revenue_os.get("available") and revenue_os.get("lead_count", 0) > 0 and revenue_os.get("paid_leads", 0) == 0:
            goals.append(self._goal(
                "Convert revenue pipeline into cash",
                "Leads exist in Revenue OS but there are no paid leads yet.",
                "high",
                "Identify the warmest lead and prepare the next conversion step or delivery artifact.",
            ))

        if not goals:
            goals.append(self._goal(
                "Maintain execution rhythm",
                "No urgent blockers detected. Keep the system moving through verified work and measured GTM.",
                "medium",
                "Review the latest brief, confirm priorities, and run one safe execution cycle.",
            ))

        return goals[:5]

    def _pick_next_action(self, snapshot: Dict[str, Any], risks: List[Dict[str, Any]]) -> Dict[str, Any]:
        goals = self._derive_goals(snapshot, risks)
        top_goal = goals[0]
        return {
            "title": top_goal["title"],
            "reason": top_goal["reason"],
            "suggested_step": top_goal["suggested_step"],
        }

    def _build_summary(self, snapshot: Dict[str, Any], risks: List[Dict[str, Any]], next_action: Dict[str, Any]) -> str:
        omni = snapshot["omni"]
        crm = snapshot["crm"]
        gtm = snapshot["gtm"]
        revenue_os = snapshot["revenue_os"]

        pending = omni.get("metrics", {}).get("pending_tasks", 0) if omni.get("available") else "unknown"
        blocked = omni.get("metrics", {}).get("blocked_tasks", 0) if omni.get("available") else "unknown"
        leads = crm.get("total_leads", "unknown") if crm.get("available") else "unknown"
        active_campaigns = gtm.get("active_campaigns", "unknown") if gtm.get("available") else "unknown"
        paid_leads = revenue_os.get("paid_leads", "unknown") if revenue_os.get("available") else "unknown"
        top_risk = risks[0]["message"] if risks else "No immediate risk detected."

        return (
            f"Execution loop pending={pending}, blocked={blocked}. "
            f"CRM leads={leads}. Active GTM campaigns={active_campaigns}. Paid Revenue OS leads={paid_leads}. "
            f"Top risk: {top_risk} Next move: {next_action['suggested_step']}"
        )

    def _count_stale_records(self, records: List[Dict[str, Any]], field: str, *, days: int) -> int:
        now = datetime.now(timezone.utc)
        stale = 0
        for record in records:
            raw = record.get(field)
            if not raw:
                continue
            parsed = self._parse_iso(raw)
            if parsed is None:
                continue
            age_days = (now - parsed).days
            if age_days >= days:
                stale += 1
        return stale

    def _parse_iso(self, value: Any) -> Optional[datetime]:
        if not isinstance(value, str):
            return None
        try:
            normalized = value.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(normalized)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed
        except ValueError:
            return None

    def _goal(self, title: str, reason: str, priority: str, suggested_step: str) -> Dict[str, str]:
        return {
            "title": title,
            "reason": reason,
            "priority": priority,
            "suggested_step": suggested_step,
        }

    def _alert(self, severity: str, alert_type: str, message: str, suggested_step: str) -> Dict[str, str]:
        return {
            "severity": severity,
            "type": alert_type,
            "message": message,
            "suggested_step": suggested_step,
        }

    def _record_audit(self, event_type: str, payload: Dict[str, Any], *, action_count: int) -> None:
        entry = {
            "timestamp": self._utc_now(),
            "universe": self.universe,
            "event_type": event_type,
            "summary": payload.get("summary") or payload.get("next_action", {}).get("title") or event_type,
            "risk_count": len(payload.get("risks", [])),
            "goal_count": payload.get("goal_count", 0),
            "alert_count": payload.get("alert_count", 0),
            "action_count": action_count,
        }
        append_audit_record(entry)

    def _recommended_queue(self, brief: Dict[str, Any], goals: Dict[str, Any], watchdog: Dict[str, Any]) -> List[Dict[str, Any]]:
        queue: List[Dict[str, Any]] = []
        top_alert = watchdog.get("alerts", [None])[0]
        if top_alert:
            queue.append({
                "lane": "stability",
                "title": top_alert["message"],
                "step": top_alert["suggested_step"],
            })
        for goal in goals.get("goals", [])[:2]:
            queue.append({
                "lane": "execution",
                "title": goal["title"],
                "step": goal["suggested_step"],
            })
        next_action = brief.get("next_action")
        if next_action:
            queue.append({
                "lane": "next_action",
                "title": next_action["title"],
                "step": next_action["suggested_step"],
            })
        return queue[:3]

    def _handler_for_goal(self, goal: Dict[str, Any]) -> str:
        title = str(goal.get("title", "")).lower()
        if "health" in title:
            return "health_recheck"
        if "gtm" in title or "campaign" in title:
            return "prepare_campaign_draft"
        if "lead" in title or "cash" in title or "convert" in title:
            return "prepare_outreach_batch"
        if "unblock" in title or "ship" in title:
            return "refresh_business_snapshot"
        return "generate_internal_draft"

    def _handler_for_alert(self, alert: Dict[str, Any]) -> str:
        alert_type = str(alert.get("type", "")).lower()
        if "health" in alert_type:
            return "health_recheck"
        if "crm" in alert_type or "pipeline" in alert_type or "lead" in alert_type:
            return "refresh_business_snapshot"
        if "gtm" in alert_type:
            return "prepare_campaign_draft"
        return "refresh_business_snapshot"

    def _handler_for_survival_task(self, title: str) -> str:
        title_lower = str(title).lower()
        if "define" in title_lower:
            return "generate_internal_draft"
        if "close" in title_lower:
            return "internal_task_update"
        return "prepare_outreach_batch"

    def _policy_classify(self, queue_item: Dict[str, Any]) -> str:
        handler = str(queue_item.get("handler") or "").strip()
        if not handler or handler not in self._action_registry():
            return "forbidden"

        title = str(queue_item.get("title", "")).lower()
        item_type = str(queue_item.get("type", "")).lower()
        approval_markers = {
            "send",
            "post",
            "publish",
            "payment",
            "invoice",
            "investor",
            "customer",
            "prospect",
            "blast",
            "outreach messages",
        }
        if any(marker in title for marker in approval_markers):
            return "approval_required"
        if any(marker in item_type for marker in {"investor", "payment", "support"}):
            return "approval_required"

        return {
            "health_recheck": "read_only",
            "refresh_business_snapshot": "read_only",
            "generate_internal_draft": "draft_only",
            "prepare_outreach_batch": "draft_only",
            "prepare_campaign_draft": "draft_only",
            "internal_task_update": "safe_write",
        }.get(handler, "forbidden")

    def _sorted_open_queue(self) -> List[Dict[str, Any]]:
        return sorted(
            [item for item in get_queue_records() if str(item.get("status", "open")).lower() == "open"],
            key=lambda item: (
                self._priority_rank(str(item.get("priority", "medium"))),
                item.get("updated_at", ""),
            ),
        )

    def _select_next_safe_item(self, queue: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        for item in queue:
            if self._policy_classify(item) in {"read_only", "draft_only", "safe_write"}:
                return item
        return None

    def _should_retry_receipt(self, receipt: Dict[str, Any]) -> bool:
        if receipt.get("final_status") != "failed":
            return False
        policy_class = receipt.get("policy_class")
        if policy_class in {"approval_required", "forbidden"}:
            return False
        verification = receipt.get("verification") or {}
        reason = " ".join([
            str(receipt.get("error") or ""),
            str(verification.get("error") or ""),
            str(verification.get("reason") or ""),
        ]).lower()
        transient_markers = {
            "timeout",
            "tempor",
            "unavailable",
            "connection",
            "incomplete",
            "unknown",
        }
        return any(marker in reason for marker in transient_markers)

    def _requeue_for_retry(self, item_id: str, *, actor: str, retry_count: int) -> Dict[str, Any] | None:
        return transition_queue_item(
            item_id,
            to_status="open",
            actor=actor,
            reason=f"Retrying transient failure (attempt {retry_count}).",
            metadata={"retry_count": retry_count},
        )

    def _block_stuck_items(
        self,
        *,
        actor: str,
        cycle_id: str,
        age_threshold_seconds: int,
    ) -> List[Dict[str, Any]]:
        now = datetime.now(timezone.utc)
        blocked_items: List[Dict[str, Any]] = []
        for item in get_queue_records():
            status = str(item.get("status", "")).lower()
            if status not in {"claimed", "in_progress", "verifying"}:
                continue
            updated_at = self._parse_iso(item.get("updated_at"))
            if updated_at is None:
                continue
            age_seconds = (now - updated_at).total_seconds()
            if age_seconds < age_threshold_seconds:
                continue
            blocked = transition_queue_item(
                str(item["id"]),
                to_status="blocked",
                actor=actor,
                reason=f"Task exceeded safe age threshold while {status}.",
                metadata={"blocked_reason": f"stuck_{status}", "blocked_age_seconds": int(age_seconds)},
            )
            if blocked:
                blocked_items.append(blocked)
                append_activity_event(
                    self._activity_event(
                        "execution_blocked",
                        queue_item=blocked,
                        cycle_id=cycle_id,
                        actor=actor,
                        policy_class=self._policy_classify(blocked),
                        detail=f"Blocked stuck queue item after {int(age_seconds)}s in {status}.",
                    )
                )
        return blocked_items

    def _sources_unavailable(self, snapshot: Dict[str, Any]) -> List[str]:
        unavailable = []
        for name in ("omni", "system_health", "crm", "business", "gtm", "revenue_os"):
            section = snapshot.get(name, {})
            if isinstance(section, dict) and section.get("available") is False:
                unavailable.append(name)
        return unavailable

    def _action_registry(self) -> Dict[str, Dict[str, Any]]:
        return {
            "health_recheck": {"run": self._run_health_recheck, "verify": self._verify_health_recheck},
            "refresh_business_snapshot": {"run": self._run_refresh_business_snapshot, "verify": self._verify_refresh_business_snapshot},
            "generate_internal_draft": {"run": self._run_generate_internal_draft, "verify": self._verify_generate_internal_draft},
            "prepare_outreach_batch": {"run": self._run_prepare_outreach_batch, "verify": self._verify_prepare_outreach_batch},
            "prepare_campaign_draft": {"run": self._run_prepare_campaign_draft, "verify": self._verify_prepare_campaign_draft},
            "internal_task_update": {"run": self._run_internal_task_update, "verify": self._verify_internal_task_update},
        }

    def _activity_event(
        self,
        event_type: str,
        *,
        queue_item: Optional[Dict[str, Any]] = None,
        execution_id: Optional[str] = None,
        cycle_id: Optional[str] = None,
        actor: Optional[str] = None,
        policy_class: Optional[str] = None,
        detail: Optional[str] = None,
    ) -> Dict[str, Any]:
        return {
            "event_type": event_type,
            "timestamp": self._utc_now(),
            "universe": self.universe,
            "cycle_id": cycle_id,
            "execution_id": execution_id,
            "actor": actor,
            "policy_class": policy_class,
            "queue_item_id": queue_item.get("id") if queue_item else None,
            "handler": queue_item.get("handler") if queue_item else None,
            "status": queue_item.get("status") if queue_item else None,
            "title": queue_item.get("title") if queue_item else None,
            "detail": detail,
        }

    def _cofounder_data_dir(self) -> str:
        path = cofounder_state.DATA_DIR
        os.makedirs(path, exist_ok=True)
        return path

    def _cofounder_subdir(self, name: str) -> str:
        path = os.path.join(self._cofounder_data_dir(), name)
        os.makedirs(path, exist_ok=True)
        return path

    def _write_markdown_artifact(self, folder: str, filename: str, content: str) -> str:
        path = os.path.join(self._cofounder_subdir(folder), filename)
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(content)
        return path

    def _write_json_artifact(self, folder: str, filename: str, payload: Dict[str, Any]) -> str:
        path = os.path.join(self._cofounder_subdir(folder), filename)
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        return path

    async def _run_health_recheck(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        report = await self._safe_system_health()
        return {
            "summary": f"Health recheck returned {report.get('overall_status', report.get('status', 'unknown'))}.",
            "action_taken": "Re-ran system health adapter and captured the current health report.",
            "files_or_records_changed": [],
            "report": report,
        }

    async def _verify_health_recheck(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        report = result.get("report", {})
        ok = isinstance(report, dict) and bool(report.get("available")) and bool(report.get("overall_status") or report.get("status"))
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": ["system_health.available", "system_health.status"],
            "error": None if ok else "Health report was incomplete.",
        }

    async def _run_refresh_business_snapshot(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        return {
            "summary": "Refreshed full business snapshot.",
            "action_taken": "Rebuilt omni, health, CRM, business, GTM, and Revenue OS snapshots.",
            "files_or_records_changed": [],
            "snapshot": snapshot,
        }

    async def _verify_refresh_business_snapshot(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        snapshot = result.get("snapshot", {})
        required = {"omni", "system_health", "crm", "business", "gtm", "revenue_os"}
        ok = isinstance(snapshot, dict) and required.issubset(snapshot.keys())
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": sorted(required),
            "error": None if ok else "Snapshot missing required sections.",
        }

    async def _run_generate_internal_draft(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        content = "\n".join([
            f"# Internal Draft: {queue_item['title']}",
            "",
            f"- Execution ID: `{execution_id}`",
            f"- Queue Item: `{queue_item['id']}`",
            f"- Reason: {queue_item['reason']}",
            f"- Suggested Step: {queue_item['suggested_step']}",
            "",
            "## Current State",
            "",
            f"- Health: `{snapshot['system_health'].get('overall_status', snapshot['system_health'].get('status', 'unknown'))}`",
            f"- CRM Leads: `{snapshot['crm'].get('total_leads', 'unknown')}`",
            f"- Active Campaigns: `{snapshot['gtm'].get('active_campaigns', 'unknown')}`",
            f"- Paid Leads: `{snapshot['revenue_os'].get('paid_leads', 'unknown')}`",
            "",
            "## Draft",
            "",
            queue_item["suggested_step"],
            "",
            "## Constraints",
            "",
            "- Planning output only",
            "- No publishing or sending performed",
            "- No money movement performed",
        ]) + "\n"
        path = self._write_markdown_artifact("drafts", f"{execution_id.lower()}_internal_draft.md", content)
        return {
            "summary": f"Internal draft created at {path}.",
            "action_taken": "Generated a planning-only internal markdown draft.",
            "files_or_records_changed": [path],
            "artifact_path": path,
        }

    async def _verify_generate_internal_draft(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        path = result.get("artifact_path")
        ok = bool(path) and os.path.exists(path) and os.path.getsize(path) > 0
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": [path] if path else [],
            "error": None if ok else "Internal draft artifact was not created.",
        }

    async def _run_prepare_outreach_batch(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        batch = {
            "execution_id": execution_id,
            "queue_item_id": queue_item["id"],
            "title": queue_item["title"],
            "offer_angle": queue_item["suggested_step"],
            "segments": [
                "warm contacts",
                "recent leads",
                "service businesses with slow follow-up",
            ],
            "messages": {
                "subject": f"{queue_item['title']} - ready-to-review batch",
                "warm": f"{queue_item['title']}: {queue_item['suggested_step']}",
                "cold": f"Quick note: {queue_item['suggested_step']}",
            },
            "snapshot": {
                "crm_leads": snapshot["crm"].get("total_leads"),
                "paid_leads": snapshot["revenue_os"].get("paid_leads"),
                "active_campaigns": snapshot["gtm"].get("active_campaigns"),
            },
            "status": "draft_only",
        }
        json_path = self._write_json_artifact("outreach", f"{execution_id.lower()}_batch.json", batch)
        md_path = self._write_markdown_artifact(
            "outreach",
            f"{execution_id.lower()}_batch.md",
            "\n".join([
                f"# Outreach Batch: {queue_item['title']}",
                "",
                f"- Execution ID: `{execution_id}`",
                "- Status: `draft_only`",
                "",
                "## Messages",
                "",
                f"- Subject: {batch['messages']['subject']}",
                f"- Warm: {batch['messages']['warm']}",
                f"- Cold: {batch['messages']['cold']}",
            ]) + "\n",
        )
        return {
            "summary": "Prepared a review-only outreach batch.",
            "action_taken": "Created outreach draft artifacts without sending any messages.",
            "files_or_records_changed": [json_path, md_path],
            "artifact_path": json_path,
            "artifact_markdown_path": md_path,
            "batch": batch,
        }

    async def _verify_prepare_outreach_batch(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        files = [path for path in [result.get("artifact_path"), result.get("artifact_markdown_path")] if path]
        ok = all(os.path.exists(path) and os.path.getsize(path) > 0 for path in files) and bool(files)
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": files,
            "error": None if ok else "Outreach batch artifacts were not created.",
        }

    async def _run_prepare_campaign_draft(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        snapshot = await self._build_snapshot()
        draft = {
            "execution_id": execution_id,
            "queue_item_id": queue_item["id"],
            "campaign_name": queue_item["title"],
            "objective": queue_item["suggested_step"],
            "channels": ["email", "social", "landing_page"],
            "cta": "Book a short qualification call",
            "guardrails": ["draft_only", "no publish", "no ad spend"],
            "supporting_metrics": {
                "crm_leads": snapshot["crm"].get("total_leads"),
                "active_campaigns": snapshot["gtm"].get("active_campaigns"),
                "paid_leads": snapshot["revenue_os"].get("paid_leads"),
            },
        }
        path = self._write_json_artifact("campaigns", f"{execution_id.lower()}_campaign.json", draft)
        return {
            "summary": "Prepared a campaign draft package.",
            "action_taken": "Created a campaign package for review without publishing it.",
            "files_or_records_changed": [path],
            "artifact_path": path,
            "campaign": draft,
        }

    async def _verify_prepare_campaign_draft(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        path = result.get("artifact_path")
        ok = bool(path) and os.path.exists(path) and os.path.getsize(path) > 0
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": [path] if path else [],
            "error": None if ok else "Campaign draft artifact was not created.",
        }

    async def _run_internal_task_update(self, queue_item: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        note = {
            "execution_id": execution_id,
            "status": "execution_in_progress",
            "updated_by": "cofounder",
            "note": queue_item.get("suggested_step"),
            "updated_at": self._utc_now(),
        }
        updated = update_queue_item(
            str(queue_item["id"]),
            {
                "execution_notes": note,
                "last_internal_update": note["updated_at"],
            },
        )
        return {
            "summary": "Updated internal task state for the queue item.",
            "action_taken": "Wrote an internal execution note onto the queue record.",
            "files_or_records_changed": [f"queue:{queue_item['id']}"],
            "updated_item": updated,
        }

    async def _verify_internal_task_update(self, queue_item: Dict[str, Any], result: Dict[str, Any], execution_id: str) -> Dict[str, Any]:
        updated = result.get("updated_item") or get_queue_item(str(queue_item["id"]))
        ok = isinstance(updated, dict) and isinstance(updated.get("execution_notes"), dict)
        return {
            "ok": ok,
            "status": "verified" if ok else "failed",
            "checked": [f"queue:{queue_item['id']}"],
            "error": None if ok else "Queue item internal note was not written.",
        }

    def _render_brief_markdown(self, payload: Dict[str, Any]) -> str:
        lines = [
            "# Empire OS Co-Founder Brief",
            "",
            f"- Universe: `{payload['universe']}`",
            f"- Generated: `{payload['generated_at']}`",
            "",
            "## Summary",
            "",
            payload["summary"],
            "",
            "## Next Action",
            "",
            f"- {payload['next_action']['title']}: {payload['next_action']['suggested_step']}",
            "",
            "## Risks",
            "",
        ]
        for risk in payload.get("risks", []):
            lines.append(f"- `{risk['severity']}` {risk['type']}: {risk['message']}")
        snapshot = payload.get("snapshot", {})
        omni = snapshot.get("omni", {})
        crm = snapshot.get("crm", {})
        gtm = snapshot.get("gtm", {})
        revenue = snapshot.get("revenue_os", {})
        lines.extend([
            "",
            "## Snapshot",
            "",
            f"- Omni pending: `{omni.get('metrics', {}).get('pending_tasks', 'unknown')}`",
            f"- Omni blocked: `{omni.get('metrics', {}).get('blocked_tasks', 'unknown')}`",
            f"- CRM leads: `{crm.get('total_leads', 'unknown')}`",
            f"- Active GTM campaigns: `{gtm.get('active_campaigns', 'unknown')}`",
            f"- Revenue OS paid leads: `{revenue.get('paid_leads', 'unknown')}`",
        ])
        return "\n".join(lines) + "\n"

    def _render_loop_markdown(
        self,
        *,
        cycle_id: str,
        strategy_agent: Dict[str, Any],
        marketing_agent: Dict[str, Any],
        ops_agent: Dict[str, Any],
        queue_items: List[Dict[str, Any]],
    ) -> str:
        lines = [
            "# Empire OS Co-Founder Loop",
            "",
            f"- Cycle: `{cycle_id}`",
            f"- Universe: `{self.universe}`",
            f"- Generated: `{self._utc_now()}`",
            "",
            "## Strategy Agent",
            "",
            f"- Mission: {strategy_agent['payload']['mission']}",
        ]
        for priority in strategy_agent["payload"]["priorities"]:
            lines.append(f"- Priority: {priority}")
        lines.extend([
            "",
            "## Marketing Agent",
            "",
            f"- Focus: {marketing_agent['payload']['focus']}",
        ])
        for item in marketing_agent["payload"]["action_items"]:
            lines.append(f"- Action: {item}")
        lines.extend([
            "",
            "## Ops Agent",
            "",
            f"- Health: {ops_agent['payload']['health']}",
            f"- Blocked tasks: {ops_agent['payload']['blocked_tasks']}",
            "",
            "## Queue",
            "",
        ])
        for item in queue_items[:10]:
            lines.append(
                f"- `{item['priority']}` [{item['agent']}/{item['lane']}] {item['title']} -> {item['suggested_step']}"
            )
        return "\n".join(lines) + "\n"

    def _render_operating_summary_markdown(self, summary: Dict[str, Any]) -> str:
        lines = [
            "# Empire OS Co-Founder Operating Summary",
            "",
            f"- Cycle: `{summary['cycle_id']}`",
            f"- Universe: `{self.universe}`",
            f"- Generated: `{summary['generated_at']}`",
            f"- Stop reason: `{summary['stop_reason']}`",
            "",
            "## Outcomes",
            "",
            f"- Actions attempted: `{summary['actions_attempted']}`",
            f"- Actions completed: `{summary['actions_completed']}`",
            f"- Actions failed: `{summary['actions_failed']}`",
            f"- Items blocked: `{summary['items_blocked']}`",
            f"- Approvals required: `{summary['approvals_required']}`",
            f"- Sources unavailable: `{', '.join(summary['sources_unavailable']) if summary['sources_unavailable'] else 'none'}`",
            f"- Highest remaining priority: `{summary['highest_remaining_priority'] or 'none'}`",
            "",
            "## Next Founder Decision",
            "",
            summary["next_recommended_founder_decision"] or "No immediate founder decision required.",
            "",
            "## Recent Receipts",
            "",
        ]
        for receipt in summary.get("receipts", [])[-5:]:
            if not receipt:
                continue
            lines.append(
                f"- `{receipt.get('final_status')}` {receipt.get('handler')} on {receipt.get('queue_item_id')} ({receipt.get('policy_class')})"
            )
        return "\n".join(lines) + "\n"

    def _survival_offer(self, snapshot: Dict[str, Any]) -> Dict[str, Any]:
        crm = snapshot.get("crm", {})
        revenue = snapshot.get("revenue_os", {})
        gtm = snapshot.get("gtm", {})
        has_pipeline = bool(crm.get("total_leads", 0) or revenue.get("lead_count", 0))
        headline = "24-Hour Lead Capture Sprint"
        if has_pipeline:
            headline = "48-Hour Follow-Up Automation Sprint"
        if gtm.get("active_campaigns", 0) == 0 and not has_pipeline:
            headline = "24-Hour Landing Page + Intake Sprint"

        return {
            "mission": "Create cash in the next 72 hours from services we can deliver fast.",
            "headline": headline,
            "price_band": "$150-$300 same-day or $500-$1,000 in 48 hours",
            "delivery_window": "24-48 hours",
            "who_for": [
                "local service businesses",
                "solo founders needing leads fast",
                "small teams with messy follow-up workflows",
            ],
            "deliverables": [
                "landing page or intake form",
                "lead capture flow",
                "follow-up automation",
                "handoff notes and live links",
            ],
            "constraints": [
                "no custom platform promises",
                "no long implementation cycle",
                "sell only what can be delivered immediately",
            ],
        }

    def _survival_outreach(self, offer: Dict[str, Any]) -> Dict[str, str]:
        headline = offer["headline"]
        return {
            "broadcast": (
                f"I have one fast-turn slot open for a {headline}. "
                "If your business needs leads, cleaner intake, or follow-up automation in the next 24-48 hours, message me tonight."
            ),
            "warm_dm": (
                f"I’m opening one immediate slot for a {headline}. "
                "If you or someone you know needs a landing page, intake flow, or follow-up automation shipped fast, send them to me."
            ),
            "cold_dm": (
                f"Quick one: I’m offering a {headline} with 24-48 hour turnaround. "
                "Best fit is businesses that need leads or cleaner follow-up fast. Want the breakdown?"
            ),
        }

    def _survival_queue(self, offer: Dict[str, Any]) -> List[Dict[str, Any]]:
        tasks = [
            ("Define the fast-cash offer", "high", f"Lock the exact scope for {offer['headline']} and stop expanding it."),
            ("Send warm contact blast", "high", "Message every warm contact with the short direct offer tonight."),
            ("Post one public offer", "high", "Publish one clean post with the immediate-slot message."),
            ("Send 20 direct outreach messages", "high", "Push for immediate conversations, not broad awareness."),
            ("Close one 24-48 hour sprint", "high", "Move the warmest prospect to payment and delivery scope."),
        ]
        return [
            self._queue_item(
                agent="survival",
                lane="cash",
                item_type="survival_cash",
                title=title,
                priority=priority,
                reason=reason,
                suggested_step=reason,
                handler=self._handler_for_survival_task(title),
            )
            for title, priority, reason in tasks
        ]

    def _render_survival_markdown(
        self,
        *,
        brief: Dict[str, Any],
        offer: Dict[str, Any],
        outreach: Dict[str, str],
        queue_items: List[Dict[str, Any]],
    ) -> str:
        lines = [
            "# Empire Survival Revenue Loop",
            "",
            f"- Universe: `{self.universe}`",
            f"- Generated: `{self._utc_now()}`",
            "",
            "## Mission",
            "",
            offer["mission"],
            "",
            "## Immediate Offer",
            "",
            f"- Headline: {offer['headline']}",
            f"- Price band: {offer['price_band']}",
            f"- Delivery: {offer['delivery_window']}",
            "",
            "## Deliverables",
            "",
        ]
        for deliverable in offer["deliverables"]:
            lines.append(f"- {deliverable}")
        lines.extend([
            "",
            "## Outreach Copy",
            "",
            f"- Broadcast: {outreach['broadcast']}",
            f"- Warm DM: {outreach['warm_dm']}",
            f"- Cold DM: {outreach['cold_dm']}",
            "",
            "## 72-Hour Queue",
            "",
        ])
        for item in queue_items:
            lines.append(f"- `{item['priority']}` {item['title']} -> {item['suggested_step']}")
        lines.extend([
            "",
            "## Current Co-Founder Read",
            "",
            brief["summary"],
        ])
        return "\n".join(lines) + "\n"

    def _utc_now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _queue_item(
        self,
        *,
        agent: str,
        lane: str,
        item_type: str,
        title: str,
        priority: str,
        reason: str,
        suggested_step: str,
        handler: str,
    ) -> Dict[str, Any]:
        now = self._utc_now()
        return {
            "id": f"Q-{uuid.uuid4().hex[:8].upper()}",
            "agent": agent,
            "lane": lane,
            "type": item_type,
            "title": title,
            "priority": priority,
            "reason": reason,
            "suggested_step": suggested_step,
            "handler": handler,
            "status": "open",
            "created_at": now,
            "updated_at": now,
            "transitions": [],
        }

    def _priority_from_severity(self, severity: str) -> str:
        mapping = {
            "critical": "high",
            "high": "high",
            "medium": "medium",
            "low": "low",
        }
        return mapping.get(severity, "medium")

    def _priority_rank(self, priority: str) -> int:
        return {"high": 0, "medium": 1, "low": 2}.get(priority.lower(), 3)
