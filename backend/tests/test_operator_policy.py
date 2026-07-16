import os

import pytest
from fastapi import HTTPException

from app.services.operator_policy import enforce_task_scope, resolve_context


def test_cofounder_mode_has_private_empire_scope(monkeypatch):
    monkeypatch.setenv("EMPIRE_OPERATOR_MODE", "cofounder")
    monkeypatch.setenv("EMPIRE_FOUNDER_TENANT_ID", "empire-1")
    context = resolve_context(None)
    assert context.mode == "cofounder"
    assert context.tenant_id == "empire-1"
    assert context.can_cross_universes is True
    assert context.can_access_private_canon is True
    enforce_task_scope(
        context=context,
        universe="SLA113",
        repository="empire1-cloud/Empire-1",
    )


def test_product_mode_requires_tenant(monkeypatch):
    monkeypatch.setenv("EMPIRE_OPERATOR_MODE", "product")
    with pytest.raises(HTTPException) as exc:
        resolve_context(None)
    assert exc.value.status_code == 400


def test_product_mode_blocks_private_empire_universe(monkeypatch):
    monkeypatch.setenv("EMPIRE_OPERATOR_MODE", "product")
    context = resolve_context("customer-123")
    with pytest.raises(HTTPException) as exc:
        enforce_task_scope(
            context=context,
            universe="SLA113",
            repository="customer/repo",
        )
    assert exc.value.status_code == 403


def test_product_mode_blocks_private_empire_repo(monkeypatch):
    monkeypatch.setenv("EMPIRE_OPERATOR_MODE", "product")
    context = resolve_context("customer-123")
    with pytest.raises(HTTPException) as exc:
        enforce_task_scope(
            context=context,
            universe="CUSTOMER_APP",
            repository="empire1-cloud/Empire-1",
        )
    assert exc.value.status_code == 403


def test_product_mode_allows_customer_scope(monkeypatch):
    monkeypatch.setenv("EMPIRE_OPERATOR_MODE", "product")
    context = resolve_context("customer-123")
    enforce_task_scope(
        context=context,
        universe="CUSTOMER_APP",
        repository="customer/repo",
    )
    assert context.can_cross_universes is False
    assert context.can_access_private_canon is False
