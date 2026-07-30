# Empire-1 Canonical Repository Audit Protocol

**Doctrine:** WE EVOLVE. NEVER DELETE.

This protocol exists to prevent a stale checkout, wrong branch, missing adapter, or failed import from being misrepresented as proof that an Empire-1 product does not exist.

The machine-readable source of truth is [`config/canonical_repo_registry.json`](../config/canonical_repo_registry.json).

## 1. No conclusion without repository identity

Every audit finding must record:

- repository owner and name;
- visibility;
- branch, tag, or ref;
- exact commit SHA;
- expected entrypoint;
- whether the inspected lane is embedded, standalone, public baseline, private, or local-only.

A statement such as “the engine is missing” is invalid unless it says **which engine path is missing from which repository at which SHA**.

## 2. Evidence labels

Use only these labels:

- **VERIFIED OPERATIONAL** — the entrypoint and critical flow executed successfully at the recorded SHA;
- **IMPLEMENTED / UNVERIFIED** — substantive implementation exists, but current runtime execution was not proven;
- **IMPLEMENTED / FRAGMENTED** — substantive work exists in multiple valid lanes that need an adapter or reconciliation contract;
- **DEGRADED** — implementation exists, but a known defect blocks a critical path;
- **NOT AUDITED** — the canonical source has not been inspected;
- **LOCAL ONLY** — known canonical work is outside the connected GitHub default branch and must be preserved and reconciled.

Do not replace these labels with “finished,” “fake,” “empty,” “live,” or “nonexistent” unless the required evidence supports that exact conclusion.

## 3. Required audit sequence

1. Resolve the canonical registry entry.
2. Inspect every declared implementation lane.
3. Record the exact SHA for each lane.
4. Verify entrypoint existence and imports.
5. Install dependencies in a clean environment.
6. boot the service or application.
7. run the repository's tests.
8. execute at least one critical route or end-to-end flow.
9. record fallback behavior and external-provider use.
10. produce findings with file-level evidence and explicit uncertainty.

A filename search is orientation, not an audit.

## 4. Current evidence correction

### SLA113

The current evidence supports both of these statements:

1. Empire-1 has a real broken integration: `backend/app/routers/sla113_orchestration.py` imports `backend/app/engines/sla113/sla113_orchestration_engine.py`, which is absent on the audited Empire-1 `main` SHA.
2. SLA113 is not imaginary: the separate `empire1-cloud/sla113` repository contains `HybridIntelligenceCore` and execution routes for routing, strategy, planning, canon enforcement, drift monitoring, errors, status, and logs.

**Correct classification:** IMPLEMENTED / FRAGMENTED, with Empire-1 DEGRADED on the embedded orchestration path.

### Empire Revenue OS

Revenue OS contains records, receipts, pipeline tracking, checkout state, delivery receipts, analytics, and an LLM-backed Money Pipeline Engine.

The present weakness is that broad exception handling can drop the engine result while deterministic builders continue producing polished output. The product must not present deterministic fallback as though an AI execution were proven.

**Correct classification:** DEGRADED, not “no AI exists.”

Required remediation:

- add an explicit `execution_mode` field;
- record provider, model, engine status, latency, and failure reason;
- separate `ai_output` from `deterministic_fallback_output`;
- fail visibly when the customer specifically requests AI execution;
- remove Google/Gemini provider configuration;
- seal the mode and evidence into the Revenue OS receipt.

### Cultura Vibe Forge

The canonical private repository contains substantive backend and frontend code, including FastAPI, JWT authentication, MongoDB integration, LLM gateway calls, Soulfire guardrails, artifact generation, and multiple frontend pages.

**Correct classification:** IMPLEMENTED / UNVERIFIED until deployment and end-to-end runtime checks are recorded.

The statement “27 empty folders, zero lines of code, one scaffold commit” does not describe the currently connected canonical Cultura repository.

## 5. Immediate remediation order

### P0 — Make truth machine-readable

- Keep `config/canonical_repo_registry.json` current.
- Require exact repo/ref/SHA in future audits and investor-facing technical claims.
- Never infer product readiness from the umbrella repository alone.

### P0 — Repair Empire-1 SLA113 boot integrity

- Resolve the missing `sla113_orchestration_engine.py` import.
- Do not copy code blindly between repositories.
- Define an adapter contract between embedded Empire-1 SLA113 and standalone SLA113.
- Add a startup import test that fails before deployment when a registered router imports a missing module.

### P0 — Make Revenue OS execution honest

- Remove Gemini and Google API support.
- Expose AI versus deterministic mode in every response and receipt.
- Replace broad exception swallowing with a typed degraded result.
- Add tests proving AI failure cannot be represented as AI success.

### P1 — Verify Cultura runtime

- boot backend with required environment values;
- run backend and frontend tests/builds;
- execute signup, login, generate, artifact retrieval, and export flows;
- record deployment status separately from implementation status.

### P1 — Complete the ecosystem registry

Audit Lyrica 3, Archisynapse, Empire Auto Cofounder, Omni-Agent, and Southern Arcade using this same protocol. Preserve every valid lane while canonical ownership is resolved.

## 6. Non-negotiable reporting format

Every product finding must include:

```text
Product:
Repository:
Visibility:
Ref:
Commit SHA:
Entrypoint:
Implementation evidence:
Boot result:
Test result:
Critical-flow result:
Fallback behavior:
External providers:
Known blockers:
Readiness label:
Confidence:
```

Without those fields, the finding is commentary—not a full repository audit.
