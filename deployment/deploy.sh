#!/bin/bash
set -e

PROJECT_ROOT="/var/www/hybrid-intelligence"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

cd $BACKEND_DIR

# Backend venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Restart backend service
systemctl restart backend.service

# Build frontend
cd $FRONTEND_DIR
npm install
npm run build

# Copy frontend build to nginx
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

systemctl reload nginx

echo "Deployment complete."
