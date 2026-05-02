# ADR 0002: Domain and Service Governance

## Status
Accepted

## Date
2026-05-01

## Context
The platform has multiple product surfaces and control-plane services running on Cloud Run, with custom domains attached per audience and function.

Recent instability came from:

- domains pointing to the wrong service for the intended audience,
- frontend services deploying successfully but reading stale or conflicting API environment variables,
- runtime assumptions differing between local and production host routing.

This produced user-visible regressions (wrong homepage, login failures, mixed product surfaces).

## Decision
We adopt the following governance model for domain/service changes:

1. **Single deploy map authority**
   - `DEPLOY_MAP.md` is the source of truth for domain -> service mapping.
   - `SHARED/universe_registry.yaml` is the source of truth for universe ownership and service dependencies.

2. **Change control requirements**
   Any domain mapping change must include:
   - PR note describing reason and intended outcome,
   - update to `DEPLOY_MAP.md`,
   - update to `SHARED/universe_registry.yaml` if ownership or dependency changes,
   - verification outputs captured after deploy (mapping table + health/login checks).

3. **Environment variable contract**
   Frontend services must explicitly set:
   - `BACKEND_URL`
   - `SLA113_BACKEND_URL` (when `/api/foundry/*` or SLA113 split routing applies)
   - optional `ARCADE_EXTERNAL_URL` only for temporary redirects.

4. **Domain intent**
   - `lyrica3.com`, `www.lyrica3.com` are reserved for Lyrica public surface.
   - `api.lyrica3.com` is reserved for Lyrica API/auth surface unless explicitly unified by approved ADR/PR.
   - `empire1.cloud`, `api.empire1.cloud` are reserved for Empire One surfaces.
   - `southernlifestyle.org` and `arcade.southernlifestyle.org` are reserved for Southern public and arcade surfaces.
   - `sla113.southernlifestyle.org` is reserved for SLA113 operator entry.

5. **Verification gates (required before "published")**
   - Domain mappings match `DEPLOY_MAP.md`.
   - API health endpoint returns success on the intended domain.
   - Login endpoint returns expected auth result (token in normal mode or controlled degraded mode).
   - Homepage host renders intended surface (no fallback mismatches).

## Consequences

### Positive
- Reduces accidental cross-surface routing errors.
- Makes rollout decisions auditable and repeatable.
- Gives operators a deterministic checklist for launch and rollback.

### Tradeoffs
- Slightly more process for "quick fixes."
- Requires discipline to keep maps and registry updated alongside code changes.

## Operational Rules

1. No direct production domain remap without corresponding repo docs update.
2. No release marked complete without post-deploy verification logs.
3. If emergency hotfix is applied first, docs must be reconciled in the same day.
4. If degraded auth mode is enabled, it must be documented and tracked to removal.

## References
- `DEPLOY_MAP.md`
- `SHARED/universe_registry.yaml`
- `deployment/cloud_shell_full_throttle.sh`
- `deployment/verify_live_state.sh`
