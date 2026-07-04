# SLA113 White-Label Capability Model

> Infrastructure requirements for exporting, branding, and deploying SLA113 universes as white-label systems.
> Status: Planning Only — No Production Code Modified.

---

## 1. The White-Label Thesis

SLA113 is not just an internal runtime — it is an **exportable control plane**. Every universe built on SLA113 can be packaged as a branded, stand-alone deployment surface for third-party tenants. The infrastructure must treat this as a first-class requirement from Phase 1, not an afterthought.

**`split_repo.sh` proves the concept:** SLA113 can be extracted as a clean, stand-alone deployable structure. The same extraction pattern applies to every universe.

### Core Principles

| Principle | Implication |
|---|---|
| **WE EVOLVE, NEVER DELETE** | White-label tenants get new deployment surfaces, never shared-state mutations. The original universe continues to run unchanged. |
| **Isolation by default** | Every tenant gets their own configs, domains, env vars, assets, analytics, and backups. No tenant can see another tenant's data. |
| **SLA113 is the parent** | The control plane orchestrates white-label lifecycle — provisioning, monitoring, backups, teardown. Tenants do not operate the control plane. |
| **Branded, not rebranded** | Each tenant gets their own domain, frontend theme, asset pipeline, and analytics identity. Not a reskin — a deployment. |

---

## 2. White-Label Candidate Universes

| Universe | White-Label Product | What the Tenant Gets | Revenue Model |
|---|---|---|---|
| **Lyrica 3** | Branded AI Music Studio | Label/studio/artist-branded AI music generation platform with DNA registry, creator dashboard, and royalty tracking | Per-tenant license + usage-based AI generation fees |
| **SL Universal** | Branded Radio / Streaming App | White-label streaming platform with Pulse Stream radio, user libraries, playlist management, discovery engine | Per-tenant license + streaming revenue share |
| **Cultura Vibe Forge** | Community / Cultural Intelligence Platform | Branded cultural workshop and intelligence platform with dialect rules, cultural packs, Taller/workshop engine, community engagement | Per-tenant license + workshop/content revenue share |
| **Southern Arcade** | Branded Arcade / Game Portal | White-label game lobby with fish shooter, slots, leaderboards, player sessions, and tenant-branded game assets | Per-tenant license + in-game revenue share |
| **Archisynapse** | Payment Ledger / Payout / Fraud Infrastructure | White-label payment processing, ledger management, merchant onboarding, fraud detection, and payout orchestration | Transaction fee + per-tenant license + fraud prevention SLA |
| **Empire-1** | Revenue OS / CRM / GTM Cockpit for Businesses | White-label Revenue OS with GTM layer, buyer scoring, campaign sequences, revenue receipts, and cockpit dashboard | Per-seat license + tiered pricing (Free/$299/$999) + white-label premium |

---

## 3. White-Label Infrastructure Requirements

Each white-label tenant deployment requires:

### 3.1 Tenant Registry

A central registry (PostgreSQL-backed) that tracks every white-label tenant:

```
tenant_id: uuid
universe: string (lyrica | sl_universal | cultura | arcade | archisynapse | empire1)
tenant_name: string
domain: string
plan_tier: string
status: string (provisioning | active | suspended | decommissioned)
created_at: timestamp
owner_contact: string
deployment_ref: string (references the deployment artifact)
```

### 3.2 Domain Mapping

Per-tenant domain routing:

| Responsibility | Tool | Detail |
|---|---|---|
| Tenant DNS | Caddy (reverse proxy) | Auto-TLS per tenant domain via Caddy's `tls` directive |
| Wildcard routing | Caddy `handle_path` | Route `*.app.sla113.io` to tenant-specific upstreams |
| Custom domain | Caddy + tenant-set CNAME | Tenant brings their own domain; we provision cert and route |
| Internal service name | Consul | `tenant-{id}-{service}.consul` for inter-service discovery |

### 3.3 Branded Frontend Assets

Each tenant gets an isolated asset pipeline:

```
/tenants/{tenant_id}/
  ├── assets/
  │   ├── logo.svg
  │   ├── favicon.ico
  │   ├── theme.json          # Colors, fonts, spacing
  │   └── brand/              # Brand-specific images, sounds
  ├── config/
  │   ├── app.config.json     # Feature flags, localization
  │   └── i18n/               # Locale overrides per tenant
  └── deployment/
      ├── Dockerfile
      ├── docker-compose.yml   # Tenant-specific compose overlay
      └── .env                 # Tenant-specific env vars
```

**Storage:** MinIO bucket per tenant (`tenant-{id}-assets`) with CDN caching.

### 3.4 Tenant-Specific Environment Configuration

Environment configuration is hierarchical. The tenant overlay merges on top of the universe base:

```
Universe Base Config (shared by all tenants of that universe)
  └── Tenant Override (per-tenant, in Vault)
       ├── TENANT_ID
       ├── TENANT_DOMAIN
       ├── DATABASE_URL       # Points to tenant-specific DB or schema
       ├── REDIS_URL          # Points to tenant-specific Redis namespace
       ├── API_KEYS           # Tenant-scoped API keys
       ├── FEATURE_FLAGS      # Per-tenant feature enable/disable
       ├── STORAGE_BACKEND    # MinIO bucket per tenant
       └── BRANDING_CONFIG    # Reference to branded asset path
```

**Secrets:** Vault with per-tenant path prefix (`secret/tenants/{tenant_id}/`).

### 3.5 Tenant-Specific Backups

Backup isolation per tenant:

| Data Type | Backup Strategy | Isolation |
|---|---|---|
| PostgreSQL | Barman with tenant-schema granularity | Per-tenant schema or separate DB |
| Object storage | MinIO bucket replication per tenant | Separate bucket per tenant |
| File assets | BorgBackup with per-tenant archive path | Separate Borg repo per tenant |
| Configs/Secrets | Vault replication per namespace | Separate Vault namespace per tenant |
| Logs | Loki with per-tenant label | `tenant_id` label on all log streams |

**Retention:** Tenant-defined (configurable in registry; default 30d).

### 3.6 Tenant-Specific Analytics Dashboards

| Audience | Dashboard | Source |
|---|---|---|
| Tenant admin | Usage metrics, revenue, active users, generation counts | Prometheus (per-tenant labels) + Grafana (tenant-filtered views) |
| SLA113 operator | Cross-tenant health, resource usage, billing aggregates | Prometheus + Grafana (admin-only unfiltered view) |
| Tenant end-users | In-app analytics via embedded Grafana panels | Grafana with `Authorization` header tenant-filtering |

Each tenant dashboard is a **Grafana folder** with data-source-level row-level security (RLS) filtering by `tenant_id` label.

### 3.7 Tenant-Specific Status Monitoring

| Layer | Tool | Per-Tenant Behavior |
|---|---|---|
| Uptime | Uptime Kuma | Per-tenant monitor group; tenant-specific status page subdomain (`status.{tenant-domain}`) |
| Health checks | Prometheus blackbox exporter | Scrape tenant endpoints with tenant_id label |
| Synthetic monitoring | Custom probes | Tenant-critical flows (signup, payment, generation) probed per tenant |
| Incident notifications | Alertmanager | Route to tenant's webhook endpoint; tenant-defined notification preferences |

### 3.8 Optional Isolated Database / Schema Per Tenant

PostgreSQL multi-tenancy options (choose per universe based on tenant density):

| Model | Isolation Level | When to Use | Tooling |
|---|---|---|---|
| **Schema per tenant** | Medium — shared instance, separate schemas | High tenant count, low-to-medium data per tenant | `CREATE SCHEMA tenant_{id}`; connection pooling via PgBouncer with `search_path` |
| **Database per tenant** | High — separate DB, shared instance | Medium tenant count, medium data per tenant | `CREATE DATABASE tenant_{id}`; connection per tenant via PgBouncer |
| **Instance per tenant** | Maximum — separate VM/container | Low tenant count, high-data or compliance-sensitive tenants | Docker Compose per tenant; full isolation; highest ops cost |
| **Hybrid** | Model chosen per universe | Archisynapse (Instance per tenant for PCI), Empire-1 (Schema per tenant for density) | Registry field `tenant_db_model` |

**Migration path:** Start with schema-per-tenant (most flexible). Escalate to instance-per-tenant for high-value or compliance-sensitive tenants.

### 3.9 API Key Isolation

| Key Type | Scope | Issuance | Revocation |
|---|---|---|---|
| Tenant admin key | Tenant's own universe instance | On tenant provisioning | Tenant admin or SLA113 operator |
| End-user keys | Within tenant's user base | On user signup via tenant's auth | User-level or tenant admin |
| Integration keys | Cross-tenant integrations | Per-request with tenant context | Tenant admin + SLA113 operator |
| SLA113 operator key | All tenants | Operator-only (never exposed to tenants) | Operator console |

**Implementation:** `x-tenant-id` header on all API requests; Kong API gateway enforces key + tenant binding; Vault stores and rotates keys per tenant.

### 3.10 Audit Logs

| Log Type | Data Captured | Retention | Storage |
|---|---|---|---|
| Tenant admin actions | Config changes, user management, billing | 365d | Loki (tenant_id label) + immutable archive |
| User activity | Feature usage, content generation, payments | 90d | Loki (tenant_id + user_id labels) |
| API access | Request/response, auth decisions, rate limiting | 90d | Loki (tenant_id + endpoint labels) |
| Infrastructure changes | Deployments, scaling, config mutations | 365d | Immutable log (append-only BorgBackup) |

**Cross-tenant audit:** SLA113 operator has unfiltered audit view. Tenants see only their own logs.

### 3.11 Deployment Verification Log

Every white-label deployment goes through a verification pipeline:

```
Phase 1: Provisioning
  ✅ Tenant registry entry created
  ✅ Vault namespace provisioned
  ✅ MinIO bucket created
  ✅ DNS record verified (Caddy auto-TLS handshake)
  ✅ PostgreSQL schema/DB created
  ✅ Tenant base config injected

Phase 2: Deployment
  ✅ Docker Compose stack deployed
  ✅ Health endpoint returns 200
  ✅ Core API endpoints respond
  ✅ Frontend assets served under tenant domain
  ✅ SSL certificate issued and valid

Phase 3: Verification
  ✅ End-to-end flow passes (signup → use → payment)
  ✅ Prometheus targets discovered and scraping
  ✅ Loki log stream active
  ✅ Uptime Kuma monitor active for tenant domain
  ✅ Alertmanager route configured for tenant
  ✅ BorgBackup/Restic backup job active
  ✅ Barman PITR configured (if PostgreSQL)
  ✅ Grafana dashboard provisioned with tenant filter

Phase 4: Handover
  ✅ Tenant admin credentials delivered (Vault one-time secret)
  ✅ Tenant API key issued
  ✅ Status page URL shared
  ✅ Support contact shared
  ✅ Deployment verification log archived to tenant's MinIO bucket
```

---

## 4. Tenant Lifecycle

```
                    ┌─────────────────┐
                    │  Onboarding     │
                    │  (Automated)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Provisioning   │
                    │  (Phases 1-4)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
              ┌─────┤   Active        │◄────┐
              │     │  (Production)   │     │
              │     └────────┬────────┘     │
              │              │              │
              │     ┌────────▼────────┐     │
              │     │   Suspended     │─────┘
              │     │  (Non-payment)  │     (Re-activate)
              │     └────────┬────────┘
              │              │
              │     ┌────────▼────────┐
              └─────┤ Decommissioned  │
                    │  (Data export)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Archived      │
                    │ (60d retention) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Purged       │
                    │  (Irreversible) │
                    └─────────────────┘
```

---

## 5. Infrastructure Implications for Phase 1

Phase 1 infrastructure choices must support white-label from day one, even if no tenant is deployed yet.

| Phase-1 Component | White-Label Requirement |
|---|---|
| **Caddy reverse proxy** | Must support wildcard domains and per-tenant CNAME-based custom domains |
| **Vault** | Must support namespaced secrets (`secret/tenants/{tenant_id}/`) |
| **PostgreSQL** | Schema-per-tenant pattern from the start; `search_path`-based connection pooling |
| **MinIO** | Per-tenant bucket creation must be automatable via API |
| **Prometheus** | All metrics must carry `tenant_id` label from day one |
| **Loki** | All log streams must carry `tenant_id` label from day one |
| **Grafana** | Dashboard provisioning must support folder-per-tenant and RLS filtering |
| **BorgBackup / Barman** | Backup jobs must be configurable per tenant with separate retention policies |
| **Kong API gateway** | Must enforce `x-tenant-id` header binding on API keys |
| **Consul** | Service names must be tenant-qualified (`{tenant_id}-{service}`) |
| **Docker Compose** | Tenant stacks must be isolated compose projects with separate networks |
| **Uptime Kuma** | Monitor groups must be per-tenant; alert routing per-tenant |

---

## 6. Infrastructure Cost Per Tenant (Estimated)

| Component | Cost Per Tenant (monthly) | Notes |
|---|---|---|
| Compute (Docker host share) | $5-20 | Shared host for small tenants; dedicated host for large |
| PostgreSQL (schema share) | $0-5 | Schema-per-tenant on shared instance; ~100 tenants per $50 instance |
| MinIO (object storage) | $0.01/GB + storage | Per-tenant bucket; $1/100GB typical |
| Redis (shared instance) | $0-3 | Namespace-per-tenant. ~200 tenants per $30 instance |
| Monitoring (Prom/Loki share) | $0-2 | Label-based isolation on shared infra |
| Backup storage | $0.01/GB | Borg/Restic backup to S3-compatible storage |
| Vault (shared) | $0-1 | Namespace-per-tenant on shared Vault cluster |
| Caddy (shared) | $0 | Shared reverse proxy with per-tenant routes |
| **Total per small tenant** | **~$5-35/month** | Fully loaded infra cost, not including universe-specific compute (AI models, game servers) |
| **Total per large tenant** | **~$50-200/month** | Dedicated DB instance, dedicated compute, enhanced backup retention |

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Noisy neighbor** (one tenant consumes shared resources) | Medium | Medium | Per-tenant resource quotas (CPU/memory limits); Prometheus alerts on per-tenant resource usage; Kong rate limiting per tenant |
| **Data leak** across tenant boundaries | Low | Critical | Separate DB schemas/instances; mTLS for inter-service; `x-tenant-id` enforced at gateway; regular penetration testing |
| **Deployment sprawl** — too many tenant stacks to manage | Medium | Medium | Automated provisioning via Ansible + Terraform; tenant registry drives all automation; decommission stale tenants |
| **Backup bloat** — per-tenant backups consume disproportionate storage | Low | Low | Configurable retention per tenant tier; BorgBackup deduplication across tenants (same files dedupe) |
| **Compliance cascade** — one tenant's compliance requirements affect shared infra | Medium | High | Compliance-sensitive tenants get instance-per-tenant isolation; shared infra stays PCI-free by contract |
| **Domain squatting** — tenant claims domain they don't own | Low | Medium | Verify domain ownership via DNS TXT record before provisioning cert |
| **Tenant churn** — high decommission rate creates cleanup debt | Medium | Low | Automated decommission workflow (purge after 60d archive); tenant registry drives cleanup |
| **Billing metering** — tracking per-tenant usage for billing | High (if not built) | High | Prometheus metrics with `tenant_id` label cover most usage; add billing connector in Phase 2 |

---

## 8. Tenant Isolation Assumptions (Phase 1 Baseline)

These are the minimum isolation guarantees every white-label tenant receives from day one:

1. ✅ **Domain isolation** — Each tenant gets their own domain with auto-TLS
2. ✅ **Environment isolation** — Each tenant gets their own Vault path + `.env` overlay
3. ✅ **Asset isolation** — Each tenant gets their own MinIO bucket for branded assets
4. ✅ **Backup isolation** — Each tenant's data is backed up independently with tenant-defined retention
5. ✅ **Monitoring isolation** — Each tenant's metrics carry `tenant_id`; dashboards are tenant-filtered
6. ✅ **API key isolation** — Each tenant's API keys are scoped to their tenant ID
7. ✅ **Audit isolation** — Each tenant sees only their own audit logs
8. ✅ **Log isolation** — Each tenant's log streams carry `tenant_id`; queryable per-tenant
9. ✅ **Status isolation** — Each tenant gets their own status page subdomain
10. ❌ **Database isolation** — Phase 1 uses schema-per-tenant (shared instance). Instance-per-tenant available in Phase 2 for high-value tenants.
11. ❌ **Compute isolation** — Phase 1 uses shared Docker hosts with resource quotas. Dedicated hosts in Phase 3.
12. ❌ **Network isolation** — Phase 1 uses Docker Compose networks with per-tenant network isolation. VPC-level isolation in Phase 3.
