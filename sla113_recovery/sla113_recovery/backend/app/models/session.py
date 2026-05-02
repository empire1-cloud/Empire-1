import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="transactions")

    # -----------------------------------------------------
    # FINANCIALS
    # -----------------------------------------------------
    amount = Column(Integer, nullable=False)
    description = Column(String, nullable=False)

    # Optional metadata for engine context, payment provider, etc.
    metadata = Column(JSON, nullable=True)

    # -----------------------------------------------------
    # TIMESTAMP
    # -----------------------------------------------------
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
