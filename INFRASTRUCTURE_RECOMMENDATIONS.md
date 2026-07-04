# SLA113 Infrastructure Recommendations

> Based on analysis of [awesome-sysadmin](https://github.com/n1trux/awesome-sysadmin) — a curated list of FOSS sysadmin resources.
> Date: 2026-06-26
> Status: Analysis Only — No Production Code Modified

---

## Executive Summary

The SLA113 ecosystem (Empire-1, Lyrica 3, Archisynapse, Cultura, Southern Lifestyle, and Southern Arcade) currently runs on a minimal Vercel + FastAPI stack with no observability, no backup strategy, no secrets management, and no CI/CD pipeline beyond `git push`. As the platform scales to support multiple independent businesses with independent revenue, this infrastructure debt becomes existential risk.

Phase 1 of the infrastructure roadmap covers the full Empire-1/SLA113 ecosystem, including all repos and deployment surfaces: `Empire-1`, `sla113`, `Lyrica3-pro`, `empire1-lyrica-ecosystem`, `the-cultura-vibe-forge-`, `sl-universal`, `soulfire-ecosystem`, `Archisynapse-`, `EMPIRE-OS`, Southern Lifestyle brand, and Southern Arcade. All API surfaces (`api.empire1.cloud`, `api.lyrica3.com`, `sluniversal.lyrica3.com`, `arcade.southernlifestyle.org`, `sla113.southernlifestyle.org`) and all public endpoints (`empire1.cloud`, `lyrica3.com`, `southernlifestyle.org`) are included in the monitoring and backup scope.

This document catalogs every category from awesome-sysadmin, maps best-in-class FOSS projects to each category, and builds a phased roadmap for SLA113 infrastructure maturity — from quick wins (week 1) to production-grade operations (90 days).

**Guiding principles:**
- **WE EVOLVE, NEVER DELETE** — integrate alongside existing code, never replace wholesale
- **Tenant-independent by default** — each universe gets isolatable infrastructure
- **Cost-efficient** — FOSS-first, self-hosted where practical, avoid vendor lock-in
- **Production-grade** — monitoring, alerting, backups, and secrets are non-negotiable for revenue-bearing systems
- **White-label by design** — every universe is an exportable, brandable, deployable product for third-party tenants; all infrastructure choices must support tenant isolation from day one

---

## Architecture Diagram (Markdown)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SLA113 OBSERVABILITY LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Grafana   │  │Prometheus│  │   Loki   │  │  Alert-  │  │  Uptime      │ │
│  │ Dashboards│  │ Metrics  │  │   Logs   │  │  manager │  │  Kuma        │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SLA113 SERVICE MESH / ROUTING                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Caddy   │  │  Consul  │  │  Vault   │  │  Keycloak│  │  Authentik   │ │
│  │ Reverse  │  │ Service  │  │ Secrets  │  │  Identity│  │  SSO Proxy   │ │
│  │  Proxy   │  │ Discovery│  │  Mgmt    │  │  Provider│  │              │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SLA113 DATA & STORAGE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │PostgreSQL│  │  Redis   │  │MinIO     │  │Meilisearch│  │  RabbitMQ    │ │
│  │ Primary  │  │  Cache   │  │Object    │  │  Search   │  │  Message     │ │
│  │  DB      │  │  + Queue │  │ Storage  │  │  Engine   │  │  Queue       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SLA113 CI/CD & DEPLOYMENT LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │Woodpecker│  │  Docker  │  │  Ansible │  │  Restic  │  │  BorgBackup  │ │
│  │   CI/CD  │  │ Compose  │  │  Config  │  │  Backups │  │  + Barman    │ │
│  │          │  │  + Swarm │  │  Mgmt    │  │          │  │  (PG dumps)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNIVERSE TENANTS (INDEPENDENT)                       │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │    EMPIRE-1      │  │   LYPRICA 3      │  │    ARCHISYNAPSE          │  │
│  │  B2B SaaS        │  │  AI Music        │  │  Payments / Ledger       │  │
│  │  Revenue OS      │  │  Creator Assets  │  │  Fraud Detection         │  │
│  │  GTM Layer       │  │  DNA Registry    │  │  API Gateway             │  │
│  │  Cockpit         │  │  Royalties       │  │  Financial Infra         │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │    CULTURA       │  │ SOUTHERN ARCADE  │                                │
│  │  Culture Engine  │  │  Multiplayer     │                                │
│  │  Knowledge Graph │  │  Leaderboards    │                                │
│  │  Execution Engine│  │  White-Label     │                                │
│  └──────────────────┘  └──────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Proxmox  │  │ WireGuard│  │ CoreDNS  │  │  NTP     │  │  PFSense/    │ │
│  │   VE     │  │  VPN     │  │ Internal │  │  Chrony  │  │  OPNsense    │ │
│  │Hypervisor│  │  Mesh    │  │  DNS     │  │  Time    │  │  Firewall    │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Category Analysis (awesome-sysadmin Derived)

### Infrastructure

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Hypervisor | VM management for multi-tenant isolation | **Proxmox VE**, oVirt, XCP-ng | Production-grade (Proxmox: 15+ years) | Each universe needs isolated runtime; Proxmox provides web UI + backup + clustering |
| Container Runtime | Lightweight app isolation | **Docker**, Podman, LXC | Industry standard | Already using Docker; formalize with Compose + Swarm for orchestration |
| Time Sync | NTP for distributed systems | **Chrony**, NTPsec | Production-grade | Essential for audit logs, financial transactions (Archisynapse), and distributed consistency |

**Recommendation:** Adopt Proxmox VE as hypervisor; standardize on Docker Compose for service definitions; deploy Chrony on all nodes.

---

### Networking

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Reverse Proxy | TLS termination, routing, load balancing | **Caddy**, Nginx, HAProxy | Production-grade | Caddy auto-TLS via Let's Encrypt, simple config; replace ad-hoc routing |
| DNS Server | Internal service discovery, external DNS | **CoreDNS**, Unbound, PowerDNS | Production-grade | CoreDNS integrates with Consul for service discovery |
| VPN | Secure inter-service and admin access | **WireGuard**, Headscale, Nebula | Production-grade | WireGuard is minimal kernel-level VPN; Headscale provides Tailscale-like mesh |
| Firewall/Router | Network perimeter security | **OPNsense**, pfSense | Production-grade | Needed for production deployment beyond single-Vercel topology |

**Recommendation:** Caddy as reverse proxy (auto-TLS, simple Caddyfile); CoreDNS for internal DNS; WireGuard for admin VPN mesh; OPNsense if deploying dedicated server infrastructure.

---

### Security

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Secrets Management | API keys, DB creds, tokens | **Vault**, SOPS + Age | Production-grade (Vault: HashiCorp) | Currently secrets in env files — Vault provides rotation, audit, and policy |
| Certificate Management | Internal PKI, mTLS | **Smallstep**, easy-rsa | Production-grade | mTLS for inter-service communication; Smallstep automates cert lifecycle |
| Intrusion Detection | Host and network monitoring | **Wazuh**, OSSEC | Production-grade | Wazuh provides SIEM-level visibility; FIM, vulnerability detection |

**Recommendation:** Vault for secrets (replace `.env` files); Smallstep for internal CA and mTLS; Wazuh for host-level security monitoring.

---

### Identity

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| SSO / IdP | Centralized authentication across universes | **Authentik**, KeyCloak, Authelia | Production-grade | Each universe currently has separate auth — unify with Authentik (simpler than KeyCloak) |
| LDAP Directory | User and group directory | **OpenLDAP**, 389 Directory Server, lldap | Production-grade | OpenLDAP as backend directory for Authentik; lldap for simpler deployments |
| OAuth/OIDC | Modern auth protocols | **ZITADEL**, KeyCloak | Production-grade | ZITADEL is cloud-native, supports OAuth/OIDC/SAML out of box |

**Recommendation:** Authentik as primary IdP (simpler deployment than KeyCloak, supports all needed protocols); OpenLDAP as backend directory; Authentik handles OAuth/OIDC for all universe apps.

---

### Monitoring

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Metrics Collection | CPU, memory, disk, custom app metrics | **Prometheus**, VictoriaMetrics, Telegraf | Production-grade (Prometheus: CNCF graduated) | Currently zero metrics — Prometheus provides TSDB + PromQL |
| Time-Series DB | Store and query metrics | **VictoriaMetrics**, Prometheus, Graphite | Production-grade | VictoriaMetrics is drop-in Prometheus replacement with 10-20x better compression |
| Visualization | Dashboards and graphs | **Grafana** | Industry standard | Grafana is the de facto standard; dashboards per universe |
| Container Monitoring | Per-container resource usage | **cAdvisor** | Production-grade | Integrates with Prometheus for container-level metrics |

**Recommendation:** Prometheus + VictoriaMetrics for metrics; Telegraf for metric collection agents; Grafana for dashboards; cAdvisor for container-level visibility.

---

### Logging

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Log Aggregation | Centralized log collection and query | **Loki**, Fluentd, rsyslog | Production-grade (Loki: Grafana Labs) | Loki integrates with Grafana; agent-based with Promtail; cheap-to-store |
| Log Shipper | Forward logs from sources to aggregator | **Fluentd**, Promtail, Filebeat | Production-grade | Promtail for Loki; Fluentd for complex routing |
| Log Analysis | Parse and analyze log patterns | **GoAccess** | Mature | Real-time web log analysis for nginx/caddy access logs |

**Recommendation:** Loki + Promtail for log aggregation; Fluentd for complex routing needs; GoAccess for ad-hoc web log analysis.

---

### Metrics & Alerting

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Alerting | Notify on metric thresholds | **Alertmanager**, Alerta | Production-grade | Alertmanager pairs with Prometheus; routes alerts to Slack, email, PagerDuty |
| Incident Management | Track and manage incidents | **OneUptime** | Growing | OneUptime provides status pages + incident tracking in one stack |

**Recommendation:** Prometheus Alertmanager for metric-based alerts; OneUptime for status pages and incident management.

---

### Backups

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| File/System Backup | Full system and file backups | **BorgBackup**, Restic, UrBackup | Production-grade | Borg: dedup, compression, encryption; Restic: cloud-native, S3-compatible |
| Database Backup | Point-in-time recovery for databases | **Barman** (PostgreSQL), pg_dump | Production-grade | Barman provides WAL archiving, PITR; essential for all universe databases |
| Backup Orchestration | Schedule and manage backup jobs | **Backrest**, Backupninja | Mature | Backrest provides web UI on top of Restic; Backupninja for cron-based scheduling |

**Recommendation:** BorgBackup for file backups (dedup = efficient); Barman for PostgreSQL PITR; Restic for cloud/S3 offsite copies; Backrest for web-based management of Restic.

---

### Automation

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Config Management | Declarative system configuration | **Ansible**, Salt, OpenVox | Production-grade (Ansible: Red Hat) | Ansible agentless, YAML-based; ideal for bootstrapping and maintaining server state |
| Infrastructure as Code | Provision cloud/VM resources | **Packer**, Terraform (via Terrateam) | Production-grade | Packer for golden images; Terrateam for GitOps Terraform workflows |
| Runbook Automation | Automated incident response | **OpenBolt**, Rundeck (via awesome list) | Mature | Execute predefined ops workflows on alert triggers |

**Recommendation:** Ansible for config management and provisioning; Packer for VM image creation; Terrateam for infrastructure-as-code GitOps.

---

### Databases

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Relational DB | Primary application data | **PostgreSQL** | Industry standard | Already in architecture — deploy with replication and automated backups |
| Key-Value Cache | Session cache, rate limiting | **Redis**, KeyDB | Production-grade | Redis for caching, session store, rate limiting, pub/sub |
| Search Engine | Full-text search across universe data | **Meilisearch**, Elasticsearch | Production-grade | Meilisearch: simpler than Elasticsearch, good for per-universe search needs |
| Time-Series DB | Metrics and observability data | **VictoriaMetrics** (see Metrics) | Production-grade | Handles Prometheus-compatible metric storage |
| Message Queue | Async job processing, event bus | **RabbitMQ**, NSQ, Redis Streams | Production-grade | RabbitMQ for reliable message delivery; Redis Streams for lightweight needs |

**Recommendation:** PostgreSQL (primary) + Redis (cache/queue) + Meilisearch (search) + RabbitMQ (event bus) as the core data layer.

---

### CI/CD

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| CI Server | Build and test automation | **Woodpecker**, Jenkins, Drone fork | Production-grade | Woodpecker: lightweight, container-native CI; simpler than Jenkins |
| CD / GitOps | Deployment automation | **ArgoCD**, Werf | Production-grade | ArgoCD for Kubernetes GitOps; Werf for Docker image build + deploy |
| Pipeline Automation | Multi-step build pipelines | **GoCD**, Concourse | Production-grade | GoCD: modeling complex pipelines visually; Concourse: containerized pipeline steps |

**Recommendation:** Woodpecker for CI (runs in Docker, YAML config); ArgoCD for Kubernetes GitOps (if K8s adopted).

---

### Containers

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Container Runtime | Running containers | **Docker** + **Podman** | Industry standard | Already using Docker; Podman for rootless, daemonless operations |
| Orchestration | Multi-container management | **Docker Swarm**, Kubernetes (opt-in) | Production-grade | Swarm: simpler than K8s, built into Docker; K8s for complex multi-service needs |
| Management UI | Container visibility and control | **Portainer** | Production-grade | Web UI for Docker management — visualize containers, logs, networks |
| Image Building | Building container images | **Docker Build**, BuildKit, Werf | Production-grade | Werf integrates CI/CD + image building + deployment |

**Recommendation:** Docker as primary runtime; Docker Swarm for orchestration (simpler path than K8s); Portainer for management UI; BuildKit for image building.

---

### Storage

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Object Storage | Blob/file storage, backups, assets | **MinIO**, Ceph, OpenStack Swift | Production-grade | MinIO: S3-compatible, lightweight, self-hosted; ideal for game assets, receipts, user uploads |
| Distributed Filesystem | Shared storage across nodes | **JuiceFS**, GlusterFS, CephFS | Production-grade | JuiceFS: POSIX on top of S3 + Redis; simpler than Ceph for moderate scale |

**Recommendation:** MinIO for object storage (S3 API, integrates with Restic, Barman, and app code); JuiceFS if POSIX shared filesystem needed.

---

### DNS

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Authoritative DNS | Serve DNS records | **CoreDNS**, PowerDNS, Bind | Production-grade | CoreDNS: Kubernetes-native, plugin architecture, integrates with Consul |
| Recursive DNS | DNS resolution for internal network | **Unbound**, dnsmasq | Production-grade | Unbound: DNSSEC-validating, privacy-focused resolver |
| DNS Management | Web UI for DNS record management | **Poweradmin**, DNSControl | Production-grade | DNSControl: DNS as code, manage via Git — fits GitOps model |

**Recommendation:** CoreDNS for internal service discovery; Unbound for recursive resolution; DNSControl for declarative DNS record management across providers.

---

### Service Discovery

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Service Registry | Register and discover services | **Consul**, etcd | Production-grade | Consul: service discovery + health checking + key-value store; native DNS integration |
| Distributed KV | Configuration storage, leader election | **etcd**, Zookeeper | Production-grade | etcd: used by Kubernetes, simple REST API; Zookeeper: more complex, battle-tested |

**Recommendation:** Consul for service discovery (health checks, DNS interface, multi-datacenter); etcd for distributed configuration and coordination.

---

### Status Page & Incident Management

| Sub-Category | Purpose | Best Projects | Maturity | Why It Matters for SLA113 |
|---|---|---|---|---|
| Status Page | Public/private service status | **cState**, Kener, Uptime Kuma | Production-grade | cState: static site (fast); Kener: has incident management built-in |
| Incident Tracking | Log and manage incidents | **OneUptime**, Kener | Growing | OneUptime: status page + monitoring + incident management in one |
| Uptime Monitoring | Monitor service availability | **Uptime Kuma**, Gatus | Production-grade | Uptime Kuma: self-hosted, rich notifications, Docker-native |

**Recommendation:** Uptime Kuma for uptime monitoring; Kener for status pages with incident management.

---

## SLA113 Infrastructure Roadmap

### Recommended Modern Open-Source Stack

| Category | Primary Recommendation | Alternative | License | Ecosystem |
|---|---|---|---|---|
| **Monitoring** | Prometheus + VictoriaMetrics | Thanos | Apache-2.0 | CNCF |
| **Logging** | Loki + Promtail | Elasticsearch + Filebeat | AGPL-3.0 / Apache-2.0 | Grafana Labs / Elastic |
| **Metrics** | Telegraf + Prometheus Node Exporter | Collectd | MIT / Apache-2.0 | InfluxData / CNCF |
| **Alerting** | Alertmanager | Alerta | Apache-2.0 | CNCF |
| **Backups** | BorgBackup + Barman + Restic | Bareos | BSD-3 / GPL-3 / Apache-2.0 | Self-hosted |
| **Secrets** | Vault | SOPS + Age | MPL-2.0 | HashiCorp |
| **Identity** | Authentik + OpenLDAP | KeyCloak | MIT / GPL-3.0 | Self-hosted |
| **Reverse Proxy** | Caddy | Nginx + Certbot | Apache-2.0 | Self-hosted |
| **API Gateway** | Kong (community) | Apache APISIX | Apache-2.0 | CNCF |
| **DNS** | CoreDNS + Unbound | PowerDNS | Apache-2.0 / BSD-3 | CNCF |
| **CI/CD** | Woodpecker | ArgoCD | Apache-2.0 | CNCF |
| **Containers** | Docker + Docker Swarm | Kubernetes (opt-in) | Apache-2.0 | Docker / CNCF |
| **Object Storage** | MinIO | Ceph | AGPL-3.0 / LGPL-3.0 | Self-hosted |
| **PostgreSQL** | PostgreSQL 16 + PgBouncer | TimescaleDB | PostgreSQL | Self-hosted |
| **Redis** | Redis Stack + RedisInsight | KeyDB | BSD-3 | Redis Ltd |
| **Search** | Meilisearch | Sonic / Typesense | MIT | Self-hosted |
| **Status Page** | Kener | cState | MIT | Self-hosted |
| **Incident** | OneUptime (self-hosted) | — | Apache-2.0 | Self-hosted |
| **Config Mgmt** | Ansible | Salt | GPL-3.0 | Red Hat |
| **Service Discovery** | Consul | etcd | MPL-2.0 / Apache-2.0 | HashiCorp / CNCF |
| **Queue** | RabbitMQ | Redis Streams | MPL-2.0 / BSD-3 | VMware / Redis Ltd |

---

## Universe Mapping

### Lyrica 3 (AI Music Platform)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Audio pipeline processing | RabbitMQ for async job queue | Critical | Audio generation is a natural async job |
| Creator assets (uploads) | MinIO for object storage | Critical | S3-compatible, self-hosted, per-creator buckets |
| DNA Registry | PostgreSQL | Critical | Relational data with search needs |
| Royalties / Ledger | PostgreSQL + audit logging | Critical | Financial data needs ACID + audit trail |
| Music search | Meilisearch | High | Fast typo-tolerant search across creator catalog |
| Artist identity | Authentik + OpenLDAP | High | SSO for creator dashboard |
| Usage metrics | Prometheus + Grafana | Medium | Track generations, compute usage, active creators |

### Archisynapse (Payments & Financial Infrastructure)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Payment ledger | PostgreSQL with Barman PITR | Critical | Financial data — point-in-time recovery mandatory |
| Transaction processing | RabbitMQ for reliable queuing | Critical | No lost transactions |
| Fraud detection | Prometheus + custom metrics + Alertmanager | Critical | Real-time anomaly alerts |
| API gateway | Kong (community) | Critical | Rate limiting, auth, logging for all financial APIs |
| Secrets (API keys, merchant keys) | Vault | Critical | Rotating secrets, audit logging |
| Audit log | Loki + immutable log shipping | Critical | Compliance requirement |
| Financial reporting | Grafana dashboards from PostgreSQL | High | Real-time revenue, transaction volume, failure rates |

### Cultura (Cultural Intelligence & Execution Engine)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Knowledge graph | PostgreSQL with pgvector | High | Hybrid relational + vector search |
| Cultural intelligence | Meilisearch for cultural content search | High | Rich text, multi-language search |
| Execution engine workflows | RabbitMQ for workflow steps | Medium | Async execution of cultural analysis pipelines |
| Community data | PostgreSQL | Medium | Community profiles, engagement data |
| Analytics | Grafana dashboards | Medium | Community growth, engagement metrics |

### Southern Arcade / Southern Lifestyle (Gaming & White-Label)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Multiplayer state | Redis for real-time state + pub/sub | Critical | Game state synchronization, leaderboard updates |
| Leaderboards | Redis Sorted Sets | Critical | Real-time, sorted, paginated |
| White-label deployment | Docker Compose per tenant | Critical | Each tenant gets isolated game stack |
| Game assets | MinIO object storage | High | Sprites, audio, config files per game |
| Session management | Redis for game sessions | High | Fast session lookups, TTL-based expiry |
| Player analytics | Prometheus + Grafana | Medium | DAU, game popularity, revenue per game |
| Anti-cheat / compliance | Wazuh + custom Prometheus metrics | Medium | Detect anomalous play patterns |

### Empire-1 (B2B SaaS — Revenue OS)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Core application data | PostgreSQL | Critical | Revenue OS data, GTM layer, user data |
| Session/auth | Redis + Authentik | Critical | User sessions, SSO across Revenue OS |
| Cold DM/Email generation | RabbitMQ or Redis Streams | High | Async generation jobs, avoid timeout on Vercel |
| File/asset storage | MinIO | High | Receipts, user uploads, generated reports |
| Search across receipts/leads | Meilisearch | Medium | Full-text search across user data |
| Customer analytics | Grafana from PostgreSQL | Medium | MRR, conversion funnels, churn analytics |
| Status page | Kener | Medium | Public service status for paying customers |

### SLA113 (Orchestration Layer — Parent OS)

| Component | Recommendation | Priority | Notes |
|---|---|---|---|
| Service registry | Consul | Critical | All universe services register here |
| Health checking | Consul health checks | Critical | Automatic health-based routing |
| Secrets distribution | Vault agent sidecar | Critical | Per-universe secret injection |
| Observability (metrics) | Prometheus + VictoriaMetrics | Critical | SLA-level metrics for all universes |
| Observability (logs) | Loki + Promtail | Critical | Centralized logging for all universes |
| Observability (alerts) | Alertmanager | Critical | Unified alert routing (Slack, email) |
| Identity bridge | Authentik as upstream IdP | High | Universes can optionally use SLA113 IdP |
| API gateway | Kong | High | Centralized routing, auth, rate limiting |
| DNS | CoreDNS + Consul DNS | High | Internal service DNS |
| Configuration | Ansible for node bootstrapping | High | Declarative infra state |
| CI/CD | Woodpecker (self-hosted) | Medium | Build and test all universe code |
| Container registry | Docker Registry + MinIO backend | Medium | Private image storage |

---

## SLA113 White-Label Capability Model

> SLA113 is not just an internal runtime. It is an **exportable control plane** that can package every universe as a branded, stand-alone deployment surface for third-party tenants. `split_repo.sh` proves the extraction pattern exists.

### White-Label Candidates

| Universe | White-Label Product | Tenant Gets | Tenant Isolation Model |
|---|---|---|---|
| Lyrica 3 | Branded AI Music Studio | Label/artist-branded AI music generation, DNA registry, creator dashboard, royalty tracking | Schema-per-tenant + per-tenant MinIO bucket + Vault namespace |
| SL Universal | Branded Radio / Streaming App | White-label streaming with Pulse Stream radio, user libraries, playlist management | Schema-per-tenant + per-tenant Redis namespace |
| Cultura Vibe Forge | Cultural Intelligence Platform | Branded cultural workshop engine with dialect rules, Taller/workshop engine | Per-tenant MinIO bucket for cultural packs + Vault namespace |
| Southern Arcade | Branded Arcade / Game Portal | White-label game lobby with fish shooter, slots, leaderboards | Per-tenant Docker Compose stack + MinIO bucket + Redis namespace |
| Archisynapse | Payment Ledger / Payout / Fraud Infra | White-label payment processing, ledger, merchant onboarding, fraud detection | Instance-per-tenant (PCI compliance) + encrypted Vault |
| Empire-1 | Revenue OS / CRM / GTM Cockpit | White-label Revenue OS with GTM layer, buyer scoring, campaign sequences | Schema-per-tenant + `x-tenant-id` gateway enforcement |

### Infrastructure Requirements for White-Label

| Requirement | Tool / Pattern | Phase |
|---|---|---|
| **Tenant registry** | PostgreSQL table tracking all white-label tenants | Phase 1 |
| **Domain mapping** | Caddy auto-TLS per tenant domain + wildcard CNAME support | Phase 1 |
| **Branded frontend assets** | MinIO bucket per tenant (`tenant-{id}-assets`) with CDN | Phase 1 |
| **Tenant-specific env config** | Vault per-tenant path (`secret/tenants/{tenant_id}/`) | Phase 1 |
| **Tenant-specific backups** | BorgBackup per-tenant archive + Barman per-tenant schema | Phase 1 |
| **Tenant-specific analytics** | Grafana folders with `tenant_id` label filtering | Phase 1 |
| **Tenant-specific status monitoring** | Uptime Kuma per-tenant monitor group + status subdomain | Phase 1 |
| **Isolated database** | PostgreSQL schema-per-tenant (Phase 1); instance-per-tenant (Phase 2+) | Phase 1-2 |
| **API key isolation** | Kong gateway with `x-tenant-id` header enforcement | Phase 2 |
| **Audit logs** | Loki with `tenant_id` label + immutable archive | Phase 1 |
| **Deployment verification log** | Automated 4-phase provisioning pipeline | Phase 2 |
| **Compute isolation** | Docker Compose per-tenant (Phase 2); dedicated hosts (Phase 3) | Phase 2-3 |

### Tenant Isolation Assumptions (Phase 1 Baseline)

All white-label tenants receive these isolation guarantees from Phase 1:

- ✅ Domain isolation with auto-TLS
- ✅ Environment isolation (Vault path + `.env` overlay)
- ✅ Asset isolation (MinIO bucket per tenant)
- ✅ Backup isolation (independent schedules and retention)
- ✅ Monitoring isolation (`tenant_id` labels on all metrics)
- ✅ API key isolation (scoped to tenant ID)
- ✅ Audit isolation (tenant-scoped log queries)
- ✅ Log isolation (`tenant_id` label on all log streams)
- ✅ Status isolation (per-tenant status subdomain)
- ❌ Database isolation (Phase 1: schema-per-tenant; Phase 2+: instance-per-tenant available)
- ❌ Compute isolation (Phase 1: shared hosts with resource quotas; Phase 3: dedicated)
- ❌ Network isolation (Phase 1: Docker Compose networks; Phase 3: VPC-level)

### Cost Per White-Label Tenant

| Tenant Tier | Infra Cost/Month | Revenue Target | Gross Margin |
|---|---|---|---|
| Small | $5-35 | $299-999 | ~85-95% |
| Large (dedicated) | $50-200 | $1,000-2,500+ | ~90-95% |

Full white-label model documentation: [`docs/infra/phase-1/PHASE_1_WHITE_LABEL_MODEL.md`](docs/infra/phase-1/PHASE_1_WHITE_LABEL_MODEL.md)

---

## Implementation Priority Matrix

| Priority | Definition | Examples |
|---|---|---|
| **Critical** | Revenue impact, data loss risk, security vulnerability | Backups, secrets, monitoring for financial systems |
| **High** | Operational efficiency, scalability enabler, risk reduction | CI/CD, service discovery, logging |
| **Medium** | Quality of life, optimization, visibility | Status pages, analytics dashboards, search |
| **Future** | Nice-to-have, emerging need, complex to deploy | Kubernetes, distributed filesystem, SIEM |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Data loss (no backups) | High | Catastrophic | Phase 1: Barman for PostgreSQL + BorgBackup for files |
| Secrets exposure in env files | High | Critical | Phase 1: Vault adoption; Phase 2: Vault sidecar injection |
| No monitoring = blind to outages | High | High (revenue impact) | Phase 1: Prometheus + Grafana + Uptime Kuma |
| Identity sprawl (separate logins per universe) | Medium | Medium | Phase 2: Authentik as unified IdP |
| Configuration drift (manual server setup) | Medium | Medium | Phase 2: Ansible playbooks for all nodes |
| Single point of failure (Vercel-only) | Medium | Medium | Phase 3: Self-hosted fallback deployment |
| No incident response process | Medium | Medium | Phase 2: OneUptime for incident tracking |
| Log loss (no centralized logging) | Medium | Medium | Phase 2: Loki + Promtail |
| Unauthorized inter-service access | Medium | High | Phase 2: mTLS via Smallstep |
| Vendor lock-in (cloud-specific APIs) | Low | Medium | FOSS-first approach mitigates this by design |

---

## Migration Strategy

The migration follows a **parallel adoption** model — new infrastructure runs alongside existing code. No existing production code is modified.

### Phase 0: Foundation (Week 1)
- Deploy Docker Compose for infrastructure services
- Set up networking (Caddy reverse proxy, WireGuard admin VPN)
- Configure DNS (CoreDNS for internal, Unbound for recursive)
- Time sync (Chrony on all nodes)

### Phase 1: Safety (Week 2)
- Backups: BorgBackup (files) + Barman (PostgreSQL) + Restic (offsite)
- Secrets: Vault initialization, migrate env vars into Vault
- Monitoring: Prometheus + Node Exporter + Grafana (basic dashboards)
- Alerting: Alertmanager → Slack
- Uptime: Uptime Kuma for all public endpoints

### Phase 2: Observability (Week 3-4)
- Logging: Loki + Promtail for all services
- Identity: Authentik deployment, connect to OpenLDAP
- Service Discovery: Consul for all universe services
- Incident Management: OneUptime or Kener with status page
- CI/CD: Woodpecker for automated builds and tests

### Phase 3: Scale (Week 5-8)
- API Gateway: Kong for rate limiting and auth
- Object Storage: MinIO for universe assets
- Search: Meilisearch per universe
- Queue: RabbitMQ for async jobs
- Config Mgmt: Ansible playbooks for all provisioning
- mTLS: Smallstep for inter-service TLS

### Phase 4: Optimize (Week 9-12)
- Container orchestration: Evaluate Docker Swarm vs K8s
- Multi-region: Evaluate replication strategy
- SIEM: Wazuh for security monitoring
- Capacity planning: VictoriaMetrics for long-term metric retention
- Disaster recovery: Document and test restore procedures

---

## 90-Day Roadmap

```
Week 1   ████████████████░░░░░░░░░░░░░░░░  Phase 0: Foundation
         Caddy, WireGuard, CoreDNS, Chrony, Docker Compose infra stack

Week 2   ░░░░░░░░░░░░████████████████░░░░  Phase 1: Safety
         BorgBackup, Barman, Vault, Prometheus, Grafana, Alertmanager, Uptime Kuma

Week 3-4 ░░░░░░░░░░░░░░░░░░██████████████  Phase 2: Observability
         Loki, Promtail, Authentik, OpenLDAP, Consul, Woodpecker, Kener

Week 5-8 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Phase 3: Scale
         Kong, MinIO, Meilisearch, RabbitMQ, Ansible, Smallstep

Week 9-12░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Phase 4: Optimize (Evaluate & Begin)
         Swarm/K8s eval, SIEM/Wazuh, DR testing, capacity planning

         ██ = Active    ░░ = Future
```

---

## Quick Wins (Can Be Done This Week)

1. **Uptime Kuma** — Single Docker container. Monitor all public endpoints. Webhook to Slack on downtime. (30 min)
2. **Prometheus + Node Exporter** — Two Docker containers. Basic CPU/memory/disk metrics. (1 hour)
3. **Grafana** — One Docker container. Connect to Prometheus. Pre-built dashboards. (30 min)
4. **Barman for PostgreSQL** — If PostgreSQL is running, enable WAL archiving and automated backups. (1 hour)
5. **BorgBackup for critical files** — Simple cron script. Deduplicated encrypted backups. (30 min)
6. **Caddy as reverse proxy** — One Docker container. Auto-TLS. Replace any raw port exposure. (1 hour)
7. **Vault for secrets** — Docker Compose config. Migrate Stripe/API keys from env files. (2 hours)
8. **WireGuard admin VPN** — Secure access to admin interfaces. (1 hour)
9. **Chrony on all nodes** — Essential for audit log timestamps. (15 min per node)
10. **Alertmanager to Slack** — Webhook integration. Basic alert rules for CPU/memory/disk. (1 hour)

---

## Long-Term Vision

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          SLA113 FABRIC — FULL PRODUCTION MATRIX                       │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                          GLOBAL LOAD BALANCER                                  │    │
│  │                     (Kong API Gateway + Caddy Reverse Proxy)                    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                       SLA113 CONTROL PLANE                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │  Consul  │ │  Vault   │ │Authentik │ │  Consul  │ │   ArgoCD /       │    │    │
│  │  │ Service  │ │ Secrets  │ │  IdP     │ │  DNS     │ │   Woodpecker     │    │    │
│  │  │ Discovery│ │          │ │          │ │          │ │   CI/CD          │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                     UNIVERSE CLUSTERS (Docker Swarm or K8s)                   │    │
│  │                                                                               │    │
│  │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────┐   │    │
│  │ │   EMPIRE-1       │ │   LYPRICA 3      │ │   ARCHISYNAPSE              │   │    │
│  │ │   Cluster        │ │   Cluster        │ │   Cluster (PCI-enclave)     │   │    │
│  │ └──────────────────┘ └──────────────────┘ └──────────────────────────────┘   │    │
│  │ ┌──────────────────┐ ┌──────────────────┐                                    │    │
│  │ │   CULTURA        │ │ SOUTHERN ARCADE  │                                    │    │
│  │ │   Cluster        │ │   Cluster        │                                    │    │
│  │ └──────────────────┘ └──────────────────┘                                    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                       SHARED DATA FABRIC                                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │PostgreSQL│ │  MinIO   │ │  Redis   │ │RabbitMQ  │ │   Victoria-      │    │    │
│  │  │ (Streams)│ │  Object  │ │  Cluster │ │  Cluster │ │   Metrics        │    │    │
│  │  │  16+     │ │  Storage │ │          │ │          │ │                  │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                       OBSERVABILITY FABRIC                                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │ Grafana  │ │Prometheus│ │   Loki   │ │  Alert-  │ │  Kener /         │    │    │
│  │  │   (HA)   │ │Victoria  │ │  Aggr    │ │  manager │ │  OneUptime       │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                       INFRASTRUCTURE (Proxmox VE Cluster)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐    │    │
│  │  │  Node 1  │ │  Node 2  │ │  Node 3  │ │  OPNsense│ │   WireGuard      │    │    │
│  │  │ (control)│ │ (worker) │ │ (worker) │ │ Firewall │ │   Mesh           │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Key Long-Term Design Decisions

1. **Per-universe isolation** — Each universe runs in its own Docker Swarm stack or Kubernetes namespace. Shared infrastructure (monitoring, identity, secrets) is provided by SLA1113 control plane but each universe owns its data.

2. **PCI-enclave for Archisynapse** — Financial infrastructure lives in a separate, hardened cluster with restricted network access, mandatory mTLS, and enhanced audit logging.

3. **Data sovereignty** — Each universe's PostgreSQL database is separate (not shared). Cross-universe queries go through the API gateway, not direct DB access.

4. **Graduated complexity** — Start with Docker + Swarm (simple), graduate to Kubernetes only when Swarm's limits are hit. The architecture is designed to be K8s-ready without requiring K8s from day one.

5. **Backup-first culture** — All data paths have automated backups with tested restore procedures before any system is declared production.

6. **Observability by default** — Every new service gets Prometheus metrics endpoint + structured logging from day one. This is enforced via CI/CD linting.

---

## Cost Estimation

| Service | FOSS Option | Approx Monthly Ops Cost | Notes |
|---|---|---|---|
| Monitoring | Prometheus + VictoriaMetrics + Grafana | $0 (self-hosted) | ~4GB RAM for moderate scale |
| Logging | Loki + Promtail | $0 (self-hosted) | Object storage for log chunks |
| Backups | BorgBackup + Barman + Restic | $5-20 (S3/Backblaze storage) | ~100GB storage for backups |
| Secrets | Vault | $0 (self-hosted) | ~2GB RAM |
| Identity | Authentik + OpenLDAP | $0 (self-hosted) | ~2GB RAM |
| Reverse Proxy | Caddy | $0 (self-hosted) | Minimal overhead |
| API Gateway | Kong (community) | $0 (self-hosted) | ~2GB RAM + PostgreSQL backend |
| CI/CD | Woodpecker | $0 (self-hosted) | Uses existing Docker host |
| Containers | Docker + Portainer | $0 | Already running |
| Object Storage | MinIO | $0 (self-hosted) | Storage costs = disk |
| PostgreSQL | Self-hosted | $0 (self-hosted) | Storage costs = disk |
| Redis | Self-hosted | $0 (self-hosted) | ~1GB RAM |
| Search | Meilisearch | $0 (self-hosted) | ~2GB RAM |
| Status Page | Kener | $0 (self-hosted) | Minimal overhead |
| Config Mgmt | Ansible | $0 | No agent overhead |
| Service Discovery | Consul | $0 (self-hosted) | ~2GB RAM per cluster |
| Queue | RabbitMQ | $0 (self-hosted) | ~2GB RAM |
| **Total estimated infra cost** | | **$5-20/month + storage** | Excludes server/VPS hosting costs |

**Comparison:** Equivalent SaaS stack (Datadog + PagerDuty + LastPass + Okta + Cloudflare + Algolia + AWS S3) would cost **$2,000-5,000+/month**.

---

## SLA113 Infrastructure Maturity Model

| Level | Name | Characteristics | Timeframe | Metrics |
|---|---|---|---|---|
| **L0** | Ad-hoc | Manual deploys, no backups, env file secrets | Current state | 0/10 reliability score |
| **L1** | Protected | Automated backups, secrets management, basic monitoring | Week 1-2 | 3/10 — data is safe, but blind to outages |
| **L2** | Observable | Centralized logs, metrics, alerts, dashboards | Week 3-4 | 6/10 — can detect and diagnose issues |
| **L3** | Automated | CI/CD, config management, status pages, incident tracking | Week 5-8 | 8/10 — can deploy and recover rapidly |
| **L4** | Resilient | Multi-region, DR testing, auto-scaling, mTLS mesh | Week 9-12+ | 10/10 — survives region failure, self-healing |

**Current State:** L0 (Ad-hoc)

---

## Appendix: awesome-sysadmin Categories Not Directly Applicable

The following categories from awesome-sysadmin have lower relevance to SLA113's immediate needs but are noted for completeness:

| Category | Notes |
|---|---|
| ChatOps | Potential future use (Opsgenie replacement via Errbot) |
| Code Review | Already handled by GitHub PRs |
| Control Panels | Not applicable (custom UIs per universe) |
| Diagramming | Useful for documentation (Mermaid, Draw.io) |
| Editors | Personal preference — no infra decision needed |
| IT Asset Management | Relevant when hardware is deployed (Snipe-IT) |
| Mail Clients | Not needed (API-driven email via Resend/SMTP) |
| Packaging | Not applicable (Docker-first deployment) |
| Project Management | Already using GitHub Projects |
| Remote Desktop | Not applicable (API-first systems) |
| Troubleshooting | Individual tooling (Wireshark, mitmproxy) |
| Version Control | Already using Git/GitHub |
| Virtualization | Proxmox covers this need |

---

*This document is an analysis based on the awesome-sysadmin repository. No production code was modified in its creation. All recommendations are advisory and should be validated against SLA113's actual deployment environment before implementation.*
