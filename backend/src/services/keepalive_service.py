import os
import asyncio
import httpx
from typing import Optional

class KeepAliveService:
    """
    Background Keep-Alive Heartbeat Service.
    Sends a lightweight HTTP ping request every 60 seconds to prevent
    cloud host platforms (e.g. Render Free Tier) from auto-sleeping.
    """
    def __init__(self):
        self._task: Optional[asyncio.Task] = None
        self._running = False

    async def _ping_loop(self):
        # Wait 30s after server boot before starting pings
        await asyncio.sleep(30)
        
        port = os.getenv("PORT", "8000")
        local_endpoint = f"http://127.0.0.1:{port}/api/v1/health"
        raw_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL") or ""
        external_endpoint = f"{raw_url.rstrip('/')}/api/v1/health" if raw_url else None
        
        target = external_endpoint or local_endpoint
        print(f"[KeepAlive] Self-ping heartbeat active. Target: {target}")

        async with httpx.AsyncClient(timeout=15.0) as client:
            while self._running:
                try:
                    resp = await client.get(target)
                    if resp.status_code == 200:
                        pass  # Silent healthy heartbeat
                    elif external_endpoint:
                        # Fallback to local if external DNS/TLS fails
                        await client.get(local_endpoint)
                except Exception:
                    try:
                        await client.get(local_endpoint)
                    except Exception:
                        pass

                # Repeat every 90 seconds
                await asyncio.sleep(90)

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._ping_loop())

    def stop(self):
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()

keepalive_service = KeepAliveService()
