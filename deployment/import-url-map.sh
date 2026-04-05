#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-$(gcloud config get-value project 2>/dev/null)}"
URL_MAP_NAME="${2:-empire1-web-map}"
TEMPLATE_PATH="deployment/url-map.yaml"
RENDERED_PATH="/tmp/${URL_MAP_NAME}.yaml"

if [[ -z "${PROJECT_ID}" || "${PROJECT_ID}" == "(unset)" ]]; then
  echo "Error: project id is not set. Pass it as arg1 or run: gcloud config set project <PROJECT_ID>"
  exit 1
fi

if [[ ! -f "${TEMPLATE_PATH}" ]]; then
  echo "Error: ${TEMPLATE_PATH} not found"
  exit 1
fi

sed "s/PROJECT_ID/${PROJECT_ID}/g" "${TEMPLATE_PATH}" > "${RENDERED_PATH}"

gcloud compute url-maps import "${URL_MAP_NAME}" \
  --global \
  --source "${RENDERED_PATH}" \
  --quiet

echo "Imported URL map '${URL_MAP_NAME}' for project '${PROJECT_ID}'."
