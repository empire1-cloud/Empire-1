# Phase 1A — Verification Checklist

> Verify that all public endpoints and API health checks are reachable.
> Run this from any machine with internet access (no Docker required).

---

## 1. Lyrica 3 — Public Homepage

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://lyrica3.com
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 2. Lyrica 3 — WWW

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://www.lyrica3.com
# Expected: HTTP 200 (may redirect to lyrica3.com)
```

**Pass/Fail:** _____

---

## 3. Lyrica 3 — API Health

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://api.lyrica3.com/api/health
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 4. SL Universal

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://sluniversal.lyrica3.com
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 5. Empire-1 — Public Homepage

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://empire1.cloud
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 6. Empire-1 — API Health

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://api.empire1.cloud/api/health
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 7. Southern Lifestyle — Public Homepage

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://southernlifestyle.org
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 8. Southern Lifestyle — WWW

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://www.southernlifestyle.org
# Expected: HTTP 200 (may redirect)
```

**Pass/Fail:** _____

---

## 9. Southern Arcade

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://arcade.southernlifestyle.org
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## 10. SLA113 Console

```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Time: %{time_total}s\n" https://sla113.southernlifestyle.org
# Expected: HTTP 200
```

**Pass/Fail:** _____

---

## Summary

| # | Endpoint | Status | Response Time |
|---|---|---|---|
| 1 | `https://lyrica3.com` | ⬜ | ___ |
| 2 | `https://www.lyrica3.com` | ⬜ | ___ |
| 3 | `https://api.lyrica3.com/api/health` | ⬜ | ___ |
| 4 | `https://sluniversal.lyrica3.com` | ⬜ | ___ |
| 5 | `https://empire1.cloud` | ⬜ | ___ |
| 6 | `https://api.empire1.cloud/api/health` | ⬜ | ___ |
| 7 | `https://southernlifestyle.org` | ⬜ | ___ |
| 8 | `https://www.southernlifestyle.org` | ⬜ | ___ |
| 9 | `https://arcade.southernlifestyle.org` | ⬜ | ___ |
| 10 | `https://sla113.southernlifestyle.org` | ⬜ | ___ |
| **All endpoints reachable** | | ⬜ | |

## Post-Verification

If all 10 return HTTP 200:

1. Run a lightweight Uptime Kuma (on Railway, Render, or locally) to monitor these continuously
2. Add Slack webhook notifications for downtime alerts
3. Proceed to Phase 1B scope planning (backups, secrets, CI/CD)

If any endpoint fails:

1. Check DNS resolution: `dig +short <domain>`
2. Check if the service is deployed (Railway/Cloud Run dashboard)
3. Check if the domain is pointing to the correct platform
4. Do not proceed until all endpoints are confirmed working
