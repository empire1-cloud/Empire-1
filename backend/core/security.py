"""Core security utilities: password hashing, JWT tokens, etc."""

import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import bcrypt
import jwt
from pydantic import BaseModel


# JWT Configuration. Production must provide a stable secret so tokens do not
# become invalid after every process restart and so multiple replicas share
# the same trust boundary.
_ENVIRONMENT = os.getenv("APP_ENV", "development").lower()
_configured_jwt_secret = os.getenv("JWT_SECRET_KEY")
if not _configured_jwt_secret:
    if _ENVIRONMENT in {"production", "prod"}:
        raise RuntimeError("JWT_SECRET_KEY is required in production")
    _configured_jwt_secret = secrets.token_urlsafe(32)

JWT_SECRET_KEY = _configured_jwt_secret
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: datetime
    iat: datetime
    jti: Optional[str] = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, additional_claims: Dict[str, Any] = None) -> str:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "type": "access", "iat": now, "exp": expires}
    if additional_claims:
        payload.update(additional_claims)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> Tuple[str, str]:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    jti = secrets.token_urlsafe(32)
    payload = {"sub": user_id, "type": "refresh", "iat": now, "exp": expires, "jti": jti}
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, hash_token(token)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_invite_token() -> Tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hashlib.sha256(token.encode()).hexdigest()


def generate_reset_token() -> Tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hashlib.sha256(token.encode()).hexdigest()


def generate_slug(name: str) -> str:
    import re
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return f"{slug}-{secrets.token_hex(4)}"


def get_token_expiry_seconds() -> int:
    return ACCESS_TOKEN_EXPIRE_MINUTES * 60


def get_refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
