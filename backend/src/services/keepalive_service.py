import os
import asyncio
import httpx
from typing import Optional

from src.config import settings

class KeepAliveService:
    """
    Background Keep-Alive Heartbeat Service.
    Sends a lightweight HTTP ping request to prevent cloud host platforms
    from auto-sleeping, respecting configurable interval and enabled flags.
    """
    def __init__(self):
        self._task: Optional[asyncio.Task] = None
        self._running = False

    async def _ping_loop(self):
        # Wait 30s after server boot before starting pings
        await asyncio.sleep(30)
        
        port = os.getenv("PORT", str(getattr(settings, "PORT", 8000)))
        local_endpoint = f"http://127.0.0.1:{port}/api/v1/health"
        raw_url = os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL") or ""
        external_endpoint = f"{raw_url.rstrip('/')}/api/v1/health" if raw_url else None
        
        target = external_endpoint or local_endpoint
        interval_sec = max(30, getattr(settings, "KEEPALIVE_INTERVAL_SECONDS", 180))
        print(f"[KeepAlive] Self-ping heartbeat active. Target: {target} (interval: {interval_sec}s)")

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

                # Repeat using configured interval
                interval_sec = max(30, getattr(settings, "KEEPALIVE_INTERVAL_SECONDS", 180))
                await asyncio.sleep(interval_sec)

    def start(self):
        if not getattr(settings, "KEEPALIVE_ENABLED", True):
            print("[KeepAlive] Notice: KeepAlive disabled by configuration.")
            return

        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._ping_loop())

    def stop(self):
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()

keepalive_service = KeepAliveService()
