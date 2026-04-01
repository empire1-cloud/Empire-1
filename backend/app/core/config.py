import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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
    # PERSONAL ACCESS TOKENS
    # ---------------------------------------------------------
    PAT_TOKEN_LENGTH: int = 32
    PAT_MAX_LIFETIME_DAYS: int = 365
    PAT_VALID_SCOPES: list = [
        "api:read",
        "api:write",
        "admin:manage"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
