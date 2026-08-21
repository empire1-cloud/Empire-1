"""
Empire-1 Slim API — Render Deployment
Minimal FastAPI server with Revenue OS endpoints only.
No MongoDB required. In-memory stores for receipts/leads.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("empire1-api")

app = FastAPI(
    title="Empire-1 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
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
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include revenue routers under /api prefix
from fastapi import APIRouter

api_router = APIRouter(prefix="/api")

from app.routers.revenue_os import router as revenue_os_router
from app.routers.revenue_receipts import router as revenue_receipts_router

api_router.include_router(revenue_os_router)
api_router.include_router(revenue_receipts_router)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "empire1-api",
        "version": "1.0.0",
        "routers": ["revenue-os", "revenue-receipts"],
    }


@app.get("/")
async def root():
    return {"message": "Empire-1 API", "docs": "/docs"}
