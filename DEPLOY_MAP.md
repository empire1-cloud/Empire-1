# Deploy Map (Source of Truth)

## Domain -> Service -> Universe
| Domain | Cloud Run Service | Universe | Purpose | Owner |
|---|---|---|---|---|
| lyrica3.com | lyrica3-frontend | LYRICA3 (U1) | Sonance Pro studio (default mode) | lyrica |
| www.lyrica3.com | lyrica3-frontend | LYRICA3 (U1) | Lyrica alias | lyrica |
| sluniversal.lyrica3.com | lyrica3-frontend | LYRICA3 (U1) | SL Universal Pulse Stream — same app, /universal mode | lyrica |
| api.lyrica3.com | lyrica3-backend | LYRICA3 (U1) | Lyrica API/Auth | sla113 |
| empire1.cloud | empire1-frontend | EMPIREONE (U4) | Empire public app | empire1 |
| api.empire1.cloud | empire1-backend | EMPIREONE (U4) | Empire API | empire1 |
| southernlifestyle.org | empire1-frontend | SOUTHERN (U3) | Southern public home | southern |
| www.southernlifestyle.org | empire1-frontend | SOUTHERN (U3) | Southern alias | southern |
| arcade.southernlifestyle.org | empire1-frontend | SOUTHERN (U3) | Arcade surface | southern |
| sla113.southernlifestyle.org | empire1-frontend | SLA113 (U0) | SLA113 operator entry | sla113 |

## Required Environment Variables
- BACKEND_URL
- SLA113_BACKEND_URL
- ARCADE_EXTERNAL_URL (optional temporary redirect)

## Release Gates (must pass before “published”)
- Backend health check passes
- Login endpoint returns token for expected auth mode
- Domain mappings match this table
- Lyrica and Empire surfaces render correct host-specific home
- If music release: checksums + release_receipt present

## Change Control
Any change to domain mapping requires:
1) PR note
2) updated `SHARED/universe_registry.yaml`
3) updated `DEPLOY_MAP.md`
4) post-change verification output logged
