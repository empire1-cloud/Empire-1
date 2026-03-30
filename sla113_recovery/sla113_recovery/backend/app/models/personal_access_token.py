import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class PersonalAccessToken(Base):
    __tablename__ = "personal_access_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Token metadata
    name = Column(String(255), nullable=False)
    token_hash = Column(Text, nullable=False, unique=True)
    scopes = Column(JSON, default=["api:read"], nullable=False)
    
    # Lifecycle
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)  # None = never expires
    revoked_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="personal_access_tokens")

    def is_valid(self) -> bool:
        """Check if token is valid (not revoked and not expired)"""
        if self.revoked_at is not None:
            return False
        if self.expires_at is not None and datetime.utcnow() > self.expires_at:
            return False
        return True
