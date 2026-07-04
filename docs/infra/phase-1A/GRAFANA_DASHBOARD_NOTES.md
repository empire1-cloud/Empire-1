# Phase 1A — Grafana Dashboard Notes (DEFERRED)

> ⚠️ Grafana requires Prometheus as a data source, which requires a self-managed node.
> ⚠️ Do NOT deploy yet — see HOSTING_MAP.md for current hosting architecture.
>
> These dashboards are **templates for a future self-managed infrastructure node**.
> They will be created manually once Prometheus is deployed, then automated in Phase 1C.

---

## Prerequisites

1. Grafana running: `http://localhost:3000` (admin / CHANGE_ME)
2. Add Prometheus data source:
   - **Type:** Prometheus
   - **URL:** `http://prometheus:9090`
   - **Access:** Server (default)
   - **Save & Test** — should return green

---

## Dashboard 1: Node Exporter — Host Overview

**Source:** Prometheus (node_exporter job)

**Panels to add:**

| Panel | Query (PromQL) | Unit | Notes |
|---|---|---|---|
| CPU Usage | `100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)` | Percent | Overall CPU utilization |
| Memory Usage | `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100` | Percent | RAM utilization |
| Disk Usage | `(1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})) * 100` | Percent | Root filesystem usage |
| Network I/O | `rate(node_network_receive_bytes_total[5m])` + `rate(node_network_transmit_bytes_total[5m])` | Bytes/sec | Combined RX/TX |
| Disk I/O | `rate(node_disk_read_bytes_total[5m])` + `rate(node_disk_written_bytes_total[5m])` | Bytes/sec | Combined read/write |
| Load Average | `node_load15` | Load | 15-minute load average |
| Uptime | `node_time_seconds - node_boot_time_seconds` | Seconds | Host uptime |
| Processes | `node_processes_running` + `node_processes_blocked` | Count | Running + blocked processes |

**Suggested layout:** Single row per host. If multiple node-exporters exist, use Grafana repeating rows.

---

## Dashboard 2: Prometheus — Self-Monitoring

**Source:** Prometheus (prometheus job)

**Panels to add:**

| Panel | Query | Notes |
|---|---|---|
| Targets Up | `prometheus_target_interval_length_seconds` | Time between scrapes |
| Scrape Duration | `rate(prometheus_target_interval_length_seconds_sum[5m]) / rate(prometheus_target_interval_length_seconds_count[5m])` | Avg scrape time |
| Ingest Rate | `rate(prometheus_tsdb_head_samples_appended_total[5m])` | Samples per second |
| TSDB Size | `prometheus_tsdb_storage_blocks_bytes` | Disk used by TSDB |
| Targets | `up` | 1 = up, 0 = down per target |

---

## Dashboard 3: Uptime Kuma — Ecosystem Status

**Source:** Uptime Kuma (re-export to Prometheus via Uptime Kuma's Prometheus endpoint, or use Uptime Kuma's built-in status page)

**Note:** Uptime Kuma has its own built-in status page feature. For Grafana integration, Uptime Kuma exposes a Prometheus metrics endpoint (`/metrics`) that can be scraped.

**If scraping Uptime Kuma's /metrics endpoint:**
- Add a Prometheus scrape target for the uptime-kuma metrics endpoint
- Panels: uptime percentage, response time, last status change

---

## Exporting Dashboards

After creating dashboards manually:

1. Click the **Share** icon in the dashboard header
2. Select **Export** tab
3. Toggle **Export for sharing externally** (to remove data source references)
4. Click **Save to file**
5. Save JSON to `docs/infra/phase-1A/dashboards/`
6. In Phase 1C, these JSON files become the dashboard provisioning directory

---

## Provisioning Automations (Phase 1C)

In Phase 1C, dashboards will be automatically provisioned via Grafana's provisioning API:

```yaml
# config/provisioning/dashboards/sla113.yml
apiVersion: 1
providers:
  - name: "SLA113"
    orgId: 1
    folder: "SLA113 Infrastructure"
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /etc/grafana/provisioning/dashboards
```

For now, create them manually.
