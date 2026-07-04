# Phase 1 — SLA113 Infrastructure Foundation

> Part of the SLA113 Infrastructure Roadmap (see `INFRASTRUCTURE_RECOMMENDATIONS.md` in repo root).
> The Infrastructure Pack (see `SLA113_INFRASTRUCTURE_PACK.md`) is the platform architecture this phase builds toward.
> Status: Implementation Ready.

---

## Purpose

Phase 1 establishes the **SLA113 Infrastructure Pack** as a first-class platform capability. It moves every universe from L0 (Ad-hoc) to L1 (Protected) — automated backups, secrets management, basic monitoring, and alerting — by deploying a shared infrastructure stack that all universes consume.

**This is not per-universe infrastructure. It is a platform capability.** Every universe (Lyrica 3, Empire-1, Archisynapse, Cultura, Southern Arcade, SL Universal) consumes the same Infrastructure Pack instead of implementing infrastructure independently.

## Ecosystem Scope

Phase 1 covers **all** universes and repos in the Empire-1 / SLA113 ecosystem:

| # | Repo / Surface | Universe | Business |
|---|---|---|---|
| 1 | `Empire-1` | Empire-1 | B2B SaaS — Revenue OS, GTM Layer, Cockpit |
| 2 | `sla113` | SLA113 | Parent Runtime / Operating System — factories, engines, pipelines |
| 3 | `Lyrica3-pro` | Lyrica 3 (U1) | Creator-owned AI music platform |
| 4 | `empire1-lyrica-ecosystem` | Integration | Empire1-Lyrica integration layer, cross-universe adapters |
| 5 | `the-cultura-vibe-forge-` | Cultura Vibe Forge (U2) | Cultural intelligence and execution engine |
| 6 | `sl-universal` | SL Universal (U1) | Pulse Stream radio, Lyrica workers, streaming metadata |
| 7 | `soulfire-ecosystem` | Lyrica + SL Universal | Canon / source of truth for Lyrica and SL Universal |
| 8 | `Archisynapse-` | ArchiSynapse | Financial intelligence, payments, ledger, fraud detection |
| 9 | `EMPIRE-OS` | System | Persistent intelligence engine |
| 10 | Southern Lifestyle | Southern Lifestyle | Gaming and white-label products — arcade, tattoos, brand |
| 11 | Southern Arcade | Southern Arcade | Multiplayer games, leadersboards, white-label deployment |

**API Surfaces:**

| Surface | Domain | Purpose |
|---|---|---|
| Empire-1 API | `api.empire1.cloud` | Revenue OS, GTM, cockpit backend |
| Lyrica 3 API | `api.lyrica3.com` | Music generation, creator assets, DNA registry |
| SL Universal | `sluniversal.lyrica3.com` | Streaming, radio, worker services |
| Southern Arcade | `arcade.southernlifestyle.org` | Game lobby, multiplayer, white-label |
| SLA113 Console | `sla113.southernlifestyle.org` | Operator dashboard, factory, compliance |

**Public-Facing Surfaces:**

| Surface | Domain | Purpose |
|---|---|---|
| Empire-1 | `empire1.cloud` | Public homepage, try-revenue-os, revenue-receipt |
| Lyrica 3 | `lyrica3.com` | Public music platform |
| Southern Lifestyle | `southernlifestyle.org` | Public brand, arcade portal |

## Architecture

The Infrastructure Pack is a **first-class SLA113 platform capability** — not documentation, not a side project. It sits alongside the Game Factory, Build Pipeline, and Compliance Engine as a module that every universe consumes.

```
SLA113
├── Game Factory
├── Build Pipeline
├── Compliance Engine
├── Tenant CRUD
├── Infrastructure Pack  ← This is what Phase 1 builds
└── Universe Consumers   (Lyrica 3, Empire-1, Archisynapse, Cultura, Southern Arcade, SL Universal)
```

See [`SLA113_INFRASTRUCTURE_PACK.md`](../SLA113_INFRASTRUCTURE_PACK.md) for the full architecture.

## Current State (L0 — Ad-hoc)

- No centralized monitoring — outages are detected by users
- No automated backups — data loss is unrecoverable
- Secrets in `.env` files — no rotation, no audit
- No CI/CD beyond `git push`
- No centralized logging — debugging requires SSH
- No alerting — incidents are reactive
- No status page — users have no visibility into known issues
- Each repo/surface operates independently with no shared infrastructure

## Phase 1 Target (L1 — Protected)

By the end of Phase 1, every surface in the ecosystem will have:

- ✅ Automated backups (file + database) with tested restore procedures
- ✅ Secrets managed through Vault (no plaintext `.env` files)
- ✅ Basic monitoring (CPU, memory, disk, service health) via Prometheus + Grafana
- ✅ Uptime monitoring via Uptime Kuma (all public + API endpoints)
- ✅ Alerting via Alertmanager → Slack
- ✅ Reverse proxy with auto-TLS (Caddy) for all self-hosted surfaces
- ✅ Admin VPN (WireGuard) for secure access
- ✅ Time synchronization (Chrony) on all nodes

## Relationship to Other Documents

| Document | Role |
|---|---|
| `docs/infra/SLA113_INFRASTRUCTURE_PACK.md` | **Platform architecture** — the Infrastructure Pack as a first-class SLA113 capability |
| `docs/infra/INFRASTRUCTURE_RECOMMENDATIONS.md` | Full awesome-sysadmin analysis — all categories mapped to SLA113 |
| `docs/infra/phase-1A/` | **Phase 1A files** — hosting map, uptime targets, verification, deferred Docker templates |
| `docs/infra/phase-1/README.md` | This file — Phase 1 scope and quick-start |
| `docs/infra/phase-1/PHASE_1_IMPLEMENTATION_PLAN.md` | Per-universe implementation details (1A/1B/1C structure) |
| `docs/infra/phase-1/PHASE_1_ECOSYSTEM_INVENTORY.md` | Full inventory table with white-label + tenant isolation |
| `docs/infra/phase-1/PHASE_1_WHITE_LABEL_MODEL.md` | White-label capability model |
| `docs/infra/phase-1/PHASE_1_INVESTOR_SUMMARY.md` | Investor-facing summary |

## Guiding Principles

- **WE EVOLVE, NEVER DELETE** — new infrastructure runs alongside existing code. Nothing is removed.
- **FOSS-first** — all recommended tools are free and open-source.
- **Infrastructure is a platform capability, not a per-universe responsibility** — every universe consumes the shared Infrastructure Pack.
- **White-label by design** — the Infrastructure Pack makes every universe exportable as a branded deployment.
- **Cost-efficient** — Phase 1A cost: $0 (managed platform health endpoints). Docker stack adds ~$5-20/month when self-managed node exists.

## Implementation Structure

Phase 1 is structured as three sub-phases:

### Phase 1A — External Observability Baseline

All backends run on **managed platforms** (Railway, GCP Cloud Run, Vercel) — no self-managed node exists yet.

Phase 1A is **external endpoint monitoring** of all public domains and API health checks:

| # | What | How | Status |
|---|---|---|---|
| 1 | **Monitor public domains** | Uptime Kuma (runs on Railway/Render/any node) | Ready to deploy |
| 2 | **Monitor API health endpoints** | Uptime Kuma HTTP(s) monitors | Ready to deploy |
| 3 | **Slack alerting** | Uptime Kuma Slack webhook integration | Manual setup |

**Files:** [`docs/infra/phase-1A/`](../phase-1A/) — see `HOSTING_MAP.md` for platform mapping, `UPTIME_KUMA_TARGETS.md` for endpoint list.

**Deferred (needs self-managed node):** Prometheus, Grafana, Node Exporter, Loki, Caddy, WireGuard. Templates preserved in `docs/infra/phase-1A/` for future use.

### Phase 1B — Protection (Week 2)

6. **WireGuard VPN** — secure admin access to all servers
7. **Chrony** — NTP time sync (pre-req for audit log timestamps)
8. **BorgBackup** — file backups (hourly for critical data, daily for standard)
9. **Barman** — PostgreSQL PITR for all databases
10. **Restic** — offsite/cloud backup copies (S3-compatible target)
11. **Alertmanager → Slack** — notification channel for all alerts
12. **Vault** (or SOPS+Age) — secrets management, migrate from `.env`

### Phase 1C — SLA113 Platform (Week 3-4)

Build the Infrastructure Pack as a formal SLA113 capability:

13. **Tenant Registry** — PostgreSQL schema + CRUD API for white-label tenants
14. **White-Label Deployment** — automated tenant provisioning pipeline
15. **Deployment Verification** — 4-phase verification pipeline
16. **Incident Management** — alert routing, on-call, status pages
