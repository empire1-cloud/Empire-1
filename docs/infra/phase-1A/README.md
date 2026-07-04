# Phase 1A — Foundation Observability (External Monitoring)

> Part of the SLA113 Infrastructure Pack.
> Status: **Phase 1A is live** — external uptime monitoring of all public endpoints.

---

## Correction: No Docker Stack to Deploy (Yet)

All backends run on **managed platforms** (Railway, GCP Cloud Run, Vercel) — no self-managed VPS or Proxmox node exists yet.

| Hosting | What Runs There |
|---|---|
| **Railway** | Lyrica3-pro, Cultura Vibe Forge, Archisynapse, Empire-1 (secondary) |
| **GCP Cloud Run** | Empire-1 (primary), SLA113, SL Universal |
| **Vercel** | All frontends — Lyrica3.com, Empire1.cloud, Southern Lifestyle |

See [`HOSTING_MAP.md`](HOSTING_MAP.md) for the full breakdown.

**Phase 1A now means:** External uptime monitoring of all public endpoints and API health checks. No Docker Compose, no Prometheus, no Grafana, no Node Exporter — those are deferred until a self-managed infrastructure node exists.

---

## Phase 1A Scope

| What | Status |
|---|---|
| Monitor all public domains (lyrica3.com, empire1.cloud, southernlifestyle.org) | ✅ Phase 1A action |
| Monitor all API health endpoints (api.lyrica3.com, api.empire1.cloud) | ✅ Phase 1A action |
| Monitor subdomains (arcade, sla113, sluniversal) | ✅ Phase 1A action |
| Alert via Slack when endpoints go down | ✅ Phase 1A action |
| Deploy Uptime Kuma | ✅ Phase 1A action (lightweight, can run on any node) |
| Deploy Prometheus / Grafana / Node Exporter stack | ⏳ Deferred — needs self-managed node |
| Host-level metrics (CPU, memory, disk) | ⏳ Deferred — needs self-managed node |
| Centralized log aggregation (Loki) | ⏳ Deferred — needs self-managed node |

**Key observation:** Even without a VPS, you can run **Uptime Kuma** on a lightweight node (Railway, Render, or even this dev machine) since it only does external HTTP checks. Everything else waits for self-managed infra.

---

## Files

| File | Purpose |
|---|---|
| `HOSTING_MAP.md` | Current deployment targets for all services |
| `UPTIME_KUMA_TARGETS.md` | All endpoints to monitor (10+ targets) |
| `PHASE_1A_VERIFICATION.md` | Verification checklist for endpoint monitoring |
| `docker-compose.phase1a.yml` | **Deferred** — for future self-managed node |
| `prometheus.yml` | **Deferred** — for future self-managed node |
| `GRAFANA_DASHBOARD_NOTES.md` | **Deferred** — for future self-managed node |

---

## Quick Start (Runs Anywhere)

### Option A: Run Uptime Kuma on Railway or Render

Since Uptime Kuma only does external HTTP checks, it runs fine on a managed platform:

**Railway:**
```bash
# Deploy via Railway dashboard or CLI
# Image: louislam/uptime-kuma:latest
# Port: 3001
# No build step needed — it's a Docker deploy
```

**Render:**
```bash
# Render Dashboard → New → Web Service
# Source: Docker → louislam/uptime-kuma:latest
# Port: 3001
# Plan: Free (starts sleeping, but Uptime Kuma can wake on check)
```

### Option B: Run Locally (Dev Machine)

```bash
# Requires Docker
docker run -d \
  --name sla113-uptime-kuma \
  --restart unless-stopped \
  -p 127.0.0.1:3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:latest
```

### Option C: Defer Until Self-Managed Node

Skip Phase 1A monitoring for now and use manual checks. Not recommended — you lose visibility.

---

## Recommended: Run Uptime Kuma Now (Even Without a VPS)

Even with everything on managed platforms, **uptime monitoring is valuable** — it tells you when a deployment breaks, a domain expires, or a Railway service restarts.

Single-container Uptime Kuma on Railway is the most pragmatic Phase 1A deploy. Add all 10+ monitors from `UPTIME_KUMA_TARGETS.md`. Connect Slack webhook for alerts.

---

## What's Deferred

These components stay template-only until you have a self-managed node:

| Component | Why Deferred | Prerequisite |
|---|---|---|
| **Prometheus** | Needs to scrape targets inside the network | Self-managed VPS/node |
| **Node Exporter** | Needs host-level access | Self-managed VPS/node |
| **Grafana** | Needs Prometheus as data source | Prometheus deployment |
| **Grafana dashboards** | Needs Grafana + Prometheus | All of the above |
| **Loki + Promtail** | Needs servers to run on | Self-managed VPS/node |
| **Caddy reverse proxy** | Needs a public IP to bind to | Self-managed VPS/node |
| **WireGuard VPN** | Needs a server as the VPN endpoint | Self-managed VPS/node |
