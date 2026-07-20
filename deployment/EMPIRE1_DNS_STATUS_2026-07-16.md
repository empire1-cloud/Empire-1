# Empire1 DNS Status — 2026-07-16

## Scope

Empire only.

Southern was intentionally left alone in this pass.

## Verified Current State

### 1. Public DNS is not resolving from this machine

Exact checks run on Thursday, July 16, 2026:

```bash
curl -I https://empire1.cloud
curl -I https://www.empire1.cloud
```

Exact result:

```text
curl: (6) Could not resolve host: empire1.cloud
curl: (6) Could not resolve host: www.empire1.cloud
```

That means the immediate blocker is DNS resolution, not frontend host routing.

### 2. Repo source of truth says Empire should live on `empire1.cloud`

From `DEPLOY_MAP.md`:

- `empire1.cloud` -> `empire1-frontend`
- `api.empire1.cloud` -> `empire1-backend`

### 3. The cutover automation in this repo is GCP HTTPS LB + IONOS DNS

Repo runbooks point to:

- frontend service: `empire1-frontend`
- backend service: `empire1-backend`
- global HTTPS load balancer
- IONOS remains registrar/DNS host

Primary scripts/docs:

- `deployment/setup-gcp-lb.sh`
- `deployment/verify-cutover.sh`
- `deployment/CUTOVER_CHECKLIST.md`
- `deployment/GCP_IONOS_MIGRATION.md`

### 4. This machine cannot execute GCP remediation directly right now

Exact check:

```bash
gcloud --version
```

Exact result:

```text
/bin/bash: line 1: gcloud: command not found
```

So this workspace can file docs and prep the runbook path, but cannot itself verify or change Cloud Run / LB / cert state until `gcloud` is installed and authenticated.

## Important Drift Found

There is a repo-level mismatch between the published domain map and the active LB automation:

### `DEPLOY_MAP.md` reserves:

- `empire1.cloud`
- `api.empire1.cloud`

### But the LB automation currently provisions cert/domains for:

- `empire1.cloud`
- `southernlifestyle.org`
- `www.southernlifestyle.org`
- `arcade.southernlifestyle.org`
- `sla113.southernlifestyle.org`

Files showing that drift:

- `deployment/setup-gcp-lb.sh`
- `deployment/verify-cutover.sh`
- `deployment/CUTOVER_CHECKLIST.md`
- `deployment/GCP_IONOS_MIGRATION.md`

So if the intended live architecture truly includes `api.empire1.cloud`, the automation/docs are incomplete today.

## Fastest Path To Get Empire Live

### A. Restore DNS for the Empire apex first

Point IONOS DNS for the Empire apex to the GCP global static IP used by the LB:

- `empire1.cloud` -> A -> `empire1-web-ip`

The static IP value is retrieved with:

```bash
gcloud compute addresses describe empire1-web-ip --global --format='value(address)'
```

### B. Stand up or verify the GCP LB stack

Run from a machine that has `gcloud` installed and authenticated:

```bash
./deployment/setup-gcp-lb.sh <PROJECT_ID>
```

Then verify:

```bash
./deployment/verify-cutover.sh <PROJECT_ID>
```

### C. Resolve the `api.empire1.cloud` decision explicitly

Choose one lane and make the docs match it:

1. Path-based API only
   - keep `/api/*` on `empire1.cloud`
   - remove or revise `api.empire1.cloud` from `DEPLOY_MAP.md`

2. Dedicated API hostname
   - add `api.empire1.cloud` to:
     - SSL cert domain list
     - LB host rules or domain mapping
     - DNS records
     - cutover verification

## Exact Next Commands

Once `gcloud` exists:

```bash
gcloud config get-value project
./deployment/setup-gcp-lb.sh <PROJECT_ID>
./deployment/verify-cutover.sh <PROJECT_ID>
```

If the Empire API must be a dedicated hostname, update the repo automation before cutover.

## Decision

As of July 16, 2026, `empire1.cloud` is not live from this machine because DNS does not resolve.

The next unblock is not React work.

The next unblock is:

1. install/auth `gcloud`
2. confirm the LB static IP
3. point IONOS DNS
4. decide whether `api.empire1.cloud` is real or should be removed from source-of-truth docs
