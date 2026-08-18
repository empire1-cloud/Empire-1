"""Empire-1 Router API: Anthropic Messages + OpenAI Chat/Responses compatibility."""

from __future__ import annotations

import hmac
import json
import os
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse

from app.services.empire_router_service import (
    EmpireRouterError,
    anthropic_stream,
    anthropic_to_chat,
    chat_to_anthropic,
    chat_to_responses,
    model_catalog,
    provider_snapshot,
    request_chat,
    resolve_route,
    responses_stream,
    responses_to_chat,
    stream_chat,
)

router = APIRouter(prefix="/empire1/router", tags=["Empire-1 Router"])


def _authorize(authorization: str | None, x_api_key: str | None) -> None:
    expected = os.getenv("EMPIRE_ROUTER_TOKEN", "").strip()
    if not expected:
        return
    supplied = ""
    if authorization and authorization.lower().startswith("bearer "):
        supplied = authorization[7:].strip()
    elif x_api_key:
        supplied = x_api_key.strip()
    if not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="Invalid Empire-1 Router token")


def _error(exc: EmpireRouterError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail=str(exc))


@router.get("/health")
async def health() -> dict[str, Any]:
    providers = provider_snapshot()
    return {
        "status": "online",
        "router": "empire-1",
        "configured_providers": [item["id"] for item in providers if item["configured"]],
        "default_model": os.getenv("EMPIRE_ROUTER_MODEL", "").strip() or None,
    }


@router.get("/providers")
async def providers(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> dict[str, Any]:
    _authorize(authorization, x_api_key)
    return {"providers": provider_snapshot()}


@router.get("/v1/models")
async def models(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> dict[str, Any]:
    _authorize(authorization, x_api_key)
    return model_catalog()


@router.post("/v1/chat/completions")
async def chat_completions(
    request: Request,
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
):
    _authorize(authorization, x_api_key)
    body = await request.json()
    try:
        route = resolve_route(str(body.get("model", "")))
        if body.get("stream"):
            async def stream():
                async for chunk in stream_chat(body, route):
                    yield b"data: " + json.dumps(chunk, separators=(",", ":")).encode() + b"\n\n"
                yield b"data: [DONE]\n\n"
            return StreamingResponse(stream(), media_type="text/event-stream")
        return JSONResponse(await request_chat(body, route))
    except EmpireRouterError as exc:
        raise _error(exc) from exc


@router.post("/v1/messages")
async def anthropic_messages(
    request: Request,
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
):
    _authorize(authorization, x_api_key)
    body = await request.json()
    try:
        route = resolve_route(str(body.get("model", "")))
        if body.get("stream"):
            return StreamingResponse(anthropic_stream(body, route), media_type="text/event-stream")
        chat = await request_chat(anthropic_to_chat(body), route)
        return JSONResponse(chat_to_anthropic(chat, route))
    except EmpireRouterError as exc:
        raise _error(exc) from exc


@router.post("/v1/messages/count_tokens")
async def count_tokens(
    request: Request,
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
):
    """Compatibility estimate for Claude Code preflight token counting."""
    _authorize(authorization, x_api_key)
    body = await request.json()
    text = str(body.get("system", ""))
    for message in body.get("messages", []):
        text += str(message.get("content", "")) if isinstance(message, dict) else str(message)
    return {"input_tokens": max(1, len(text) // 4)}


@router.post("/v1/responses")
async def responses(
    request: Request,
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
):
    _authorize(authorization, x_api_key)
    body = await request.json()
    try:
        route = resolve_route(str(body.get("model", "")))
        if body.get("stream"):
            return StreamingResponse(responses_stream(body, route), media_type="text/event-stream")
        chat = await request_chat(responses_to_chat(body), route)
        return JSONResponse(chat_to_responses(chat, route))
    except EmpireRouterError as exc:
        raise _error(exc) from exc
