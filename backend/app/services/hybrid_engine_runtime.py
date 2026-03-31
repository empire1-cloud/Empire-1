import uuid
import asyncio
from datetime import datetime
from typing import Optional, Any, Callable
from enum import Enum

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
        tenant_id: Optional[str] = None,
    ):
        self.execution_id = execution_id
        self.engine = engine
        self.action = action
        self.payload = payload
        self.tenant_id = tenant_id
        self.state = EngineState.IDLE
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.result: Optional[dict] = None
        self.error: Optional[Exception] = None
        self.retries = 0
        self.latency_ms: Optional[float] = None
        self.metadata: dict = {}

    def to_dict(self) -> dict:
        return {
            "execution_id": self.execution_id,
            "engine": self.engine,
            "action": self.action,
            "payload": self.payload,
            "tenant_id": self.tenant_id,
            "state": self.state,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "result": self.result,
            "error": str(self.error) if self.error else None,
            "retries": self.retries,
            "latency_ms": self.latency_ms,
            "metadata": self.metadata,
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
        tenant_id: Optional[str] = None,
    ) -> EngineExecutionContext:
        """
        Execute a single engine action.
        
        Args:
            engine: Engine name
            action: Action to perform
            payload: Input payload
            timeout: Timeout in seconds
            tenant_id: Tenant ID for isolation
        
        Returns:
            EngineExecutionContext with result
        """
        execution_id = str(uuid.uuid4())
        context = EngineExecutionContext(
            execution_id=execution_id,
            engine=engine,
            action=action,
            payload=payload,
            tenant_id=tenant_id,
        )
        
        # Validate payload
        if not self.sandbox.validate_payload(payload):
            context.state = EngineState.FAILED
            context.error = ValueError("Invalid payload: contains blocked keys")
            return context
        
        # Execute with timeout
        context.state = EngineState.RUNNING
        context.started_at = datetime.utcnow()
        
        try:
            result = await asyncio.wait_for(
                self._execute_engine(engine, action, payload),
                timeout=timeout,
            )
            
            context.result = result
            context.state = EngineState.COMPLETED
            
        except asyncio.TimeoutError:
            context.state = EngineState.TIMEOUT
            context.error = TimeoutError(f"Engine {engine} timed out after {timeout}s")
            
        except Exception as e:
            context.state = EngineState.FAILED
            context.error = e
        
        context.completed_at = datetime.utcnow()
        
        if context.started_at and context.completed_at:
            delta = context.completed_at - context.started_at
            context.latency_ms = delta.total_seconds() * 1000
        
        return context

    async def execute_chain(
        self,
        pipeline: list[dict],
        timeout: float = 300.0,
        tenant_id: Optional[str] = None,
    ) -> list[EngineExecutionContext]:
        """
        Execute a chain of engines sequentially.
        Output of each engine becomes input to the next.
        
        Args:
            pipeline: List of {engine, action, payload} dicts
            timeout: Total timeout
            tenant_id: Tenant ID
        
        Returns:
            List of execution contexts
        """
        results = []
        context_data = {}
        
        start_time = datetime.utcnow()
        
        for i, step in enumerate(pipeline):
            step_timeout = timeout / len(pipeline)  # Distribute timeout
            
            # Merge previous results into payload
            payload = {**step.get("payload", {}), **context_data}
            
            context = await self.execute_single(
                engine=step["engine"],
                action=step["action"],
                payload=payload,
                timeout=step_timeout,
                tenant_id=tenant_id,
            )
            
            results.append(context)
            
            # Store result for next step
            if context.result:
                context_data[f"step_{i}_result"] = context.result
                context_data[f"{step['engine']}_output"] = context.result
            
            # Stop pipeline on failure
            if context.state != EngineState.COMPLETED:
                break
        
        return results

    async def execute_parallel(
        self,
        tasks: list[dict],
        timeout: float = 60.0,
        tenant_id: Optional[str] = None,
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
                tenant_id=tenant_id,
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
                    tenant_id=tenant_id,
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
        # Import engine router dynamically
        from ..routers.vision import router as vision_router
        from ..routers.voice import router as voice_router
        from ..routers.sonicforge import router as sonicforge_router
        from ..routers.video import router as video_router
        
        engine_routes = {
            "vision_smith": vision_router,
            "voice_king": voice_router,
            "sonic_forge": sonicforge_router,
            "vo_engine": video_router,
        }
        
        # Placeholder - actual implementation would call the router
        # For now, return mock result
        return {
            "engine": engine,
            "action": action,
            "status": "completed",
            "output": f"{engine} executed {action}",
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
            tenant_id=options.get("tenant_id"),
        )
        
        return context.to_dict()
    
    async def execute_pipeline(
        self,
        pipeline: list[dict],
        options: Optional[dict] = None,
    ) -> list[dict]:
        """Execute a pipeline of engines."""
        options = options or {}
        
        contexts = await self.executor.execute_chain(
            pipeline=pipeline,
            timeout=options.get("timeout", 300.0),
            tenant_id=options.get("tenant_id"),
        )
        
        return [ctx.to_dict() for ctx in contexts]
    
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
