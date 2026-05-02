#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-disco-amphora-490606-n8}"
REGION="${REGION:-us-central1}"
BRANCH="${BRANCH:-cursor/sovereign-unify-c13f}"
REPO_URL="${REPO_URL:-https://github.com/shiestybizz113-cell/Empire-1.git}"
WORKDIR="${WORKDIR:-$HOME/Empire-1}"

BACKEND_SERVICE="${BACKEND_SERVICE:-empire1-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-lyrica3-frontend}"
API_DOMAIN="${API_DOMAIN:-api.lyrica3.com}"
LYRICA_DOMAIN="${LYRICA_DOMAIN:-lyrica3.com}"
LYRICA_WWW_DOMAIN="${LYRICA_WWW_DOMAIN:-www.lyrica3.com}"
BACKEND_API_BASE="${BACKEND_API_BASE:-https://api.lyrica3.com}"

ALLOW_DEGRADED_AUTH="${ALLOW_DEGRADED_AUTH:-true}"
DEGRADED_AUTH_EMAIL="${DEGRADED_AUTH_EMAIL:-admin@lyrica3.com}"
DEGRADED_AUTH_PASSWORD="${DEGRADED_AUTH_PASSWORD:-TempPass123!}"
DEGRADED_AUTH_FIRST_NAME="${DEGRADED_AUTH_FIRST_NAME:-SLA113}"
DEGRADED_AUTH_LAST_NAME="${DEGRADED_AUTH_LAST_NAME:-Operator}"
DEGRADED_AUTH_ROLE="${DEGRADED_AUTH_ROLE:-admin}"

echo "=== Cloud Shell full-throttle deploy ==="
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Branch:  $BRANCH"

command -v gcloud >/dev/null 2>&1 || { echo "gcloud is required."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required."; exit 1; }

gcloud config set project "$PROJECT_ID"
gcloud config set run/region "$REGION"

if [[ -d "$WORKDIR/.git" ]]; then
  cd "$WORKDIR"
  git fetch origin "$BRANCH"
else
  rm -rf "$WORKDIR"
  git clone "$REPO_URL" "$WORKDIR"
  cd "$WORKDIR"
fi

git checkout "$BRANCH"
git pull origin "$BRANCH"

[[ -f cloudbuild.backend.yaml ]] || { echo "Missing cloudbuild.backend.yaml"; exit 1; }
[[ -f cloudbuild.frontend.yaml ]] || { echo "Missing cloudbuild.frontend.yaml"; exit 1; }

echo "--- Deploying backend ($BACKEND_SERVICE) ---"
gcloud builds submit \
  --project="$PROJECT_ID" \
  --config=cloudbuild.backend.yaml \
  .

if [[ "$ALLOW_DEGRADED_AUTH" == "true" ]]; then
  echo "--- Enabling degraded auth fallback on backend ---"
  gcloud run services update "$BACKEND_SERVICE" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --update-env-vars "ALLOW_DEGRADED_AUTH=true,DEGRADED_AUTH_EMAIL=$DEGRADED_AUTH_EMAIL,DEGRADED_AUTH_PASSWORD=$DEGRADED_AUTH_PASSWORD,DEGRADED_AUTH_FIRST_NAME=$DEGRADED_AUTH_FIRST_NAME,DEGRADED_AUTH_LAST_NAME=$DEGRADED_AUTH_LAST_NAME,DEGRADED_AUTH_ROLE=$DEGRADED_AUTH_ROLE"
fi

echo "--- Mapping API domain ($API_DOMAIN) to backend ($BACKEND_SERVICE) ---"
gcloud beta run domain-mappings delete \
  --domain="$API_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --quiet || true

gcloud beta run domain-mappings create \
  --service="$BACKEND_SERVICE" \
  --domain="$API_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID"

echo "--- Deploying frontend ($FRONTEND_SERVICE) ---"
gcloud builds submit \
  --project="$PROJECT_ID" \
  --config=cloudbuild.frontend.yaml \
  --substitutions "_SERVICE_NAME=$FRONTEND_SERVICE,_IMAGE_NAME=$FRONTEND_SERVICE,_BACKEND_URL=$BACKEND_API_BASE,_SLA113_BACKEND_URL=$BACKEND_API_BASE" \
  .

echo "--- Mapping Lyrica domains to frontend ($FRONTEND_SERVICE) ---"
gcloud beta run domain-mappings delete \
  --domain="$LYRICA_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --quiet || true

gcloud beta run domain-mappings create \
  --service="$FRONTEND_SERVICE" \
  --domain="$LYRICA_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID"

gcloud beta run domain-mappings delete \
  --domain="$LYRICA_WWW_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --quiet || true

gcloud beta run domain-mappings create \
  --service="$FRONTEND_SERVICE" \
  --domain="$LYRICA_WWW_DOMAIN" \
  --region="$REGION" \
  --project="$PROJECT_ID"

echo "=== Deploy complete ==="
echo "Run: ./deployment/verify_live_state.sh"
