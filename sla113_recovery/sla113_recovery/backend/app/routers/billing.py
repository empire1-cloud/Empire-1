from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.billing import BillingService

router = APIRouter(prefix="/billing", tags=["Billing"])


class CheckoutRequest(BaseModel):
    user_id: str
    price_id: str


class PortalRequest(BaseModel):
    customer_id: str


# ---------------------------------------------------------
# CREATE CHECKOUT SESSION
# ---------------------------------------------------------
@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        billing = BillingService(db)
        url = await billing.create_checkout_session(body.user_id, body.price_id)
        return {"success": True, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# CUSTOMER PORTAL
# ---------------------------------------------------------
@router.post("/portal")
async def create_portal(
    body: PortalRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        billing = BillingService(db)
        url = await billing.create_portal_session(body.customer_id)
        return {"success": True, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# SUBSCRIPTION STATUS
# ---------------------------------------------------------
@router.get("/status")
async def subscription_status(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        billing = BillingService(db)
        status = await billing.get_subscription_status(user_id)
        return {"success": True, "status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# ADD CREDITS
# ---------------------------------------------------------
@router.post("/credits/add")
async def add_credits(
    user_id: str,
    amount: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        billing = BillingService(db)
        ok = await billing.add_credits(user_id, amount)
        return {"success": ok}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------
# DEDUCT CREDITS
# ---------------------------------------------------------
@router.post("/credits/deduct")
async def deduct_credits(
    user_id: str,
    amount: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        billing = BillingService(db)
        ok = await billing.deduct_credits(user_id, amount)
        return {"success": ok}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
