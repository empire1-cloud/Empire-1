"""Pure unit tests for the Empire-1 Content Growth Engine."""

from pathlib import Path
import sys

APP_ROOT = Path(__file__).resolve().parents[1] / "app"
sys.path.insert(0, str(APP_ROOT))

from routers.gtm import (  # noqa: E402
    ViralAuditPackCreate,
    _build_viral_audit_pack,
    _survival_rate,
    _validate_universe,
)


def payload(**overrides):
    values = {
        "product_universe": "Lyrica 3",
        "audited_subject": "royalty proof layers",
        "total_examined": "6",
        "survivors": "6",
        "proof_basis": "creation, VICS signing, royalty obligation, and payout receipt",
        "proof_reference": "signed $1.25 Flip royalty receipt",
        "audience": "independent creators",
        "conversion_goal": "creator pilot applications",
        "proof_strength": 90,
        "audience_relevance": 90,
        "originality": 85,
        "conversion_potential": 80,
        "universe_alignment": 100,
    }
    values.update(overrides)
    return ViralAuditPackCreate(**values)


def test_survival_rate_parses_human_numbers():
    assert _survival_rate("1,000", "25") == 2.5
    assert _survival_rate("all current claims", "only proof-backed claims") is None


def test_legacy_universe_aliases_preserve_history():
    assert _validate_universe("Empire Auto Cofounder") == "HIC / Empire Auto Cofounder"
    assert _validate_universe("San Bernardino Youth Tech") == "Founding 8 Youth Tech"


def test_verified_empire_proof_passes_publish_gate():
    pack = _build_viral_audit_pack(payload())
    assert pack["scoring"]["publish_ready"] is True
    assert pack["scoring"]["blockers"] == []
    assert pack["founder_approved"] is False


def test_unverified_claim_is_preserved_but_blocked():
    pack = _build_viral_audit_pack(payload(evidence_classification="unverified_claim"))
    assert pack["status"] == "proof_review"
    assert pack["scoring"]["publish_ready"] is False
    assert any("Unverified claims" in blocker for blocker in pack["scoring"]["blockers"])


def test_content_pack_contains_full_growth_loop():
    pack = _build_viral_audit_pack(payload())
    assert len(pack["content_assets"]["hooks"]) == 5
    assert len(pack["content_assets"]["short_posts"]) == 3
    assert len(pack["content_assets"]["carousel"]) == 7
    assert len(pack["distribution_plan"]) == 5
    assert all(day["approval_required"] for day in pack["distribution_plan"])


def test_cultura_vibe_forge_stays_a_protected_lane():
    pack = _build_viral_audit_pack(payload(product_universe="Cultura Vibe Forge"))
    assert pack["product_universe"] == "Cultura Vibe Forge"
    assert any("Keep Cultura Vibe Forge separate" in rule for rule in pack["integrity_rules"])
