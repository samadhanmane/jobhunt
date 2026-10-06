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
        """Verify background discovery interval defaults to 60 minutes (1 hour) and defaults to False (fail-closed)."""
        self.assertEqual(settings.BACKGROUND_DISCOVERY_INTERVAL_MINUTES, 60)
        self.assertFalse(settings.BACKGROUND_DISCOVERY_ENABLED)

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
        """Verify keepalive is enabled by default to keep scheduler alive on Render free tier."""
        self.assertEqual(settings.KEEPALIVE_INTERVAL_SECONDS, 600)
        self.assertTrue(settings.KEEPALIVE_ENABLED)

    async def test_linkedin_cookie_validation_async(self):
        """Verify validate_cookie_async safely handles unconfigured cookie without blocking."""
        li_svc = LinkedInService()
        res = await li_svc.validate_cookie_async(None)
        self.assertFalse(res["valid"])
        self.assertEqual(res["status"], "unconfigured")

    def test_background_discovery_toggle_dynamically(self):
        """Verify Admin can enable and disable background check dynamically."""
        svc = SchedulerService()
        
        # Disable background discovery
        svc.set_background_discovery_enabled(False, updated_by="test_admin")
        self.assertFalse(svc.is_background_discovery_enabled())

        # Re-enable background discovery
        svc.set_background_discovery_enabled(True, updated_by="test_admin")
        self.assertTrue(svc.is_background_discovery_enabled())

    def test_is_background_discovery_enabled_fails_closed(self):
        """Verify is_background_discovery_enabled returns False on database-read failure."""
        from unittest.mock import patch
        svc = SchedulerService()

        with patch("src.services.scheduler_service.SessionLocal", side_effect=Exception("Database connection timeout")):
            # Must fail closed (return False)
            self.assertFalse(svc.is_background_discovery_enabled())

    async def test_background_discovery_disabled_blocks_crawling(self):
        """Verify when background discovery is disabled, run_continuous_background_job_discovery makes 0 scraping calls."""
        from unittest.mock import patch, AsyncMock
        svc = SchedulerService()
        svc.set_background_discovery_enabled(False, updated_by="test_admin")

        with patch.object(svc.orchestrator, "orchestrate_search", new_callable=AsyncMock) as mock_scrape:
            await svc.run_continuous_background_job_discovery()
            mock_scrape.assert_not_called()

    async def test_in_progress_crawl_aborts_immediately_when_disabled(self):
        """Verify in-progress crawl halts when crawler toggle is set to False."""
        svc = SchedulerService()
        svc.set_background_discovery_enabled(False, updated_by="test_admin")
        self.assertTrue(svc._stop_discovery_requested)
        self.assertFalse(svc._discovery_running)

    def test_alert_timing_delays_without_polling(self):
        """Verify get_next_due_alerts_and_delay calculates precise future seconds without polling."""
        from datetime import datetime, timedelta
        from unittest.mock import patch, MagicMock
        svc = SchedulerService()

        # Mock an active alert scheduled at 09:00 IST
        mock_alert = MagicMock()
        mock_alert.id = "alert-123"
        mock_alert.preferred_time = "09:00"
        mock_alert.last_sent_at = None

        mock_db = MagicMock()
        mock_db.query.return_value.filter.return_value.all.return_value = [mock_alert]

        with patch("src.services.scheduler_service.SessionLocal", return_value=mock_db):
            # Test when current IST is 14:00 (past 09:00 today) and alert hasn't run today:
            # Must be DUE TODAY so user receives their daily digest even after server boot/restart
            now_utc = datetime(2026, 9, 28, 8, 30) # 14:00 IST
            with patch("src.services.scheduler_service.datetime") as mock_dt:
                mock_dt.utcnow.return_value = now_utc
                mock_dt.side_effect = lambda *args, **kw: datetime(*args, **kw)
                due_ids, next_delay = svc.get_next_due_alerts_and_delay()
                self.assertEqual(due_ids, ["alert-123"])

            # Test when alert was ALREADY sent today at 09:00 IST:
            # Should NOT be due again today; should delay until tomorrow at 09:00 (> 18 hours)
            mock_alert.last_sent_at = datetime(2026, 9, 28, 3, 30) # 09:00 IST
            with patch("src.services.scheduler_service.datetime") as mock_dt:
                mock_dt.utcnow.return_value = now_utc
                mock_dt.side_effect = lambda *args, **kw: datetime(*args, **kw)
                due_ids, next_delay = svc.get_next_due_alerts_and_delay()
                self.assertEqual(due_ids, [])
                self.assertGreater(next_delay, 18 * 3600)

if __name__ == "__main__":
    unittest.main()
