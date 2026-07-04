# Commit Split Plan

## Source Used
This plan is based on:
- [DIRTY_WORKTREE_AUDIT.md](/home/shiestybizz113/projects/Empire-1/DIRTY_WORKTREE_AUDIT.md)
- the current dirty-file status in `~/projects/Empire-1`

This document does not modify, stage, delete, or commit any of the existing dirty files.

## Commit Group 1: Revenue OS / GTM Data

### Files Included
- `backend/app/data/gtm/campaigns.json`
- `backend/app/data/revenue_os/commands.json`
- `backend/app/data/revenue_os/leads.json`
- `backend/app/data/revenue_os/receipts.json`

### Files Excluded
- `backend/server.py`
- `next.config.mjs`
- `.gitignore`
- `backend/.gitignore`
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

### Risk Level
Medium

### Reason For Separate Commit
- These files look like generated or operator-driven runtime data.
- They represent Revenue OS / GTM activity, not code refactoring.
- They should not be mixed with backend behavior changes or infrastructure planning docs.
- If they are local-only artifacts, they may be better left uncommitted entirely.

### Suggested Commit Message
`Record Revenue OS and GTM runtime data updates`

### Pre-Commit Checks
- Confirm these files are intended to be committed at all.
- Confirm timestamps, test/demo entries, and public-try lead records are acceptable in git history.
- Confirm no sensitive or disposable local-only runtime data is present.
- Re-check that no code files are staged with this group.

### User Approval Required Before Commit
Yes

## Commit Group 2: Backend/API Behavior

### Files Included
- `backend/server.py`
- `next.config.mjs`

### Files Excluded
- all Revenue OS / GTM JSON data files
- `.gitignore`
- `backend/.gitignore`
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

### Risk Level
High

### Reason For Separate Commit
- These are live runtime behavior changes.
- `backend/server.py` changes API surface registration.
- `next.config.mjs` changes frontend-to-backend rewrite behavior for `/api/*`.
- These files need focused review because they can break local or deployed request routing.

### Suggested Commit Message
`Wire Revenue OS routes and align API rewrite behavior`

### Pre-Commit Checks
- Confirm the route additions are intentional and correspond to real router modules.
- Confirm the `/api/:path* -> ${BACKEND_URL}/api/:path*` rewrite is the intended production behavior.
- Manually review whether this commit should stay separate from any generated Revenue OS / GTM data.
- Re-check that no documentation-only or ignore-file changes are staged with it.

### User Approval Required Before Commit
Yes

## Commit Group 3: Config / Ignore / Deployment Hygiene

### Files Included
- `.gitignore`
- `backend/.gitignore`

### Files Excluded
- all Revenue OS / GTM JSON data files
- `backend/server.py`
- `next.config.mjs`
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

### Risk Level
Low to Medium

### Reason For Separate Commit
- These files affect repo hygiene and local environment noise, not product behavior.
- They should be reviewed together because they both deal with ignore behavior for env and local platform files.
- They should not be mixed with routing or runtime data changes.

### Suggested Commit Message
`Tighten local ignore rules for env and backend artifacts`

### Pre-Commit Checks
- Confirm `.env*` ignore behavior is desired and does not hide any intentionally tracked env examples.
- Confirm `backend/.gitignore` does not duplicate or conflict with top-level ignore expectations in a harmful way.
- Re-check that no code or runtime data files are staged with this group.

### User Approval Required Before Commit
No, but review is still recommended

## Commit Group 4: Infrastructure Docs

### Files Included
- `INFRASTRUCTURE_RECOMMENDATIONS.md`
- `docs/infra/`

### Files Excluded
- all Revenue OS / GTM JSON data files
- `backend/server.py`
- `next.config.mjs`
- `.gitignore`
- `backend/.gitignore`

### Risk Level
Medium

### Reason For Separate Commit
- These are planning and documentation artifacts, not product runtime changes.
- They include both narrative docs and implementation-ready infrastructure planning material.
- They should remain isolated from backend behavior or generated operational data.

### Suggested Commit Message
`Add SLA113 infrastructure planning and recovery docs`

### Pre-Commit Checks
- Confirm these docs are intended to live in the repo now rather than staying local-only.
- Confirm the included infrastructure configs are documentation/planning artifacts, not accidental production secrets.
- Confirm this commit contains only infra docs and infra planning files.

### User Approval Required Before Commit
No, but review is still recommended

## Recommended Commit Order
1. Config / ignore / deployment hygiene
2. Infrastructure docs
3. Backend/API behavior
4. Revenue OS / GTM data

Reason:
- Start with the lowest-risk, easiest-to-review changes.
- Keep planning/docs separate before touching runtime behavior.
- Review backend/API behavior before deciding whether related runtime data should be committed.
- Leave generated or local-looking Revenue OS / GTM data last because it has the highest chance of being intentionally excluded from git.

## Files Not To Mix
- Do not mix `backend/server.py` or `next.config.mjs` with Revenue OS / GTM JSON data.
- Do not mix `.gitignore` or `backend/.gitignore` with infrastructure planning docs.
- Do not mix infrastructure docs with backend routing changes.
- Do not mix any of these groups with canon docs such as:
  - `EMPIRE1_OS_ARCHITECTURE.md`
  - `EMPIRE_LYRICA_BOUNDARY_CONTRACT.md`
- Do not combine generated-looking runtime data with repo hygiene changes in one commit.

## Stop Conditions
- Stop if any staged set includes files from more than one commit group.
- Stop if Revenue OS / GTM data appears to include disposable test/demo-only records that should not enter history.
- Stop if backend/API behavior changes are not clearly understood.
- Stop if any file outside the listed dirty set appears in staging.
- Stop if a commit would mix docs/config planning with runtime behavior.
- Stop and re-review if the dirty set changes before staging begins.

## Bottom Line
- The audit source supports four separate commit groups:
  1. Revenue OS / GTM data
  2. Backend/API behavior
  3. Config / ignore / deployment hygiene
  4. Infrastructure docs
- The safest order is to commit hygiene and docs first, runtime behavior next, and generated-looking data last.
- Existing dirty files should remain untouched until the user intentionally stages one group at a time.
