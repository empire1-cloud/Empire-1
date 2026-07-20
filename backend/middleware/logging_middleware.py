"""
Mongo-backed execution middleware for HIC request paths.

This replaces /tmp-backed authority for execution receipts while preserving the
existing middleware hook in the main FastAPI app.
"""

import json
import time
from typing import Callable

from fastapi import HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from core.engine_context import resolve_execution_context
from services.execution_logger_db import (
    build_idempotency_key,
    create_execution_receipt,
    finalize_execution_receipt,
    mark_execution_state,
)
from services.usage_service import record_execution


PROTECTED_EXECUTION_PREFIXES = (
    "/api/core/",
    "/api/strategy",
    "/api/route",
    "/api/plan",
    "/api/analyze",
    "/api/opportunities",
    "/api/evaluate",
    "/api/pricing",
    "/api/blueprint",
    "/api/persona",
    "/api/anime/",
    "/api/art-direction",
    "/api/money-pipeline",
    "/api/pipeline/",
)


def _is_protected_execution_request(path: str, method: str) -> bool:
    return method.upper() == "POST" and any(path.startswith(prefix) for prefix in PROTECTED_EXECUTION_PREFIXES)


def get_engine_from_path(path: str) -> str:
    """Extract engine name from a protected execution path."""
    path_to_engine = {
        "/api/strategy": "strategy_engine",
        "/api/strategy-to-plan": "strategy_engine",
        "/api/route": "routing_engine",
        "/api/plan": "plan_builder_engine",
        "/api/analyze": "analysis_engine",
        "/api/opportunities": "opportunity_mapper_engine",
        "/api/evaluate": "evaluator_engine",
        "/api/pricing": "pricing_engine",
        "/api/blueprint": "blueprint_engine",
        "/api/persona": "persona_engine",
        "/api/anime/character": "anime_character_engine",
        "/api/anime/protagonist": "anime_character_engine",
        "/api/anime/antagonist": "anime_character_engine",
        "/api/anime/lore": "anime_lore_engine",
        "/api/anime/story": "anime_story_engine",
        "/api/art-direction": "art_direction_engine",
        "/api/money-pipeline": "money_pipeline_engine",
        "/api/pipeline/compose": "pipeline_composer_engine",
        "/api/pipeline/compose-detailed": "pipeline_composer_engine",
        "/api/pipeline/custom": "pipeline_composer_engine",
        "/api/pipeline/validate": "pipeline_composer_engine",
        "/api/core/execute": "hybrid_intelligence_core",
        "/api/core/strategy-to-plan": "hybrid_intelligence_core",
    }

    for endpoint, engine in path_to_engine.items():
        if path.startswith(endpoint):
            return engine
    return "unknown"


def _parse_request_body(body: bytes) -> dict:
    if not body:
        return {}
    try:
        return json.loads(body)
    except Exception:
        return {"raw": body.decode(errors="ignore")[:500]}


def _build_single_step(engine: str, state: str) -> list[dict]:
    return [{"engine": engine, "state": state, "updated_at": time.time()}]


class ExecutionLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        method = request.method

        if not _is_protected_execution_request(path, method):
            return await call_next(request)

        body = await request.body()
        input_data = _parse_request_body(body)

        body_sent = False

        async def receive():
            nonlocal body_sent
            if body_sent:
                return {"type": "http.request", "body": b"", "more_body": False}
            body_sent = True
            return {"type": "http.request", "body": body, "more_body": False}

        request = Request(request.scope, receive)

        try:
            ctx = await resolve_execution_context(request)
            request.state.engine_ctx = ctx
        except HTTPException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail},
                headers=getattr(exc, "headers", None),
            )

        engine = get_engine_from_path(path)
        idempotency_key = build_idempotency_key(
            team_id=ctx.team_id,
            user_id=ctx.user_id,
            endpoint=path,
            method=method,
            input_data=input_data,
            provided_key=request.headers.get("Idempotency-Key") or request.headers.get("X-Idempotency-Key"),
        )

        receipt = await create_execution_receipt(
            team_id=ctx.team_id,
            user_id=ctx.user_id,
            engine=engine,
            input_data=input_data,
            source="api",
            endpoint=path,
            method=method,
            idempotency_key=idempotency_key,
            request_type="pipeline" if path.startswith("/api/pipeline/") else "engine",
            requested_target=engine,
            auth_type=ctx.auth_metadata.auth_type,
            api_key_id=ctx.auth_metadata.api_key_id,
            api_key_name=ctx.auth_metadata.api_key_name,
            step_statuses=_build_single_step(engine, "pending"),
            retry_counts={engine: 0},
        )

        if receipt.get("_created"):
            # New execution record created for this request. Move it into running.
            await mark_execution_state(
                receipt["execution_id"],
                status="running",
                final_state="running",
                step_statuses=_build_single_step(engine, "running"),
                retry_counts={engine: 0},
            )
        else:
            existing_status = receipt.get("status")
            existing_code = receipt.get("receipt_references", {}).get("response_status_code")
            if existing_status in {"pending", "running"}:
                return JSONResponse(
                    status_code=409,
                    content={
                        "detail": "Execution with this idempotency key is already in progress",
                        "execution_id": receipt.get("execution_id"),
                        "status": existing_status,
                    },
                    headers={
                        "X-Execution-ID": receipt.get("execution_id", ""),
                        "X-Idempotent-Replay": "true",
                    },
                )

            replay_body = receipt.get("output_data")
            if replay_body is None:
                replay_body = {
                    "detail": receipt.get("error_message") or "Execution already finalized",
                    "execution_id": receipt.get("execution_id"),
                }

            return JSONResponse(
                status_code=existing_code or (200 if receipt.get("error_message") is None else 500),
                content=replay_body,
                headers={
                    "X-Execution-ID": receipt.get("execution_id", ""),
                    "X-Idempotent-Replay": "true",
                },
            )

        start_time = time.time()
        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = int((time.time() - start_time) * 1000)
            await finalize_execution_receipt(
                receipt["execution_id"],
                team_id=ctx.team_id,
                user_id=ctx.user_id,
                engine=engine,
                status="error",
                duration_ms=duration_ms,
                error_message=str(exc),
                step_statuses=_build_single_step(engine, "error"),
                retry_counts={engine: 0},
                response_status_code=500,
            )
            raise

        duration_ms = int((time.time() - start_time) * 1000)

        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        output_data = None
        error_message = None
        try:
            if response.status_code >= 400:
                error_message = response_body.decode(errors="ignore")[:1000]
            else:
                output_data = json.loads(response_body) if response_body else {}
        except Exception:
            if response.status_code >= 400:
                error_message = "Failed to parse error response"
            else:
                output_data = {"raw": response_body.decode(errors="ignore")[:1000]}

        status = "success" if response.status_code < 400 else "error"
        await finalize_execution_receipt(
            receipt["execution_id"],
            team_id=ctx.team_id,
            user_id=ctx.user_id,
            engine=engine,
            status=status,
            duration_ms=duration_ms,
            output_data=output_data,
            error_message=error_message,
            step_statuses=_build_single_step(engine, status),
            retry_counts={engine: 0},
            response_status_code=response.status_code,
        )

        if status == "success":
            await record_execution(
                team_id=ctx.team_id,
                user_id=ctx.user_id,
                engine=engine,
                tokens_used=0,
                success=True,
            )

        headers = dict(response.headers)
        headers["X-Execution-ID"] = receipt["execution_id"]
        return Response(
            content=response_body,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type,
        )
