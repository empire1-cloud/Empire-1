from datetime import datetime, timedelta
from typing import Optional
import secrets
import string

from jose import jwt, JWTError
from passlib.context import CryptContext

from .config import get_settings

settings = get_settings()

# ---------------------------------------------------------
# PASSWORD HASHING
# ---------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------
# JWT TOKEN CREATION
# ---------------------------------------------------------
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    return encoded_jwt


# ---------------------------------------------------------
# JWT DECODING
# ---------------------------------------------------------
def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        return None


# ---------------------------------------------------------
# TOKEN HELPERS
# ---------------------------------------------------------
def get_token_expiry_seconds() -> int:
    return settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def create_refresh_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=30)
    payload = {"sub": user_id, "exp": expire}

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )


# ---------------------------------------------------------
# PERSONAL ACCESS TOKEN GENERATION & VALIDATION
# ---------------------------------------------------------
def generate_pat_token(user_id: str, length: int = 32) -> str:
    """
    Generate a random personal access token with 'pat_' prefix.
    Format: pat_<random_alphanumeric>
    """
    alphabet = string.ascii_letters + string.digits
    random_part = ''.join(secrets.choice(alphabet) for _ in range(length))
    return f"pat_{random_part}"


def hash_pat_token(token: str) -> str:
    """Hash a PAT using bcrypt (same as password hashing)"""
    return pwd_context.hash(token)


def verify_pat_token(plain_token: str, hashed_token: str) -> bool:
    """Verify a plain PAT against its hash"""
    return pwd_context.verify(plain_token, hashed_token)


def validate_scope(token_scopes: list, required_scope: str) -> bool:
    """
    Check if token has required scope.
    Supports wildcards: 'api:*' allows any 'api:' scope
    """
    if required_scope in token_scopes:
        return True
    
    # Check for wildcard patterns
    for scope in token_scopes:
        if scope.endswith('*'):
            prefix = scope[:-1]  # Remove the *
            if required_scope.startswith(prefix):
                return True
    
    return False
