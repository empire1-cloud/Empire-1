from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.models import User, Transaction, PersonalAccessToken  # Register models

# Routers
from app.routers.auth import router as auth_router
from app.routers.tokens import router as tokens_router
from app.routers.vision import router as vision_router
from app.routers.voice import router as voice_router
from app.routers.sonicforge import router as sonicforge_router
from app.routers.song import router as song_router
from app.routers.video import router as video_router
from app.routers.admin import router as admin_router
from app.routers.sla113_admin import router as sla113_admin_router
from app.routers.admin_universe import router as admin_universe_router
from app.routers.narrative import router as narrative_router
from app.routers.sla113_logs import router as sla113_logs_router
from app.routers.sla113_health import router as sla113_health_router
from app.routers.sla113_billing import router as sla113_billing_router
from app.routers.sla113_engine_dashboard import router as sla113_engine_dashboard_router
from app.routers.hybrid_engine import router as hybrid_engine_router
from app.routers.empire1 import router as empire1_router
from app.routers.southern import router as southern_router
from app.routers.sla113_universe import router as sla113_universe_router
from app.routers.southern_engine_pack import router as southern_engine_pack_router
from app.routers.os_modules import router as os_modules_router
from app.routers.sla113_orchestration import router as sla113_orchestration_router
from app.routers.sla113_dashboard_context import router as sla113_dashboard_context_router
from app.routers.sla113_regulatory import router as sla113_regulatory_router
from app.routers.sla113_foundry import router as sla113_foundry_router
from app.routers.sla113.factory import router as sla113_factory_router
from app.routers.sla113.factory import router as sla113_factory_heartbeat_router
from app.routers.frontline import router as frontline_router
from app.routers.billing import router as billing_router
from app.routers.arcade import router as arcade_router
try:
    from app.routers.my_vertex_universe import router as my_vertex_universe_router
except ModuleNotFoundError:
    my_vertex_universe_router = None
from app.routers.voxcpm import router as voxcpm_router
from app.routers.audio_fx import router as audio_fx_router
from app.routers.revenue_receipts import router as revenue_receipts_router
from app.routers.revenue_os import router as revenue_os_router
from app.routers.gtm_layer import router as gtm_layer_router
from app.routers.empire_os_cofounder import router as empire_os_cofounder_router
from routers.engines.lyrica.agents import router as lyrica_router

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# ROUTERS
# ---------------------------------------------------------
app.include_router(auth_router)
app.include_router(tokens_router)
app.include_router(vision_router)
app.include_router(voice_router)
app.include_router(sonicforge_router)
app.include_router(song_router)
app.include_router(video_router)
app.include_router(admin_router)
app.include_router(sla113_admin_router)
app.include_router(admin_universe_router)
app.include_router(narrative_router)
app.include_router(sla113_logs_router)
app.include_router(sla113_health_router)
app.include_router(sla113_billing_router)
app.include_router(sla113_engine_dashboard_router)
app.include_router(hybrid_engine_router)
app.include_router(empire1_router)
app.include_router(southern_router)
app.include_router(sla113_universe_router)
app.include_router(southern_engine_pack_router)
app.include_router(os_modules_router)
app.include_router(sla113_orchestration_router)
app.include_router(sla113_dashboard_context_router)
app.include_router(sla113_regulatory_router)
app.include_router(sla113_foundry_router)
app.include_router(sla113_factory_router)
app.include_router(sla113_factory_heartbeat_router)
app.include_router(frontline_router)
app.include_router(billing_router)
app.include_router(arcade_router)
if my_vertex_universe_router:
    app.include_router(my_vertex_universe_router)
app.include_router(voxcpm_router)
app.include_router(audio_fx_router)
app.include_router(revenue_receipts_router)
app.include_router(revenue_os_router)
app.include_router(gtm_layer_router)
app.include_router(empire_os_cofounder_router)

# ---------------------------------------------------------
# STARTUP: CREATE TABLES
# ---------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    try:
        from app.services.revenue_os_store import ensure_store
        ensure_store()
    except Exception:
        pass
    try:
        from app.services.empire_os_cofounder.state import ensure_store as ensure_cofounder_store
        ensure_cofounder_store()
    except Exception:
        pass


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------
@app.get("/")
async def root():
    return {"status": "online", "app": settings.APP_NAME}
