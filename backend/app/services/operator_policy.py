"""Deployment policy for the shared Empire Cofounder/Operator runtime.

The engine is shared. Authority is not:
- cofounder mode: private Empire-wide scope, canon-aware, founder approvals
- product mode: customer tenant scope only, no Empire private universes or repos
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Literal

from fastapi import HTTPException

DeploymentMode = Literal["cofounder", "product"]

PRIVATE_UNIVERSES = {"SLA113", "EMPIREONE", "BLACK_BOX_REGISTRY"}
PRIVATE_REPO_PREFIXES = ("empire1-cloud/Empire-1", "empire_auto_cofounder")


@dataclass(frozen=True)
class OperatorContext:
    mode: DeploymentMode
    tenant_id: str
    can_cross_universes: bool
    can_access_private_canon: bool


def deployment_mode() -> DeploymentMode:
    value = os.getenv("EMPIRE_OPERATOR_MODE", "product").strip().lower()
    if value not in {"cofounder", "product"}:
        raise RuntimeError("EMPIRE_OPERATOR_MODE must be 'cofounder' or 'product'")
    return value  # type: ignore[return-value]


def resolve_context(requested_tenant_id: str | None) -> OperatorContext:
    mode = deployment_mode()
    if mode == "cofounder":
        return OperatorContext(
            mode="cofounder",
            tenant_id=os.getenv("EMPIRE_FOUNDER_TENANT_ID", "empire-1"),
            can_cross_universes=True,
            can_access_private_canon=True,
        )
    if not requested_tenant_id or not requested_tenant_id.strip():
        raise HTTPException(status_code=400, detail="tenant_id is required in product mode")
    return OperatorContext(
        mode="product",
        tenant_id=requested_tenant_id.strip(),
        can_cross_universes=False,
        can_access_private_canon=False,
    )


def enforce_task_scope(*, context: OperatorContext, universe: str, repository: str) -> None:
    if context.mode == "cofounder":
        return
    normalized_universe = universe.strip().upper()
    normalized_repo = repository.strip().lower()
    if normalized_universe in PRIVATE_UNIVERSES:
        raise HTTPException(status_code=403, detail="Private Empire universe is unavailable in product mode")
    if any(normalized_repo.startswith(prefix.lower()) for prefix in PRIVATE_REPO_PREFIXES):
        raise HTTPException(status_code=403, detail="Private Empire repository is unavailable in product mode")
