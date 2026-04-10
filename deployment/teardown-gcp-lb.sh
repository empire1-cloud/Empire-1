#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
CONFIRM_FLAG="${2:-}"

REGION="${REGION:-us-central1}"
STATIC_IP_NAME="${STATIC_IP_NAME:-empire1-web-ip}"
FRONTEND_NEG="${FRONTEND_NEG:-empire1-frontend-neg}"
BACKEND_NEG="${BACKEND_NEG:-empire1-backend-neg}"
FRONTEND_BACKEND_SERVICE="${FRONTEND_BACKEND_SERVICE:-empire1-frontend-backend}"
API_BACKEND_SERVICE="${API_BACKEND_SERVICE:-empire1-api-backend}"
URL_MAP_NAME="${URL_MAP_NAME:-empire1-web-map}"
SSL_CERT_NAME="${SSL_CERT_NAME:-empire1-managed-cert}"
HTTPS_PROXY_NAME="${HTTPS_PROXY_NAME:-empire1-https-proxy}"
FORWARDING_RULE_NAME="${FORWARDING_RULE_NAME:-empire1-https-rule}"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "Error: project id is not set. Pass it as arg1 or run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

if [[ "${CONFIRM_FLAG}" != "--yes" ]]; then
  echo "Safety check: this script deletes load balancer resources."
  echo "Re-run with: ./deployment/teardown-gcp-lb.sh <PROJECT_ID> --yes"
  exit 1
fi

for cmd in gcloud; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "Error: required command '${cmd}' not found in PATH"
    exit 1
  fi
done

delete_if_exists() {
  local kind="$1"
  local name="$2"
  shift 2

  if gcloud compute "${kind}" describe "${name}" "$@" --project "${PROJECT_ID}" >/dev/null 2>&1; then
    echo "[delete] ${kind} ${name}"
    gcloud compute "${kind}" delete "${name}" "$@" --project "${PROJECT_ID}" --quiet
  else
    echo "[skip] ${kind} ${name} not found"
  fi
}

echo "Project: ${PROJECT_ID}"
echo "Region:  ${REGION}"
echo ""
echo "Deleting resources in dependency-safe order..."

# 1) Forwarding rule depends on target proxy.
delete_if_exists forwarding-rules "${FORWARDING_RULE_NAME}" --global

# 2) Target proxy depends on URL map and SSL cert.
delete_if_exists target-https-proxies "${HTTPS_PROXY_NAME}" --global

# 3) URL map references backend services.
delete_if_exists url-maps "${URL_MAP_NAME}" --global

# 4) SSL cert can be removed after proxy is gone.
delete_if_exists ssl-certificates "${SSL_CERT_NAME}" --global

# 5) Backend services reference NEGs.
delete_if_exists backend-services "${FRONTEND_BACKEND_SERVICE}" --global
delete_if_exists backend-services "${API_BACKEND_SERVICE}" --global

# 6) NEGs can be removed after backend services.
delete_if_exists network-endpoint-groups "${FRONTEND_NEG}" --region "${REGION}"
delete_if_exists network-endpoint-groups "${BACKEND_NEG}" --region "${REGION}"

# 7) Static IP can be removed last.
delete_if_exists addresses "${STATIC_IP_NAME}" --global

echo ""
echo "Teardown completed."
