import sys
import os
import time
import asyncio
import unittest

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.core.thread_pool import get_worker_pool, run_in_worker_thread, shutdown_worker_pool
from src.config import settings
from src.services.scheduler_service import SchedulerService, scheduler_service
from src.services.keepalive_service import KeepAliveService
from src.services.linkedin_service import LinkedInService

class TestSchedulerAndThreadOptimization(unittest.IsolatedAsyncioTestCase):
    def test_worker_thread_pool_singleton(self):
        """Verify worker thread pool is initialized with correct naming and bounds."""
        pool = get_worker_pool()
        self.assertIsNotNone(pool)
        self.assertGreaterEqual(pool._max_workers, 4)
        # Verify subsequent call returns identical singleton
        self.assertIs(pool, get_worker_pool())

    async def test_run_in_worker_thread_offload(self):
        """Verify run_in_worker_thread executes blocking code in a worker thread."""
        def blocking_calc(x, multiplier=2):
            time.sleep(0.05)
            import threading
            return x * multiplier, threading.current_thread().name

        main_thread_name = asyncio.get_running_loop()
        val, worker_thread_name = await run_in_worker_thread(blocking_calc, 21, multiplier=2)
        
        self.assertEqual(val, 42)
        self.assertTrue("JobHunt-Worker" in worker_thread_name or "ThreadPoolExecutor" in worker_thread_name)

    def test_scheduler_1_hour_configuration(self):
        """Verify background discovery interval defaults to 60 minutes (1 hour)."""
        self.assertEqual(settings.BACKGROUND_DISCOVERY_INTERVAL_MINUTES, 60)
        self.assertTrue(settings.BACKGROUND_DISCOVERY_ENABLED)

    async def test_scheduler_discovery_mutex_lock(self):
        """Verify discovery lock prevents overlapping runs."""
        svc = SchedulerService()
        self.assertFalse(svc._discovery_running)
        svc._discovery_running = True
        
        # When lock is held, run_continuous_background_job_discovery should return early
        await svc.run_continuous_background_job_discovery()
        
        # Lock should remain preserved
        self.assertTrue(svc._discovery_running)

    def test_keepalive_configuration(self):
        """Verify keepalive uses configurable interval settings."""
        self.assertEqual(settings.KEEPALIVE_INTERVAL_SECONDS, 180)
        self.assertTrue(settings.KEEPALIVE_ENABLED)

    async def test_linkedin_cookie_validation_async(self):
        """Verify validate_cookie_async safely handles unconfigured cookie without blocking."""
        li_svc = LinkedInService()
        res = await li_svc.validate_cookie_async(None)
        self.assertFalse(res["valid"])
        self.assertEqual(res["status"], "unconfigured")

if __name__ == "__main__":
    unittest.main()
