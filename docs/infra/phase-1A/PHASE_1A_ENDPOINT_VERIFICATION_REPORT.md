# Phase 1A — Endpoint Verification Report

> Run: 2026-06-27
> Method: curl with 10s connect timeout, Google DNS (8.8.8.8) for resolution

---

## Results

| # | Endpoint | HTTP | Time | Resolved IP | Platform | Universe | Status |
|---|---|---|---|---|---|---|---|
| 1 | `https://lyrica3.com` | **200** | 0.106s | 76.76.21.21 | Vercel | Lyrica 3 | ✅ PASS |
| 2 | `https://www.lyrica3.com` | **307** | 0.111s | 76.76.21.21 (CNAME) | Vercel | Lyrica 3 | ✅ PASS (redirects to lyrica3.com) |
| 3 | `https://sluniversal.lyrica3.com` | **500** | 0.131s | ghs.googlehosted.com | Google Hosted | SL Universal | ❌ FAIL — service returns 500 |
| 4 | `https://api.lyrica3.com/api/health` | **503** | 0.126s | ghs.googlehosted.com | Google Hosted | Lyrica 3 | ❌ FAIL — service returns 503 |
| 5 | `https://empire1.cloud` | **200** | 0.115s | 76.76.21.21 | Vercel | Empire-1 | ✅ PASS |
| 6 | `https://api.empire1.cloud/api/health` | **000** | 0.073s | 130.211.29.24 | GCP Load Balancer | Empire-1 | ❌ FAIL — no healthy backends |
| 7 | `https://southernlifestyle.org` | **000** | 0.044s | 130.211.29.24 | GCP Load Balancer | Southern Lifestyle | ❌ FAIL — no healthy backends |
| 8 | `https://www.southernlifestyle.org` | **000** | 0.072s | 130.211.29.24 | GCP Load Balancer | Southern Lifestyle | ❌ FAIL — no healthy backends |
| 9 | `https://arcade.southernlifestyle.org` | **000** | 0.071s | 130.211.29.24 | GCP Load Balancer | Southern Arcade | ❌ FAIL — no healthy backends |
| 10 | `https://sla113.southernlifestyle.org` | **000** | 0.080s | 130.211.29.24 | GCP Load Balancer | SLA113 | ❌ FAIL — no healthy backends |

## Additional Backend URLs Discovered

| URL | HTTP | Notes |
|---|---|---|
| `https://archisynapse-production.up.railway.app/health` | **200** | `{"status":"ok"}` — working health endpoint |
| `https://archisynapse-production.up.railway.app/` | 404 | No root route |
| `https://lyrica3-backend.up.railway.app/` | 404 | Deployed but no routes configured |
| `https://cultura-backend-e2q5oemapa-uc.a.run.app/` | 500 | Cloud Run backend unhealthy |
| `https://cultura-backend-e2q5oemapa-uc.a.run.app/api/health` | 503 | Health endpoint unhealthy |
| `https://lyrica3-backend.up.railway.app/api/health` | 404 | Health endpoint not found |

## Summary

| Metric | Count |
|---|---|
| Endpoints tested | 10 |
| ✅ PASS | 3 (lyrica3.com, www.lyrica3.com redirect, empire1.cloud) |
| ❌ FAIL | 7 |
| Redirects found | 1 (www.lyrica3.com → lyrica3.com) |
| Backend URLs discovered | 6 (3 Railway + 1 Cloud Run + 2 Google Hosted) |

## Key Patterns

1. **All `*.southernlifestyle.org` domains + `api.empire1.cloud`** share the same GCP Load Balancer IP (130.211.29.24) — all return HTTP 000 (connection refused / no healthy backends)
2. **`api.lyrica3.com` + `sluniversal.lyrica3.com`** point to `ghs.googlehosted.com` (Google Hosted Services) — returning 503/500 instead of routing to Railway
3. **Vercel-hosted frontends** (lyrica3.com, empire1.cloud) — working correctly
4. **Railway backends** are deployed but have no routes configured or no health endpoints exposed
5. **DNS is via Uberspace** (ui-dns.de/biz/com/org) for southernlifestyle.org domains
