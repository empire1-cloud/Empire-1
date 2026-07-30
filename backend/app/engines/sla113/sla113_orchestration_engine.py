"""
SLA113 5-Tier Orchestration Engine
==================================
The engine the orchestration router expects. Resolves a live gaming-session
context through five tiers in strict priority order:

    Tier 1  RevenueEngine     — proposes engagement/volatility to drive revenue
    Tier 2  NarrativeEngine   — picks the cinematic beat (build/near-miss/climax/cooldown)
    Tier 3  AdaptiveEngine    — adapts to real-time player state
    Tier 4  IdentityEngine    — personalizes to player history/demographic
    Tier 5  GovernanceEngine  — responsible-gaming gate. ALWAYS WINS. No override.

Design notes (honest):
  * This is DETERMINISTIC by design — gaming governance must be auditable and
    reproducible, not an LLM guess. Same context in → same decision out.
  * Governance is a hard veto: if a responsible-gaming limit trips, it overrides
    every revenue/narrative decision beneath it and the result is labeled
    governance_enforced = True with the reason in the audit trace.
  * Thresholds load from SLA113_BUILD_SPEC.yaml when present; if the spec is
    missing the engine still boots and runs on SAFE built-in defaults, and the
    audit trace records config_source so you always know which was used.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Session context (matches the router's OrchestrationRequest fields)
# ---------------------------------------------------------------------------
@dataclass
class SessionContext:
    tenant_id: str
    player_id: str
    machine_type: str = "fish"
    jurisdiction: str = "nevada_lvcc"
    session_duration_minutes: float = 0.0
    consecutive_losses: int = 0
    current_balance: float = 0.0
    buy_in_amount: float = 0.0
    spin_count: int = 0
    is_bonus_round: bool = False
    player_history: Optional[dict] = None
    demographic: Optional[dict] = None
    custom: Optional[dict] = None


@dataclass
class OrchestrationResult:
    resolved: Dict[str, Any]
    narrative_beat: str
    volatility_tier: str
    cinematic_weight: float
    governance_enforced: bool
    timestamp: float
    audit_trace: List[Dict[str, Any]] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Responsible-gaming thresholds. Spec-driven, with safe defaults.
# Stricter jurisdictions override the base caps.
# ---------------------------------------------------------------------------
_DEFAULT_LIMITS = {
    "max_session_minutes": 120.0,
    "max_consecutive_losses": 10,
    "low_balance_floor": 0.0,
    "cooldown_volatility": "low",
}
_JURISDICTION_OVERRIDES = {
    "uk_gbga":        {"max_session_minutes": 60.0,  "max_consecutive_losses": 6},
    "australia_ilga": {"max_session_minutes": 90.0,  "max_consecutive_losses": 8},
    "nevada_lvcc":    {},
}


def _load_limits(jurisdiction: str) -> Dict[str, Any]:
    limits = dict(_DEFAULT_LIMITS)
    source = "builtin_defaults"
    try:
        from ...core.build_spec_loader import get_governance_canon
        gov = get_governance_canon() or {}
        rg = gov.get("responsible_gaming", {})
        for k in ("max_session_minutes", "max_consecutive_losses", "low_balance_floor"):
            if k in rg:
                limits[k] = rg[k]
        source = "build_spec"
    except Exception:
        source = "builtin_defaults"
    limits.update(_JURISDICTION_OVERRIDES.get(jurisdiction, {}))
    limits["_source"] = source
    return limits


class SLA113Orchestrator:
    """Runs the five tiers in strict priority. Governance is a hard veto."""

    VOLATILITY_ORDER = ["low", "medium", "high"]

    def orchestrate(self, ctx: SessionContext) -> OrchestrationResult:
        trace: List[Dict[str, Any]] = []
        limits = _load_limits(ctx.jurisdiction)

        # ---- Tier 1: Revenue -------------------------------------------------
        revenue_vol = "high" if (ctx.is_bonus_round or ctx.spin_count > 50) else "medium"
        revenue_weight = 0.85 if ctx.is_bonus_round else 0.6
        trace.append({"tier": 1, "engine": "RevenueEngine",
                      "proposed": {"volatility": revenue_vol, "cinematic_weight": revenue_weight}})

        # ---- Tier 2: Narrative ----------------------------------------------
        if ctx.is_bonus_round:
            beat = "climax"
        elif ctx.spin_count == 0:
            beat = "onboarding"
        elif ctx.consecutive_losses >= 3:
            beat = "near_miss_recovery"
        else:
            beat = "build_up"
        trace.append({"tier": 2, "engine": "NarrativeEngine", "proposed": {"narrative_beat": beat}})

        # ---- Tier 3: Adaptive -----------------------------------------------
        volatility = revenue_vol
        if ctx.current_balance > 0 and ctx.buy_in_amount > 0:
            if ctx.current_balance < 0.25 * ctx.buy_in_amount:
                volatility = "low"
                trace.append({"tier": 3, "engine": "AdaptiveEngine",
                              "adjusted": {"volatility": "low"}, "reason": "balance<25% buy-in"})
            else:
                trace.append({"tier": 3, "engine": "AdaptiveEngine", "adjusted": {}})
        else:
            trace.append({"tier": 3, "engine": "AdaptiveEngine", "adjusted": {}})

        # ---- Tier 4: Identity -----------------------------------------------
        cinematic_weight = revenue_weight
        hist = ctx.player_history or {}
        if hist.get("prefers_low_stimulation"):
            cinematic_weight = min(cinematic_weight, 0.4)
            trace.append({"tier": 4, "engine": "IdentityEngine",
                          "adjusted": {"cinematic_weight": cinematic_weight},
                          "reason": "player prefers low stimulation"})
        else:
            trace.append({"tier": 4, "engine": "IdentityEngine", "adjusted": {}})

        # ---- Tier 5: Governance (ALWAYS WINS) -------------------------------
        governance_enforced = False
        gov_reasons: List[str] = []
        if ctx.session_duration_minutes >= limits["max_session_minutes"]:
            gov_reasons.append(f"session>={limits['max_session_minutes']}min")
        if ctx.consecutive_losses >= limits["max_consecutive_losses"]:
            gov_reasons.append(f"losses>={limits['max_consecutive_losses']}")
        if ctx.buy_in_amount > 0 and ctx.current_balance <= limits["low_balance_floor"]:
            gov_reasons.append("balance_depleted")

        if gov_reasons:
            governance_enforced = True
            volatility = limits["cooldown_volatility"]
            cinematic_weight = 0.2
            beat = "cooldown"
            trace.append({"tier": 5, "engine": "GovernanceEngine", "override": True,
                          "reasons": gov_reasons, "note": "Governance always wins. No override."})
        else:
            trace.append({"tier": 5, "engine": "GovernanceEngine", "override": False,
                          "reasons": []})

        trace.append({"config_source": limits["_source"], "jurisdiction": ctx.jurisdiction})

        resolved = {
            "machine_type": ctx.machine_type,
            "volatility": volatility,
            "narrative_beat": beat,
            "cinematic_weight": cinematic_weight,
            "governance_enforced": governance_enforced,
            "governance_reasons": gov_reasons,
        }
        return OrchestrationResult(
            resolved=resolved,
            narrative_beat=beat,
            volatility_tier=volatility,
            cinematic_weight=cinematic_weight,
            governance_enforced=governance_enforced,
            timestamp=round(time.time(), 3),
            audit_trace=trace,
        )


def _selftest() -> None:
    o = SLA113Orchestrator()

    r = o.orchestrate(SessionContext(tenant_id="t1", player_id="p1", spin_count=10,
                                     buy_in_amount=100, current_balance=80))
    assert r.governance_enforced is False
    assert r.volatility_tier in o.VOLATILITY_ORDER

    r2 = o.orchestrate(SessionContext(tenant_id="t1", player_id="p1", is_bonus_round=True,
                                      session_duration_minutes=200, buy_in_amount=100,
                                      current_balance=50))
    assert r2.governance_enforced is True
    assert r2.narrative_beat == "cooldown"
    assert r2.volatility_tier == "low"

    r3 = o.orchestrate(SessionContext(tenant_id="t1", player_id="p1",
                                      jurisdiction="uk_gbga", session_duration_minutes=65,
                                      buy_in_amount=100, current_balance=90))
    assert r3.governance_enforced is True

    print("SLA113 orchestration engine — self-test PASS")
    print("  normal   -> governance_enforced:", False, "| beat:", r.narrative_beat)
    print("  200min   -> governance_enforced:", r2.governance_enforced, "| beat:", r2.narrative_beat,
          "| volatility:", r2.volatility_tier, "(revenue wanted high — governance won)")
    print("  uk 65min -> governance_enforced:", r3.governance_enforced)


if __name__ == "__main__":
    _selftest()
