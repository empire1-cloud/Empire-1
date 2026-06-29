# Dirty Worktree Audit

## Scope
This audit explains the current uncommitted changes in `~/projects/Empire-1` without modifying, deleting, staging, or committing any existing dirty files.

Prime constraints followed:
- No product code edited
- No files deleted
- No files moved
- No tests run
- No formatters run
- No files staged
- No commit made

## Current Dirty Paths

| Classification | Path | State | Likely Purpose | Risk Level | Related To Previous Canon Work? | Recommended Action |
|---|---|---|---|---|---|---|
| Deployment/Config | `.gitignore` | Modified | Expands env-file ignore coverage by adding `.env*` alongside existing `*.env` rules | Low | No | `review` |
| Revenue OS / GTM | `backend/app/data/gtm/campaigns.json` | Modified | Large append-only GTM campaign data set, mostly draft campaigns for `Demo Founder Studio` and test entries | Medium | No | `split commit` |
| Revenue OS / GTM | `backend/app/data/revenue_os/commands.json` | Modified | Revenue OS command log expanded with completed commands tied to receipts | Medium | No | `split commit` |
| Revenue OS / GTM | `backend/app/data/revenue_os/leads.json` | Modified | Lead intake data changed from empty to multiple public-try leads | Medium | No | `split commit` |
| Revenue OS / GTM | `backend/app/data/revenue_os/receipts.json` | Modified | Revenue receipt log expanded to match new command activity | Medium | No | `split commit` |
| Backend/API | `backend/server.py` | Modified | Registers GTM layer and Revenue OS routers; comments out removed SLA113 orchestration router | High | No | `review` |
| Deployment/Config | `next.config.mjs` | Modified | Rewrites `/api/*` to `${BACKEND_URL}/api/*` instead of `${BACKEND_URL}/*`; likely fixes frontend-to-backend proxy pathing | High | No | `review` |
| Documentation | `INFRASTRUCTURE_RECOMMENDATIONS.md` | Untracked | Standalone infrastructure strategy document for SLA113 ecosystem, monitoring, backups, secrets, and white-label ops | Low | No, but architecture-adjacent | `keep` |
| Deployment/Config | `backend/.gitignore` | Untracked | Backend-local ignore rules for `.vercel` and `.env*` | Low | No | `review` |
| Infrastructure | `docs/infra/` | Untracked | New infrastructure planning pack: ecosystem inventory, implementation plans, routing recovery, monitoring configs, docker compose, Prometheus config, verification notes | Medium | No, but architecture-adjacent | `keep` |

## Path Notes

### `.gitignore`
- Change is small and isolated: one new ignore pattern, `.env*`.
- It overlaps existing `*.env` and `*.env.*` rules, so the change may be defensive rather than essential.
- Risk is low technically, but it can hide files unexpectedly if the team relies on more specific env tracking behavior.

### `backend/app/data/gtm/campaigns.json`
- This is the largest dirty path by far.
- The diff is append-heavy and looks like generated operational data rather than hand-maintained canon or architecture work.
- Entries reference repeated `Demo Founder Studio`, `Test`, and draft GTM sequence payloads.
- Risk is medium because it is data, not code, but it is easy to accidentally bundle with unrelated backend or config changes.

### `backend/app/data/revenue_os/commands.json`
- Appears to log completed Revenue OS commands over a short time window on `2026-06-26` through `2026-06-27`.
- IDs and timestamps line up with receipt activity.
- Looks operational, likely from local/manual use of Revenue OS features.

### `backend/app/data/revenue_os/leads.json`
- Changed from `[]` to populated public-try leads.
- Data quality looks mixed: placeholder names, empty segment/channel/offer fields, and short notes.
- This looks like captured runtime/test data rather than a curated seed file.

### `backend/app/data/revenue_os/receipts.json`
- Mirrors `commands.json` closely and likely belongs in the same logical batch.
- Includes both `command` and `quick` output types.
- Strongly suggests a generated ledger/event log rather than an intentional code-side refactor.

### `backend/server.py`
- Adds router imports and includes for:
  - `app.routers.gtm_layer`
  - `app.routers.revenue_os`
  - `app.routers.revenue_receipts`
- Comments out `sla113_orchestration_router` with notes about engine deletion / game migration.
- This is a real API-surface change and should not be mixed casually with generated data files unless the team wants one feature commit covering both new routes and the produced data.

### `next.config.mjs`
- The rewrite changed from:
  - `${hybridBackendUrl}/:path*`
  to:
  - `${hybridBackendUrl}/api/:path*`
- This is a meaningful runtime behavior change because it alters how frontend `/api/*` requests are forwarded.
- Risk is high because an incorrect rewrite can break all app API calls in production or local integration.

### `INFRASTRUCTURE_RECOMMENDATIONS.md`
- Documentation-only.
- Covers broad SLA113 ecosystem infrastructure guidance, not product runtime code.
- Architecture-adjacent, but not part of the canon stack that produced `EMPIRE1_OS_ARCHITECTURE.md` or `EMPIRE_LYRICA_BOUNDARY_CONTRACT.md`.

### `backend/.gitignore`
- Small backend-local ignore file with:
  - `.vercel`
  - `.env*`
- Likely added to reduce accidental local-environment noise inside `backend/`.
- Low risk, but should be reviewed alongside the root `.gitignore` to avoid redundant or conflicting ignore strategy.

### `docs/infra/`
- Untracked infrastructure planning bundle.
- Includes both documentation and config artifacts such as:
  - `SLA113_INFRASTRUCTURE_PACK.md`
  - `phase-1/*.md`
  - `phase-1A/*.md`
  - `phase-1A/docker-compose.phase1a.yml`
  - `phase-1A/prometheus.yml`
- This is not product code, but it is more than notes; it includes implementation-ready infrastructure material.

## Recommended Commit Groups

### Group 1: Revenue OS / GTM runtime data
- `backend/app/data/gtm/campaigns.json`
- `backend/app/data/revenue_os/commands.json`
- `backend/app/data/revenue_os/leads.json`
- `backend/app/data/revenue_os/receipts.json`

Reason:
- These files move together conceptually.
- They look like generated or operator-driven data, not code refactoring.
- They should be reviewed as a data/state batch, or possibly left uncommitted if they are local-only runtime artifacts.

### Group 2: Backend/API + routing/config behavior
- `backend/server.py`
- `next.config.mjs`

Reason:
- These are actual runtime behavior changes.
- They affect API exposure and frontend proxy routing.
- They deserve focused review separate from JSON data churn.

### Group 3: Ignore-file hygiene
- `.gitignore`
- `backend/.gitignore`

Reason:
- These are repo hygiene/config changes.
- They are low-risk but should be evaluated together so ignore behavior stays intentional.

### Group 4: Infrastructure planning and recovery docs
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

Reason:
- These are documentation/infrastructure planning materials.
- They are separate from product behavior and should not be bundled with backend runtime changes.

## Overall Assessment

### What looks unrelated to previous canon work
- All dirty paths listed here appear unrelated to the prior canon-stack work that created:
  - `EMPIRE1_OS_ARCHITECTURE.md`
  - `EMPIRE_LYRICA_BOUNDARY_CONTRACT.md`
- The infrastructure docs are architecture-adjacent, but they are not part of that canon mapping or boundary-contract task.

### What needs the most caution
- `backend/server.py`
- `next.config.mjs`

These two files can change live API behavior and routing assumptions.

### What looks most like generated local/runtime data
- `backend/app/data/gtm/campaigns.json`
- `backend/app/data/revenue_os/commands.json`
- `backend/app/data/revenue_os/leads.json`
- `backend/app/data/revenue_os/receipts.json`

### What looks safest to leave untouched until intentionally grouped
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

## Conclusion
- The dirty files fall into four practical buckets: Revenue OS / GTM data, Backend/API behavior, ignore/config hygiene, and Infrastructure documentation.
- None of the listed dirty paths appear to be part of the earlier Empire-1 canon mapping or Empire ↔ Lyrica boundary-contract work.
- The cleanest next move would be to keep these changes separated by purpose and avoid mixing generated data, runtime behavior, and infrastructure planning into one commit.
