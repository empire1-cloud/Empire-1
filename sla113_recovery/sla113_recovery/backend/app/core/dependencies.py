from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_pat_token, validate_scope
from app.models.user import User
from app.models.personal_access_token import PersonalAccessToken


async def get_current_user_from_pat(
    token: str,
    db: AsyncSession = Depends(get_db),
    required_scope: Optional[str] = None
) -> User:
    """
    Validate PAT and return associated user.
    Optionally check for specific scope.
    Updates last_used_at on successful validation.
    """
    # Extract token from "Bearer pat_..." format if needed
    token_value = token.replace("Bearer ", "") if token.startswith("Bearer ") else token
    
    # Find token by searching all tokens and verifying (inefficient but works)
    # For production, implement token_id lookup table
    result = await db.execute(
        select(PersonalAccessToken).filter(
            PersonalAccessToken.revoked_at.is_(None)
        )
    )
    
    pat = None
    for candidate_pat in result.scalars():
        if verify_pat_token(token_value, candidate_pat.token_hash):
            pat = candidate_pat
            break
    
    if not pat:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid personal access token"
        )
    
    # Check if token is valid (not revoked, not expired)
    if not pat.is_valid():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked or expired"
        )
    
    # Check scope if required
    if required_scope and not validate_scope(pat.scopes, required_scope):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Token does not have required scope: {required_scope}"
        )
    
    # Update last_used_at
    pat.last_used_at = datetime.utcnow()
    db.add(pat)
    await db.commit()
    
    # Fetch and return the user
    result = await db.execute(
        select(User).where(User.id == pat.user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user
