"""
Unit tests for SLA113 5-Tier Orchestration Engine — pure functions, no server needed.
"""
from __future__ import annotations

import pytest
from app.engines.sla113.sla113_orchestration_engine import (
    SLA113Orchestrator,
    SessionContext,
    OrchestrationResult,
    _DEFAULT_LIMITS,
)


class TestSessionContext:
    def test_defaults(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1")
        assert ctx.machine_type == "fish"
        assert ctx.jurisdiction == "nevada_lvcc"
        assert ctx.session_duration_minutes == 0.0

    def test_custom_values(self):
        ctx = SessionContext(
            tenant_id="t1", player_id="p1", machine_type="slots",
            spin_count=100, is_bonus_round=True, current_balance=500.0,
            player_history={"prefers_low_stimulation": True},
        )
        assert ctx.machine_type == "slots"
        assert ctx.spin_count == 100
        assert ctx.is_bonus_round is True
        assert ctx.player_history == {"prefers_low_stimulation": True}


class TestSLA113Orchestrator:
    """Five-tier deterministic orchestration engine — governance always wins."""

    def setup_method(self):
        self.orchestrator = SLA113Orchestrator()

    # ── Happy path: normal session, no governance trip ──────────────────

    @pytest.mark.parametrize("spin_count,bonus,expected_vol", [
        (0,   False, "medium"),
        (10,  False, "medium"),
        (100, False, "high"),
        (0,   True,  "high"),
    ])
    def test_tier1_revenue_volatility(self, spin_count, bonus, expected_vol):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             spin_count=spin_count, is_bonus_round=bonus,
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.volatility_tier == expected_vol

    @pytest.mark.parametrize("spin_count,losses,bonus,expected_beat", [
        (0,   0, False, "onboarding"),
        (10,  0, False, "build_up"),
        (10,  3, False, "near_miss_recovery"),
        (10,  5, False, "near_miss_recovery"),
        (10,  0, True,  "climax"),
    ])
    def test_tier2_narrative_beat(self, spin_count, losses, bonus, expected_beat):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             spin_count=spin_count, consecutive_losses=losses,
                             is_bonus_round=bonus,
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.narrative_beat == expected_beat

    def test_tier3_adaptive_reduces_volatility_when_balance_depleted(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             spin_count=10, buy_in_amount=100, current_balance=20)
        r = self.orchestrator.orchestrate(ctx)
        assert r.volatility_tier == "low"
        assert any(
            t["engine"] == "AdaptiveEngine" and t.get("adjusted", {}).get("volatility") == "low"
            for t in r.audit_trace
        )

    def test_tier4_identity_lowers_cinematic_weight(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             buy_in_amount=100, current_balance=80,
                             player_history={"prefers_low_stimulation": True})
        r = self.orchestrator.orchestrate(ctx)
        assert r.cinematic_weight <= 0.4

    # ── Governance: always wins ─────────────────────────────────────────

    def test_governance_not_enforced_on_normal_session(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             spin_count=10, buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is False
        assert r.narrative_beat != "cooldown"

    def test_governance_enforces_cooldown_on_long_session(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             is_bonus_round=True,
                             session_duration_minutes=200,
                             buy_in_amount=100, current_balance=50)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is True
        assert r.narrative_beat == "cooldown"
        assert r.volatility_tier == "low"

    def test_governance_enforces_cooldown_on_excessive_losses(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             consecutive_losses=15, buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is True
        assert r.narrative_beat == "cooldown"

    def test_governance_enforces_cooldown_on_depleted_balance(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             buy_in_amount=100, current_balance=0)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is True
        assert r.narrative_beat == "cooldown"

    # ── Jurisdiction overrides ──────────────────────────────────────────

    @pytest.mark.parametrize("jurisdiction,minutes,expected_gov", [
        ("nevada_lvcc", 65, False),   # base cap = 120
        ("nevada_lvcc", 130, True),
        ("uk_gbga",     65, True),    # uk cap = 60
        ("uk_gbga",     55, False),
        ("australia_ilga", 95, True), # aus cap = 90
        ("australia_ilga", 85, False),
    ])
    def test_jurisdiction_session_limits(self, jurisdiction, minutes, expected_gov):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             jurisdiction=jurisdiction,
                             session_duration_minutes=minutes,
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is expected_gov

    @pytest.mark.parametrize("jurisdiction,losses,expected_gov", [
        ("nevada_lvcc", 9,  False),    # base cap = 10
        ("nevada_lvcc", 11, True),
        ("uk_gbga",     5,  False),    # uk cap = 6
        ("uk_gbga",     7,  True),
    ])
    def test_jurisdiction_loss_limits(self, jurisdiction, losses, expected_gov):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             jurisdiction=jurisdiction,
                             consecutive_losses=losses,
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert r.governance_enforced is expected_gov

    # ── Audit trace structure ───────────────────────────────────────────

    def test_audit_trace_contains_all_five_tiers(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        engines_in_trace = [t["engine"] for t in r.audit_trace if "engine" in t]
        assert "RevenueEngine" in engines_in_trace
        assert "NarrativeEngine" in engines_in_trace
        assert "AdaptiveEngine" in engines_in_trace
        assert "IdentityEngine" in engines_in_trace
        assert "GovernanceEngine" in engines_in_trace

    def test_trace_includes_config_source_and_jurisdiction(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        last = r.audit_trace[-1]
        assert "config_source" in last
        assert "jurisdiction" in last
        assert last["jurisdiction"] == "nevada_lvcc"

    # ── OrchestrationResult structure ───────────────────────────────────

    def test_result_has_required_fields(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             buy_in_amount=100, current_balance=80)
        r = self.orchestrator.orchestrate(ctx)
        assert isinstance(r, OrchestrationResult)
        assert isinstance(r.resolved, dict)
        assert isinstance(r.timestamp, float)
        assert r.timestamp > 0
        assert "machine_type" in r.resolved
        assert "volatility" in r.resolved
        assert "narrative_beat" in r.resolved
        assert "governance_enforced" in r.resolved

    def test_governance_override_note_in_trace(self):
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             session_duration_minutes=200,
                             buy_in_amount=100, current_balance=50)
        r = self.orchestrator.orchestrate(ctx)
        gov_entries = [t for t in r.audit_trace if t.get("engine") == "GovernanceEngine"]
        assert len(gov_entries) == 1
        assert gov_entries[0].get("override") is True
        assert "Governance always wins" in gov_entries[0].get("note", "")


class TestDeterministic:
    """Same context must produce identical results."""

    def test_deterministic_output(self):
        o = SLA113Orchestrator()
        ctx = SessionContext(tenant_id="t1", player_id="p1",
                             spin_count=10, consecutive_losses=3,
                             buy_in_amount=100, current_balance=40)
        r1 = o.orchestrate(ctx)
        r2 = o.orchestrate(ctx)
        assert r1.governance_enforced == r2.governance_enforced
        assert r1.narrative_beat == r2.narrative_beat
        assert r1.volatility_tier == r2.volatility_tier
        assert r1.cinematic_weight == r2.cinematic_weight
