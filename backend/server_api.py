"""Legacy slim API surface.

Revenue endpoints remain here for the legacy deployment path. HIC is deliberately
not mounted on this unauthenticated server; it is exposed only by server.py,
where the control-plane authentication boundary is enforced.
"""

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Empire-1 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = [
    "https://empire1.cloud",
    "https://www.empire1.cloud",
    "https://southernlifestyle.org",
    "https://www.southernlifestyle.org",
    "https://arcade.southernlifestyle.org",
    "https://sla113.southernlifestyle.org",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Team-ID", "X-API-Key", "X-Request-ID"],
)

api_router = APIRouter(prefix="/api")

from app.routers.revenue_os import router as revenue_os_router
from app.routers.revenue_receipts import router as revenue_receipts_router

api_router.include_router(revenue_os_router)
api_router.include_router(revenue_receipts_router)
app.include_router(api_router)

@api_router.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "empire1-api",
        "version": "1.0.0",
        "routers": ["revenue-os", "revenue-receipts"],
        "hic": "moved to authenticated control-plane server",
    }

@app.get("/")
async def root():
    return {"message": "Empire-1 API", "docs": "/docs"}
