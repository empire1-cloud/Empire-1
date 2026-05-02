#!/usr/bin/env bash
set -e

PROJECT_DIR="/var/www/hybrid-intelligence"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "==> Updating system packages..."
sudo apt-get update -y

echo "==> Installing system dependencies..."
sudo apt-get install -y python3 python3-venv python3-pip nginx nodejs npm git

echo "==> Ensuring project directory exists..."
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R "$USER":"$USER" "$PROJECT_DIR"

echo "==> Setting up Backend..."
cd "$BACKEND_DIR"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Building Root Arcade App (Next.js)..."
cd "$PROJECT_DIR"
npm install
npm run build

echo "==> Building Empire1 Dashboard (CRA)..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "==> Configuring NGINX..."
sudo cp "$PROJECT_DIR/deployment/nginx.conf" /etc/nginx/sites-available/hybrid-intelligence
sudo ln -sf /etc/nginx/sites-available/hybrid-intelligence /etc/nginx/sites-enabled/hybrid-intelligence
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "==> Installing Services..."
sudo cp "$PROJECT_DIR/deployment/backend.service" /etc/systemd/system/backend.service
sudo cp "$PROJECT_DIR/deployment/arcade.service" /etc/systemd/system/arcade.service
sudo cp "$PROJECT_DIR/deployment/empire1.service" /etc/systemd/system/empire1.service

sudo systemctl daemon-reload
sudo systemctl enable backend arcade empire1
sudo systemctl restart backend arcade empire1

echo "==> Deployment Complete."
