import json
import logging
from functools import wraps
from typing import Any
import redis
from app.config import settings

logger = logging.getLogger(__name__)

# Fallback to dummy URL if not configured so app doesn't crash on boot
redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.Redis.from_url(redis_url, decode_responses=True)

def cache_response(ttl_seconds: int = 300):
    """
    Decorator to cache FastAPI endpoint responses in Redis.
    Uses the function name and arguments to generate a cache key.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate a unique key based on the function and its arguments
            key_parts = [func.__name__] + [str(a) for a in args] + [f"{k}:{v}" for k, v in kwargs.items()]
            cache_key = ":".join(key_parts)
            
            try:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            except redis.RedisError as e:
                logger.warning(f"Redis cache read error: {e}")

            # Execute the actual function
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)

            try:
                # If result is a Pydantic model, dump it; otherwise assume serializable
                serializable_result = result.model_dump() if hasattr(result, "model_dump") else result
                redis_client.setex(cache_key, ttl_seconds, json.dumps(serializable_result))
            except redis.RedisError as e:
                logger.warning(f"Redis cache write error: {e}")

            return result
        return wrapper
    return decorator
