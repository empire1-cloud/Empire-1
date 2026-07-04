# Phase 1A — Remaining Unknowns Resolution

> Resolved during endpoint verification run: 2026-06-27
> Updated: 2026-06-27 (post-deep-investigation)

---

## Resolved

| Unknown | Resolution |
|---|---|
| **Archisynapse public health endpoint** | ✅ `https://archisynapse-production.up.railway.app/health` → 200 `{"status":"ok"}` |
| **Lyrica3 backend actual target** | ✅ `https://lyrica3-backend.up.railway.app` (Railway). Deployed but returns 404 for ALL routes — app code not serving. |
| **Lyrica3 backend health endpoint** | ✅ `/health` and `/api/health` are both defined in `backend/server.py:544-545` (pings MongoDB, returns 200 or 503). |
| **Lyrica3 frontend API base URL** | ✅ Uses relative `/api` proxy in production (CRA via Vercel). No `REACT_APP_BACKEND_URL` used at runtime — only in dev. |
| **Lyrica3 Railway CORS config** | ✅ `CORS_ORIGINS=https://lyrica3pro.com,https://www.lyrica3pro.com` (set in `railway.toml`). |
| **Empire-1 backend actual target** | ✅ GCP Cloud Run: `https://empire1-backend-339698334666.us-central1.run.app` (project `disco-amphora-490606-n8`, region `us-central1`). Health endpoints `/health` and `/api/health` defined in `backend/server.py`. |
| **Empire-1 frontend API proxy** | ✅ Next.js rewrites in `next.config.mjs` → `BACKEND_URL` env var → Cloud Run URL. API route proxy in `app/api/[...path]/route.ts` defaults to `https://empire1-backend-339698334666.us-central1.run.app`. |
| **Empire-1 deploy target** | ✅ `ACTIVE_DEPLOY_TARGET=CLOUD` (from `deployment/deploy-target.conf`). Railway config exists but is secondary. |
| **SLA113 backend actual target** | ✅ GCP Cloud Run: `https://sla113-backend-339698334666.us-central1.run.app` (same project/region). |
| **GCP Load Balancer details** | ✅ Full naming discovered: IP `130.211.29.24`, URL map `empire1-web-map`, serverless NEGs `empire1-frontend-neg` + `empire1-backend-neg`. Created by `deployment/setup-gcp-lb.sh`. |
| **DNS provider for southernlifestyle.org** | ✅ Uberspace (ns1116.ui-dns.de, ns1040.ui-dns.org, ns1122.ui-dns.biz, ns1020.ui-dns.com). |
| **DNS provider for lyrica3.com** | Uncertain — had `ghs.googlehosted.com` so likely Google Domains/Cloud DNS for the `www.lyrica3.com` and `api.lyrica3.com` records. `lyrica3.com` itself is on Vercel (76.76.21.21). |

## Partially Resolved

| Unknown | Status |
|---|---|
| **Southern Arcade backend platform** | 🔶 DNS → same GCLB (130.211.29.24). Likely Cloud Run, but unknown if a separate Cloud Run service exists or if it routes through `empire1-frontend`. Needs GCP Console check. |
| **Cultura Vibe Forge public URL** | 🔶 Cloud Run URL: `https://cultura-backend-e2q5oemapa-uc.a.run.app` (from `cloudbuild.yaml`). Returns 500/503 — unhealthy. No custom domain found — may not have a public domain assigned yet. |
| **Lyrica3 Railway backend 404 (why?)** | 🔶 Backend code defines `/health` + `/api/health` correctly. 404 suggests Docker image is wrong, env vars missing, or app crashes on startup before routes register. Needs Railway dashboard log check. |

## Still Unknown — Needs Human Confirmation

| Unknown | Why Blocked | What's Needed |
|---|---|---|
| **Lyrica3 DNS provider** | We found `ghs.googlehosted.com` for `api.lyrica3.com` but don't know who manages the DNS zone. | ✅ Determine if lyrica3.com DNS is at IONOS, Google Domains, or another provider. Check Vercel DNS dashboard. |
| **Lyrica3 Railway app crash cause** | Railway returns 404 for all routes. Backend has routes defined. Something is wrong in the deployment. | ✅ Log into Railway dashboard → view deployment logs for Lyrica3-pro. Check startup errors, missing env vars, MongoDB connection. |
| **Lyrica3 Railway health check status** | Railway `healthcheckPath = "/health"` but the health check might be failing (causing Railway to not route traffic). | ✅ Check Railway deploy status — is the service marked "healthy" or "unhealthy"? |
| **SL Universal intended platform** | Current: `ghs.googlehosted.com` (500). Should it be Railway, Cloud Run, or stay on Google Hosted? | ✅ Make a routing decision based on business intent. |
| **GCP Cloud Run service status** | Empire-1 backend/frontend Cloud Run services may be deleted, scaled to zero, or unhealthy. | ✅ Log into GCP Console (`disco-amphora-490606-n8`) → Cloud Run → check both services. |
| **GCLB backend health** | Load balancer has no healthy backends. Backend services may reference deleted NEGs or unhealthy Cloud Run services. | ✅ Check GCP Console → Network Services → Load Balancing → `empire1-web-map` → backend health. |

## Updated Hosting Map (with full detail)

| Backend | Platform | Status | DNS Target | Direct URL | Health Check |
|---|---|---|---|---|---|
| **Lyrica3-pro** | Railway | Deployed but 404 (app not serving) | ghs.googlehosted.com (WRONG) | `lyrica3-backend.up.railway.app` | `/health` defined, `/api/health` defined — but both 404 |
| **Archisynapse** | Railway | Healthy ✅ | Railway | `archisynapse-production.up.railway.app` | `/health` → 200 |
| **Cultura Vibe Forge** | GCP Cloud Run | Unhealthy ❌ | (no custom domain) | `cultura-backend-e2q5oemapa-uc.a.run.app` | 500/503 |
| **Empire-1 backend** | GCP Cloud Run | GCLB dead ❌ | GCLB (130.211.29.24) | `empire1-backend-339698334666.us-central1.run.app` | `/api/health` defined |
| **Empire-1 frontend** | Vercel + GCP Cloud Run | Vercel alive ✅, GCLB dead ❌ | Vercel (76.76.21.21) + GCLB | `empire1.cloud` (Vercel) | N/A |
| **SLA113** | GCP Cloud Run | GCLB dead ❌ | GCLB (130.211.29.24) | `sla113-backend-339698334666.us-central1.run.app` | Unknown — never tested |
| **SL Universal** | Google Hosted? | 500 ❌ | ghs.googlehosted.com | `sluniversal.lyrica3.com` | 500 |

## Recommended Actions (Priority Order)

### Immediate (fixes deployable from config/console)

1. **Check Lyrica3 Railway logs** — why does the backend return 404 for all routes?
   - Railway dashboard → Lyrica3-pro → Deployments → View logs
   - Check for: missing `MONGO_URL`, app crash, wrong Dockerfile build
   - Fix and redeploy if needed

2. **Fix Lyrica3 DNS** — point `api.lyrica3.com` to Railway
   - Add custom domain in Railway dashboard → copy CNAME target → update DNS → verify

3. **Check GCP Cloud Run services** — are `empire1-backend` and `empire1-frontend` alive?
   - GCP Console → Cloud Run → view logs
   - If missing, deploy: `gcloud builds submit --config cloudbuild.backend.yaml`
   - If unhealthy, fix the crash and redeploy

### Decision Required

4. **Decide SL Universal routing** — same Railway backend? Separate service? Stay on Google Hosted?

5. **Decide GCP vs migration** — fix GCLB/Cloud Run or move Empire backend to Railway?

### After Fixes

6. **Re-run endpoint verification** — confirm all 10 endpoints return 200
7. **Deploy Uptime Kuma** — only after verification passes
