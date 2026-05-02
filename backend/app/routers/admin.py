from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.user import User
from app.models.transaction import Transaction

router = APIRouter(prefix="/admin", tags=["Admin"])


# ---------------------------------------------------------
# ADMIN CHECK (placeholder)
# Replace with real JWT → user lookup → is_admin check
# ---------------------------------------------------------
async def require_admin(user_id: str, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    return user


# ---------------------------------------------------------
# OVERVIEW METRICS
# ---------------------------------------------------------
@router.get("/overview")
async def admin_overview(
    admin_id: str,
    db: AsyncSession = Depends(get_db),
):
    await require_admin(admin_id, db)

    total_users = await db.execute(select(func.count(User.id)))
    total_transactions = await db.execute(select(func.count(Transaction.id)))

    return {
        "success": True,
        "metrics": {
            "total_users": total_users.scalar(),
            "total_transactions": total_transactions.scalar(),
        }
    }


# ---------------------------------------------------------
# LIST USERS
# ---------------------------------------------------------
@router.get("/users")
async def list_users(
    admin_id: str,
    db: AsyncSession = Depends(get_db),
):
    await require_admin(admin_id, db)

    result = await db.execute(select(User))
    users = result.scalars().all()

    return {
        "success": True,
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "credits": u.credits,
                "is_admin": u.is_admin,
                "created_at": u.created_at,
            }
            for u in users
        ]
    }


# ---------------------------------------------------------
# LIST TRANSACTIONS
# ---------------------------------------------------------
@router.get("/transactions")
async def list_transactions(
    admin_id: str,
    db: AsyncSession = Depends(get_db),
):
    await require_admin(admin_id, db)

    result = await db.execute(select(Transaction))
    txs = result.scalars().all()

    return {
        "success": True,
        "transactions": [
            {
                "id": str(t.id),
                "user_id": str(t.user_id),
                "amount": t.amount,
                "description": t.description,
                "metadata": t.metadata,
                "timestamp": t.timestamp,
            }
            for t in txs
        ]
    }
