# Phase 1 Implementation Plan — Per-Repo/Surface

> Part of the SLA113 Infrastructure Roadmap.
> The Infrastructure Pack (`SLA113_INFRASTRUCTURE_PACK.md`) is the platform architecture this builds toward.
> Status: Implementation Ready.

---

## Implementation Structure

Phase 1 is divided into three sub-phases:

| Sub-Phase | Focus | Timeline | Outcome |
|---|---|---|---|
| **1A — Foundation** | Shared observability + ingress stack | Deploy now | Every universe has centralized metrics, logs, dashboards, secure ingress |
| **1B — Protection** | Backups, secrets, alerting | Week 2 | No more `.env` files, all data backed up with tested restore |
| **1C — SLA113 Platform** | Tenant Registry, white-label provisioning, verification | Week 3-4 | Infrastructure as a formal SLA113 platform capability |

**Key insight:** Every universe consumes the same Infrastructure Pack. The per-universe details below define what *each universe* needs to declare in its `infrastructure.yaml` — the actual infrastructure plumbing is shared.

---

## Universe Consumption Model

Each universe declares its infrastructure requirements in a single YAML file. The Infrastructure Pack provisions from these declarations. Example pattern:

```yaml
universe: <name>
tenant_capable: true|false
tenant_db_model: schema|database|instance

endpoints:
  - url: <public_url>
    type: public|api_health

backups:
  postgresql: { enabled: true, pitr: true, retention: 30d }
  files:
    - path: <glob_pattern>
      schedule: hourly|daily

secrets:
  - KEY_NAME
```

The sections below define what each universe's `infrastructure.yaml` should contain.

---

## 1. Empire-1

| Field | Detail |
|---|---|
| **Purpose** | B2B SaaS platform — Revenue OS, GTM Layer, Cockpit, public try flow |
| **Universe** | Empire-1 |
| **Current Deployment** | Vercel (frontend), self-hosted FastAPI + Uvicorn on VPS (backend, `server.py`, port 8001) |
| **Current Host** | Hybrid: Vercel edge + GCP Cloud Run / self-hosted VPS |
| **Monitoring Target** | Vercel deployment health, backend process (systemd), API `/api/health` response time, error rate, CPU/memory of backend process |
| **Logs Needed** | Backend access logs (`uvicorn`), application errors (Python exceptions), Vercel deployment logs (via Vercel dashboard), API 4xx/5xx rate |
| **Backup Target** | Backend JSON files (Revenue OS data, GTM layer data, leads), PostgreSQL (if configured), env config |
| **Risk Level** | **Critical** — Revenue OS and GTM layer are customer-facing; data loss = unrecoverable |
| **Owner Universe** | Empire-1 |
| **White-Label** | ✅ Revenue OS / CRM / GTM Cockpit for businesses — schema-per-tenant + `x-tenant-id` gateway enforcement |
| **Tenant Isolation** | Schema-per-tenant (PostgreSQL); per-tenant Vault path for secrets; `tenant_id` labels on all metrics/logs; MinIO bucket per tenant if file storage needed |
| **Phase-1 Action** | Deploy Uptime Kuma monitoring on `empire1.cloud` + `api.empire1.cloud/api/health`; Prometheus Node Exporter on backend VPS; BorgBackup for JSON data files; Barman if PostgreSQL in use; Vault for Stripe/Resend/API keys |

---

## 2. SLA113

| Field | Detail |
|---|---|
| **Purpose** | Parent Runtime / Operating System — game factories, build pipelines, sprite registry, compliance engine, tenant CRUD, orchestration |
| **Universe** | SLA113 |
| **Current Deployment** | Self-hosted FastAPI (`sla113/main.py` or standalone variant), MongoDB (if configured), Gunicorn + Uvicorn via systemd |
| **Current Host** | Self-hosted VPS (127.0.0.1:8001), GCP Cloud Run possible |
| **Monitoring Target** | API `/api/sla113/health` or health endpoint, MongoDB connection pool, build pipeline queue depth, systemd service status, CPU/memory |
| **Logs Needed** | FastAPI access logs, error logs, Gunicorn access/error logs, MongoDB logs, build pipeline logs (compile, deploy), systemd journal |
| **Backup Target** | MongoDB data (if configured), build artifacts (zipped deploys), deployment configs, sprite registry data, compliance rules |
| **Risk Level** | **Critical** — SLA113 is the orchestration layer for all universes; downtime blocks all tenant operations |
| **Owner Universe** | SLA113 |
| **White-Label** | ❌ Control plane — not exported; shared by design |
| **Tenant Isolation** | N/A — orchestrates white-label tenants but is not itself tenant-deployable |
| **Phase-1 Action** | Uptime Kuma on `sla113.southernlifestyle.org` + health endpoint; Prometheus + Node Exporter; BorgBackup for build artifacts and configs; Vault for `MONGO_URL`, `GEMINI_API_KEY`, `EMERGENT_LLM_KEY` |

---

## 3. Lyrica3-pro

| Field | Detail |
|---|---|
| **Purpose** | Creator-owned AI music platform — music generation, formant engine, emotional OS, creator dashboard |
| **Universe** | Lyrica 3 (U1) |
| **Current Deployment** | Self-hosted backend (FastAPI + AI models), frontend (unknown — likely Vercel or self-hosted) |
| **Current Host** | Unknown — likely VPS or Cloud Run; see `Lyrica3-pro/deployment/` |
| **Monitoring Target** | API `/api/health` or equivalent, AI model inference latency, job queue depth (audio generation), creator dashboard availability |
| **Logs Needed** | AI generation logs (prompts, duration, success/failure), API access logs, error traces, job queue logs |
| **Backup Target** | Generated audio files → **MinIO object storage** (critical — creator assets), DNA registry → PostgreSQL, prompt/job logs → file archive or Loki, creator uploads → file system |
| **Risk Level** | **Critical** — Generated audio is creator IP; loss is unrecoverable and erodes creator trust |
| **Owner Universe** | Lyrica 3 |
| **White-Label** | ✅ Branded AI Music Studio for labels/artists — schema-per-tenant + per-tenant MinIO bucket + Vault namespace |
| **Tenant Isolation** | Schema-per-tenant (PostgreSQL); per-tenant MinIO bucket for audio assets; per-tenant Vault namespace for API/model keys; `tenant_id` labels on all metrics/logs |
| **Phase-1 Action** | Uptime Kuma on `lyrica3.com` + `api.lyrica3.com/api/health`; BorgBackup for generated audio and creator uploads (local); Restic for offsite copy; Vault for AI model API keys, cloud storage credentials |

---

## 4. empire1-lyrica-ecosystem

| Field | Detail |
|---|---|
| **Purpose** | Integration layer between Empire-1 and Lyrica 3 — cross-universe adapters, shared configs, documentation |
| **Universe** | Integration (bridges Empire-1 + Lyrica 3) |
| **Current Deployment** | GitHub repository only — likely not actively deployed as a service |
| **Current Host** | GitHub (source only); may produce shared Docker images or libraries |
| **Monitoring Target** | N/A (no production service) — monitor GitHub Actions if CI/CD is configured |
| **Logs Needed** | N/A — log CI/CD build outputs |
| **Backup Target** | Shared Lyrica/SLA113 documentation, integration configs, cross-universe adapter code (code is in GitHub — backed up by GitHub) |
| **Risk Level** | **Low** — Code-only repo; no production data |
| **Owner Universe** | Empire-1 / Lyrica 3 (shared) |
| **Phase-1 Action** | Ensure GitHub repo is included in backup policy (GitHub is already redundant); document integration touchpoints; no production infra needed |

---

## 5. the-cultura-vibe-forge- (Cultura Vibe Forge)

| Field | Detail |
|---|---|
| **Purpose** | Cultural intelligence and execution engine — cultural packs, dialect rules, Taller workshops, community engagement |
| **Universe** | Cultura Vibe Forge (U2) |
| **Current Deployment** | Likely self-hosted backend + frontend; see `the-cultura-vibe-forge-/deployment/` |
| **Current Host** | Unknown — likely VPS; possibly GCP |
| **Monitoring Target** | API health endpoint (if exists), execution engine status, community engagement metrics |
| **Logs Needed** | Execution engine workflow logs, cultural pack access logs, community interaction logs, error traces |
| **Backup Target** | Cultural packs (structured content), dialect rules, execution engine configs, Taller/workshop assets, community profiles |
| **Risk Level** | **High** — Cultural packs and dialect rules are unique IP; loss would require full recreation |
| **Owner Universe** | Cultura |
| **White-Label** | ✅ Community / Cultural Intelligence Platform — per-tenant MinIO bucket for cultural packs + Vault namespace |
| **Tenant Isolation** | Per-tenant MinIO bucket for cultural packs and workshop assets; per-tenant Vault namespace for engine configs; schema-per-tenant if PostgreSQL in use |
| **Phase-1 Action** | Uptime Kuma on public endpoint (if applicable); BorgBackup for cultural packs and configs; Vault for API keys; Barman if PostgreSQL in use |

---

## 6. sl-universal (SL Universal)

| Field | Detail |
|---|---|
| **Purpose** | Pulse Stream radio, Lyrica workers, streaming metadata, user libraries |
| **Universe** | SL Universal (U1 mode) |
| **Current Deployment** | Self-hosted backend services; see `sl-universal/` |
| **Current Host** | Unknown — likely VPS or GCP Cloud Run |
| **Monitoring Target** | Radio stream uptime, worker health, streaming metadata API, user library API |
| **Logs Needed** | Stream metadata changes, worker job logs, user activity (playlists, library state), error traces |
| **Backup Target** | Streaming metadata (track info, playlists), user libraries (saved tracks, playlists), playlist/track state (could be PostgreSQL or Redis) |
| **Risk Level** | **High** — User libraries and playlists cannot be recreated; stream metadata is ongoing operations |
| **Owner Universe** | SL Universal (under Lyrica 3 / Southern Lifestyle umbrella) |
| **White-Label** | ✅ Branded Radio / Streaming App — schema-per-tenant + per-tenant Redis namespace |
| **Tenant Isolation** | Schema-per-tenant (PostgreSQL); per-tenant Redis namespace (key prefix `tenant:{id}:`); per-tenant Vault namespace for streaming credentials |
| **Phase-1 Action** | Uptime Kuma on `sluniversal.lyrica3.com`; BorgBackup for metadata and configs; Barman if PostgreSQL in use; Vault for streaming service credentials |

---

## 7. soulfire-ecosystem

| Field | Detail |
|---|---|
| **Purpose** | Canon / source of truth for Lyrica and SL Universal — brand docs, architecture decisions, universe canon |
| **Universe** | Lyrica + SL Universal (canon layer) |
| **Current Deployment** | GitHub repository only — documentation and markdown files |
| **Current Host** | GitHub (source only) |
| **Monitoring Target** | N/A (no production service) |
| **Logs Needed** | N/A |
| **Backup Target** | Canonical documentation (backed up by GitHub) |
| **Risk Level** | **Low** — Code/docs only; no production data |
| **Owner Universe** | Lyrica 3 / SL Universal |
| **Phase-1 Action** | Ensure GitHub repo is in backup policy; no production infra needed |

---

## 8. Archisynapse-

| Field | Detail |
|---|---|
| **Purpose** | Financial intelligence — payments, ledger, fraud detection, merchant/API key management |
| **Universe** | ArchiSynapse |
| **Current Deployment** | Self-hosted backend; see `Archisynapse-/` |
| **Current Host** | Unknown — likely VPS; requires PCI-level security consideration |
| **Monitoring Target** | Transaction API health, ledger consistency, fraud detection pipeline, payment gateway uptime, API key validation endpoints |
| **Logs Needed** | **Transaction logs** (critical — audit requirement), ledger mutations (immutable log), fraud signal payloads, merchant API key usage, error traces |
| **Backup Target** | **Ledger data** (critical — PITR via Barman mandatory), transaction logs (immutable, archived), merchant/API key records (encrypted), fraud signals (ML training data), payment gateway configurations |
| **Risk Level** | **Critical** — Financial data has compliance requirements; data loss = legal liability; fraud detection downtime = active revenue risk |
| **Owner Universe** | ArchiSynapse |
| **White-Label** | ✅ Payment Ledger / Payout / Fraud Infrastructure — instance-per-tenant (PCI compliance) + encrypted Vault |
| **Tenant Isolation** | Instance-per-tenant (separate PostgreSQL instance per PCI-compliant tenant); encrypted per-tenant Vault namespace for merchant keys; immutable per-tenant audit log archive |
| **Phase-1 Action** | Uptime Kuma on all financial endpoints; **Barman with WAL archiving** for PostgreSQL; BorgBackup for configs + logs; Restic for encrypted offsite copies; Vault for payment gateway keys, merchant secrets; Alertmanager for transaction failure alerts |

---

## 9. EMPIRE-OS

| Field | Detail |
|---|---|
| **Purpose** | Persistent intelligence engine — cross-universe knowledge, agent memory, decision support |
| **Universe** | System (cross-universe) |
| **Current Deployment** | Unknown — referenced in AGENTS.md as 17 commits; likely not actively deployed as a service |
| **Current Host** | Unknown — possibly shared with SLA113 |
| **Monitoring Target** | Unknown — depends on deployment model |
| **Logs Needed** | Unknown — depends on deployment model |
| **Backup Target** | Intelligence data, knowledge graphs, agent memory state |
| **Risk Level** | **Medium** — If deployed, intelligence data may be valuable but likely not customer-facing yet |
| **Owner Universe** | System (cross-universe) |
| **Phase-1 Action** | Investigate current deployment status; if active, add to Uptime Kuma, BorgBackup, and Vault |

---

## 10. Southern Lifestyle (Brand + Website)

| Field | Detail |
|---|---|
| **Purpose** | Brand website, arcade portal (`/arcade`), tattoo designs, cultural identity |
| **Universe** | Southern Lifestyle |
| **Current Deployment** | Part of SLA113 monorepo or standalone; likely self-hosted or static site |
| **Current Host** | Unknown — likely VPS or static hosting |
| **Monitoring Target** | Public website uptime, arcade portal availability, game lobby responsiveness |
| **Logs Needed** | Website access logs, arcade activity logs, error traces |
| **Backup Target** | Brand assets (images, logos, CSS), tattoo design files, cultural content |
| **Risk Level** | **Medium** — Brand site is public-facing but content is mostly static; arcade portal is customer-facing |
| **Owner Universe** | Southern Lifestyle |
| **Phase-1 Action** | Uptime Kuma on `southernlifestyle.org` + `arcade.southernlifestyle.org`; BorgBackup for brand assets; Vault for any sensitive configs |

---

## 11. Southern Arcade (White-Label Gaming Platform)

| Field | Detail |
|---|---|
| **Purpose** | Multiplayer games, leadersboards, white-label deployment — fish shooter, slots engine, game lobby |
| **Universe** | Southern Arcade (under Southern Lifestyle) |
| **Current Deployment** | Deployed game bundles via SLA113 build pipeline; self-hosted game servers |
| **Current Host** | Same as SLA113 — likely VPS or GCP |
| **Monitoring Target** | Game server uptime, WebSocket connection count, leaderboard latency, game session count, white-label tenant health |
| **Logs Needed** | Game session logs, multiplayer state changes, leaderboard updates, tenant deployment logs, error traces |
| **Backup Target** | Game assets (sprites, audio, config files), tenant configs (per-white-label), leaderboard snapshots, player session data |
| **Risk Level** | **High** — White-label tenants expect game uptime; leaderboard data loss undermines competitive play |
| **Owner Universe** | Southern Arcade / Southern Lifestyle |
| **White-Label** | ✅ Branded Arcade / Game Portal — per-tenant Docker Compose stack + MinIO bucket + Redis namespace |
| **Tenant Isolation** | Per-tenant Docker Compose stack (isolated containers, networks, volumes); per-tenant MinIO bucket for game assets; per-tenant Redis namespace (key prefix `tenant:{id}:`) for leaderboards/sessions; per-tenant Vault namespace for API keys |
| **Phase-1 Action** | Uptime Kuma on arcade endpoints; BorgBackup for game assets and tenant configs; Vault for tenant API keys; Prometheus for game server metrics |

---

## Shared Infrastructure (SLA113 Infrastructure Pack)

### Phase 1A — Foundation (Deploy Now)

| Service | Purpose | Deployment |
|---|---|---|
| **Uptime Kuma** | Endpoint monitoring for all public + API surfaces | Single Docker container |
| **Prometheus + Node Exporter** | Metrics collection across all hosts | Docker Compose; one node_exporter per host |
| **Grafana** | Dashboards for all metrics (per-universe, tenant-filtered) | Docker Compose; connects to Prometheus + Loki |
| **Loki + Promtail** | Centralized log aggregation for all services | Docker Compose; one promtail per host |
| **Caddy** | Reverse proxy + auto-TLS for all self-hosted surfaces | Single Docker container; Caddyfile per surface |

### Phase 1B — Protection (Week 2)

| Service | Purpose | Deployment |
|---|---|---|
| **WireGuard** | Admin VPN for secure access to all servers | WireGuard server; client configs to team |
| **Chrony** | NTP time sync (pre-req for audit logs) | Install + configure on every server |
| **BorgBackup** | File backup for all repos | cron script per host; dedup + encryption |
| **Barman** | PostgreSQL backup with PITR | Docker Compose per PostgreSQL instance |
| **Restic** | Offsite/cloud backup copies | cron script; S3-compatible target |
| **Alertmanager** | Alert routing to Slack/email | Docker Compose alongside Prometheus |
| **Vault** (or SOPS+Age) | Secrets management; no more `.env` files | Docker Compose cluster or SOPS workflow |

### Phase 1C — SLA113 Platform (Week 3-4)

| Component | What It Provides |
|---|---|
| **Tenant Registry** | PostgreSQL schema + CRUD API for all white-label tenants |
| **White-Label Deployment** | Automated provisioning pipeline: Caddy route → Vault namespace → MinIO bucket → Uptime Kuma monitor → BorgBackup job → Grafana folder → Alertmanager route |
| **Deployment Verification** | 4-phase pipeline (Provisioning → Deployment → Verification → Handover) with archived log |
| **Incident Management** | Alert routing, on-call schedules, tenant-specific status pages |
| **Health Checks** | Prometheus blackbox exporter + Consul service health for all endpoints |

---

## Architecture Reference

This implementation plan builds toward the **SLA113 Infrastructure Pack** — a first-class SLA113 platform capability. Every universe listed above consumes the Infrastructure Pack instead of implementing infrastructure independently.

See [`docs/infra/SLA113_INFRASTRUCTURE_PACK.md`](../SLA113_INFRASTRUCTURE_PACK.md) for the full platform architecture, including:

- Pack module layout (monitoring, logging, backups, secrets, proxy, etc.)
- Universe consumption model with `infrastructure.yaml` declaration pattern
- Tenant Registry data model
- White-label tenant provisioning pipeline
- Operational model (who runs it, how universes onboard)
- Comparison: before vs after Infrastructure Pack |
