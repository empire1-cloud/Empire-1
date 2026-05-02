import redis.asyncio as redis
from .config import get_settings

settings = get_settings()

# ---------------------------------------------------------
# REDIS CLIENT (ASYNC)
# ---------------------------------------------------------
redis_client = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)

# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------
async def redis_healthcheck() -> bool:
    try:
        pong = await redis_client.ping()
        return pong is True
    except Exception:
        return False

# ---------------------------------------------------------
# COMMON HELPERS
# ---------------------------------------------------------
async def redis_set(key: str, value: str, expire: int | None = None):
    await redis_client.set(key, value, ex=expire)


async def redis_get(key: str):
    return await redis_client.get(key)


async def redis_delete(key: str):
    await redis_client.delete(key)
