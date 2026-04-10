#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_FILE="$SCRIPT_DIR/deploy-target.conf"
LEGACY_TARGET_FILE="$SCRIPT_DIR/deploy-target.env"

ACTIVE_TARGET="VPS"
if [[ -f "$TARGET_FILE" ]]; then
	# shellcheck disable=SC1090
	source "$TARGET_FILE"
	ACTIVE_TARGET="${ACTIVE_DEPLOY_TARGET:-$ACTIVE_TARGET}"
elif [[ -f "$LEGACY_TARGET_FILE" ]]; then
	# shellcheck disable=SC1090
	source "$LEGACY_TARGET_FILE"
	ACTIVE_TARGET="${ACTIVE_DEPLOY_TARGET:-$ACTIVE_TARGET}"
fi

if [[ "${ACTIVE_TARGET^^}" != "VPS" && "${FORCE_DEPLOY:-0}" != "1" ]]; then
	echo "Blocked: ACTIVE_DEPLOY_TARGET is $ACTIVE_TARGET, not VPS."
	echo "Update deployment/deploy-target.conf or run FORCE_DEPLOY=1 ./deployment/deploy.sh"
	exit 1
fi

PROJECT_ROOT="/var/www/hybrid-intelligence"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

cd "$BACKEND_DIR"

# Backend venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Restart backend service
systemctl restart backend.service

# Build frontend
cd "$FRONTEND_DIR"
npm install
npm run build

# Copy frontend build to nginx
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

systemctl reload nginx

echo "Deployment complete."
