from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import get_settings

settings = get_settings()

# ---------------------------------------------------------
# BASE MODEL
# ---------------------------------------------------------
Base = declarative_base()

# ---------------------------------------------------------
# ASYNC ENGINE
# ---------------------------------------------------------
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

# ---------------------------------------------------------
# SESSION FACTORY
# ---------------------------------------------------------
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ---------------------------------------------------------
# FASTAPI DEPENDENCY
# ---------------------------------------------------------
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session

# Alias for backwards compatibility
SessionLocal = async_session
