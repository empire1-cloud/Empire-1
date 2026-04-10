# Empire-1 Cutover Checklist (GCP + IONOS)

Use this checklist on cutover day to avoid missed steps.

## 1. Preflight

- [ ] Confirm you are in the correct project:
  - `gcloud config get-value project`
- [ ] Confirm required services are enabled:
  - `gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com compute.googleapis.com certificatemanager.googleapis.com`
- [ ] Confirm backend secrets/env values are ready before traffic cutover.
- [ ] Confirm frontend and backend Cloud Run service names:
  - frontend: `empire1-frontend`
  - backend: `empire1-backend`

## 2. Build and Deploy App Services

- [ ] Deploy frontend:
  - `gcloud builds submit --config cloudbuild.frontend.yaml .`
- [ ] Deploy backend:
  - `gcloud builds submit --config cloudbuild.backend.yaml .`
- [ ] If needed, apply backend env vars:
  - `bash deployment/cloudrun-backend-env.template.sh`

## 3. Provision Load Balancer Stack

- [ ] Run one-command LB setup:
  - `./deployment/setup-gcp-lb.sh <PROJECT_ID>`
- [ ] Capture static IP from script output.
- [ ] Confirm URL map exists:
  - `gcloud compute url-maps describe empire1-web-map --global`
- [ ] Confirm forwarding rule exists:
  - `gcloud compute forwarding-rules describe empire1-https-rule --global`

## 4. DNS Cutover in IONOS

- [ ] Point all required A records to the static IP:
  - `empire1.cloud`
  - `southernlifestyle.org`
  - `www.southernlifestyle.org` (A or CNAME per IONOS UI)
  - `arcade.southernlifestyle.org`
  - `sla113.southernlifestyle.org`
- [ ] Keep IONOS as registrar/DNS host (no nameserver move required).

## 5. Certificate Readiness

- [ ] Check managed cert status:
  - `gcloud compute ssl-certificates describe empire1-managed-cert --global --format='value(managed.status)'`
- [ ] Wait until status is `ACTIVE` before final validation.

## 6. Post-Cutover Validation

- [ ] `https://empire1.cloud` loads Empire frontend.
- [ ] `https://southernlifestyle.org` loads Southern frontend.
- [ ] `https://arcade.southernlifestyle.org` loads arcade frontend.
- [ ] `https://sla113.southernlifestyle.org` lands on `/admin` and enforces auth.
- [ ] `https://<host>/api/...` reaches backend through LB.
- [ ] Run unified verification script:
  - `./deployment/verify-cutover.sh <PROJECT_ID>`

## 7. Smoke Tests

- [ ] Verify admin login/session cookie behavior on SLA113 host.
- [ ] Verify at least one API route for each tenant scenario.
- [ ] Verify no mixed-content or TLS errors in browser console.
- [ ] Verify Cloud Run logs show successful request flow for frontend and backend.

## 8. Rollback Readiness

- [ ] Keep old VPS running until all checks pass.
- [ ] Keep previous DNS values documented for quick rollback.
- [ ] Define rollback trigger (for example, sustained 5xx or login failure).
- [ ] If full LB rollback is required:
  - `./deployment/teardown-gcp-lb.sh <PROJECT_ID> --yes`

## 9. Final Sign-Off

- [ ] Record cutover timestamp.
- [ ] Record DNS propagation completion time.
- [ ] Record cert active timestamp.
- [ ] Record operator sign-off.
