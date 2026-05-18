import json
import logging
from typing import Optional

import redis

from app.config import settings
from app.events.types import DomainEvent

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_client


def publish(event: DomainEvent) -> None:
    try:
        client = get_redis()
        payload = event.model_dump_json()
        for channel in event.channels:
            client.publish(channel, payload)
        logger.debug("Published %s to %s", event.type, event.channels)
    except redis.RedisError as exc:
        logger.warning("Redis publish failed for %s: %s", event.type, exc)
