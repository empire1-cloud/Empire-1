# Phase 1 Ecosystem Inventory

> Complete inventory of all repos, surfaces, and API endpoints in the Empire-1 / SLA113 ecosystem.
> Status: Planning Only — No Production Code Modified.

---

## Inventory Table

| # | Repo / Surface | Universe | Business Purpose | Deployment Surface | Critical Data | Monitoring Target | Backup Requirement | Current Risk | White-Label Candidate | Tenant Isolation | Phase-1 Action |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `Empire-1` | Empire-1 | B2B SaaS — Revenue OS, GTM Layer, public try flow, cockpit | Vercel (frontend) + self-hosted VPS (backend) | Revenue OS JSON data, GTM layer leads, user receipts, Stripe/Resend/API keys | `empire1.cloud`, `api.empire1.cloud/api/health`, backend process, error rate | BorgBackup for JSON data + configs; Barman for PostgreSQL | **Critical** — Customer-facing SaaS; data loss unrecoverable | ✅ Revenue OS / CRM / GTM Cockpit for businesses | Schema-per-tenant + `x-tenant-id` gateway enforcement | Uptime Kuma, Prometheus, Vault, BorgBackup, Barman |
| 2 | `sla113` | SLA113 | Parent OS — factories, build pipelines, sprite registry, compliance, tenant CRUD | Self-hosted VPS (Gunicorn + Uvicorn, systemd) | MongoDB data, build artifacts, sprite registry, compliance rules, tenant configs | `sla113.southernlifestyle.org`, health endpoint, MongoDB pool, queue depth | BorgBackup for artifacts + configs; MongoDB dump; Vault for env secrets | **Critical** — Orchestration layer; downtime blocks all tenants | ❌ Control plane (not exported) | N/A (control plane is shared by design) | Uptime Kuma, Prometheus, Vault, BorgBackup |
| 3 | `Lyrica3-pro` | Lyrica 3 (U1) | AI music platform — generation, formant engine, creator dashboard | Self-hosted VPS / GCP Cloud Run | Generated audio (creator IP), DNA registry, prompt/job logs, creator uploads | `lyrica3.com`, `api.lyrica3.com/api/health`, AI inference latency, job queue | BorgBackup for audio + uploads; MinIO for object storage; Restic for offsite | **Critical** — Generated audio is creator IP; unrecoverable | ✅ Branded AI Music Studio for labels/artists | Schema-per-tenant + per-tenant MinIO bucket + per-tenant Vault namespace | Uptime Kuma, Prometheus, Vault, BorgBackup, MinIO, Restic |
| 4 | `empire1-lyrica-ecosystem` | Integration (Empire-1 + Lyrica 3) | Cross-universe adapters, shared configs, integration docs | GitHub only (no production service) | Integration configs, cross-universe adapter code, shared docs | N/A — monitor GitHub Actions if CI/CD exists | GitHub is redundant; no additional backup needed | **Low** — Code-only; no production data | ❌ Internal integration layer | N/A (code-only; no tenant data) | Ensure in backup policy; document integration touchpoints |
| 5 | `the-cultura-vibe-forge-` | Cultura Vibe Forge (U2) | Cultural intelligence — cultural packs, dialect rules, execution engine, Taller workshops | Self-hosted VPS (likely) | Cultural packs (unique IP), dialect rules, engine configs, workshop assets, community profiles | API health (if exists), execution engine status | BorgBackup for cultural packs + configs; Barman for PostgreSQL | **High** — Cultural packs are unique IP; recreation cost high | ✅ Community / Cultural Intelligence Platform | Per-tenant MinIO bucket for cultural packs + per-tenant Vault namespace | Uptime Kuma, BorgBackup, Vault, Barman |
| 6 | `sl-universal` | SL Universal (U1) | Pulse Stream radio, Lyrica workers, streaming metadata, user libraries | Self-hosted VPS / GCP Cloud Run | Streaming metadata, user libraries, playlist/track state, stream configs | `sluniversal.lyrica3.com`, worker health, stream uptime | BorgBackup for metadata + configs; Barman for PostgreSQL; Restic for offsite | **High** — User libraries unrecreatable; stream is live ops | ✅ Branded Radio / Streaming App | Schema-per-tenant + per-tenant Redis namespace | Uptime Kuma, Prometheus, Vault, BorgBackup, Barman |
| 7 | `soulfire-ecosystem` | Lyrica + SL Universal | Canon — brand docs, architecture decisions, universe source of truth | GitHub only (no production service) | Canonical documentation, architecture decisions | N/A — no production service | GitHub is redundant; no additional backup needed | **Low** — Docs only; no production data | ❌ Canon/documentation layer | N/A (not a deployable service) | Ensure in backup policy |
| 8 | `Archisynapse-` | ArchiSynapse | Financial intelligence — payments, ledger, fraud detection, API key mgmt | Self-hosted VPS (PCI consideration) | Ledger data (financial records), transaction logs, merchant/API keys, fraud signals | Transaction API health, ledger consistency, fraud pipeline | **Barman PITR mandatory** for PostgreSQL; BorgBackup for configs; encrypted Restic offsite; immutable log archive | **Critical** — Financial data; legal liability if lost | ✅ Payment Ledger / Payout / Fraud Infrastructure | Instance-per-tenant (PCI compliance) + encrypted per-tenant Vault namespace | Barman PITR, Uptime Kuma, Prometheus, Vault, Alertmanager, encrypted backup |
| 9 | `EMPIRE-OS` | System (cross-universe) | Persistent intelligence engine — agent memory, decision support | Unknown — possibly shared with SLA113 | Intelligence data, knowledge graphs, agent memory state | Unknown — needs investigation | Unknown — needs investigation | **Medium** — Value depends on deployment status | ❌ Internal system (not customer-facing) | N/A — internal shared service | Investigate deployment status; if active, add to all Phase-1 services |
| 10 | Southern Lifestyle (brand) | Southern Lifestyle | Public brand website, cultural identity, tattoo designs | Static site / self-hosted | Brand assets, cultural content, tattoo design files | `southernlifestyle.org` | BorgBackup for brand assets; GitHub backup | **Medium** — Public-facing but mostly static content | ❌ Internal brand site (not exported) | N/A (not a tenant-deployable service) | Uptime Kuma, BorgBackup |
| 11 | Southern Arcade | Southern Arcade | Multiplayer games, leaderboards, white-label game deployment | Self-hosted VPS (game servers) | Game assets (sprites, audio), tenant configs, leaderboards, player sessions | `arcade.southernlifestyle.org`, WebSocket connections, leaderboard latency | BorgBackup for assets + configs; Redis RDB snapshots for leaderboards | **High** — White-label tenants; leaderboard data live | ✅ Branded Arcade / Game Portal | Per-tenant Docker Compose stack + per-tenant MinIO bucket + per-tenant Redis namespace | Uptime Kuma, Prometheus, Vault, BorgBackup, Redis backup |

---

## Endpoint Monitoring List

All endpoints below will be configured in Uptime Kuma during Phase 1.

| # | Endpoint | Type | Universe | Expected Status | Check Interval |
|---|---|---|---|---|---|
| 1 | `https://empire1.cloud` | Public web | Empire-1 | 200 | 1 min |
| 2 | `https://api.empire1.cloud/api/health` | API health | Empire-1 | 200 (JSON) | 30 sec |
| 3 | `https://lyrica3.com` | Public web | Lyrica 3 | 200 | 1 min |
| 4 | `https://api.lyrica3.com/api/health` | API health | Lyrica 3 | 200 (JSON) | 30 sec |
| 5 | `https://sluniversal.lyrica3.com` | Public web | SL Universal | 200 | 1 min |
| 6 | `https://southernlifestyle.org` | Public web | Southern Lifestyle | 200 | 1 min |
| 7 | `https://arcade.southernlifestyle.org` | Public web | Southern Arcade | 200 | 1 min |
| 8 | `https://sla113.southernlifestyle.org` | Public web | SLA113 | 200 | 1 min |

**Additional checks (Phase 2+):**
- SSL certificate expiry (all domains)
- Response time p95 < 2s (all endpoints)
- API endpoint response body validation (health endpoints must return `{"status": "ok"}`)
- DNS resolution checks for all domains
- Port checks (443, 80, 8001, etc.)

---

## Backup Matrix

| Repo / Surface | Backup Type | Tool | Frequency | Retention | Offsite |
|---|---|---|---|---|---|
| Empire-1 (backend JSON) | File | BorgBackup | Hourly | 7d daily, 4w weekly | Restic → S3 |
| Empire-1 (PostgreSQL) | DB (PITR) | Barman | Continuous WAL | 30d | Restic → S3 |
| SLA113 (build artifacts) | File | BorgBackup | Daily | 30d | Restic → S3 |
| SLA113 (MongoDB) | DB dump | mongodump + Borg | Daily | 7d | Restic → S3 |
| Lyrica3-pro (audio) | Object | MinIO replication | Real-time | 90d | MinIO multi-site |
| Lyrica3-pro (files) | File | BorgBackup | Daily | 30d | Restic → S3 |
| Lyrica3-pro (PostgreSQL) | DB (PITR) | Barman | Continuous WAL | 30d | Restic → S3 |
| cultura-vibe-forge (cultural packs) | File | BorgBackup | Daily | 30d | Restic → S3 |
| cultura-vibe-forge (PostgreSQL) | DB (PITR) | Barman | Continuous WAL | 30d | Restic → S3 |
| sl-universal (metadata) | File | BorgBackup | Daily | 30d | Restic → S3 |
| sl-universal (PostgreSQL) | DB (PITR) | Barman | Continuous WAL | 30d | Restic → S3 |
| Archisynapse (ledger) | DB (PITR) | Barman | **Continuous WAL** | **365d** | **Encrypted Restic → S3** |
| Archisynapse (transaction logs) | Immutable file | BorgBackup + append-only | Real-time | 365d (regulatory) | Encrypted Restic → S3 |
| Archisynapse (configs) | File | BorgBackup | Daily | 90d | Encrypted Restic → S3 |
| Southern Arcade (game assets) | File | BorgBackup | Daily | 30d | Restic → S3 |
| Southern Arcade (tenant configs) | File | BorgBackup | Daily | 90d | Restic → S3 |
| Southern Arcade (Redis leaderboards) | RDB snapshot | Redis BGSAVE + Borg | Hourly | 7d | Restic → S3 |
| Southern Lifestyle (brand) | File | BorgBackup | Weekly | 3mo | Restic → S3 |

---

## Risk Summary

| Risk Level | Count | Repos/Surfaces |
|---|---|---|
| **Critical** | 4 | Empire-1, SLA113, Lyrica3-pro, Archisynapse |
| **High** | 3 | cultura-vibe-forge, sl-universal, Southern Arcade |
| **Medium** | 2 | EMPIRE-OS, Southern Lifestyle (brand) |
| **Low** | 2 | empire1-lyrica-ecosystem, soulfire-ecosystem |

---

## Repo-Specific Data Risk Detail

### Lyrica3-pro
- **Generated audio files** — Each generation is unique. Loss = IP loss for creators. **Primary backup target.**
- **Creator uploads** — Samples, stems, reference tracks. Irreplaceable.
- **DNA tags** — Structured metadata marking creative signatures. Recreation would require re-analysis.
- **Prompt/job logs** — Valuable for debugging, model improvement, and attribution.

### empire1-lyrica-ecosystem
- **Shared Lyrica/SLA113 docs** — Integration specifications. Backed up by GitHub + BorgBackup.
- **Integration configs** — Cross-universe API configurations. Backed up by GitHub.
- **Cross-universe adapters** — Code bridging Empire-1 and Lyrica 3. Backed up by GitHub.

### Cultura Vibe Forge
- **Cultural packs** — Structured cultural knowledge data. **Unique IP**, high recreation cost.
- **Dialect rules** — Linguistic and cultural pattern rules. Custom-built, hard to recreate.
- **Execution engine configs** — Workflow definitions for cultural analysis. Backed up by code.
- **Taller/workshop assets** — Community workshop materials. May have variable backup priority.

### SL Universal
- **Streaming metadata** — Track info, radio schedules. Recreatable but operational load.
- **User libraries** — Saved tracks, playlists. **Cannot recreate.** User trust impact.
- **Playlist/track state** — Current streaming state. Ephemeral but valuable.

### Archisynapse
- **Ledger data** — Financial records. **Regulatory retention requirement.** PITR mandatory.
- **Transaction logs** — Audit trail. **Immutable storage required.**
- **Merchant/API key records** — Access credentials. **Must be encrypted at rest and in backup.**
- **Fraud signals** — ML training data for fraud detection. Recreatable but costly.
- **Compliance note:** Financial data backup must be encrypted and access-controlled per PCI/regulatory requirements.

### Southern Arcade
- **Game assets** — Sprites, audio, configs per game. Recreatable but large volume.
- **Tenant configs** — Per-white-label configuration. Business-critical for tenants.
- **Leaderboards** — Live competitive data. Snapshot backups mitigate total loss.
- **Player sessions** — Volume may be large; prioritize session state and recent data.

### SLA113 / Empire-1
- **Service registry** — Service discovery records. Recreatable from code + config.
- **Routing configs** — Reverse proxy and API gateway rules. Backed up by code.
- **Universe manifests** — Tenant definitions, universe configurations. **Critical for operations.**
- **Infrastructure docs** — This directory. Backed up by GitHub.

---

## Missing Repos / Surfaces Discovered

During the inventory process, the following were identified as potentially undocumented or unaccounted for:

| # | Item | Notes |
|---|---|---|
| 1 | **`voice-demo` repo** | Listed in AGENTS.md as LangChain voice agent backends for Lyrica 3. Not in the original scope. May need monitoring if deployed. |
| 2 | **`agent-skills` repo** | Not a production service, but CI/CD of skills may need monitoring. |
| 3 | **`mempalace` repo** | Python package — MCP server. If deployed as a service, needs monitoring. |
| 4 | **`last30days-skill` repo** | Market research CLI tool. Not a production service. |
| 5 | **`financial-services` repo** | Referenced in AGENTS.md. Not in original scope. Check if deployed. |
| 6 | **`EMPIRE-OS` deployment status** | Unknown. Needs team investigation to determine if it's running as a service. |
| 7 | **SL113 standalone deployment** | The `sla113_standalone/` directory structure may represent a separate deployment surface. |
| 8 | **MongoDB deployment** | Unclear which services/surfaces use MongoDB vs PostgreSQL vs JSON files. |
| 9 | **Vercel projects** | Unknown how many Vercel projects are deployed and their relationship to repos. |
| 10 | **CI/CD pipelines** | Unknown if any repo has CI/CD configured beyond the manual `git push` workflow. |

## Remaining Unknowns

1. **Exact deployment topology** — IP addresses, cloud providers, VPS specs, network topology for each surface.
2. **Database distribution** — Which services use PostgreSQL, MongoDB, JSON files, or other storage.
3. **Auth boundaries** — Whether each universe has independent auth or shares SLA113 auth.
4. **Domain DNS configuration** — Which DNS provider, which records exist for each surface.
5. **SSL/TLS management** — Current certificate provisioning (manual, Let's Encrypt, cloud LB).
6. **SSH access model** — Who has access to which servers, key management, sudo access.
7. **Cost tracking** — Monthly spend per VPS/cloud provider per surface.
8. **Alert contact matrix** — Who gets notified for which type of incident.
9. **Backup storage** — Location and capacity for backup storage (local disk, external, cloud).
10. **Regulatory requirements** — PCI/GDPR/CCPA applicability for Archisynapse and any EU user data.

## Recommended Next Step

1. **Complete the unknowns** — Schedule a 30-min walkthrough with each universe owner to fill in the `Remaining Unknowns` above.
2. **Validate endpoint list** — Confirm all 8 endpoints in the monitoring list are correct and reachable.
3. **Test backup scripts** — Deploy BorgBackup and Barman to a single non-production surface first (e.g., `empire1-lyrica-ecosystem` or a staging server).
4. **Deploy Uptime Kuma** — Quickest win; single Docker container, configures in 30 min.
5. **Deploy Prometheus + Node Exporter + Grafana** — Second quickest win; three Docker containers.
6. Begin Phase 1 implementation on the **highest-risk surfaces** first: Archisynapse (financial data) → Lyrica3-pro (creator IP) → Empire-1/SLA113 (customer-facing SaaS).
