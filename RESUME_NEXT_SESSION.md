# Resume Next Session (Cloud Shell)

## Goal
- Restore/verify Lyrica login
- Ensure Luna/Xolotl slice is live
- Validate domain + service routing in one pass

## Preconditions
- GCP auth active in Cloud Shell (`gcloud auth list`)
- Project: `disco-amphora-490606-n8`
- Region: `us-central1`
- Branch: `cursor/sovereign-unify-c13f`

## One-command deploy

```bash
bash deployment/cloud_shell_full_throttle.sh
```

## One-command verify

```bash
bash deployment/verify_live_state.sh
```

## If login still fails
- Ensure degraded auth env is present on `empire1-backend`:
  - `ALLOW_DEGRADED_AUTH=true`
  - `DEGRADED_AUTH_EMAIL=admin@lyrica3.com`
  - `DEGRADED_AUTH_PASSWORD=TempPass123!`

Re-run:

```bash
bash deployment/verify_live_state.sh
```

## If frontend still shows wrong surface
- Confirm domain mappings:
  - `lyrica3.com -> lyrica3-frontend`
  - `www.lyrica3.com -> lyrica3-frontend`
  - `api.lyrica3.com -> empire1-backend`

Then force rebuild frontend:

```bash
gcloud builds submit --project=disco-amphora-490606-n8 --config=cloudbuild.frontend.yaml \
  --substitutions _SERVICE_NAME=lyrica3-frontend,_IMAGE_NAME=lyrica3-frontend,_BACKEND_URL=https://api.lyrica3.com,_SLA113_BACKEND_URL=https://api.lyrica3.com .
```
