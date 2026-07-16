from fastapi import FastAPI, APIRouter
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Load environment variables first
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import database connection
from database import connect_to_database, close_database_connection, get_database
from app.core.config import get_settings

DATABASE_CONNECTED = False

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    global DATABASE_CONNECTED
    try:
        await connect_to_database()
        DATABASE_CONNECTED = True
        logging.info("Database connected on startup")
    except Exception:
        DATABASE_CONNECTED = False
        logging.exception("Database connection failed on startup; running in degraded mode")
    yield
    if DATABASE_CONNECTED:
        await close_database_connection()
        logging.info("Database connection closed on shutdown")

app = FastAPI(
    title="Hybrid AI Stack",
    description="Multi-model AI pipeline with governed Empire Cofounder and production Operator runtime",
    version="2.1.0",
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
from app.routers.operator import router as operator_router

from routers.engines import (
    core_router,
    strategy_router,
    drift_router,
    plan_router,
    analysis_router,
    opportunity_router,
    evaluator_router,
    pricing_router,
    blueprint_router,
    persona_router,
    pipeline_router,
    anime_character_router,
    anime_lore_router,
    anime_story_router,
    art_direction_router,
    money_pipeline_router,
    analytics_router,
    voxcpm_router,
    audio_fx_router,
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
api_router.include_router(operator_router)

api_router.include_router(history_protected_router)
api_router.include_router(pipelines_router)
api_router.include_router(sla113_router)
api_router.include_router(sla113_orchestration_router)

api_router.include_router(core_router)
api_router.include_router(strategy_router)
api_router.include_router(drift_router)
api_router.include_router(plan_router)
api_router.include_router(analysis_router)
api_router.include_router(opportunity_router)
api_router.include_router(evaluator_router)
api_router.include_router(pricing_router)
api_router.include_router(blueprint_router)
api_router.include_router(persona_router)
api_router.include_router(pipeline_router)
api_router.include_router(anime_character_router)
api_router.include_router(anime_lore_router)
api_router.include_router(anime_story_router)
api_router.include_router(art_direction_router)
api_router.include_router(money_pipeline_router)
api_router.include_router(analytics_router)
api_router.include_router(voxcpm_router)
api_router.include_router(audio_fx_router)
api_router.include_router(lyrica_router)


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if DATABASE_CONNECTED else "degraded",
        "version": "2.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    db = get_database()
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    db = get_database()
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


app.include_router(api_router)


@app.get("/health")
async def root_health_check():
    return {
        "status": "healthy",
        "database": "connected" if DATABASE_CONNECTED else "degraded",
        "version": "2.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://www.lyrica3.com",
        "https://empire1.cloud",
        "https://www.empire1.cloud",
        "http://localhost:3000",
        "http://localhost:4321",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

from middleware.logging_middleware import ExecutionLoggingMiddleware
app.add_middleware(ExecutionLoggingMiddleware)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
