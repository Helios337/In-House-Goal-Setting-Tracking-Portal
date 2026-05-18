import asyncio
import json
import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from app import dependencies
from app.core.database import get_db
from app.services.channel_service import get_user_channels
from app.services.event_bus import get_redis

logger = logging.getLogger(__name__)
router = APIRouter()


async def _event_generator(request: Request, channels: list[str]):
    redis_client = get_redis()
    pubsub = redis_client.pubsub()
    pubsub.subscribe(*channels)
    heartbeat_ticks = 0

    try:
        yield {"data": json.dumps({"type": "connected", "channels": channels})}
        while True:
            if await request.is_disconnected():
                break

            message = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0),
            )

            if message and message.get("type") == "message":
                yield {"data": message["data"]}
                heartbeat_ticks = 0
            else:
                heartbeat_ticks += 1
                if heartbeat_ticks >= 20:
                    yield {"data": json.dumps({"type": "heartbeat"})}
                    heartbeat_ticks = 0

            await asyncio.sleep(0.5)
    finally:
        try:
            pubsub.unsubscribe(*channels)
            pubsub.close()
        except Exception as exc:
            logger.debug("Pubsub cleanup: %s", exc)


@router.get("/stream")
async def event_stream(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(dependencies.get_current_active_user),
):
    channels = get_user_channels(db, current_user.id)
    return EventSourceResponse(_event_generator(request, channels))
