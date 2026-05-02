from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------
def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_token(user_id: str) -> str:
    """
    Placeholder for your JWT signer.
    Replace with real JWT encode logic.
    """
    return f"token-{user_id}"


# ---------------------------------------------------------
# REGISTER
# ---------------------------------------------------------
@router.post("/register")
async def register(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token(str(user.id))

    return {
        "success": True,
        "user": {"id": user.id, "email": user.email},
        "token": token
    }


# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------
@router.post("/login")
async def login(
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_token(str(user.id))

    return {
        "success": True,
        "user": {"id": user.id, "email": user.email},
        "token": token
    }


# ---------------------------------------------------------
# ME
# ---------------------------------------------------------
@router.get("/me")
async def me(
    user_id: str,  # In real system, extract from JWT
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "credits": user.credits,
            "is_admin": user.is_admin,
        }
    }
