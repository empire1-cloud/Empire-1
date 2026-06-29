# Empire-1 / Lyrica Boundary Contract

## Prime Directive
WE EVOLVE. NEVER DELETE.

## Canon
- Every repo matters.
- Every repo contains truth.
- We classify, connect, and evolve.
- We do not flatten, replace, or delete.

## Purpose
This document defines the ownership boundary between `Empire-1` / `SLA113` as the parent runtime and the `Lyrica` universe as the music platform and product ecosystem.

The goal is not to collapse the systems together. The goal is to preserve each truth lane, define what the parent runtime may observe and control, protect what it must not absorb, and identify safe integration points for future work.

## Source of Truth Lanes

| Lane | Source of Truth | What It Owns |
|---|---|---|
| Parent runtime, governance, federation | `Empire-1` / `SLA113` | Control plane, universe registry, policy, routing, orchestration, shared runtime contracts |
| Lyrica ecosystem architecture/orchestration | `empire1-lyrica-ecosystem` | Ecosystem architecture map, orchestration intent, agent memory, reports, cross-repo coordination |
| Lyrica app implementation | `Lyrica3-pro` | Product routes, APIs, creator surfaces, listening surfaces, concrete feature behavior |
| Creative AI brain | `Soulfire Engine` | Generation planning, creative reasoning, transformation logic |
| Audio execution | `Native Audio Runtime` | DSP, stems, render jobs, Demucs, MMA, PFA, artifact generation |
| Trust, rights, payouts, provenance | `Archisynapse` | DNA, VICS, royalties, fraud, payments, ledger, payout state |
| Cultural intelligence | `Cultura` | Authenticity, dialect, heritage, persona, community-signal guardrails |
| Planning and execution discipline | `Empire Auto Cofounder` | Approvals, manifests, preflight, execution safety, planning structure |

## Empire-1 / SLA113 Responsibilities
- Own the parent control plane above product repos.
- Maintain universe registry, routing identity, and federation boundaries.
- Define governance, policy, and runtime contract expectations.
- Provide shared orchestration surfaces for status, capability registration, and parent-level enforcement.
- Observe health, topology, declared capabilities, and contract compliance across connected universes.
- Protect multiverse separation so Lyrica remains a first-class universe instead of a hidden feature cluster inside the parent repo.

## Lyrica Responsibilities
- Own music-product behavior, creator workflows, listener/remix workflows, and feature semantics.
- Own Lyrica-specific UX, app routes, product APIs, and working implementation evidence.
- Own the boundary between Sonance Pro and SL Universal as product surfaces within the Lyrica universe.
- Integrate with Soulfire, Native Audio Runtime, Archisynapse, and Cultura through adapters instead of flattening those systems into generic app logic.
- Expose declared capabilities, status, and contract-level metadata upward to `Empire-1` without yielding subsystem ownership.

## What Empire-1 May Observe
- Lyrica service identity, environment identity, and declared universe registration.
- Health/status signals from Lyrica services and adapters.
- Capability manifests for product surfaces, engines, jobs, and connected subsystems.
- Policy/compliance outcomes, not private subsystem internals beyond what contracts expose.
- Job lifecycle status, queue state, artifact status, and integration state when those are intentionally surfaced.
- Provenance-ready metadata required for federation, routing, audit, and governance.

## What Empire-1 May Control
- Parent-level routing and universe registration rules.
- Global governance and policy enforcement requirements.
- Cross-universe access rules, contract admission rules, and shared runtime guardrails.
- Parent orchestration for capability discovery, parent-level status collection, and federation integrity checks.
- Explicit integration handshakes that Lyrica opts into through adapter contracts.

## What Empire-1 Must Not Own
- Lyrica product UX, creator workflow semantics, or listener-facing product decisions.
- Soulfire creative reasoning details merely because generation is orchestrated from a parent runtime.
- Native Audio Runtime internals merely because parent runtime can dispatch or observe jobs.
- Archisynapse ledger, royalty, DNA, VICS, fraud, or payout truth.
- Cultura authenticity logic, dialect constraints, heritage rules, or community-signal reasoning.
- Lyrica-specific release semantics, remix semantics, or studio-to-audience product rules.
- Hidden shadow copies of Lyrica business logic inside `Empire-1`.

## What Lyrica Must Not Reimplement
- Parent control-plane identity, federation registry, or universe-governance logic.
- Ad hoc copies of `SLA113` routing, policy, or parent orchestration behavior.
- Parent-level capability registry or multiverse admission rules.
- Standalone replacements for Archisynapse trust/ledger responsibilities.
- Standalone replacements for Cultura guardrail responsibilities.
- A fake parent runtime embedded in product code just because local orchestration utilities exist.

## Adapter Contract
The `Empire-1` to `Lyrica` relationship must remain adapter-based.

Minimum boundary shape:
- `Capability Registration`
  Lyrica declares named surfaces, services, engines, and supported contract versions to `Empire-1`.
- `Runtime Status`
  Lyrica exposes health, readiness, job-state, and degraded-mode signals that the parent runtime may consume.
- `Policy Intake`
  `Empire-1` exposes governance and boundary requirements that Lyrica consumes without re-owning them.
- `Identity and Ownership`
  Every registered surface identifies owning universe, subsystem lane, and whether it is source-of-truth, adapter, or implementation evidence.
- `Event Handoff`
  Cross-boundary events must pass as explicit contract events, not as silent ownership transfer.

Required contract posture:
- Parent runtime may coordinate.
- Lyrica may implement product behavior.
- Connected systems may remain separate truth lanes.
- Adapter presence does not transfer ownership.

## Protected Areas
- `Empire-1` governance and parent-runtime materials:
  `README.md`, `ARCHITECTURE.md`, `ADRS/`, `DEPLOY_MAP.md`, `SHARED/`, `SLA113/`, `policy.yaml`, `middleware.ts`
- `Empire-1` shared backend/runtime contract areas:
  `backend/app/core/`, `backend/app/data/`, `backend/app/routers/`, `backend/app/services/`, `deployment/`, `Dockerfile*`, `cloudbuild*.yaml`, `railway.toml`, `vercel.json`
- `Lyrica` ecosystem architecture/orchestration materials:
  `LYRICA_ARCHITECTURE.md`, `memory/`, `omni_agent/guardrails.py`, `omni_agent/state_machine.py`, `omni_agent/config.yaml`, `omni_agent/state/`, `omni_agent/reports/`
- `Lyrica` working product and runtime evidence:
  `Lyrica3-pro` routes, studio/listening pages, API entrypoints, `soulfire_kernel/`, `backend/music_engine/`, `backend/audio_engine.py`, `backend/demucs_worker.py`, `backend/mma_worker.py`, `backend/pfa_worker.py`
- Connected truth lanes that must not be flattened into either side:
  Archisynapse integration evidence, Cultura evidence, release/provenance artifacts, and parent-runtime state/evidence stores

## Anti-Flattening Rules
1. Do not treat `Empire-1` as owner of all music-product logic because it is the parent runtime.
2. Do not treat `Lyrica3-pro` as owner of the entire Lyrica ecosystem because it contains working product code.
3. Do not treat `empire1-lyrica-ecosystem` as a substitute for the running product implementation.
4. Do not treat adapters or integration files as proof of ownership transfer.
5. Do not absorb Soulfire into parent orchestration merely because the parent can observe or dispatch work.
6. Do not absorb Native Audio Runtime into app-only ownership merely because workers live near backend code today.
7. Do not absorb Archisynapse or Cultura into UI/backend glue.
8. Do not duplicate `SLA113` parent-runtime behavior inside Lyrica as shadow governance.
9. Preserve unclear areas visibly until they are classified by contract, not by deletion or collapse.

## First Safe Integration Points
- Universe/capability registration from Lyrica into `Empire-1` with explicit ownership labels.
- Runtime health/status exposure for Lyrica services, Soulfire-facing services, and audio job lanes.
- Parent-level policy intake where `Empire-1` publishes governance requirements and Lyrica consumes them as constraints.
- Explicit adapter manifests for:
  Soulfire access,
  Native Audio Runtime job dispatch,
  Archisynapse trust/payout/provenance events,
  Cultura authenticity outcomes
- Cross-repo architecture crosschecks that compare evidence paths without moving code or changing product ownership.

## Recommended Next Actions
1. Turn this boundary contract into a versioned interface table with contract name, owner, consumer, and protected fields.
2. Define the `Lyrica -> Empire-1` capability registration schema before any parent-runtime integration code expands.
3. Define the `Empire-1 -> Lyrica` policy/governance intake schema so Lyrica consumes parent rules without reimplementing them.
4. Cross-reference this contract against concrete files in `Empire-1`, `empire1-lyrica-ecosystem`, and `Lyrica3-pro` without editing product code.
5. Follow with separate contract docs for `Lyrica <-> Soulfire`, `Soulfire <-> Native Audio Runtime`, `Lyrica <-> Archisynapse`, and `Lyrica <-> Cultura`.
