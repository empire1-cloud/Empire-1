# SLA113 Infrastructure Pack

> A first-class capability of the SLA113 platform.
> Status: Architecture — Implementation Ready.

---

## 1. What Is the Infrastructure Pack?

The Infrastructure Pack is a **first-class SLA113 capability** — not documentation, not a separate project, but a platform module that every universe consumes, the same way universes consume the build pipeline, compliance engine, or service registry.

```
SLA113
├── Game Factory         (fish_engine, slots_engine, sprite registry)
├── Build Pipeline       (compile → deploy → verify)
├── Compliance Engine    (regulatory checks)
├── Tenant CRUD          (white-label minting)
├── Infrastructure Pack  ← YOU ARE HERE
│   ├── Monitoring
│   ├── Logging
│   ├── Metrics
│   ├── Backups
│   ├── Secrets
│   ├── Reverse Proxy
│   ├── Health Checks
│   ├── Tenant Registry
│   ├── White-Label Deployment
│   ├── Deployment Verification
│   └── Incident Management
├── Lyrica 3             (universe consumer)
├── Empire-1             (universe consumer)
├── Archisynapse         (universe consumer)
├── Cultura              (universe consumer)
├── Southern Arcade      (universe consumer)
└── SL Universal         (universe consumer)
```

Every universe gets infrastructure **for free** — they never implement monitoring, logging, backups, or secrets independently. The Infrastructure Pack provides these as platform services. The universe merely declares its endpoints, data types, and backup requirements.

---

## 2. Architecture

### 2.1 Pack Modules

```
Infrastructure Pack/
├── monitoring/
│   ├── prometheus.yml            # Scrape configs for all universes
│   ├── alertmanager.yml          # Alert routing (Slack, email, webhook)
│   ├── grafana-dashboards/       # Per-universe dashboard JSON
│   │   ├── empire-1.json
│   │   ├── lyrica-3.json
│   │   ├── archisynapse.json
│   │   ├── cultura.json
│   │   ├── southern-arcade.json
│   │   └── sl-universal.json
│   └── rules/                    # Alerting rules per universe
│       ├── empire-1.yml
│       ├── lyrica-3.yml
│       └── archisynapse.yml
├── logging/
│   ├── promtail.yml              # Log shipping config
│   └── loki.yml                  # Log aggregation config
├── backups/
│   ├── barman/                   # PostgreSQL PITR configs
│   │   ├── empire-1.conf
│   │   ├── lyrica-3.conf
│   │   ├── archisynapse.conf
│   │   ├── cultura.conf
│   │   └── sl-universal.conf
│   ├── borg/                     # File backup scripts
│   │   ├── borg-backup.sh
│   │   └── borg-restic-sync.sh
│   └── restic/                   # Offsite backup scripts
│       └── restic-backup.sh
├── secrets/
│   └── vault/                    # Vault config + policies
│       ├── vault-config.json
│       └── policies/
│           ├── admin.hcl
│           └── tenant-base.hcl
├── proxy/
│   ├── Caddyfile                 # Reverse proxy config (all surfaces)
│   └── caddy/                    # Caddy Docker Compose
├── uptime/
│   └── uptime-kuma.json          # Uptime Kuma monitor definitions
├── tenant-registry/
│   └── schema.sql                # PostgreSQL schema for tenant registry
├── verification/
│   └── deploy-verify.sh          # Deployment verification pipeline
└── incident/
    └── oncall.yml                # Alert → notification routing
```

### 2.2 Data Flow

```
                      ┌──────────────────────┐
                      │    Universe Service   │
                      │  (any universe pod)  │
                      └──────┬───────┬───────┘
                             │       │
              ┌──────────────┘       └──────────────┐
              │                                     │
              ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│   Prometheus         │              │   Promtail           │
│   (scrape /metrics)  │              │   (/var/log/*)       │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐              ┌──────────────────────┐
│   VictoriaMetrics    │              │   Loki               │
│   (time-series DB)   │              │   (log storage)      │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           └──────────┬──────────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   Grafana            │
           │   (dashboards +      │
           │    alerting)         │
           └──────────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │   Alertmanager       │
           │   → Slack / Email    │
           └──────────────────────┘

┌──────────────────────┐
│   Caddy              │
│   (reverse proxy +   │
│    auto-TLS)         │
└──────┬───────────────┘
       │
       ▼  *.sla113.io / custom domains
```

### 2.3 Tenant Registry Data Model

The Tenant Registry is a PostgreSQL table that drives all Infrastructure Pack automation:

```sql
CREATE TABLE tenants (
    tenant_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universe        VARCHAR(64) NOT NULL,  -- lyrica | empire1 | archisynapse | cultura | arcade | sl_universal
    tenant_name     VARCHAR(255) NOT NULL,
    domain          VARCHAR(255) UNIQUE,
    plan_tier       VARCHAR(32) DEFAULT 'standard',  -- standard | premium | enterprise
    status          VARCHAR(32) DEFAULT 'provisioning', -- provisioning | active | suspended | decommissioned
    db_model        VARCHAR(32) DEFAULT 'schema',       -- schema | database | instance
    backup_retention_days INT DEFAULT 30,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    provisioned_at  TIMESTAMPTZ,
    decommissioned_at TIMESTAMPTZ,
    owner_email     VARCHAR(255),
    deployment_ref  VARCHAR(255),  -- git ref or compose project name
    metadata        JSONB          -- feature flags, region prefs, etc.
);
```

When a new tenant is created in the registry, the Infrastructure Pack **automatically**:
- Provisions a Vault namespace (`secret/tenants/{tenant_id}/`)
- Creates a MinIO bucket (`tenant-{tenant_id}-assets`)
- Generates a Caddy route (wildcard or custom domain)
- Spawns an Uptime Kuma monitor group
- Configures a BorgBackup target path
- Creates a Grafana dashboard folder with `tenant_id` label filter
- Sets up Alertmanager route for tenant notifications
- Archives the deployment verification log

---

## 3. Implementation Phases

### Phase 1A — Foundation (Deploy Now)

Deploy the shared observability stack. This is the same for every universe — deploy once, consume everywhere.

| Service | Why First | Deployment |
|---|---|---|
| **Uptime Kuma** | Instant visibility into all endpoints | Single Docker container |
| **Prometheus** | Metrics foundation for all universes | Docker Compose + node_exporter per host |
| **Grafana** | Dashboards for all observability data | Docker Compose, connects to Prometheus + Loki |
| **Loki** | Log aggregation for all services | Docker Compose + object storage backend |
| **Promtail** | Log shipping from every universe pod | One per host, configured via docker labels |
| **Caddy** | Reverse proxy + auto-TLS for everything | Single Docker container, Caddyfile per surface |

**Outcome:** Every universe has centralized metrics, logs, dashboards, and secure ingress — without writing any code.

### Phase 1B — Protection (Week 2)

| Service | Why Next | Deployment |
|---|---|---|
| **BorgBackup** | File-level backup with dedup + encryption | cron script per host |
| **Barman** | PostgreSQL PITR for all DBs | Docker Compose per PostgreSQL instance |
| **Restic** | Offsite/cloud backup copies | cron script, S3-compatible target |
| **Vault** (or SOPS+Age) | Secrets management, no more `.env` files | Docker Compose cluster or SOPS workflow |

### Phase 1C — SLA113 Platform (Week 3-4)

Build the Infrastructure Pack as an SLA113 capability:

| Component | What It Does |
|---|---|
| **Tenant Registry** | PostgreSQL schema + CRUD API for all white-label tenants |
| **White-Label Deployment** | Automated tenant provisioning pipeline (Caddy route → Vault namespace → MinIO bucket → Uptime Kuma monitor → BorgBackup job → Grafana folder → Alertmanager route) |
| **Deployment Verification** | 4-phase verification pipeline with archived log |
| **Incident Management** | Alert routing, on-call schedules, status page per tenant |
| **Health Checks** | Prometheus blackbox exporter for all endpoints + Consul service health |

---

## 4. Universe Consumption Model

Each universe declares its infrastructure requirements in a single YAML file. The Infrastructure Pack provisions from these declarations.

### `infrastructure.yaml` (example — Empire-1)

```yaml
universe: empire1
tenant_capable: true
tenant_db_model: schema

endpoints:
  - name: web
    url: https://empire1.cloud
    type: public
  - name: api
    url: https://api.empire1.cloud/api/health
    type: api_health

monitoring:
  metrics_port: 8001
  metrics_path: /metrics
  rules:
    - alert: HighErrorRate
      expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
      duration: 5m

logging:
  sources:
    - path: /var/log/uvicorn/*.log
      labels:
        service: backend
    - path: /var/log/nginx/*.log
      labels:
        service: web

backups:
  postgresql:
    enabled: true
    pitr: true
    retention: 30d
  files:
    - path: /app/data/revenue-os/*.json
      schedule: hourly
    - path: /app/data/gtm/*.json
      schedule: hourly

secrets:
  - STRIPE_SECRET_KEY
  - RESEND_API_KEY
  - JWT_SECRET_KEY

white_label:
  isolation_model: schema
  default_retention_days: 30
  features:
    - domain_custom
    - asset_branding
    - analytics_dashboard
    - status_page
```

Each universe owns its `infrastructure.yaml`. The Infrastructure Pack reads it and provisions everything.

---

## 5. What Changes for Existing Universes

### Lyrica 3
- **Before:** Self-hosted infrastructure, ad-hoc monitoring, `.env` secrets
- **After:** Consumes Monitoring, Logging, Backups, Secrets from Infrastructure Pack. Declares generated audio as backup target, AI model inference latency as Prometheus metric, creator uploads as MinIO object storage.
- **White-label:** Branded AI Music Studio — schema-per-tenant, per-tenant MinIO bucket for audio.

### Empire-1
- **Before:** Vercel + self-hosted hybrid, JSON file persistence, no monitoring
- **After:** Consumes everything from Infrastructure Pack. Vercel still handles frontend; Infrastructure Pack monitors backend. Revenue OS data backed up via BorgBackup.
- **White-label:** Revenue OS / CRM / GTM Cockpit — schema-per-tenant, `x-tenant-id` gateway enforcement.

### Archisynapse
- **Before:** No infra documented; likely self-hosted with no monitoring
- **After:** Consumes everything from Infrastructure Pack, but with **enhanced isolation**. Instance-per-tenant for PCI compliance. Encrypted backups. Immutable audit log archive. Dedicated Barman with 365d retention.
- **White-label:** Payment Ledger / Payout / Fraud Infrastructure.

### Cultura Vibe Forge
- **Before:** No infra documented; cultural packs at risk
- **After:** Consumes Infrastructure Pack. Cultural packs backed up via BorgBackup. Execution engine metrics monitored via Prometheus.
- **White-label:** Cultural Intelligence Platform.

### Southern Arcade
- **Before:** Game assets, tenant configs, leaderboards — no backup strategy
- **After:** Consumes Infrastructure Pack. Redis leaderboards snapshotted. Game assets stored in MinIO (provided by Infrastructure Pack). Per-tenant Docker Compose stacks for white-label.
- **White-label:** Branded Arcade / Game Portal — per-tenant stacks.

### SL Universal
- **Before:** Streaming metadata, user libraries — no backup strategy
- **After:** Consumes Infrastructure Pack. User libraries backed up. Stream uptime monitored. Per-tenant Redis namespaces for white-label streaming.
- **White-label:** Branded Radio / Streaming App.

---

## 6. Operational Model

### Who runs the Infrastructure Pack?

The Infrastructure Pack is operated by **SLA113 platform engineering** — a shared capability, not a per-universe team. This is the same team that operates the build pipeline, factory, and compliance engine.

### Who configures it per universe?

Each universe owner writes their `infrastructure.yaml`. The platform team handles the infrastructure plumbing.

### How do universes onboard?

```
1. Universe owner writes infrastructure.yaml
2. PR submitted to sla113/infrastructure-pack/
3. CI validates the YAML (required fields, valid endpoints, etc.)
4. Platform team reviews and merges
5. Infrastructure Pack provisions automatically:
   - Prometheus scrape target added
   - Promtail log path configured
   - BorgBackup job created
   - Barman config added (if PostgreSQL)
   - Caddy route added
   - Uptime Kuma monitor created
   - Grafana dashboard provisioned
   - Alertmanager route configured
6. Verification: platform team runs deploy-verify.sh
7. Infrastructure Pack dashboard shows new universe as "active"
```

### How do white-label tenants onboard?

```
1. Tenant signs up (or operator creates via Tenant Registry)
2. Tenant Registry creates record with tenant_id, domain, plan_tier
3. Infrastructure Pack auto-provisions:
   - Vault namespace (secret/tenants/{tenant_id}/)
   - MinIO bucket (tenant-{tenant_id}-assets)
   - Caddy route (tenant domain → universe backend)
   - Docker Compose stack (if instance-per-tenant model)
   - BorgBackup target path
   - Uptime Kuma monitor group
   - Grafana dashboard folder with tenant_id filter
   - Alertmanager route for tenant
4. Deployment verification runs
5. Tenant receives: admin credentials, API key, status page URL
6. Registry status updated to "active"
```

---

## 7. The Platform Story

Instead of saying "we have six products," the architecture now enables:

> **"SLA113 is a platform that builds, operates, and exports creator, business, financial, cultural, and entertainment systems as branded deployments."**

The Infrastructure Pack is what makes this statement true. Without it, each universe implements infrastructure independently — inconsistent, untestable, unscalable. With it, white-label deployment becomes a **feature of the platform**, not a per-universe project.

### What changed

| Before | After |
|---|---|
| Infrastructure was per-universe responsibility | Infrastructure is a shared SLA113 platform capability |
| White-label was Southern Arcade's problem | White-label is an Infrastructure Pack feature available to every universe |
| Each universe had its own monitoring (or none) | One observability stack consumed by all |
| Secrets in `.env` files per universe | Vault cluster shared across all universes |
| Backup decisions made independently | Standardized backup policies per data type |
| Deployment required manual steps per universe | Tenant Registry drives automated provisioning |

### What didn't change

- **Each universe remains an independent business** with independent revenue
- **SLA113 is still the parent runtime** — it orchestrates; it does not own the universes
- **WE EVOLVE, NEVER DELETE** — all existing universe code runs unchanged
- **FOSS-first** — every tool in the pack is open-source
- **Cost-efficient** — total infrastructure cost: $5-20/month + storage

---

## 8. Comparison: Before vs After Infrastructure Pack

| Concern | Before (L0) | After (L1 — Infrastructure Pack) |
|---|---|---|
| **Uptime monitoring** | None — users detect outages | Uptime Kuma — 30s check on every endpoint |
| **Metrics** | None — blind to performance | Prometheus + VictoriaMetrics — CPU, memory, disk, app metrics |
| **Logs** | SSH into server, grep | Loki — centralized, searchable, tenant-filtered |
| **Dashboards** | None | Grafana — per-universe dashboards, per-tenant filtered |
| **Backups** | None — data loss permanent | BorgBackup (hourly files) + Barman (PITR PostgreSQL) + Restic (offsite) |
| **Secrets** | `.env` files | Vault — rotated, audited, per-tenant namespaced |
| **Reverse proxy** | Direct port exposure or Vercel edge | Caddy — auto-TLS, wildcard domains, per-tenant routing |
| **Alerting** | None | Alertmanager → Slack, per-tenant routes |
| **Incidents** | Reactive, no documentation | Alert → notification → tracked in OneUptime |
| **Tenant provisioning** | Manual, no standard | Tenant Registry → automated infra provisioning |
| **Deployment verification** | None | 4-phase verification pipeline per tenant |
| **Cost** | $0 infra + unknown risk | $5-20/month + known cost |

---

## 9. File Layout

```
docs/infra/
├── INFRASTRUCTURE_RECOMMENDATIONS.md     ← Full awesome-sysadmin analysis (existing)
├── SLA113_INFRASTRUCTURE_PACK.md          ← This file — pack architecture
└── phase-1/
    ├── README.md                          ← Phase 1 scope
    ├── PHASE_1_IMPLEMENTATION_PLAN.md     ← Per-universe details
    ├── PHASE_1_ECOSYSTEM_INVENTORY.md     ← Full inventory + white-label
    ├── PHASE_1_WHITE_LABEL_MODEL.md       ← White-label capability model
    └── PHASE_1_INVESTOR_SUMMARY.md        ← Investor-facing summary
```

---

*This document defines the SLA113 Infrastructure Pack as a first-class platform capability. No production code has been modified. All existing universe code continues to run unchanged. The Infrastructure Pack provisions new infrastructure alongside existing systems — WE EVOLVE, NEVER DELETE.*
