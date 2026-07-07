"""FastAPI surface for the gstack adapter.

GET-only. Launch: `uvicorn adapter.api:app --port 8787` from gstack-adapter/.
"""

from __future__ import annotations

import asyncio
import json
import os
import time

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from . import store

DEFAULT_ORIGINS = "http://127.0.0.1:5173,http://localhost:5173"

app = FastAPI(
    title="gstack-adapter",
    description="Read-only bridge from ~/.gstack project intelligence to Empire Cofounder.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        o.strip()
        for o in os.environ.get("GSTACK_ADAPTER_CORS", DEFAULT_ORIGINS).split(",")
        if o.strip()
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/gstack/health")
def health() -> dict:
    root = store.projects_root()
    return {
        "status": "ok",
        "source": "gstack",
        "gstack_home": str(store.gstack_home()),
        "projects_root_exists": root.is_dir(),
        "projects": len(store.list_projects()),
        "ts": time.time(),
    }


@app.get("/api/gstack/projects")
def projects() -> dict:
    return {"projects": store.list_projects()}


@app.get("/api/gstack/activity")
def activity(project: str | None = None, limit: int = Query(100, ge=1, le=1000)) -> dict:
    return {"events": store.activity(project, limit)}


@app.get("/api/gstack/missions")
def missions(project: str | None = None, limit: int = Query(100, ge=1, le=1000)) -> dict:
    return {"missions": store.missions(project, limit)}


@app.get("/api/gstack/learnings")
def learnings(project: str | None = None, limit: int = Query(200, ge=1, le=2000)) -> dict:
    return {"learnings": store.learnings(project, limit)}


@app.get("/api/gstack/artifacts")
def artifacts(project: str | None = None, limit: int = Query(200, ge=1, le=2000)) -> dict:
    return {"artifacts": store.artifacts(project, limit)}


@app.get("/api/gstack/evidence")
def evidence(project: str | None = None, limit: int = Query(200, ge=1, le=2000)) -> dict:
    return {"evidence": store.evidence(project, limit)}


@app.get("/api/gstack/artifacts/{project}/{artifact_id:path}/content")
def artifact_content(project: str, artifact_id: str) -> dict:
    try:
        item = store.artifact_content(project, artifact_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="artifact not found")
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    return {
        "id": item.id,
        "project": item.project,
        "media": item.media,
        "content": item.content,
        "truncated": item.truncated,
    }


@app.get("/api/gstack/snapshot")
def snapshot(project: str | None = None) -> dict:
    return {
        "source": "gstack",
        "generated_ts": time.time(),
        "projects": store.list_projects(),
        "activity": store.activity(project, 50),
        "missions": store.missions(project, 50),
        "learnings": store.learnings(project, 50),
        "artifacts": store.artifacts(project, 50),
        "evidence": store.evidence(project, 50),
    }


@app.get("/api/gstack/stream")
async def stream() -> StreamingResponse:
    """SSE: emits a `change` event whenever any timeline file changes."""

    async def event_source():
        fingerprint = store.timeline_fingerprint()
        yield "event: hello\ndata: {}\n\n"
        while True:
            await asyncio.sleep(2)
            current = store.timeline_fingerprint()
            if current != fingerprint:
                fingerprint = current
                payload = json.dumps({"ts": time.time()})
                yield f"event: change\ndata: {payload}\n\n"
            else:
                yield ": keepalive\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")
