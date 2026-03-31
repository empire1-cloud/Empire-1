import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.transaction import Transaction
from app.core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------
# STRIPE CLIENT (lazy-loaded)
# ---------------------------------------------------------
def get_stripe():
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


# ---------------------------------------------------------
# BILLING SERVICE
# ---------------------------------------------------------
class BillingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.stripe = get_stripe()

    # -----------------------------------------------------
    # CREATE CHECKOUT SESSION
    # -----------------------------------------------------
    async def create_checkout_session(self, user_id: str, price_id: str) -> str:
        session = self.stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=settings.FRONTEND_URL + "/billing/success",
            cancel_url=settings.FRONTEND_URL + "/billing/cancel",
        )
        return session.url

    # -----------------------------------------------------
    # CREATE CUSTOMER PORTAL SESSION
    # -----------------------------------------------------
    async def create_portal_session(self, customer_id: str) -> str:
        session = self.stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=settings.FRONTEND_URL + "/billing",
        )
        return session.url

    # -----------------------------------------------------
    # GET USER SUBSCRIPTION STATUS
    # -----------------------------------------------------
    async def get_subscription_status(self, user_id: str) -> dict:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.stripe_customer_id:
            return {"active": False, "plan": None}

        subs = self.stripe.Subscription.list(customer=user.stripe_customer_id)

        if not subs.data:
            return {"active": False, "plan": None}

        sub = subs.data[0]
        return {
            "active": sub.status == "active",
            "plan": sub.items.data[0].price.id,
            "renewal": datetime.fromtimestamp(sub.current_period_end),
        }

    # -----------------------------------------------------
    # RECORD TRANSACTION
    # -----------------------------------------------------
    async def record_transaction(self, user_id: str, amount: int, description: str):
        tx = Transaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            amount=amount,
            description=description,
            timestamp=datetime.utcnow(),
        )
        self.db.add(tx)
        await self.db.commit()

    # -----------------------------------------------------
    # USAGE TRACKING (CREDITS)
    # -----------------------------------------------------
    async def deduct_credits(self, user_id: str, amount: int):
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return False

        if user.credits < amount:
            return False

        user.credits -= amount
        await self.db.commit()
        return True

    async def add_credits(self, user_id: str, amount: int):
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return False

        user.credits += amount
        await self.db.commit()
        return True
