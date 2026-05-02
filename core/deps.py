from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)


class MockUser:
    def __init__(self, id: str, role: str, email: str = ""):
        self.id = id
        self.role = role
        self.email = email


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> MockUser:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    token = credentials.credentials
    if token == "admin-token":
        return MockUser(id="admin-1", role="admin", email="admin@empireone.com")
    elif token == "owner-token":
        return MockUser(id="owner-1", role="owner", email="owner@empireone.com")
    elif token == "member-token":
        return MockUser(id="member-1", role="member", email="member@empireone.com")
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def require_role(required_role: str):
    def role_checker(user=Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {required_role} role"
            )
        return user
    return role_checker
