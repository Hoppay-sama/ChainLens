import asyncio
import json
from typing import List


class EventBroadcaster:
    def __init__(self):
        self._queues: List[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self._queues.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        self._queues.remove(queue)

    async def broadcast(self, event_type: str, data: dict) -> None:
        message = f"event: {event_type}\ndata: {json.dumps(data)}\n\n"
        for queue in self._queues:
            await queue.put(message)


broadcaster = EventBroadcaster()
