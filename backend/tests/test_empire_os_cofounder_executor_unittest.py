import asyncio
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from app.services.empire_os_cofounder import state as cofounder_state
from app.services.empire_os_cofounder.runtime import EmpireOSCoFounderService


def _snapshot(
    *,
    health_status: str = "healthy",
    blocked_tasks: int = 0,
    pending_tasks: int = 2,
    total_leads: int = 3,
    stale_leads: int = 0,
    active_campaigns: int = 1,
    draft_campaigns: int = 0,
    revenue_leads: int = 2,
    paid_leads: int = 1,
):
    return {
        "omni": {"available": True, "metrics": {"blocked_tasks": blocked_tasks, "pending_tasks": pending_tasks}},
        "system_health": {"available": True, "overall_status": health_status},
        "crm": {"available": True, "total_leads": total_leads, "stale_leads_estimate": stale_leads},
        "business": {"available": True, "crm_leads": total_leads, "active_clients": 1},
        "gtm": {
            "available": True,
            "campaign_count": active_campaigns + draft_campaigns,
            "active_campaigns": active_campaigns,
            "draft_campaigns": draft_campaigns,
        },
        "revenue_os": {"available": True, "lead_count": revenue_leads, "paid_leads": paid_leads},
    }


class EmpireOSCoFounderExecutorTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_data_dir = cofounder_state.DATA_DIR
        cofounder_state.DATA_DIR = self.temp_dir.name
        cofounder_state.ensure_store()
        self.service = EmpireOSCoFounderService("empire")

        async def fake_snapshot():
            return _snapshot(active_campaigns=0, draft_campaigns=2, paid_leads=0)

        self.service._build_snapshot = fake_snapshot
        self.service._record_audit = lambda *args, **kwargs: None

    def tearDown(self):
        cofounder_state.DATA_DIR = self.original_data_dir
        self.temp_dir.cleanup()

    async def test_run_next_safe_completes_and_writes_receipt_and_activity(self):
        await self.service.run_loop()

        result = await self.service.run_next_safe()

        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["receipt"]["final_status"], "done")
        self.assertIn(result["receipt"]["policy_class"], {"read_only", "draft_only", "safe_write"})

        queue_item = cofounder_state.get_queue_item(result["queue_item"]["id"])
        self.assertEqual(queue_item["status"], "done")

        receipts = cofounder_state.load_json_store("receipts")
        self.assertGreaterEqual(len(receipts), 1)
        self.assertEqual(receipts[-1]["execution_id"], result["receipt"]["execution_id"])

        activity = cofounder_state.load_json_store("activity")
        event_types = [event["event_type"] for event in activity]
        self.assertIn("queue_item_claimed", event_types)
        self.assertIn("execution_started", event_types)
        self.assertIn("verification_started", event_types)
        self.assertIn("execution_completed", event_types)

    async def test_approval_required_item_does_not_execute(self):
        item = self.service._queue_item(
            agent="survival",
            lane="cash",
            item_type="survival_cash",
            title="Send warm contact blast",
            priority="high",
            reason="Needs explicit human signoff before outreach.",
            suggested_step="Prepare the batch but do not send it.",
            handler="prepare_outreach_batch",
        )
        cofounder_state.upsert_queue_items([item])

        result = await self.service.run_queue_item(item["id"])

        self.assertEqual(result["receipt"]["final_status"], "approval_required")
        self.assertTrue(result["receipt"]["approval_required"])
        queue_item = cofounder_state.get_queue_item(item["id"])
        self.assertEqual(queue_item["status"], "approval_required")

    async def test_unknown_handler_is_refused(self):
        item = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="mystery",
            title="Mystery executor",
            priority="medium",
            reason="Should fail policy classification.",
            suggested_step="Do not run unknown handlers.",
            handler="execute_anything",
        )
        cofounder_state.upsert_queue_items([item])

        result = await self.service.run_queue_item(item["id"])

        self.assertEqual(result["receipt"]["final_status"], "failed")
        self.assertEqual(result["receipt"]["policy_class"], "forbidden")
        queue_item = cofounder_state.get_queue_item(item["id"])
        self.assertEqual(queue_item["status"], "failed")

    async def test_policy_classification_covers_safe_and_approval_cases(self):
        safe_item = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Maintain execution rhythm",
            priority="medium",
            reason="Keep work moving.",
            suggested_step="Write a planning draft.",
            handler="generate_internal_draft",
        )
        approval_item = self.service._queue_item(
            agent="survival",
            lane="cash",
            item_type="survival_cash",
            title="Post one public offer",
            priority="high",
            reason="External publishing always pauses for approval.",
            suggested_step="Prepare the campaign package only.",
            handler="prepare_campaign_draft",
        )
        forbidden_item = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="mystery",
            title="Run anything",
            priority="low",
            reason="Should not be allowed.",
            suggested_step="Do nothing.",
            handler="unknown_handler",
        )

        self.assertEqual(self.service._policy_classify(safe_item), "draft_only")
        self.assertEqual(self.service._policy_classify(approval_item), "approval_required")
        self.assertEqual(self.service._policy_classify(forbidden_item), "forbidden")

    async def test_internal_task_update_uses_safe_write_and_verifies(self):
        item = self.service._queue_item(
            agent="survival",
            lane="cash",
            item_type="survival_cash",
            title="Close one 24-48 hour sprint",
            priority="high",
            reason="Track internal progress safely.",
            suggested_step="Update the queue item with an execution note.",
            handler="internal_task_update",
        )
        cofounder_state.upsert_queue_items([item])

        result = await self.service.run_queue_item(item["id"])

        self.assertEqual(result["receipt"]["final_status"], "done")
        self.assertEqual(result["receipt"]["policy_class"], "safe_write")
        queue_item = cofounder_state.get_queue_item(item["id"])
        self.assertEqual(queue_item["status"], "done")
        self.assertIn("execution_notes", queue_item)

    async def test_generated_draft_creates_artifact(self):
        item = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Maintain execution rhythm",
            priority="medium",
            reason="No urgent blockers.",
            suggested_step="Write an internal draft for the next move.",
            handler="generate_internal_draft",
        )
        cofounder_state.upsert_queue_items([item])

        result = await self.service.run_queue_item(item["id"])

        self.assertEqual(result["receipt"]["final_status"], "done")
        changed = result["receipt"]["files_or_records_changed"]
        self.assertTrue(changed)
        self.assertTrue(all(os.path.exists(path) for path in changed if path.startswith("/")))

    async def test_autonomous_cycle_completes_multiple_safe_items_and_writes_summary(self):
        item_one = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="system_health",
            title="Recheck system health",
            priority="high",
            reason="Safe read-only task.",
            suggested_step="Refresh health state.",
            handler="health_recheck",
        )
        item_two = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Prepare internal draft",
            priority="medium",
            reason="Safe draft task.",
            suggested_step="Write a planning artifact.",
            handler="generate_internal_draft",
        )
        cofounder_state.upsert_queue_items([item_one, item_two])

        async def fake_health():
            return {"available": True, "overall_status": "healthy"}

        self.service._safe_system_health = fake_health

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_actions_per_cycle=2,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["actions_completed"], 2)
        self.assertEqual(result["summary"]["stop_reason"], "action_limit_reached")
        self.assertEqual(cofounder_state.get_queue_item(item_one["id"])["status"], "done")
        self.assertEqual(cofounder_state.get_queue_item(item_two["id"])["status"], "done")
        self.assertTrue(os.path.exists(result["artifact"]["path"]))
        summaries = cofounder_state.load_json_store("summaries")
        self.assertGreaterEqual(len(summaries), 1)
        receipts = cofounder_state.load_json_store("receipts")
        self.assertGreaterEqual(len(receipts), 2)

    async def test_autonomous_cycle_action_limit_stops_execution(self):
        items = [
            self.service._queue_item(
                agent="strategy",
                lane="strategy",
                item_type=f"daily_goal_{index}",
                title=f"Draft {index}",
                priority="medium",
                reason="Safe draft task.",
                suggested_step="Write a planning artifact.",
                handler="generate_internal_draft",
            )
            for index in range(3)
        ]
        cofounder_state.upsert_queue_items(items)

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_actions_per_cycle=1,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["actions_attempted"], 1)
        self.assertEqual(result["summary"]["stop_reason"], "action_limit_reached")
        done_count = sum(1 for item in cofounder_state.get_queue_records() if item["status"] == "done")
        self.assertEqual(done_count, 1)

    async def test_autonomous_cycle_time_limit_stops_execution(self):
        item = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Prepare internal draft",
            priority="medium",
            reason="Safe draft task.",
            suggested_step="Write a planning artifact.",
            handler="generate_internal_draft",
        )
        cofounder_state.upsert_queue_items([item])

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_cycle_seconds=0,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["stop_reason"], "cycle_time_limit_reached")
        self.assertEqual(result["summary"]["actions_attempted"], 0)
        self.assertEqual(cofounder_state.get_queue_item(item["id"])["status"], "open")

    async def test_autonomous_cycle_stops_on_approval_required_item(self):
        approval_item = self.service._queue_item(
            agent="survival",
            lane="cash",
            item_type="survival_cash",
            title="Send warm contact blast",
            priority="high",
            reason="Requires approval.",
            suggested_step="Prepare but do not send.",
            handler="prepare_outreach_batch",
        )
        safe_item = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Prepare internal draft",
            priority="medium",
            reason="Safe draft task.",
            suggested_step="Write a planning artifact.",
            handler="generate_internal_draft",
        )
        cofounder_state.upsert_queue_items([approval_item, safe_item])

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_actions_per_cycle=3,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["stop_reason"], "approval_required")
        self.assertEqual(cofounder_state.get_queue_item(approval_item["id"])["status"], "approval_required")
        self.assertEqual(cofounder_state.get_queue_item(safe_item["id"])["status"], "open")

    async def test_autonomous_cycle_stops_on_forbidden_item_without_running_handler(self):
        forbidden_item = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="mystery",
            title="Run anything",
            priority="high",
            reason="Unknown handler should stop the cycle.",
            suggested_step="Do not run this.",
            handler="unknown_handler",
        )
        safe_item = self.service._queue_item(
            agent="strategy",
            lane="strategy",
            item_type="daily_goal",
            title="Prepare internal draft",
            priority="medium",
            reason="Safe draft task.",
            suggested_step="Write a planning artifact.",
            handler="generate_internal_draft",
        )
        cofounder_state.upsert_queue_items([forbidden_item, safe_item])

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_actions_per_cycle=3,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["stop_reason"], "forbidden_item_encountered")
        self.assertEqual(cofounder_state.get_queue_item(forbidden_item["id"])["status"], "failed")
        self.assertEqual(cofounder_state.get_queue_item(safe_item["id"])["status"], "open")
        activity = cofounder_state.load_json_store("activity")
        forbidden_started = [
            event for event in activity
            if event.get("queue_item_id") == forbidden_item["id"] and event.get("event_type") == "execution_started"
        ]
        self.assertEqual(forbidden_started, [])

    async def test_autonomous_cycle_retries_transient_failure_but_does_not_loop_forever(self):
        item = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="system_health",
            title="Recheck system health",
            priority="high",
            reason="Safe read-only task.",
            suggested_step="Refresh health state.",
            handler="health_recheck",
        )
        cofounder_state.upsert_queue_items([item])

        async def fake_run(queue_item, execution_id):
            return {
                "summary": "Temporary source issue.",
                "action_taken": "Attempted health refresh.",
                "files_or_records_changed": [],
                "report": {"available": False},
            }

        async def fake_verify(queue_item, result, execution_id):
            return {"ok": False, "status": "failed", "error": "temporary unavailable source"}

        self.service._run_health_recheck = fake_run
        self.service._verify_health_recheck = fake_verify

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            max_actions_per_cycle=5,
            max_retries_per_item=1,
            cooldown_seconds=0,
        )

        self.assertEqual(result["summary"]["stop_reason"], "repeated_verification_failures")
        self.assertEqual(result["summary"]["actions_attempted"], 2)
        self.assertEqual(result["summary"]["actions_failed"], 2)

    async def test_autonomous_cycle_blocks_stuck_items(self):
        item = self.service._queue_item(
            agent="ops",
            lane="operations",
            item_type="system_health",
            title="Recheck system health",
            priority="high",
            reason="Safe read-only task.",
            suggested_step="Refresh health state.",
            handler="health_recheck",
        )
        cofounder_state.upsert_queue_items([item])
        stale_time = (datetime.now(timezone.utc) - timedelta(seconds=600)).isoformat()
        cofounder_state.update_queue_item(
            item["id"],
            {
                "status": "claimed",
                "updated_at": stale_time,
            },
        )

        result = await self.service.run_autonomous_cycle(
            refresh_planning=False,
            cooldown_seconds=0,
            stuck_age_seconds=300,
        )

        self.assertEqual(result["summary"]["items_blocked"], 1)
        self.assertEqual(cofounder_state.get_queue_item(item["id"])["status"], "blocked")


if __name__ == "__main__":
    unittest.main()
