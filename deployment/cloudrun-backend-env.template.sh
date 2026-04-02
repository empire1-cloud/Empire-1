#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="disco-amphora-490606-n8"
REGION="us-central1"
SERVICE="empire1-backend"

gcloud run services update "$SERVICE" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --set-env-vars ENV=production \
  --set-env-vars FRONTEND_URL="https://empire1.cloud" \
  --set-env-vars CORS_ORIGINS="https://empire1.cloud,https://southernlifestyle.org,https://www.southernlifestyle.org,https://arcade.southernlifestyle.org,https://sla113.southernlifestyle.org" \
  --set-env-vars MONGO_URL="REPLACE_EMPIRE_MONGODB_ATLAS_URI" \
  --set-env-vars DB_NAME="empire_one" \
  --set-env-vars DATABASE_URL="REPLACE_POSTGRES_DATABASE_URL" \
  --set-env-vars REDIS_URL="REPLACE_REDIS_URL" \
  --set-env-vars MONGODB_ATLAS_EMPIRE_URI="REPLACE_EMPIRE_MONGODB_ATLAS_URI" \
  --set-env-vars MONGODB_ATLAS_EMPIRE_DB="empire_one" \
  --set-env-vars MONGODB_ATLAS_SOUTHERN_URI="REPLACE_SOUTHERN_MONGODB_ATLAS_URI" \
  --set-env-vars MONGODB_ATLAS_SOUTHERN_DB="southern_lifestyle" \
  --set-env-vars STRIPE_SECRET_KEY="REPLACE_STRIPE_SECRET_KEY" \
  --set-env-vars STRIPE_WEBHOOK_SECRET="REPLACE_STRIPE_WEBHOOK_SECRET" \
  --set-env-vars STRIPE_PRO_PRICE_ID="REPLACE_STRIPE_PRO_PRICE_ID" \
  --set-env-vars STRIPE_ENTERPRISE_PRICE_ID="REPLACE_STRIPE_ENTERPRISE_PRICE_ID" \
  --set-env-vars JWT_SECRET_KEY="REPLACE_JWT_SECRET_KEY" \
  --set-env-vars SECRET_KEY="REPLACE_SECRET_KEY" \
  --set-env-vars SLA113_ADMIN_KEY="REPLACE_SLA113_ADMIN_KEY" \
  --set-env-vars OPENAI_API_KEY="REPLACE_OPENAI_API_KEY" \
  --set-env-vars ANTHROPIC_API_KEY="REPLACE_ANTHROPIC_API_KEY" \
  --set-env-vars GOOGLE_API_KEY="REPLACE_GOOGLE_API_KEY" \
  --set-env-vars AZURE_OPENAI_KEY="REPLACE_AZURE_OPENAI_KEY" \
  --set-env-vars AZURE_OPENAI_ENDPOINT="REPLACE_AZURE_OPENAI_ENDPOINT" \
  --set-env-vars AZURE_OPENAI_API_VERSION="2024-02-15-preview" \
  --set-env-vars AZURE_OPENAI_DEPLOYMENT="gpt-4o" \
  --set-env-vars AZURE_DALLE_DEPLOYMENT="dall-e-3" \
  --set-env-vars AZURE_TTS_DEPLOYMENT="tts-hd" \
  --set-env-vars EMERGENT_LLM_KEY="REPLACE_EMERGENT_LLM_KEY" \
  --set-env-vars HYBRID_BACKEND_URL="https://api-placeholder.example.com"

echo "Backend environment update command completed."