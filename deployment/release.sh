#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_FILE="$SCRIPT_DIR/deploy-target.conf"
LEGACY_TARGET_FILE="$SCRIPT_DIR/deploy-target.env"

DEFAULT_TARGET="CLOUD"
if [[ -f "$TARGET_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$TARGET_FILE"
  DEFAULT_TARGET="${ACTIVE_DEPLOY_TARGET:-$DEFAULT_TARGET}"
elif [[ -f "$LEGACY_TARGET_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$LEGACY_TARGET_FILE"
  DEFAULT_TARGET="${ACTIVE_DEPLOY_TARGET:-$DEFAULT_TARGET}"
fi

REQUESTED_TARGET="${1:-$DEFAULT_TARGET}"
TARGET="$(echo "$REQUESTED_TARGET" | tr '[:lower:]' '[:upper:]')"

if [[ "$TARGET" == "STATUS" ]]; then
  echo "ACTIVE_DEPLOY_TARGET=$DEFAULT_TARGET"
  exit 0
fi

if [[ "$TARGET" != "CLOUD" && "$TARGET" != "VPS" ]]; then
  echo "Invalid target: $REQUESTED_TARGET"
  echo "Usage: ./deployment/release.sh [cloud|vps|status]"
  exit 1
fi

if [[ "$TARGET" != "$DEFAULT_TARGET" && "${FORCE_DEPLOY:-0}" != "1" ]]; then
  echo "Blocked: active target is $DEFAULT_TARGET but requested $TARGET."
  echo "Edit deployment/deploy-target.conf or run FORCE_DEPLOY=1 ./deployment/release.sh $TARGET"
  exit 1
fi

cd "$REPO_ROOT"

if [[ "$TARGET" == "CLOUD" ]]; then
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "gcloud is not installed or not on PATH."
    exit 1
  fi

  echo "Deploying backend to Cloud Run via Cloud Build..."
  gcloud builds submit --config cloudbuild.backend.yaml .

  echo "Deploying frontend to Cloud Run via Cloud Build..."
  gcloud builds submit --config cloudbuild.frontend.yaml .

  echo "Cloud release complete."
  exit 0
fi

echo "Running VPS deployment script..."
"$SCRIPT_DIR/deploy.sh"
echo "VPS release complete."
