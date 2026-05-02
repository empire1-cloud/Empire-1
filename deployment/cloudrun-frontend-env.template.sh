#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="disco-amphora-490606-n8"
REGION="us-central1"
SERVICE="empire1-frontend"

gcloud run services update "$SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --set-env-vars BACKEND_URL="https://empire1-backend-339698334666.us-central1.run.app" \
  --set-env-vars SLA113_BACKEND_URL="https://sla113-backend-339698334666.us-central1.run.app"

echo "Frontend environment update completed."
echo ""
echo "NOTE: NEXT_PUBLIC_GOOGLE_API_KEY is baked into the JS bundle at build time."
echo "To update it you must redeploy via Cloud Build with the key as a substitution:"
echo ""
echo "  gcloud builds submit --config cloudbuild.frontend.yaml \\"
echo "    --substitutions _NEXT_PUBLIC_GOOGLE_API_KEY=YOUR_REAL_KEY ."
