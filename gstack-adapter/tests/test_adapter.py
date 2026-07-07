"""Tests for the gstack adapter: parsers, safety boundary, API surface."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from adapter import store  # noqa: E402
from adapter.redact import redact  # noqa: E402


@pytest.fixture()
def gstack_home(tmp_path, monkeypatch):
    home = tmp_path / ".gstack"
    proj = home / "projects" / "empire-1"
    proj.mkdir(parents=True)
    monkeypatch.setenv("GSTACK_HOME", str(home))

    timeline = [
        {"skill": "review", "event": "started", "branch": "feature-billing", "session": "s1", "ts": "2026-07-07T10:00:00Z"},
        {"skill": "review", "event": "completed", "branch": "feature-billing", "session": "s1", "outcome": "success", "duration_s": "183", "ts": "2026-07-07T10:03:03Z"},
        {"skill": "qa", "event": "started", "branch": "main", "session": "s2", "ts": "2026-07-07T11:00:00Z"},
    ]
    (proj / "timeline.jsonl").write_text("\n".join(json.dumps(e) for e in timeline))

    (proj / "learnings.jsonl").write_text(
        json.dumps({"skill": "review", "type": "pitfall", "key": "n-plus-one", "insight": "watch ORM joins; api_key=supersecret123", "confidence": 8, "source": "observed", "ts": "2026-07-07T10:05:00Z"})
    )

    plans = proj / "ceo-plans"
    plans.mkdir()
    (plans / "plan-1.md").write_text("# Plan\nShip billing.\ntoken: sbp_0123456789abcdefghij\n")

    (proj / "feature-billing-reviews.jsonl").write_text(
        json.dumps({"finding": "missing null check", "severity": "P1", "ts": "2026-07-07T10:02:00Z"})
    )

    # Denylisted content that must never surface
    transcripts = home / "projects" / "empire-1" / "transcripts"
    transcripts.mkdir()
    (transcripts / "session.md").write_text("FULL CONVERSATION — must never be served")

    return home


def test_projects_listed(gstack_home):
    projects = store.list_projects()
    assert [p["slug"] for p in projects] == ["empire-1"]
    assert projects[0]["timeline_events"] == 3
    assert projects[0]["learnings"] == 1


def test_activity_sorted_desc(gstack_home):
    events = store.activity()
    assert events[0]["skill"] == "qa"
    assert all(e["project"] == "empire-1" for e in events)


def test_missions_pairing_and_empire_rule(gstack_home):
    missions = store.missions()
    by_skill = {m["skill"]: m for m in missions}
    assert by_skill["qa"]["status"] == "ACTIVE"
    assert by_skill["review"]["status"] == "RECEIPTED"
    # The Empire rule: a receipt is never auto-verified.
    assert all(m["verification"] == "pending" for m in missions)
    assert not any(m.get("status") == "VERIFIED" for m in missions)


def test_learnings_redacted(gstack_home):
    rows = store.learnings()
    assert len(rows) == 1
    assert "supersecret123" not in rows[0]["insight"]
    assert "n-plus-one" == rows[0]["key"]


def test_artifacts_indexed(gstack_home):
    arts = store.artifacts()
    assert any(a["kind"] == "ceo-plan" and a["name"] == "plan-1.md" for a in arts)


def test_artifact_content_redacted(gstack_home):
    item = store.artifact_content("empire-1", "ceo-plans/plan-1.md")
    assert "Ship billing." in item.content
    assert "sbp_0123456789abcdefghij" not in item.content


def test_evidence_from_reviews(gstack_home):
    rows = store.evidence()
    assert rows[0]["finding"] == "missing null check"
    assert rows[0]["branch"] == "feature-billing"
    assert rows[0]["receipt_type"] == "review"


def test_transcripts_never_served(gstack_home):
    # Not in the artifact index...
    assert not any("transcripts" in a["id"] for a in store.artifacts())
    # ...and direct fetch is refused.
    with pytest.raises(PermissionError):
        store.artifact_content("empire-1", "transcripts/session.md")


def test_path_traversal_blocked(gstack_home):
    with pytest.raises(PermissionError):
        store.artifact_content("empire-1", "../../gbrain-detection.json")
    with pytest.raises((PermissionError, FileNotFoundError)):
        store.artifact_content("..", "anything.md")


def test_symlink_escape_blocked(gstack_home, tmp_path):
    outside = tmp_path / "outside-secret.md"
    outside.write_text("private")
    link = store.projects_root() / "empire-1" / "ceo-plans" / "sneaky.md"
    link.symlink_to(outside)
    with pytest.raises(PermissionError):
        store.artifact_content("empire-1", "ceo-plans/sneaky.md")
    assert not any(a["name"] == "sneaky.md" for a in store.artifacts())


def test_redactor_patterns():
    samples = [
        "postgresql://postgres:hunter2@db.example.com:6543/postgres",
        "Authorization: Bearer abcdefghijklmnop1234",
        "OPENAI_API_KEY=sk-proj-abcdefghijklmnop",
        "password: correcthorsebattery",
    ]
    for sample in samples:
        cleaned = redact(sample)
        assert "hunter2" not in cleaned
        assert "correcthorsebattery" not in cleaned or "[REDACTED]" in cleaned


def test_api_surface(gstack_home):
    from fastapi.testclient import TestClient

    from adapter.api import app

    client = TestClient(app)
    assert client.get("/api/gstack/health").json()["status"] == "ok"
    snap = client.get("/api/gstack/snapshot").json()
    assert snap["source"] == "gstack"
    assert len(snap["missions"]) == 2
    assert client.get("/api/gstack/artifacts/empire-1/transcripts%2Fsession.md/content").status_code in (403, 404)
    # No mutating routes exist at all.
    assert client.post("/api/gstack/projects").status_code == 405
