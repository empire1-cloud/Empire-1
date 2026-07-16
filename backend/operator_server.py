"""Production entrypoint for the Empire backend with Operator routes enabled.

Run locally:
    uvicorn operator_server:app --host 0.0.0.0 --port 8001
"""

from server import app
from app.routers.operator import router as operator_router

app.include_router(operator_router, prefix="/api")
