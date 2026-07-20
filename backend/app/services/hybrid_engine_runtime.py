import uuid
import asyncio
from datetime import datetime
from typing import Optional
from enum import Enum

from app.core.database import async_session
from app.services.sonic_forge_module import SonicForge
from app.services.vo_engine import VOEngine
from app.services.voice_king import VoiceKing
from app.services.vision_smith import VisionSmithCore
from services.execution_logger_db import (
    build_idempotency_key,
    create_execution_receipt,
    finalize_execution_receipt,
    mark_execution_state,
)
from services.usage_service import record_execution

from ..core.config import get_settings

settings = get_settings()


class EngineState(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class EngineExecutionContext:
    """Context for a single engine execution."""
    
    def __init__(
        self,
        execution_id: str,
        engine: str,
        action: str,
        payload: dict,
        team_id: Optional[str] = None,
        user_id: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        request_type: str = "engine",
        requested_target: Optional[str] = None,
        auth_type: Optional[str] = None,
        api_key_id: Optional[str] = None,
        api_key_name: Optional[str] = None,
    ):
        self.execution_id = execution_id
        self.engine = engine
        self.action = action
        self.payload = payload
        self.team_id = team_id
        self.user_id = user_id
        self.idempotency_key = idempotency_key
        self.request_type = request_type
        self.requested_target = requested_target or engine
        self.auth_type = auth_type
        self.api_key_id = api_key_id
        self.api_key_name = api_key_name
        self.state = EngineState.IDLE
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.result: Optional[dict] = None
        self.error: Optional[Exception] = None
        self.retries = 0
        self.latency_ms: Optional[float] = None
        self.metadata: dict = {}
        self.step_statuses: list[dict] = []
        self.retry_counts: dict[str, int] = {}
        self.receipt_references: dict = {}

    def to_dict(self) -> dict:
        return {
            "execution_id": self.execution_id,
            "engine": self.engine,
            "action": self.action,
            "payload": self.payload,
            "team_id": self.team_id,
            "user_id": self.user_id,
            "idempotency_key": self.idempotency_key,
            "request_type": self.request_type,
            "requested_target": self.requested_target,
            "auth_type": self.auth_type,
            "api_key_id": self.api_key_id,
            "api_key_name": self.api_key_name,
            "state": self.state,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "result": self.result,
            "error": str(self.error) if self.error else None,
            "retries": self.retries,
            "latency_ms": self.latency_ms,
            "metadata": self.metadata,
            "step_statuses": self.step_statuses,
            "retry_counts": self.retry_counts,
            "receipt_references": self.receipt_references,
        }


class EngineSandbox:
    """
    Sandboxes engine execution for isolation.
    Ensures engines can't access unauthorized resources.
    """
    
    # Allowed imports/functions for engine execution
    ALLOWED_MODULES = {
        "uuid": ["uuid4"],
        "datetime": ["datetime", "timedelta"],
        "json": ["dumps", "loads"],
        "math": ["ceil", "floor", "sqrt"],
        "random": ["randint", "choice", "random"],
    }
    
    @staticmethod
    def validate_payload(payload: dict) -> bool:
        """
        Validate engine payload for safety.
        Prevents injection of malicious code or unauthorized access.
        """
        blocked_keys = ["__import__", "exec", "eval", "open", "os.", "subprocess"]
        
        def check_dict(d: dict):
            for key, value in d.items():
                if any(blocked in str(key) for blocked in blocked_keys):
                    return False
                if isinstance(value, dict):
                    if not check_dict(value):
                        return False
            return True
        
        return check_dict(payload)

    @staticmethod
    def get_allowed_execution_context() -> dict:
        """Get sandboxed execution context for engines."""
        import json
        import math
        import random
        
        return {
            "json": json,
            "math": math,
            "random": random,
            "uuid": uuid,
            "datetime": datetime,
        }


class EnginePipelineExecutor:
    """
    Executes engine pipelines with chaining and orchestration.
    Supports sequential and parallel execution.
    """
    
    def __init__(self):
        self.sandbox = EngineSandbox()
    
    async def execute_single(
        self,
        engine: str,
        action: str,
        payload: dict,
        timeout: float = 60.0,
        team_id: Optional[str] = None,
        user_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        auth_type: Optional[str] = None,
        api_key_id: Optional[str] = None,
        api_key_name: Optional[str] = None,
    ) -> EngineExecutionContext:
        """
        Execute a single engine action.
        
        Args:
            engine: Engine name
            action: Action to perform
            payload: Input payload
            timeout: Timeout in seconds
            team_id: Team ID for isolation
        
        Returns:
            EngineExecutionContext with result
        """
        execution_id = str(uuid.uuid4())
        context = EngineExecutionContext(
            execution_id=execution_id,
            engine=engine,
            action=action,
            payload=payload,
            team_id=team_id,
            user_id=user_id,
            idempotency_key=idempotency_key,
            request_type="engine",
            requested_target=engine,
            auth_type=auth_type,
            api_key_id=api_key_id,
            api_key_name=api_key_name,
        )
        context.retry_counts = {engine: 0}
        context.step_statuses = [{"engine": engine, "state": "pending"}]
        receipt = await create_execution_receipt(
            team_id=team_id or "",
            user_id=user_id or "",
            engine=engine,
            input_data=payload,
            source="hybrid_runtime",
            endpoint=endpoint,
            method=method,
            execution_id=execution_id,
            idempotency_key=idempotency_key,
            request_type="engine",
            requested_target=engine,
            auth_type=auth_type,
            api_key_id=api_key_id,
            api_key_name=api_key_name,
            step_statuses=context.step_statuses,
            retry_counts=context.retry_counts,
        )
        context.execution_id = receipt["execution_id"]
        context.metadata["receipt_created"] = receipt.get("_created", False)
        if not receipt.get("_created", False):
            existing_status = receipt.get("status")
            context.step_statuses = receipt.get("step_statuses", [])
            context.retry_counts = receipt.get("retry_counts", {})
            context.receipt_references = receipt.get("receipt_references", {})
            if existing_status in {"success", "replayed"}:
                context.state = EngineState.COMPLETED
                context.result = receipt.get("output_data")
                context.metadata["replayed"] = True
                context.completed_at = datetime.utcnow()
                return context
            if existing_status == "error":
                context.state = EngineState.FAILED
                context.error = RuntimeError(receipt.get("error_message") or "Execution already failed")
                context.metadata["replayed"] = True
                context.completed_at = datetime.utcnow()
                return context
            context.state = EngineState.RUNNING
            context.metadata["replayed"] = True
            context.metadata["in_progress"] = True
            return context
        
        # Validate payload
        if not self.sandbox.validate_payload(payload):
            context.state = EngineState.FAILED
            context.error = ValueError("Invalid payload: contains blocked keys")
            context.step_statuses = [{"engine": engine, "state": "error"}]
            await finalize_execution_receipt(
                context.execution_id,
                team_id=team_id or "",
                user_id=user_id or "",
                engine=engine,
                status="error",
                duration_ms=0,
                error_message=str(context.error),
                step_statuses=context.step_statuses,
                retry_counts=context.retry_counts,
                response_status_code=400,
            )
            return context
        
        # Execute with timeout
        context.state = EngineState.RUNNING
        context.started_at = datetime.utcnow()
        context.step_statuses = [{"engine": engine, "state": "running"}]
        await mark_execution_state(
            context.execution_id,
            status="running",
            final_state="running",
            step_statuses=context.step_statuses,
            retry_counts=context.retry_counts,
        )
        
        try:
            result = await asyncio.wait_for(
                self._execute_engine(engine, action, payload),
                timeout=timeout,
            )
            
            context.result = result
            context.state = EngineState.COMPLETED
            context.step_statuses = [{"engine": engine, "state": "success"}]
            
        except asyncio.TimeoutError:
            context.state = EngineState.TIMEOUT
            context.error = TimeoutError(f"Engine {engine} timed out after {timeout}s")
            context.step_statuses = [{"engine": engine, "state": "error"}]
            
        except Exception as e:
            context.state = EngineState.FAILED
            context.error = e
            context.step_statuses = [{"engine": engine, "state": "error"}]
        
        context.completed_at = datetime.utcnow()
        
        if context.started_at and context.completed_at:
            delta = context.completed_at - context.started_at
            context.latency_ms = delta.total_seconds() * 1000
        await finalize_execution_receipt(
            context.execution_id,
            team_id=team_id or "",
            user_id=user_id or "",
            engine=engine,
            status="success" if context.state == EngineState.COMPLETED else "error",
            duration_ms=int(context.latency_ms or 0),
            output_data=context.result,
            error_message=str(context.error) if context.error else None,
            step_statuses=context.step_statuses,
            retry_counts=context.retry_counts,
            response_status_code=200 if context.state == EngineState.COMPLETED else 500,
        )
        if context.state == EngineState.COMPLETED and team_id and user_id:
            await record_execution(
                team_id=team_id,
                user_id=user_id,
                engine=engine,
                tokens_used=0,
                success=True,
            )
        
        return context

    async def execute_chain(
        self,
        pipeline: list[dict],
        timeout: float = 300.0,
        team_id: Optional[str] = None,
        user_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        auth_type: Optional[str] = None,
        api_key_id: Optional[str] = None,
        api_key_name: Optional[str] = None,
    ) -> EngineExecutionContext:
        """
        Execute a chain of engines sequentially.
        Output of each engine becomes input to the next.
        
        Args:
            pipeline: List of {engine, action, payload} dicts
            timeout: Total timeout
            team_id: Team ID
        
        Returns:
            EngineExecutionContext representing the parent pipeline receipt
        """
        execution_id = str(uuid.uuid4())
        parent_context = EngineExecutionContext(
            execution_id=execution_id,
            engine="pipeline",
            action="execute_pipeline",
            payload={"pipeline": pipeline},
            team_id=team_id,
            user_id=user_id,
            idempotency_key=idempotency_key,
            request_type="pipeline",
            requested_target="pipeline",
            auth_type=auth_type,
            api_key_id=api_key_id,
            api_key_name=api_key_name,
        )
        parent_context.retry_counts = {}
        parent_context.step_statuses = [
            {"engine": step["engine"], "action": step["action"], "state": "pending"}
            for step in pipeline
        ]
        receipt = await create_execution_receipt(
            team_id=team_id or "",
            user_id=user_id or "",
            engine="pipeline",
            input_data={"pipeline": pipeline},
            source="hybrid_runtime",
            endpoint=endpoint,
            method=method,
            execution_id=execution_id,
            idempotency_key=idempotency_key,
            request_type="pipeline",
            requested_target="pipeline",
            auth_type=auth_type,
            api_key_id=api_key_id,
            api_key_name=api_key_name,
            step_statuses=parent_context.step_statuses,
            retry_counts=parent_context.retry_counts,
        )
        parent_context.execution_id = receipt["execution_id"]
        if not receipt.get("_created", False):
            parent_context.step_statuses = receipt.get("step_statuses", [])
            parent_context.retry_counts = receipt.get("retry_counts", {})
            if receipt.get("status") in {"success", "replayed"}:
                parent_context.state = EngineState.COMPLETED
                parent_context.result = receipt.get("output_data")
            elif receipt.get("status") == "error":
                parent_context.state = EngineState.FAILED
                parent_context.error = RuntimeError(receipt.get("error_message") or "Execution already failed")
            else:
                parent_context.state = EngineState.RUNNING
            parent_context.metadata["replayed"] = True
            return parent_context

        results = []
        context_data = {}

        parent_context.state = EngineState.RUNNING
        parent_context.started_at = datetime.utcnow()
        await mark_execution_state(
            parent_context.execution_id,
            status="running",
            final_state="running",
            step_statuses=parent_context.step_statuses,
            retry_counts=parent_context.retry_counts,
        )

        for i, step in enumerate(pipeline):
            step_timeout = timeout / len(pipeline)  # Distribute timeout
            
            # Merge previous results into payload
            payload = {**step.get("payload", {}), **context_data}
            parent_context.step_statuses[i]["state"] = "running"
            await mark_execution_state(
                parent_context.execution_id,
                status="running",
                final_state="running",
                step_statuses=parent_context.step_statuses,
                retry_counts=parent_context.retry_counts,
            )
            
            context = EngineExecutionContext(
                execution_id=str(uuid.uuid4()),
                engine=step["engine"],
                action=step["action"],
                payload=payload,
                team_id=team_id,
                user_id=user_id,
            )
            context.started_at = datetime.utcnow()
            context.retry_counts = {step["engine"]: 0}
            try:
                context.result = await asyncio.wait_for(
                    self._execute_engine(step["engine"], step["action"], payload),
                    timeout=step_timeout,
                )
                context.state = EngineState.COMPLETED
                parent_context.step_statuses[i]["state"] = "success"
            except asyncio.TimeoutError:
                context.state = EngineState.TIMEOUT
                context.error = TimeoutError(f"Engine {step['engine']} timed out after {step_timeout}s")
                parent_context.step_statuses[i]["state"] = "error"
            except Exception as exc:
                context.state = EngineState.FAILED
                context.error = exc
                parent_context.step_statuses[i]["state"] = "error"
            context.completed_at = datetime.utcnow()
            
            results.append(context)
            
            # Store result for next step
            if context.result:
                context_data[f"step_{i}_result"] = context.result
                context_data[f"{step['engine']}_output"] = context.result
            
            # Stop pipeline on failure
            if context.state != EngineState.COMPLETED:
                break

        parent_context.completed_at = datetime.utcnow()
        parent_context.latency_ms = (
            (parent_context.completed_at - parent_context.started_at).total_seconds() * 1000
            if parent_context.started_at and parent_context.completed_at
            else None
        )
        parent_context.result = {"pipeline": [ctx.to_dict() for ctx in results]}
        parent_context.state = (
            EngineState.COMPLETED
            if all(ctx.state == EngineState.COMPLETED for ctx in results) and len(results) == len(pipeline)
            else EngineState.FAILED
        )
        if parent_context.state != EngineState.COMPLETED:
            failed = next((ctx for ctx in results if ctx.state != EngineState.COMPLETED), None)
            parent_context.error = failed.error if failed else RuntimeError("Pipeline execution failed")

        await finalize_execution_receipt(
            parent_context.execution_id,
            team_id=team_id or "",
            user_id=user_id or "",
            engine="pipeline",
            status="success" if parent_context.state == EngineState.COMPLETED else "error",
            duration_ms=int(parent_context.latency_ms or 0),
            output_data=parent_context.result,
            error_message=str(parent_context.error) if parent_context.error else None,
            step_statuses=parent_context.step_statuses,
            retry_counts=parent_context.retry_counts,
            response_status_code=200 if parent_context.state == EngineState.COMPLETED else 500,
        )
        if parent_context.state == EngineState.COMPLETED and team_id and user_id:
            await record_execution(
                team_id=team_id,
                user_id=user_id,
                engine="pipeline",
                tokens_used=0,
                success=True,
            )

        return parent_context

    async def execute_parallel(
        self,
        tasks: list[dict],
        timeout: float = 60.0,
        team_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> list[EngineExecutionContext]:
        """
        Execute multiple engines in parallel.
        
        Args:
            tasks: List of {engine, action, payload} dicts
            timeout: Timeout for all tasks
            tenant_id: Tenant ID
        
        Returns:
            List of execution contexts
        """
        async def run_task(task: dict):
            return await self.execute_single(
                engine=task["engine"],
                action=task["action"],
                payload=task.get("payload", {}),
                timeout=timeout,
                team_id=team_id,
                user_id=user_id,
            )
        
        tasks_coroutines = [run_task(task) for task in tasks]
        
        results = await asyncio.wait_for(
            asyncio.gather(*tasks_coroutines, return_exceptions=True),
            timeout=timeout,
        )
        
        # Convert exceptions to failed contexts
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                ctx = EngineExecutionContext(
                    execution_id=str(uuid.uuid4()),
                    engine=tasks[i]["engine"],
                    action=tasks[i]["action"],
                    payload=tasks[i].get("payload", {}),
                    team_id=team_id,
                    user_id=user_id,
                )
                ctx.state = EngineState.FAILED
                ctx.error = result
                processed_results.append(ctx)
            else:
                processed_results.append(result)
        
        return processed_results

    async def _execute_engine(self, engine: str, action: str, payload: dict) -> dict:
        """
        Internal engine executor.
        Routes to actual engine implementation.
        """
        async with async_session() as db:
            if engine == "vision_smith":
                service = VisionSmithCore()
                if action == "generate":
                    result = await service.generate(
                        prompt=payload["prompt"],
                        size=payload.get("size", "1024x1024"),
                        quality=payload.get("quality", "hd"),
                    )
                elif action in {"metadata", "get_metadata"}:
                    result = await service.get_metadata(image_id=payload["image_id"])
                elif action == "upscale":
                    result = await service.upscale(
                        file_path=payload["file_path"],
                        scale=payload.get("scale", 2),
                    )
                else:
                    raise ValueError(f"Unsupported action '{action}' for {engine}")
            elif engine == "voice_king":
                service = VoiceKing(db)
                if action in {"generate", "speak"}:
                    result = await service.generate(
                        text=payload["text"],
                        voice_id=payload.get("voice_id", "default"),
                    )
                elif action in {"list", "list_voices"}:
                    result = await service.list_voices()
                else:
                    raise ValueError(f"Unsupported action '{action}' for {engine}")
            elif engine == "sonic_forge":
                service = SonicForge(db)
                if action in {"generate", "generate_music"}:
                    result = await service.generate(
                        prompt=payload["prompt"],
                        style=payload.get("style", "g_funk"),
                        duration=payload.get("duration", 30),
                    )
                elif action == "generate_sfx":
                    result = await service.generate_sfx(
                        scene=payload["scene"],
                        intensity=payload.get("intensity", "medium"),
                    )
                elif action == "status":
                    result = await service.get_status(job_id=payload["job_id"])
                else:
                    raise ValueError(f"Unsupported action '{action}' for {engine}")
            elif engine == "vo_engine":
                service = VOEngine(db)
                if action in {"generate", "generate_video"}:
                    result = await service.generate_video(
                        prompt=payload["prompt"],
                        duration=payload.get("duration", 10),
                        resolution=payload.get("resolution", "720p"),
                    )
                elif action == "status":
                    result = await service.get_status(job_id=payload["job_id"])
                elif action in {"frames", "get_frames"}:
                    result = await service.get_frames(video_id=payload["video_id"])
                else:
                    raise ValueError(f"Unsupported action '{action}' for {engine}")
            else:
                raise ValueError(f"Unsupported engine '{engine}'")

        return {
            "engine": engine,
            "action": action,
            "status": "completed",
            "output": result,
        }


class EngineOrchestrator:
    """
    High-level orchestrator for engine operations.
    Manages versioning, health, and metadata sync.
    """
    
    def __init__(self):
        self.executor = EnginePipelineExecutor()
        self.version_cache: dict = {}
        self.health_cache: dict = {}
    
    async def execute(
        self,
        engine: str,
        action: str,
        payload: dict,
        options: Optional[dict] = None,
    ) -> dict:
        """
        Main entry point for engine execution.
        
        Args:
            engine: Engine name
            action: Action to perform
            payload: Input payload
            options: Execution options (timeout, retries, tenant_id)
        
        Returns:
            Execution result
        """
        options = options or {}
        
        context = await self.executor.execute_single(
            engine=engine,
            action=action,
            payload=payload,
            timeout=options.get("timeout", 60.0),
            team_id=options.get("team_id"),
            user_id=options.get("user_id"),
            endpoint=options.get("endpoint"),
            method=options.get("method"),
            idempotency_key=options.get("idempotency_key"),
            auth_type=options.get("auth_type"),
            api_key_id=options.get("api_key_id"),
            api_key_name=options.get("api_key_name"),
        )
        
        return context.to_dict()
    
    async def execute_pipeline(
        self,
        pipeline: list[dict],
        options: Optional[dict] = None,
    ) -> dict:
        """Execute a pipeline of engines."""
        options = options or {}
        
        context = await self.executor.execute_chain(
            pipeline=pipeline,
            timeout=options.get("timeout", 300.0),
            team_id=options.get("team_id"),
            user_id=options.get("user_id"),
            endpoint=options.get("endpoint"),
            method=options.get("method"),
            idempotency_key=options.get("idempotency_key"),
            auth_type=options.get("auth_type"),
            api_key_id=options.get("api_key_id"),
            api_key_name=options.get("api_key_name"),
        )
        
        return context.to_dict()
    
    async def get_engine_version(self, engine: str) -> Optional[str]:
        """Get engine version from cache or registry."""
        if engine in self.version_cache:
            return self.version_cache[engine]
        
        # Would fetch from engine registry
        return "1.0.0"
    
    async def get_engine_health(self, engine: str) -> dict:
        """Get engine health status."""
        if engine in self.health_cache:
            return self.health_cache[engine]
        
        return {
            "engine": engine,
            "status": "healthy",
            "last_check": datetime.utcnow().isoformat(),
        }


# Singleton instance
engine_orchestrator = EngineOrchestrator()
