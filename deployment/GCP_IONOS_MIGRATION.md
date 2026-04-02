# Google Cloud + IONOS Migration

This repo can be moved off the VPS without moving domain registration away from IONOS.

Keep IONOS as the registrar and DNS host. Point the DNS records at Google Cloud.

## Target Architecture

- Frontend: Cloud Run service `empire1-frontend`
- Backend: Cloud Run service `empire1-backend`
- Entry point: Google Cloud external HTTPS load balancer
- DNS host: IONOS
- SSL: Google-managed certificate on the load balancer

## Domain Mapping

- `empire1.cloud` -> frontend
- `southernlifestyle.org` -> frontend
- `www.southernlifestyle.org` -> frontend
- `arcade.southernlifestyle.org` -> frontend
- `sla113.southernlifestyle.org` -> frontend
- `/api/*` on every host -> backend

## Data Topology

This codebase is already set up for separate MongoDB Atlas connections per tenant group:

- `MONGODB_ATLAS_EMPIRE_URI` / `MONGODB_ATLAS_EMPIRE_DB`
- `MONGODB_ATLAS_SOUTHERN_URI` / `MONGODB_ATLAS_SOUTHERN_DB`

That means Empire1 and Southern can stay on separate Mongo clusters or separate Mongo databases during migration.

Application-level host behavior is enforced in:

- `middleware.ts`
- `app/page.tsx`

## Important Repo Change

`next.config.mjs` now rewrites `/api/*` to `localhost:8000` only outside production.

That matters because in Google Cloud production traffic should reach the backend through the HTTPS load balancer, not through a hardcoded localhost rewrite.

## 1. Enable Required Google Cloud Services

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com \
  certificatemanager.googleapis.com
```

## 2. Deploy Frontend and Backend to Cloud Run

Frontend:

```bash
gcloud builds submit \
  --config cloudbuild.frontend.yaml \
  .
```

Backend:

```bash
gcloud builds submit \
  --config cloudbuild.backend.yaml \
  .
```

If the backend needs environment variables recovered from the VPS, set them on Cloud Run before sending traffic:

```bash
gcloud run services update empire1-backend \
  --region us-central1 \
  --set-env-vars KEY1=value1,KEY2=value2
```

Prefer Secret Manager for sensitive values.

## 3. Reserve a Global Static IP

```bash
gcloud compute addresses create empire1-web-ip \
  --global

gcloud compute addresses describe empire1-web-ip \
  --global
```

Save the returned IP. You will enter that into IONOS later.

## 4. Create Serverless Network Endpoint Groups

Frontend NEG:

```bash
gcloud compute network-endpoint-groups create empire1-frontend-neg \
  --region us-central1 \
  --network-endpoint-type serverless \
  --cloud-run-service empire1-frontend
```

Backend NEG:

```bash
gcloud compute network-endpoint-groups create empire1-backend-neg \
  --region us-central1 \
  --network-endpoint-type serverless \
  --cloud-run-service empire1-backend
```

## 5. Create Backend Services for the Load Balancer

```bash
gcloud compute backend-services create empire1-frontend-backend \
  --global \
  --load-balancing-scheme EXTERNAL_MANAGED

gcloud compute backend-services add-backend empire1-frontend-backend \
  --global \
  --network-endpoint-group empire1-frontend-neg \
  --network-endpoint-group-region us-central1

gcloud compute backend-services create empire1-api-backend \
  --global \
  --load-balancing-scheme EXTERNAL_MANAGED

gcloud compute backend-services add-backend empire1-api-backend \
  --global \
  --network-endpoint-group empire1-backend-neg \
  --network-endpoint-group-region us-central1
```

## 6. Create URL Map with API Path Routing

Create `deployment/url-map.yaml` locally with this shape:

```yaml
defaultService: projects/PROJECT_ID/global/backendServices/empire1-frontend-backend
hostRules:
  - hosts:
      - empire1.cloud
      - southernlifestyle.org
      - www.southernlifestyle.org
      - arcade.southernlifestyle.org
      - sla113.southernlifestyle.org
    pathMatcher: empire1-matcher
pathMatchers:
  - name: empire1-matcher
    defaultService: projects/PROJECT_ID/global/backendServices/empire1-frontend-backend
    pathRules:
      - paths:
          - /api
          - /api/*
        service: projects/PROJECT_ID/global/backendServices/empire1-api-backend
```

Then create the URL map:

```bash
gcloud compute url-maps import empire1-web-map \
  --global \
  --source deployment/url-map.yaml
```

Replace `PROJECT_ID` before importing.

## 7. Create a Google-Managed SSL Certificate

```bash
gcloud compute ssl-certificates create empire1-managed-cert \
  --domains=empire1.cloud,southernlifestyle.org,www.southernlifestyle.org,arcade.southernlifestyle.org,sla113.southernlifestyle.org \
  --global
```

## 8. Create HTTPS Proxy and Forwarding Rule

```bash
gcloud compute target-https-proxies create empire1-https-proxy \
  --global \
  --url-map empire1-web-map \
  --ssl-certificates empire1-managed-cert

gcloud compute forwarding-rules create empire1-https-rule \
  --global \
  --load-balancing-scheme EXTERNAL_MANAGED \
  --network-tier PREMIUM \
  --address empire1-web-ip \
  --target-https-proxy empire1-https-proxy \
  --ports 443
```

Optional HTTP to HTTPS redirect:

```bash
gcloud compute url-maps create empire1-http-redirect \
  --global \
  --default-url-redirect=https://empire1.cloud \
  --default-redirect-response-code=301
```

### One-Command Automation (Optional)

This repo now includes an idempotent setup script that performs steps 3 through 8:

```bash
./deployment/setup-gcp-lb.sh <PROJECT_ID>
```

It will:

- create the global static IP (if missing)
- create both serverless NEGs (if missing)
- create and attach backend services (if missing)
- import/update the URL map from `deployment/url-map.yaml`
- create the managed SSL certificate (if missing)
- create HTTPS proxy and forwarding rule (if missing)

At the end it prints the static IP and current certificate status.

## 9. Update DNS in IONOS

In IONOS DNS, point these records to the Google static IP from step 3:

- `@` for `empire1.cloud` -> A -> `STATIC_IP`
- `@` for `southernlifestyle.org` -> A -> `STATIC_IP`
- `www` -> A or CNAME -> `STATIC_IP` or root host depending on IONOS UI
- `arcade` -> A -> `STATIC_IP`
- `sla113` -> A -> `STATIC_IP`

Do not move nameservers unless you want Google Cloud DNS to host your zone. It is not required.

## 10. Wait for Certificate Provisioning

Google-managed certificates stay in provisioning until DNS is correct and public.

Check status:

```bash
gcloud compute ssl-certificates describe empire1-managed-cert --global
```

## 11. Post-Cutover Validation

Verify these behaviors:

- `https://empire1.cloud` shows the Empire frontend
- `https://southernlifestyle.org` shows the Southern frontend
- `https://arcade.southernlifestyle.org` shows the arcade frontend
- `https://sla113.southernlifestyle.org` redirects into `/admin` and requires your admin cookie outside local dev
- `https://<host>/api/...` reaches the backend through the load balancer

## Recovery Priorities From The VPS Backup

If the VPS is corrupted, recover these first before cutover:

- backend environment variables and secrets
- database credentials and connection strings
- API keys
- any uploaded assets not already in git
- TLS-independent app secrets such as JWT or admin token signing values

## Recommended Next Step

After first successful cutover, export the remaining VPS files and move secrets into Google Secret Manager so the deployment is no longer dependent on the old box.

## Operations Checklist

For cutover-day execution, use:

- `deployment/CUTOVER_CHECKLIST.md`

Rollback helper (if needed):

- `deployment/teardown-gcp-lb.sh`