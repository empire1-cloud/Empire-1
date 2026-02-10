#!/usr/bin/env bash
set -e

PROJECT_DIR="/var/www/hybrid-intelligence"
PYTHON_BIN="python3"
VENV_DIR="$PROJECT_DIR/venv"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "==> Updating system packages..."
sudo apt-get update -y

echo "==> Installing system dependencies..."
sudo apt-get install -y python3 python3-venv python3-pip nginx nodejs npm git

echo "==> Ensuring project directory exists..."
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R "$USER":"$USER" "$PROJECT_DIR"

echo "==> Creating Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
  $PYTHON_BIN -m venv "$VENV_DIR"
fi

echo "==> Activating virtual environment..."
source "$VENV_DIR/bin/activate"

echo "==> Installing backend dependencies..."
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  pip install --upgrade pip
  pip install -r "$BACKEND_DIR/requirements.txt"
else
  echo "WARNING: $BACKEND_DIR/requirements.txt not found, skipping backend pip install."
fi

echo "==> Building frontend..."
if [ -f "$FRONTEND_DIR/package.json" ]; then
  cd "$FRONTEND_DIR"
  npm install
  npm run build || npm run build:prod || echo "WARNING: frontend build command failed or not defined."
else
  echo "WARNING: $FRONTEND_DIR/package.json not found, skipping frontend build."
fi

echo "==> Copying NGINX config..."
sudo cp "$PROJECT_DIR/deployment/nginx.conf" /etc/nginx/sites-available/hybrid-intelligence
sudo ln -sf /etc/nginx/sites-available/hybrid-intelligence /etc/nginx/sites-enabled/hybrid-intelligence
sudo rm -f /etc/nginx/sites-enabled/default

echo "==> Testing NGINX config..."
sudo nginx -t

echo "==> Reloading NGINX..."
sudo systemctl reload nginx || sudo systemctl restart nginx

echo "==> Installing backend systemd service..."
sudo cp "$PROJECT_DIR/deployment/backend.service" /etc/systemd/system/backend.service
sudo systemctl daemon-reload
sudo systemctl enable backend.service
sudo systemctl restart backend.service

echo "==> Setup complete."
