# Phase 1A — Routing Recovery Plan

> After endpoint verification: 3/10 alive. 7/10 dead due to DNS/routing/backend issues, not monitoring gaps.
> Created: 2026-06-27

---

## Recovery Priority

Fix **one domain at a time**. Verify after each change.

```text
1. api.lyrica3.com        ← Lyrica's backend (main product)
2. sluniversal.lyrica3.com ← SL Universal (radio/streaming)
3. empire1.cloud + api    ← Empire B2B SaaS (already partially alive)
4. southernlifestyle.org  ← Brand + arcade
5. arcade.southernlifestyle.org
6. sla113.southernlifestyle.org
```

---

## Domain Recovery Table

| # | Domain | Current Status | Current Target | Intended Service | Intended Platform | Action Required | Needs Dashboard? | Risk |
|---|---|---|---|---|---|---|---|---|
| 1 | `api.lyrica3.com` | 503 — ghs.googlehosted.com | Google Hosted (wrong) | Lyrica3 API backend | Railway | Add custom domain in Railway dashboard; update DNS CNAME | ✅ Railway dashboard | Low — frontend is already alive, API is just unreachable |
| 2 | `sluniverslyrica3.com` | 500 — ghs.googlehosted.com | Google Hosted (wrong) | SL Universal app | TBD — needs decision | Determine if SL Universal should be same Railway backend or separate service | ❓ Needs decision | Medium — unclear if it's a separate service |
| 3 | `empire1.cloud` | 200 ✅ | Vercel (76.76.21.21) | Empire-1 public frontend | Vercel | **Already working** — do not touch | — | None |
| 4 | `api.empire1.cloud` | 000 — GCLB (130.211.29.24) | GCP Load Balancer (no healthy backends) | Empire-1 API backend | GCP Cloud Run | Check `empire1-backend` Cloud Run service; redeploy if missing; verify GCLB health | ✅ GCP Console | Medium — could affect existing frontend if rewrites break |
| 5 | `southernlifestyle.org` | 000 — GCLB (130.211.29.24) | GCP Load Balancer (no healthy backends) | Southern Lifestyle public frontend | GCP Cloud Run / Vercel? | Same GCLB issue as `api.empire1.cloud` | ✅ GCP Console | Medium |
| 6 | `www.southernlifestyle.org` | 000 — GCLB (130.211.29.24) | Same GCLB | Southern alias | Same | Same fix | ✅ GCP Console | Low |
| 7 | `arcade.southernlifestyle.org` | 000 — GCLB (130.211.29.24) | Same GCLB | Southern Arcade / game lobby | GCP Cloud Run / Vercel? | Same GCLB fix, or needs separate service | ✅ GCP Console | Medium |
| 8 | `sla113.southernlifestyle.org` | 000 — GCLB (130.211.29.24) | Same GCLB | SLA113 operator console | GCP Cloud Run | Same GCLB fix | ✅ GCP Console | Low — no live users yet |

---

## Step 1: Fix Lyrica API (`api.lyrica3.com`)

### Current State
| Item | Value |
|---|---|
| Frontend | `lyrica3.com` — 200 ✅ (Vercel) |
| Frontend API base URL | `/api` (relative proxy via CRA) |
| Backend Railway URL | `https://lyrica3-backend.up.railway.app` |
| Health endpoint | `/health` and `/api/health` defined ✅ |
| Current DNS | `api.lyrica3.com` → `ghs.googlehosted.com` (wrong — not pointing to Railway) |
| Current health check result | 503 (Google Hosted returns error because Railway isn't behind it) |
| Railway health check result | 404 (backend running but all routes return 404 — app code not serving) |
| CORS origins (Railway env) | `https://lyrica3pro.com,https://www.lyrica3pro.com` |
| Frontend production URL | `https://lyrica3pro.com` (CRA build, vercel.json deploys frontend/) |

### Two sub-problems to fix

#### Problem A: Railway backend routes return 404
The backend at `lyrica3-backend.up.railway.app` returns 404 for ALL paths including `/health` and `/api/health`. The service is deployed and running (returns Railway's 404 JSON), but the FastAPI app code is not actually serving routes.

**Possible causes:**
1. The Docker image was built from the wrong Dockerfile or wrong branch
2. The Railway environment variables don't match what the backend expects
3. The backend crashes on startup (e.g., MongoDB connection failure) and the health check fails
4. The Railway health check timeout (300s) is too short for the startup time

**Fix requires:**
- ✅ Log into Railway dashboard
- ✅ Check deployment logs for startup errors
- ✅ Verify `MONGO_URL` env var is set (backend pings MongoDB in health check — returns 503 if unreachable)
- ✅ Verify the correct Dockerfile was built (`Dockerfile` in root, not a subdirectory)
- ✅ Check if the app crashes due to missing env vars

#### Problem B: api.lyrica3.com DNS points to Google Hosted
`api.lyrica3.com` → `ghs.googlehosted.com` instead of Railway.

**Fix process (do not guess DNS target):**
1. Log into Railway dashboard → Lyrica3 backend service → Settings → Domains
2. Add custom domain: `api.lyrica3.com`
3. Copy the Railway-provided CNAME target (e.g., `lyrica3-backend.up.railway.app` or a `cname.railway.app` subdomain)
4. Log into DNS provider (likely IONOS or wherever lyrica3.com is registered)
5. Export current DNS records (screenshot before editing)
6. Add/update CNAME record: `api` → Railway-provided target
7. Wait for Railway domain verification (usually 5-15 min)
8. Verify: `curl https://api.lyrica3.com/api/health` returns 200

### Verify Lyrica Fix
```bash
curl https://api.lyrica3.com/api/health
# Expected: {"status":"ok",...}
curl https://lyrica3.com
# Expected: 200 (should continue working)
```

---

## Step 2: Fix SL Universal (`sluniversal.lyrica3.com`)

### Decision Needed
`sluniversal.lyrica3.com` currently points to `ghs.googlehosted.com` (500).

**Questions to answer:**
1. Should SL Universal run on **the same Railway backend** as Lyrica3 API (with host-based routing)?
2. Should it be a **separate service** on Railway, Cloud Run, or elsewhere?
3. Is the current Google Hosted target intentional but misconfigured?

**Safest approach:**
1. First fix the Lyrica3 API (`api.lyrica3.com` → Railway)
2. Then decide SL Universal routing
3. If it should point to the same Railway backend, configure host-based routing or a separate Railway service
4. If it stays on Google Hosted, fix the Google Hosted service configuration

**Hold on this step until Step 1 is complete.**

---

## Step 3: Fix Empire-1 API (`api.empire1.cloud`)

### Current State
| Item | Value |
|---|---|
| Frontend | `empire1.cloud` — 200 ✅ (Vercel) |
| Frontend API proxy | Next.js rewrites → `BACKEND_URL` env var → defaults to Cloud Run URL |
| Backend Cloud Run URL | `https://empire1-backend-339698334666.us-central1.run.app` |
| Health endpoint | `/api/health` defined ✅ (returns `{"status":"healthy"}`) |
| DNS | `api.empire1.cloud` → GCLB (130.211.29.24) |
| GCLB status | No healthy backends |
| GCP project | `disco-amphora-490606-n8` (us-central1) |
| Active deploy target | `CLOUD` (confirmed in `deployment/deploy-target.conf`) |

### Root Cause
The GCP Load Balancer (set up by `deployment/setup-gcp-lb.sh`) has serverless NEGs pointing to Cloud Run services `empire1-backend` and `empire1-frontend`, but those services are either:
- Not deployed (never deployed or deleted)
- Deployed but unhealthy (crashing on startup)
- Scaled to zero with no traffic to warm them up

The frontend is on Vercel (`empire1.cloud` → 76.76.21.21), but the API subdomain `api.empire1.cloud` and all `*.southernlifestyle.org` domains route through the GCLB to the Cloud Run services.

### Fix Process
1. Log into GCP Console → Cloud Run → check if `empire1-backend` and `empire1-frontend` services exist
2. If missing, redeploy:
   ```bash
   gcloud config set project disco-amphora-490606-n8
   gcloud builds submit --config cloudbuild.backend.yaml
   ```
3. If deployed but unhealthy, check logs:
   ```bash
   gcloud run services logs read empire1-backend --region us-central1
   ```
4. Verify the service URL directly:
   ```bash
   curl https://empire1-backend-339698334666.us-central1.run.app/api/health
   ```
5. If the service is healthy but the GCLB doesn't route to it, run:
   ```bash
   deployment/verify-cutover.sh
   ```
6. If the GCLB is completely broken, tear it down and recreate:
   ```bash
   deployment/teardown-gcp-lb.sh    # reads current state
   deployment/setup-gcp-lb.sh        # recreates from scratch
   ```

### Decision Needed: Stay on GCP or Migrate?

The current architecture is:
- Frontend on **Vercel** (empire1.cloud — working)
- Backend on **GCP Cloud Run** (api.empire1.cloud — broken GCLB)
- DNS at **IONOS**

Alternative: Move everything to Railway (like Lyrica3) or keep GCP but fix the load balancer.

**Recommendation:**
- ✅ Keep Vercel for frontend (it's working)
- ❓ Either fix GCP Cloud Run + GCLB (if you want to keep GCP) or move the backend to Railway (simpler, lower ops burden)

---

## Step 4–6: Fix Southern Lifestyle Domains

All `*.southernlifestyle.org` domains share the same GCLB (130.211.29.24) and the same root cause: no healthy Cloud Run backends.

These should recover automatically when the GCLB backends are fixed in Step 3, assuming the Cloud Run services for these domains also exist.

If the `southernlifestyle.org` frontend should be on **Vercel instead of Cloud Run**, then DNS needs to be updated to point to Vercel's IP (76.76.21.21) — the same as `empire1.cloud`.

---

## Quick Reference: Known Good URLs

| Service | URL | Status |
|---|---|---|
| Lyrica3 frontend (Vercel) | `https://lyrica3.com` | ✅ 200 |
| Lyrica3 frontend (Vercel alias) | `https://www.lyrica3.com` | ✅ 307 → lyrica3.com |
| Empire-1 frontend (Vercel) | `https://empire1.cloud` | ✅ 200 |
| Empire-1 backend (Cloud Run) | `https://empire1-backend-339698334666.us-central1.run.app` | ❓ Untested — needs verification |
| SLA113 backend (Cloud Run) | `https://sla113-backend-339698334666.us-central1.run.app` | ❓ Untested — needs verification |
| Lyrica3 backend (Railway) | `https://lyrica3-backend.up.railway.app` | ❌ 404 (deployed but no routes) |
| Archisynapse (Railway) | `https://archisynapse-production.up.railway.app/health` | ✅ 200 |
| Cultura (Cloud Run) | `https://cultura-backend-e2q5oemapa-uc.a.run.app` | ❌ 503 (unhealthy) |
