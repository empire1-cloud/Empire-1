# Phase 1A — DNS Fix Checklist

> Safe procedure for updating DNS records.
> **One record at a time. Verify after each change.**
> Never guess DNS targets — always get the exact value from the platform dashboard.

---

## Before Any DNS Change

- [ ] Identify the DNS provider for the domain
- [ ] Log into the DNS provider dashboard
- [ ] Export current DNS records (screenshot or zone file export)
- [ ] Save exported records to `docs/infra/dns-snapshots/` (create dir if needed)
- [ ] Confirm the target value from the destination platform

---

## Known DNS Providers

| Domain | Provider | Notes |
|---|---|---|
| `lyrica3.com` + subdomains | Unknown (Google Domains? IONOS? Vercel?) | `api.lyrica3.com` and `sluniversal.lyrica3.com` have `ghs.googlehosted.com` A records — possibly Google Domains DNS |
| `empire1.cloud` | Vercel (NS records → Vercel) | A record resolves to 76.76.21.21 (Vercel) |
| `api.empire1.cloud` | Uberspace (ui-dns.de etc.) | Points to GCLB (130.211.29.24) |
| `southernlifestyle.org` + subdomains | Uberspace (ui-dns.de/com/biz/org) | All point to GCLB (130.211.29.24) |

---

## How to Find the DNS Provider

```bash
# Check NS records
dig NS lyrica3.com +short
dig NS empire1.cloud +short
dig NS southernlifestyle.org +short

# Check registrar (WHOIS)
whois lyrica3.com | grep -i "registrar\|Name Server"
whois southernlifestyle.org | grep -i "registrar\|Name Server"
```

---

## Fix Procedure: `api.lyrica3.com` → Railway

### Step 1: Get the Railway CNAME target
- [ ] Log into Railway dashboard
- [ ] Select Lyrica3-pro backend service
- [ ] Go to **Settings → Domains**
- [ ] Click **Add Custom Domain**
- [ ] Enter: `api.lyrica3.com`
- [ ] Copy the Railway-provided CNAME target (looks like `api.lyrica3.com.cname.railway.app` or similar)

### Step 2: Update DNS
- [ ] Log into DNS provider for lyrica3.com
- [ ] **Screenshot current records** before editing
- [ ] Do NOT delete existing records yet — just add/update the specific one
- [ ] **For the `api` subdomain:**
  - If current record is an A record → change to CNAME pointing to Railway target
  - If current record is a CNAME → update value to Railway target
- [ ] Save/apply the change

### Step 3: Verify after propagation
```bash
# Check DNS propagation (wait 5-15 min)
dig api.lyrica3.com +short

# Check Railway domain verification status
# (Railway dashboard → Domains → verify shows green checkmark)

# Check the health endpoint
curl https://api.lyrica3.com/api/health

# Expected: {"status":"ok",...} (200)
```

### Step 4: Log the change
- [ ] Save screenshot of the new DNS record to `docs/infra/dns-snapshots/`
- [ ] Record the change in `docs/infra/phase-1A/DNS_CHANGE_LOG.md` (create if needed)

---

## Fix Procedure: `api.empire1.cloud` + Southern Lifestyle Domains

### Option A: Fix GCP Load Balancer (keep on Cloud Run)

```bash
# 1. Check if Cloud Run services exist
gcloud run services list --project=disco-amphora-490606-n8 --region=us-central1

# 2. If empire1-backend is missing, redeploy
gcloud builds submit --config cloudbuild.backend.yaml --project=disco-amphora-490606-n8

# 3. Test the Cloud Run URL directly
curl https://empire1-backend-339698334666.us-central1.run.app/api/health

# 4. If Cloud Run is healthy but GCLB is broken
cd deployment
bash setup-gcp-lb.sh    # idempotent — safe to re-run

# 5. Verify cutover
bash verify-cutover.sh
```

### Option B: Move to Vercel/Railway (migrate off GCP)

Only proceed if you've decided to migrate. This requires:
- Deploying the Empire-1 backend on Railway instead of Cloud Run
- Updating Vercel rewrites in `next.config.mjs` to point to Railway URL
- Updating DNS for all `*.southernlifestyle.org` domains to point to Vercel

This is a larger change — create a separate migration plan.

---

## DNS General Rules

| Rule | Why |
|---|---|
| **One record at a time** | Minimizes blast radius. If something breaks, you know exactly what caused it. |
| **Export before editing** | Recovery if you need to roll back. DNS propagation can take hours — don't guess the original value. |
| **Screenshot before/after** | Proof of change. Useful for debugging later. |
| **Wait for propagation** | DNS TTL varies. Some providers propagate in 1-5 min, others take hours. Use `dig @8.8.8.8` to check from Google's perspective. |
| **Verify with curl, not browser** | Browsers cache aggressively. Curl with `--connect-timeout 10` for reliable results. |
| **Don't delete old records immediately** | If the new record doesn't work, you can switch back by deleting it. Only clean up old records after verification passes. |
| **CNAME at apex is not allowed** | If `api.lyrica3.com` is at the zone apex (unlikely — it's a subdomain), you'll need an ALIAS/ANAME record instead of CNAME. Subdomains can use CNAME. |

---

## After All DNS Fixes Are Complete

- [ ] Re-run full endpoint verification from `PHASE_1A_VERIFICATION.md`
- [ ] All 10 endpoints return 200
- [ ] Update `HOSTING_MAP.md` with corrected DNS targets
- [ ] Deploy Uptime Kuma (on Railway or other lightweight platform)
- [ ] Add all 10 monitors from `UPTIME_KUMA_TARGETS.md`
- [ ] Connect Slack webhook for alerts
