import asyncio

from app.services.empire_os_cofounder.runtime import EmpireOSCoFounderService


def _snapshot(
    *,
    health_status: str = "healthy",
    omni_available: bool = True,
    blocked_tasks: int = 0,
    pending_tasks: int = 2,
    crm_available: bool = True,
    total_leads: int = 3,
    stale_leads: int = 0,
    gtm_available: bool = True,
    active_campaigns: int = 1,
    draft_campaigns: int = 0,
    revenue_available: bool = True,
    revenue_leads: int = 2,
    paid_leads: int = 1,
):
    return {
        "omni": {
            "available": omni_available,
            "metrics": {
                "blocked_tasks": blocked_tasks,
                "pending_tasks": pending_tasks,
            },
        },
        "system_health": {
            "available": True,
            "overall_status": health_status,
        },
        "crm": {
            "available": crm_available,
            "total_leads": total_leads,
            "stale_leads_estimate": stale_leads,
        },
        "business": {
            "available": True,
            "crm_leads": total_leads,
            "active_clients": 1,
        },
        "gtm": {
            "available": gtm_available,
            "campaign_count": active_campaigns + draft_campaigns,
            "active_campaigns": active_campaigns,
            "draft_campaigns": draft_campaigns,
        },
        "revenue_os": {
            "available": revenue_available,
            "lead_count": revenue_leads,
            "paid_leads": paid_leads,
        },
    }


def test_brief_returns_next_action_and_summary(monkeypatch):
    service = EmpireOSCoFounderService("empire")
    async def fake_snapshot():
        return _snapshot()
    monkeypatch.setattr(service, "_build_snapshot", fake_snapshot)
    monkeypatch.setattr(service, "_record_audit", lambda *args, **kwargs: None)

    brief = asyncio.run(service.get_brief())

    assert brief["status"] == "ok"
    assert brief["module"] == "empire_os_cofounder"
    assert "next_action" in brief
    assert brief["next_action"]["title"]
    assert "Execution loop" in brief["summary"]


def test_goals_prioritize_system_health(monkeypatch):
    service = EmpireOSCoFounderService("empire")
    async def fake_snapshot():
        return _snapshot(health_status="degraded", blocked_tasks=4)
    monkeypatch.setattr(service, "_build_snapshot", fake_snapshot)
    monkeypatch.setattr(service, "_record_audit", lambda *args, **kwargs: None)

    goals = asyncio.run(service.get_goals())

    assert goals["goal_count"] >= 1
    assert goals["goals"][0]["title"] == "Stabilize system health"


def test_watchdog_emits_high_signal_alerts(monkeypatch):
    service = EmpireOSCoFounderService("empire")
    async def fake_snapshot():
        return _snapshot(health_status="unhealthy", blocked_tasks=4, stale_leads=6, active_campaigns=0, draft_campaigns=3, paid_leads=0)
    monkeypatch.setattr(
        service,
        "_build_snapshot",
        fake_snapshot,
    )
    monkeypatch.setattr(service, "_record_audit", lambda *args, **kwargs: None)

    watchdog = asyncio.run(service.get_watchdog())

    assert watchdog["alert_count"] >= 4
    severities = {alert["severity"] for alert in watchdog["alerts"]}
    assert "critical" in severities or "high" in severities


def test_run_safe_loop_returns_read_only_actions(monkeypatch):
    service = EmpireOSCoFounderService("empire")
    async def fake_snapshot():
        return _snapshot(blocked_tasks=2, active_campaigns=0, paid_leads=0)
    monkeypatch.setattr(service, "_build_snapshot", fake_snapshot)
    monkeypatch.setattr(service, "_record_audit", lambda *args, **kwargs: None)

    result = asyncio.run(service.run_safe_loop())

    assert result["status"] == "ok"
    assert result["mode"] == "read_only"
    assert len(result["actions_taken"]) >= 1
    assert result["next_action"]["title"]


def test_get_audit_returns_reverse_chronological_entries(monkeypatch):
    service = EmpireOSCoFounderService("empire")
    records = [
        {"timestamp": "2026-07-03T00:00:00+00:00", "event_type": "brief", "summary": "older"},
        {"timestamp": "2026-07-03T01:00:00+00:00", "event_type": "watchdog", "summary": "newer"},
    ]
    monkeypatch.setattr("app.services.empire_os_cofounder.runtime.load_cofounder_store", lambda name: records)

    payload = asyncio.run(service.get_audit(limit=10))

    assert payload["count"] == 2
    assert payload["entries"][0]["summary"] == "newer"
    assert payload["entries"][1]["summary"] == "older"
