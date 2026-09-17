import os
import sys
import asyncio

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.integrations.themuse.client import TheMuseClient
from src.integrations.simplify.client import SimplifyClient
from src.integrations.dailyremote.client import DailyRemoteClient
from src.integrations.govindia.client import GovIndiaClient
from src.agents.orchestrator import OrchestratorAgent
from src.services.scheduler_service import SchedulerService

def test_themuse_client():
    print("Testing TheMuseClient...")
    client = TheMuseClient()
    assert client.BASE_URL == "https://www.themuse.com/api/public/jobs"
    res = asyncio.run(client.search(query="software engineer"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "The Muse"
    print(f"  PASS: TheMuseClient returned {len(res)} jobs")

def test_simplify_client():
    print("Testing SimplifyClient...")
    client = SimplifyClient()
    assert "SimplifyJobs" in client.DATA_URL
    res = asyncio.run(client.search(query="intern"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "Simplify"
    print(f"  PASS: SimplifyClient returned {len(res)} jobs")

def test_dailyremote_client():
    print("Testing DailyRemoteClient (disabled by design)...")
    client = DailyRemoteClient()
    res = asyncio.run(client.search(query="python"))
    assert isinstance(res, list)
    assert len(res) == 0
    print("  PASS: DailyRemoteClient returns empty list")

def test_expanded_govindia_psus():
    print("Testing GovIndia PSU connector (disabled by design)...")
    client = GovIndiaClient()
    res = asyncio.run(client.search(query="engineer"))
    assert isinstance(res, list)
    assert len(res) == 0
    print("  PASS: GovIndia connector disabled and returns empty list")

def test_orchestrator_and_scheduler_integration():
    print("Testing Orchestrator and Scheduler integration of new platforms...")
    orchestrator = OrchestratorAgent()
    assert hasattr(orchestrator, "themuse")
    assert hasattr(orchestrator, "simplify")
    assert not hasattr(orchestrator, "dailyremote")
    assert not hasattr(orchestrator, "govindia")
    
    scheduler = SchedulerService()
    assert hasattr(scheduler.orchestrator, "themuse")
    assert hasattr(scheduler.orchestrator, "simplify")
    assert not hasattr(scheduler.orchestrator, "dailyremote")
    assert not hasattr(scheduler.orchestrator, "govindia")
    print("  PASS: Orchestrator and Scheduler Service attributes verified")

if __name__ == "__main__":
    test_themuse_client()
    test_simplify_client()
    test_dailyremote_client()
    test_expanded_govindia_psus()
    test_orchestrator_and_scheduler_integration()
    print("\nALL THE MUSE, SIMPLIFY, DAILYREMOTE & AUTOMATION TESTS PASSED!")
