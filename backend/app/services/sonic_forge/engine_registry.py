"""
Engine Registry — plugin architecture for Sonic Forge.

Every engine subclasses BaseEngine and registers in ENGINE_REGISTRY.
Orchestrator resolves by name; engines are swappable at runtime.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .context import EngineContext

logger = logging.getLogger(__name__)


class BaseEngine(ABC):
    name: str = ""
    version: str = "1.0.0"

    @abstractmethod
    async def process(self, ctx: EngineContext) -> EngineContext: ...


ENGINE_REGISTRY: dict[str, type[BaseEngine]] = {}


def register_engine(engine_cls: type[BaseEngine]) -> type[BaseEngine]:
    """Decorator-style registration. Usage:  @register_engine  class FooEngine ..."""
    key = engine_cls.name or engine_cls.__name__.lower().replace("engine", "")
    ENGINE_REGISTRY[key] = engine_cls
    logger.debug("[Registry] Registered %s → %s", key, engine_cls.__name__)
    return engine_cls


def get_engine(name: str) -> type[BaseEngine] | None:
    return ENGINE_REGISTRY.get(name)
