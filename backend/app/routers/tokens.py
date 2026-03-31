from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.core.config import get_settings
from app.core.security import generate_pat_token, hash_pat_token, decode_token
from app.models.user import User
from app.models.personal_access_token import PersonalAccessToken

router = APIRouter(prefix="/auth/tokens", tags=["Personal Access Tokens"])
settings = get_settings()


# ---------------------------------------------------------
# AUTH DEPENDENCIES
# ---------------------------------------------------------
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Resolve current user from JWT Bearer token in Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header"
        )
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


async def require_arcade_owner(
    current_user: User = Depends(get_current_user)
) -> User:
    """ArcadeOS gate: only the platform owner (is_admin=True) may regenerate tokens."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token regeneration is restricted to the Arcade OS owner role."
        )
    return current_user


# ---------------------------------------------------------
# SCHEMAS
# ---------------------------------------------------------
class CreateTokenRequest(BaseModel):
    name: str
    scopes: List[str] = ["api:read"]
    expires_in_days: Optional[int] = None


class TokenResponse(BaseModel):
    id: str
    name: str
    scopes: List[str]
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    revoked_at: Optional[datetime]

    class Config:
        from_attributes = True


class CreateTokenResponse(BaseModel):
    id: str
    name: str
    token: str
    scopes: List[str]
    created_at: datetime
    expires_at: Optional[datetime]


# ---------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------
@router.post("/create", response_model=CreateTokenResponse)
async def create_personal_access_token(
    request: CreateTokenRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_arcade_owner)
):
    """Create a new personal access token"""
    
    # Validate scopes
    valid_scopes = ["api:read", "api:write", "admin:manage"]
    for scope in request.scopes:
        if scope not in valid_scopes and not any(
            scope.startswith(vs.split(':')[0] + ":*") for vs in valid_scopes
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scope: {scope}"
            )
    
    # Generate token
    plain_token = generate_pat_token(str(current_user.id))
    token_hash = hash_pat_token(plain_token)
    
    # Calculate expiry
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=request.expires_in_days)
    
    # Create PAT record
    pat = PersonalAccessToken(
        id=uuid.uuid4(),
        user_id=current_user.id,
        name=request.name,
        token_hash=token_hash,
        scopes=request.scopes,
        expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    
    db.add(pat)
    await db.commit()
    await db.refresh(pat)
    
    return CreateTokenResponse(
        id=str(pat.id),
        name=pat.name,
        token=plain_token,
        scopes=pat.scopes,
        created_at=pat.created_at,
        expires_at=pat.expires_at
    )


@router.get("/", response_model=List[TokenResponse])
async def list_personal_access_tokens(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all PATs for current user"""
    
    result = await db.execute(
        select(PersonalAccessToken).where(
            PersonalAccessToken.user_id == current_user.id
        ).order_by(PersonalAccessToken.created_at.desc())
    )
    
    tokens = result.scalars().all()
    
    return [
        TokenResponse(
            id=str(token.id),
            name=token.name,
            scopes=token.scopes,
            created_at=token.created_at,
            expires_at=token.expires_at,
            last_used_at=token.last_used_at,
            revoked_at=token.revoked_at
        )
        for token in tokens
    ]


@router.post("/{token_id}/revoke")
async def revoke_token(
    token_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke a specific personal access token"""
    
    result = await db.execute(
        select(PersonalAccessToken).where(
            PersonalAccessToken.id == uuid.UUID(token_id),
            PersonalAccessToken.user_id == current_user.id
        )
    )
    
    token = result.scalar_one_or_none()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    token.revoked_at = datetime.utcnow()
    db.add(token)
    await db.commit()
    
    return {"message": "Token revoked successfully"}


@router.delete("/{token_id}")
async def delete_token(
    token_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific personal access token"""
    
    result = await db.execute(
        select(PersonalAccessToken).where(
            PersonalAccessToken.id == uuid.UUID(token_id),
            PersonalAccessToken.user_id == current_user.id
        )
    )
    
    token = result.scalar_one_or_none()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    await db.delete(token)
    await db.commit()
    
    return {"message": "Token deleted successfully"}
