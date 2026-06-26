import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": None, "case_sensitive": True}

    # ---------------------------------------------------------
    # CORE APP SETTINGS
    # ---------------------------------------------------------
    APP_NAME: str = "Hybrid Intelligence Backend"
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = ENV == "development"

    # ---------------------------------------------------------
    # SECURITY
    # ---------------------------------------------------------
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ---------------------------------------------------------
    # DATABASE
    # ---------------------------------------------------------
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/hybrid_intelligence"
    )

    # ---------------------------------------------------------
    # REDIS
    # ---------------------------------------------------------
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )

    # ---------------------------------------------------------
    # AI ENGINE KEYS
    # ---------------------------------------------------------
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    GOOGLE_PROJECT_ID: str = os.getenv("GOOGLE_PROJECT_ID", "disco-amphora-490606-n8")
    VERTEX_AI_LOCATION: str = os.getenv("VERTEX_AI_LOCATION", "us-central1")
    VERTEX_AI_TEXT_MODEL: str = os.getenv("VERTEX_AI_TEXT_MODEL", "gemini-1.5-pro")
    VERTEX_AI_IMAGE_MODEL: str = os.getenv("VERTEX_AI_IMAGE_MODEL", "imagegeneration@006")

    # Azure OpenAI
    AZURE_OPENAI_KEY: str = os.getenv("AZURE_OPENAI_KEY", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    AZURE_OPENAI_DEPLOYMENT: str = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
    AZURE_DALLE_DEPLOYMENT: str = os.getenv("AZURE_DALLE_DEPLOYMENT", "dall-e-3")
    AZURE_TTS_DEPLOYMENT: str = os.getenv("AZURE_TTS_DEPLOYMENT", "tts-hd")

    # Emergent LLM (GPT, Claude, Gemini via single API)
    EMERGENT_LLM_KEY: str = os.getenv("EMERGENT_LLM_KEY", "")

    # ---------------------------------------------------------
    # BILLING / CREDITS
    # ---------------------------------------------------------
    DEFAULT_CREDITS: int = 100
    BILLING_ENABLED: bool = True
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")

    # ---------------------------------------------------------
    # CORS
    # ---------------------------------------------------------
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # ---------------------------------------------------------
    # MONGODB ATLAS (Tenant Connections)
    # ---------------------------------------------------------
    MONGODB_ATLAS_EMPIRE_URI: str = os.getenv("MONGODB_ATLAS_EMPIRE_URI", "")
    MONGODB_ATLAS_EMPIRE_DB: str = os.getenv("MONGODB_ATLAS_EMPIRE_DB", "empire_one")
    
    MONGODB_ATLAS_SOUTHERN_URI: str = os.getenv("MONGODB_ATLAS_SOUTHERN_URI", "")
    MONGODB_ATLAS_SOUTHERN_DB: str = os.getenv("MONGODB_ATLAS_SOUTHERN_DB", "southern_lifestyle")

    # ---------------------------------------------------------
    # HYBRID BACKEND (Engine Invocation)
    # ---------------------------------------------------------
    HYBRID_BACKEND_URL: str = os.getenv("HYBRID_BACKEND_URL", "http://localhost:8000")

    # ---------------------------------------------------------
    # SLA113 ADMIN
    # ---------------------------------------------------------
    SLA113_ADMIN_KEY: str = os.getenv("SLA113_ADMIN_KEY", "dev-admin-key")

    # ---------------------------------------------------------
    # VOXCPM (Voice Synthesis)
    # ---------------------------------------------------------
    VOXCPM_MODE: str = os.getenv("VOXCPM_MODE", "remote")
    VOXCPM_API_URL: str = os.getenv("VOXCPM_API_URL", "http://localhost:8808")
    VOXCPM_MODEL: str = os.getenv("VOXCPM_MODEL", "openbmb/VoxCPM2")
    VOXCPM_AUDIO_DIR: str = os.getenv("VOXCPM_AUDIO_DIR", "/var/sla/audio/voxcpm")
    VOXCPM_DEFAULT_VOICE: str = os.getenv("VOXCPM_DEFAULT_VOICE", "default")
    VOXCPM_SAMPLE_RATE: int = 48000

    # ---------------------------------------------------------
    # PERSONAL ACCESS TOKENS
    # ---------------------------------------------------------
    PAT_TOKEN_LENGTH: int = 32
    PAT_MAX_LIFETIME_DAYS: int = 365
    PAT_VALID_SCOPES: list = [
        "api:read",
        "api:write",
        "admin:manage"
    ]

@lru_cache()
def get_settings() -> Settings:
    return Settings()
