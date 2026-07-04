# Phase 1A — Hosting Map

> Current deployment targets for all SLA113 ecosystem services.
> Phase 1A monitoring strategy is based on this map.

---

## Backend Services

| Backend | Platform | Evidence | Monitoring Method | Host-Level Access |
|---|---|---|---|---|
| **Lyrica3-pro** | **Railway** (LIVE) | README: "FastAPI Backend: LIVE on Railway (GitHub auto-deploy)"; `railway.toml` exists; `render.yaml` also present (past/alternative) | Health endpoint (`api.lyrica3.com/api/health`) | No — managed platform |
| **Cultura Vibe Forge** | **Railway** | `railway.toml` is the only deploy config | HTTP check (`the-cultura-vibe-forge--*`) | No — managed platform |
| **Archisynapse** | **Railway** | Hardcoded `archisynapse-production.up.railway.app` in source | Health endpoint (TBD) | No — managed platform |
| **Empire-1** | **GCP Cloud Run** (primary) / **Railway** (secondary) | `deploy-target.conf`: `ACTIVE_DEPLOY_TARGET=CLOUD`; full GCP deployment guide | Health endpoint (`api.empire1.cloud/api/health`) | No — managed platform |
| **SLA113** | **GCP Cloud Run** | README explicitly says Cloud Run; `DEPLOYMENT_GUIDE.md` is Cloud Run walkthrough | HTTP check (`sla113.southernlifestyle.org`) | No — managed platform |
| **SL Universal** | **Google Cloud Run** (AI Studio) | `.env.example` references Cloud Run service URL | HTTP check (`sluniversal.lyrica3.com`) | No — managed platform / AI Studio |

## Frontend / Public Surfaces

| Surface | Platform | Evidence | Monitoring Method |
|---|---|---|---|
| **Lyrica3.com** | **Vercel** | `vercel.json` at root, CRA build | HTTP check (200) |
| **Empire1.cloud** | **Vercel** | `vercel.json` at root, Next.js build | HTTP check (200) |
| **Southern Lifestyle** | **Vercel** | Astro site via `frontend/vercel.json` | HTTP check (200) |
| **Southern Arcade** | **Vercel** | (same domain family) | HTTP check (200) |

## Key Observation

**No self-managed VPS or Proxmox node currently exists.** Every backend runs on a managed platform (Railway, Cloud Run, Vercel). This means:

- ❌ No host-level metrics (CPU, memory, disk) via Node Exporter
- ❌ No Prometheus scrape targets inside the network
- ❌ No Grafana dashboards with host-level data
- ❌ No Docker Compose stack to deploy
- ✅ **External uptime monitoring works — and is the most important thing**
- ✅ Health endpoints exist on most backends

## What This Means for Phase 1A

Phase 1A is **external uptime monitoring only** — watch the public endpoints and API health checks.

The Docker observability stack (Uptime Kuma, Prometheus, Grafana, Node Exporter) is **deferred until a self-managed VPS or Proxmox node exists** — see `docker-compose.phase1a.yml` (marked "For future self-managed node").

## When Self-Managed Infrastructure Arrives

When you add a VPS, Proxmox node, or dedicated server:

1. Deploy the Docker compose stack from `docker-compose.phase1a.yml`
2. Point Node Exporter at all servers
3. Add Prometheus blackbox_exporter for deeper external checks (TLS cert expiry, response time percentiles)
4. Add Loki + Promtail for log aggregation
5. Deploy Caddy reverse proxy + WireGuard VPN for secure access
