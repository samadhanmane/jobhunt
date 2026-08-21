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
        
        # Priority: Render External URL -> BACKEND_URL -> Localhost
        raw_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL") or ""
        if raw_url:
            clean_url = raw_url.rstrip("/")
            ping_endpoint = f"{clean_url}/health"
        else:
            port = os.getenv("PORT", "8000")
            ping_endpoint = f"http://127.0.0.1:{port}/health"

        print(f"[KeepAlive] Self-ping heartbeat active. Target: {ping_endpoint}")

        async with httpx.AsyncClient(timeout=10.0) as client:
            while self._running:
                try:
                    resp = await client.get(ping_endpoint)
                    if resp.status_code == 200:
                        print("[KeepAlive Heartbeat]: 💓 Server Active (200 OK)")
                    else:
                        print(f"[KeepAlive Notice]: Ping status {resp.status_code}")
                except Exception as e:
                    print(f"[KeepAlive Notice]: Ping notice ({e})")

                # Repeat every 60 seconds
                await asyncio.sleep(60)

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._ping_loop())

    def stop(self):
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()

keepalive_service = KeepAliveService()
