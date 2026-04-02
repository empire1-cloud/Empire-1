#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
REGION="${REGION:-us-central1}"

FRONTEND_SERVICE="${FRONTEND_SERVICE:-empire1-frontend}"
BACKEND_SERVICE="${BACKEND_SERVICE:-empire1-backend}"

STATIC_IP_NAME="${STATIC_IP_NAME:-empire1-web-ip}"
FRONTEND_NEG="${FRONTEND_NEG:-empire1-frontend-neg}"
BACKEND_NEG="${BACKEND_NEG:-empire1-backend-neg}"
FRONTEND_BACKEND_SERVICE="${FRONTEND_BACKEND_SERVICE:-empire1-frontend-backend}"
API_BACKEND_SERVICE="${API_BACKEND_SERVICE:-empire1-api-backend}"
URL_MAP_NAME="${URL_MAP_NAME:-empire1-web-map}"
SSL_CERT_NAME="${SSL_CERT_NAME:-empire1-managed-cert}"
HTTPS_PROXY_NAME="${HTTPS_PROXY_NAME:-empire1-https-proxy}"
FORWARDING_RULE_NAME="${FORWARDING_RULE_NAME:-empire1-https-rule}"

DOMAINS="${DOMAINS:-empire1.cloud,southernlifestyle.org,www.southernlifestyle.org,arcade.southernlifestyle.org,sla113.southernlifestyle.org}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "Error: project id is not set. Pass it as arg1 or run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

for cmd in gcloud sed; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "Error: required command '${cmd}' not found in PATH"
    exit 1
  fi
done

ensure_global_address() {
  if gcloud compute addresses describe "${STATIC_IP_NAME}" --global --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] Global static IP exists: ${STATIC_IP_NAME}"
  else
    echo "[create] Global static IP: ${STATIC_IP_NAME}"
    gcloud compute addresses create "${STATIC_IP_NAME}" \
      --global \
      --project "${PROJECT_ID}"
  fi
}

ensure_serverless_neg() {
  local neg_name="$1"
  local cloud_run_service="$2"

  if gcloud compute network-endpoint-groups describe "${neg_name}" \
    --region "${REGION}" \
    --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] Serverless NEG exists: ${neg_name}"
  else
    echo "[create] Serverless NEG: ${neg_name} -> ${cloud_run_service}"
    gcloud compute network-endpoint-groups create "${neg_name}" \
      --region "${REGION}" \
      --project "${PROJECT_ID}" \
      --network-endpoint-type serverless \
      --cloud-run-service "${cloud_run_service}"
  fi
}

ensure_backend_service() {
  local backend_name="$1"
  if gcloud compute backend-services describe "${backend_name}" \
    --global \
    --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] Backend service exists: ${backend_name}"
  else
    echo "[create] Backend service: ${backend_name}"
    gcloud compute backend-services create "${backend_name}" \
      --global \
      --project "${PROJECT_ID}" \
      --load-balancing-scheme EXTERNAL_MANAGED
  fi
}

ensure_backend_attached() {
  local backend_name="$1"
  local neg_name="$2"

  if gcloud compute backend-services describe "${backend_name}" \
    --global \
    --project "${PROJECT_ID}" \
    --format="value(backends.group)" | grep -q "/networkEndpointGroups/${neg_name}$"; then
    echo "[ok] NEG '${neg_name}' already attached to backend '${backend_name}'"
  else
    echo "[attach] NEG '${neg_name}' -> backend '${backend_name}'"
    gcloud compute backend-services add-backend "${backend_name}" \
      --global \
      --project "${PROJECT_ID}" \
      --network-endpoint-group "${neg_name}" \
      --network-endpoint-group-region "${REGION}"
  fi
}

ensure_ssl_cert() {
  if gcloud compute ssl-certificates describe "${SSL_CERT_NAME}" \
    --global \
    --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] SSL certificate exists: ${SSL_CERT_NAME}"
  else
    echo "[create] Managed SSL certificate: ${SSL_CERT_NAME}"
    gcloud compute ssl-certificates create "${SSL_CERT_NAME}" \
      --global \
      --project "${PROJECT_ID}" \
      --domains "${DOMAINS}"
  fi
}

ensure_https_proxy() {
  if gcloud compute target-https-proxies describe "${HTTPS_PROXY_NAME}" \
    --global \
    --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] HTTPS proxy exists: ${HTTPS_PROXY_NAME}"
  else
    echo "[create] HTTPS proxy: ${HTTPS_PROXY_NAME}"
    gcloud compute target-https-proxies create "${HTTPS_PROXY_NAME}" \
      --global \
      --project "${PROJECT_ID}" \
      --url-map "${URL_MAP_NAME}" \
      --ssl-certificates "${SSL_CERT_NAME}"
  fi
}

ensure_forwarding_rule() {
  if gcloud compute forwarding-rules describe "${FORWARDING_RULE_NAME}" \
    --global \
    --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[ok] Forwarding rule exists: ${FORWARDING_RULE_NAME}"
  else
    echo "[create] HTTPS forwarding rule: ${FORWARDING_RULE_NAME}"
    gcloud compute forwarding-rules create "${FORWARDING_RULE_NAME}" \
      --global \
      --project "${PROJECT_ID}" \
      --load-balancing-scheme EXTERNAL_MANAGED \
      --network-tier PREMIUM \
      --address "${STATIC_IP_NAME}" \
      --target-https-proxy "${HTTPS_PROXY_NAME}" \
      --ports 443
  fi
}

echo "Using project: ${PROJECT_ID}"
echo "Using region:  ${REGION}"

ensure_global_address
ensure_serverless_neg "${FRONTEND_NEG}" "${FRONTEND_SERVICE}"
ensure_serverless_neg "${BACKEND_NEG}" "${BACKEND_SERVICE}"

ensure_backend_service "${FRONTEND_BACKEND_SERVICE}"
ensure_backend_service "${API_BACKEND_SERVICE}"

ensure_backend_attached "${FRONTEND_BACKEND_SERVICE}" "${FRONTEND_NEG}"
ensure_backend_attached "${API_BACKEND_SERVICE}" "${BACKEND_NEG}"

"${ROOT_DIR}/deployment/import-url-map.sh" "${PROJECT_ID}" "${URL_MAP_NAME}"

ensure_ssl_cert
ensure_https_proxy
ensure_forwarding_rule

STATIC_IP_VALUE="$(gcloud compute addresses describe "${STATIC_IP_NAME}" --global --project "${PROJECT_ID}" --format='value(address)')"
CERT_STATUS="$(gcloud compute ssl-certificates describe "${SSL_CERT_NAME}" --global --project "${PROJECT_ID}" --format='value(managed.status)')"

echo ""
echo "Setup complete."
echo "Static IP: ${STATIC_IP_VALUE}"
echo "Cert status: ${CERT_STATUS}"
echo "Update IONOS A records to this static IP, then wait for cert status to become ACTIVE."
