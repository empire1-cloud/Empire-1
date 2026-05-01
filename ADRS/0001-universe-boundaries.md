# ADR 0001: Universe Boundaries and Ownership

- Status: Accepted
- Date: 2026-05-01
- Owners: SLA113 Operator Core, Empire One
- Related: `SHARED/universe_registry.yaml`, `DEPLOY_MAP.md`

## Context

The platform has multiple product surfaces and control layers (SLA113, Lyrica, Southern, Empire, Omni-Agent) that were previously described inconsistently across sessions and branches. This created routing confusion, overlap in ownership language, and deployment drift.

We need one stable definition of boundaries so execution, deployment, and team communication stay aligned.

## Decision

We define universe boundaries as follows:

1. `SLA113` (U0) is the parent runtime/control plane.
   - Responsibilities: orchestration, policy, routing contracts, identity firewall, telemetry.
2. `LYRICA3` (U1) is a product surface that consumes SLA113-backed APIs.
   - Includes `SONANCE_PRO` and `SL_UNIVERSAL` as sub-universes.
3. `CULTURA_VIBE_FORGE` (U2) is the cultural operating layer.
4. `SOUTHERN` (U3) is the themed experience/arcade surface.
5. `EMPIREONE` (U4) is the enterprise SaaS surface.
6. `OMNI_AGENT` (U5) is the operator behavior OS and executes as part of the SLA113 runtime contract.
7. `BLACK_BOX_REGISTRY` (U10) is the engine vault and version governance layer.

## Operational Rules

1. `SHARED/universe_registry.yaml` is the single source of truth for universe ownership and service/domain bindings.
2. Any boundary change requires:
   - PR update
   - registry update
   - `DEPLOY_MAP.md` update
   - post-change verification evidence
3. Unknown host fallback behavior is governed by registry routing rules, not ad-hoc assumptions.

## Consequences

### Positive

- Reduces product identity drift between teams and agents.
- Prevents accidental cross-surface deployments.
- Makes ownership auditable and explicit.

### Trade-offs

- Boundary changes require more disciplined PR updates.
- Temporary experimentation must still conform to registry change rules.

## Follow-up

1. Keep a changelog entry whenever a universe service/domain mapping changes.
2. Add CI checks later to fail if `DEPLOY_MAP.md` and `universe_registry.yaml` diverge.
