from fastapi import FastAPI, APIRouter, Depends
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import connect_to_database, close_database_connection, get_database
from core.dependencies import get_current_user

DATABASE_CONNECTED = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    global DATABASE_CONNECTED
    try:
        await connect_to_database()
        DATABASE_CONNECTED = True
        logging.info("Database connected on startup")
    except Exception as exc:
        DATABASE_CONNECTED = False
        logging.exception("Database connection failed on startup")
        if os.getenv("APP_ENV", "development").lower() in {"production", "prod"}:
            raise RuntimeError("Production startup aborted: database is unavailable") from exc
    yield
    if DATABASE_CONNECTED:
        await close_database_connection()
        logging.info("Database connection closed")

app = FastAPI(
    title="Hybrid AI Stack",
    description="Empire-1 control-plane API",
    version="2.0.0",
    lifespan=lifespan,
)

api_router = APIRouter(prefix="/api")

from routers.auth import router as auth_router
from routers.teams import router as teams_router
from routers.profile import router as profile_router
from routers.invites import router as invites_router
from routers.billing import router as billing_router
from routers.api_keys import router as api_keys_router
from routers.admin import router as admin_router
from routers.system import router as system_router
from app.routers.crm import router as crm_router
from app.routers.business_analytics import router as business_analytics_router
from app.routers.gtm import router as gtm_router
from app.routers.empire_router import router as empire_router
from app.routers.gtm_layer import router as gtm_layer_router
from app.routers.revenue_os import router as revenue_os_router
from app.routers.revenue_receipts import router as revenue_receipts_router
from app.routers.hic import router as hic_router

from routers.engines import (
    core_router, strategy_router, drift_router, plan_router, analysis_router,
    opportunity_router, evaluator_router, pricing_router, blueprint_router,
    persona_router, pipeline_router, anime_character_router, anime_lore_router,
    anime_story_router, art_direction_router, money_pipeline_router,
    analytics_router, voxcpm_router, audio_fx_router,
)
from routers.engines.history_protected import router as history_protected_router
from routers.engines.lyrica.agents import router as lyrica_router
from routers.pipelines import router as pipelines_router
from routers.sla113 import router as sla113_router
from app.routers.sla113_orchestration import router as sla113_orchestration_router

api_router.include_router(auth_router)
api_router.include_router(teams_router)
api_router.include_router(profile_router)
api_router.include_router(invites_router)
api_router.include_router(billing_router)
api_router.include_router(api_keys_router)
api_router.include_router(admin_router)
api_router.include_router(system_router)
api_router.include_router(crm_router)
api_router.include_router(business_analytics_router)
api_router.include_router(gtm_router)
api_router.include_router(gtm_layer_router)
api_router.include_router(revenue_os_router)
api_router.include_router(revenue_receipts_router)
api_router.include_router(history_protected_router)
api_router.include_router(pipelines_router)
api_router.include_router(sla113_router)
api_router.include_router(sla113_orchestration_router)

# HIC now lives behind the authenticated control-plane boundary.
api_router.include_router(hic_router, dependencies=[Depends(get_current_user)])

# Legacy engine execution and telemetry are no longer public.
for engine_router in (
    core_router, strategy_router, drift_router, plan_router, analysis_router,
    opportunity_router, evaluator_router, pricing_router, blueprint_router,
    persona_router, pipeline_router, anime_character_router, anime_lore_router,
    anime_story_router, art_direction_router, money_pipeline_router,
    analytics_router, voxcpm_router, audio_fx_router, lyrica_router,
):
    api_router.include_router(engine_router, dependencies=[Depends(get_current_user)])

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Empire-1 API"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy" if DATABASE_CONNECTED else "degraded",
        "database": "connected" if DATABASE_CONNECTED else "degraded",
        "version": "2.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    db = get_database()
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://empire1.cloud", "https://www.empire1.cloud",
        "https://southernlifestyle.org", "https://www.southernlifestyle.org",
        "https://arcade.southernlifestyle.org", "https://sla113.southernlifestyle.org",
        "http://localhost:3000", "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Team-ID", "X-API-Key", "X-Request-ID"],
)
