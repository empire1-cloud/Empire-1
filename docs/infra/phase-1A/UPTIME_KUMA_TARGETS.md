# Phase 1A — Uptime Kuma Target List
> Add these monitors to Uptime Kuma.
> Uptime Kuma can run on Railway, Render, or your local machine — no VPS required.
> All 10 endpoints cover the full SLA113 ecosystem (public + API surfaces).

---

## Monitor Configuration

| # | Endpoint | Type | Interval | Expected Status | Alert Method | Universe |
|---|---|---|---|---|---|---|
| 1 | `https://lyrica3.com` | HTTP(s) | 60s | 200 | Slack | Lyrica 3 |
| 2 | `https://www.lyrica3.com` | HTTP(s) | 60s | 200 | Slack | Lyrica 3 |
| 3 | `https://sluniversal.lyrica3.com` | HTTP(s) | 60s | 200 | Slack | SL Universal |
| 4 | `https://api.lyrica3.com/api/health` | HTTP(s) | 30s | 200 + JSON body `{"status":"ok"}` | Slack | Lyrica 3 |
| 5 | `https://empire1.cloud` | HTTP(s) | 60s | 200 | Slack | Empire-1 |
| 6 | `https://api.empire1.cloud/api/health` | HTTP(s) | 30s | 200 + JSON body | Slack | Empire-1 |
| 7 | `https://southernlifestyle.org` | HTTP(s) | 60s | 200 | Slack | Southern Lifestyle |
| 8 | `https://www.southernlifestyle.org` | HTTP(s) | 60s | 200 | Slack | Southern Lifestyle |
| 9 | `https://arcade.southernlifestyle.org` | HTTP(s) | 60s | 200 | Slack | Southern Arcade |
| 10 | `https://sla113.southernlifestyle.org` | HTTP(s) | 60s | 200 | Slack | SLA113 |

---

## Setup Instructions

### Deploy Uptime Kuma (Choose One)

**Option A: Railway (recommended — always-on, free tier)**
1. Railway Dashboard → New Project → Deploy from Docker
2. Image: `louislam/uptime-kuma:latest`
3. Port: 3001
4. Add persistent volume at `/app/data`

**Option B: Render**
1. Render Dashboard → New → Web Service
2. Source: Docker → `louislam/uptime-kuma:latest`
3. Port: 3001
4. Plan: Free (idles after inactivity, but Uptime Kuma checks can wake it)

**Option C: Local (dev machine)**
```bash
docker run -d \
  --name sla113-uptime-kuma \
  --restart unless-stopped \
  -p 127.0.0.1:3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:latest
```

### Configure Monitors

1. Open Uptime Kuma at its deployed URL
2. Create admin account on first visit (use strong password)
3. Go to **Settings → Notification** → Add Slack Webhook
4. Go to **Monitor → Add Monitor**

For each endpoint:
- **Type:** HTTP(s)
- **URL:** (from table above)
- **Interval:** (from table above)
- **Notification:** Slack
- **Retry:** 3
- **Advanced:** Enable "Resolve status" check — a single success after failure should auto-resolve

---

## Future Monitors (Phase 1B+)

Once Caddy reverse proxy is deployed, add:

- Internal health endpoints (before they hit the public proxy)
- SSL certificate expiry checks (Uptime Kuma supports this natively)
- DNS resolution checks
- Port checks (443, 80, 8001, etc.)

---

## Monitoring Philosophy

> **Watch the empire first.** Phase 1A is about visibility — knowing what's up and what's down before making any changes.
