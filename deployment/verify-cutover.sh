#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-20}"

STATIC_IP_NAME="${STATIC_IP_NAME:-empire1-web-ip}"
SSL_CERT_NAME="${SSL_CERT_NAME:-empire1-managed-cert}"
URL_MAP_NAME="${URL_MAP_NAME:-empire1-web-map}"
FORWARDING_RULE_NAME="${FORWARDING_RULE_NAME:-empire1-https-rule}"

HOSTS=(
  "empire1.cloud"
  "southernlifestyle.org"
  "www.southernlifestyle.org"
  "arcade.southernlifestyle.org"
  "sla113.southernlifestyle.org"
)

API_PROBE_PATH="${API_PROBE_PATH:-/api/health}"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "Error: project id is not set. Pass it as arg1 or run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

for cmd in gcloud curl getent awk; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "Error: required command '${cmd}' not found in PATH"
    exit 1
  fi
done

STATIC_IP_VALUE="$(gcloud compute addresses describe "${STATIC_IP_NAME}" --global --project "${PROJECT_ID}" --format='value(address)')"
CERT_STATUS="$(gcloud compute ssl-certificates describe "${SSL_CERT_NAME}" --global --project "${PROJECT_ID}" --format='value(managed.status)')"

URL_MAP_OK="yes"
if ! gcloud compute url-maps describe "${URL_MAP_NAME}" --global --project "${PROJECT_ID}" >/dev/null 2>&1; then
  URL_MAP_OK="no"
fi

FWD_RULE_OK="yes"
if ! gcloud compute forwarding-rules describe "${FORWARDING_RULE_NAME}" --global --project "${PROJECT_ID}" >/dev/null 2>&1; then
  FWD_RULE_OK="no"
fi

echo "Project: ${PROJECT_ID}"
echo "Static IP (${STATIC_IP_NAME}): ${STATIC_IP_VALUE}"
echo "Cert (${SSL_CERT_NAME}) status: ${CERT_STATUS}"
echo "URL map (${URL_MAP_NAME}) present: ${URL_MAP_OK}"
echo "Forwarding rule (${FORWARDING_RULE_NAME}) present: ${FWD_RULE_OK}"
echo ""

failures=0

probe_host() {
  local host="$1"

  local dns_ip
  dns_ip="$(getent ahostsv4 "${host}" | awk '{print $1}' | head -n1 || true)"
  if [[ -z "${dns_ip}" ]]; then
    dns_ip="UNRESOLVED"
    failures=$((failures + 1))
  fi

  local dns_ok="no"
  if [[ "${dns_ip}" == "${STATIC_IP_VALUE}" ]]; then
    dns_ok="yes"
  fi

  local home_code
  home_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time "${TIMEOUT_SECONDS}" "https://${host}/" || true)"

  local api_code
  api_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time "${TIMEOUT_SECONDS}" "https://${host}${API_PROBE_PATH}" || true)"

  local home_ok="no"
  if [[ "${home_code}" =~ ^2|3 ]]; then
    home_ok="yes"
  fi

  local api_ok="no"
  if [[ "${api_code}" =~ ^2|3|4 ]]; then
    api_ok="yes"
  fi

  if [[ "${dns_ok}" == "no" || "${home_ok}" == "no" || "${api_ok}" == "no" ]]; then
    failures=$((failures + 1))
  fi

  printf '%-32s dns=%-15s match_ip=%-3s home=%-3s(%s) api=%-3s(%s)\n' \
    "${host}" "${dns_ip}" "${dns_ok}" "${home_ok}" "${home_code}" "${api_ok}" "${api_code}"
}

echo "Host checks:"
for host in "${HOSTS[@]}"; do
  probe_host "${host}"
done

echo ""
if [[ "${CERT_STATUS}" != "ACTIVE" ]]; then
  echo "Warning: certificate is not ACTIVE yet (${CERT_STATUS})."
  failures=$((failures + 1))
fi

if [[ "${URL_MAP_OK}" != "yes" || "${FWD_RULE_OK}" != "yes" ]]; then
  failures=$((failures + 1))
fi

if [[ ${failures} -eq 0 ]]; then
  echo "Cutover verification passed."
  exit 0
else
  echo "Cutover verification found ${failures} issue(s)."
  exit 2
fi
