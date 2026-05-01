#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-disco-amphora-490606-n8}"
REGION="${REGION:-us-central1}"
LOGIN_EMAIL="${LOGIN_EMAIL:-admin@lyrica3.com}"
LOGIN_PASSWORD="${LOGIN_PASSWORD:-TempPass123!}"

echo "== VERIFY LIVE STATE =="
echo "project=$PROJECT_ID region=$REGION"
echo

echo "1) Domain mappings"
gcloud beta run domain-mappings list \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --format='table(metadata.name:label=DOMAIN,spec.routeName:label=SERVICE,status.conditions[0].type:label=READY_TYPE,status.conditions[0].status:label=READY)'
echo

echo "2) Service revisions"
for svc in empire1-backend lyrica3-frontend; do
  rev="$(gcloud run services describe "$svc" --project "$PROJECT_ID" --region "$REGION" --format='value(status.latestReadyRevisionName)')"
  echo "$svc => $rev"
done
echo

echo "3) API health"
curl -sS "https://api.lyrica3.com/api/health" | python3 -m json.tool || true
echo

echo "4) Login smoke test"
LOGIN_STATUS="$(curl -sS -o /tmp/lyrica_login_resp.json -w '%{http_code}' \
  -X POST "https://api.lyrica3.com/api/auth/login" \
  -H "content-type: application/json" \
  -d "{\"email\":\"${LOGIN_EMAIL}\",\"password\":\"${LOGIN_PASSWORD}\"}")"
echo "HTTP $LOGIN_STATUS"
python3 -m json.tool /tmp/lyrica_login_resp.json || cat /tmp/lyrica_login_resp.json
echo

echo "5) Lyrica homepage head"
curl -I "https://lyrica3.com" | rg -i "HTTP/|location|server|cache-control" || true
echo

echo "6) Luna/Xolotl marker check"
if curl -sS "https://lyrica3.com" | rg -i "Luna \\+ Xolotl Bonded Hunt|Luna|Xolotl" >/tmp/luna_marker.txt; then
  echo "FOUND marker(s):"
  cat /tmp/luna_marker.txt
else
  echo "No Luna/Xolotl marker in raw homepage HTML (may still be client-rendered)."
fi
echo

echo "Verification complete."
