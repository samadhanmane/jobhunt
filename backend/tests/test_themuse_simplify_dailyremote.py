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
    print("Testing DailyRemoteClient...")
    client = DailyRemoteClient()
    assert client.BASE_URL == "https://dailyremote.com/remote-jobs"
    res = asyncio.run(client.search(query="python"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "DailyRemote"
    print(f"  PASS: DailyRemoteClient returned {len(res)} jobs")

def test_expanded_govindia_psus():
    print("Testing expanded GovIndia PSU opportunities...")
    client = GovIndiaClient()
    res = asyncio.run(client.search(query="engineer"))
    assert isinstance(res, list)
    assert len(res) >= 5, f"Expected >= 5 PSU opportunities, got {len(res)}"
    companies = [j["company"] for j in res]
    assert any("ISRO" in c for c in companies)
    assert any("DRDO" in c for c in companies)
    assert any("BEL" in c for c in companies)
    assert any("BHEL" in c for c in companies)
    assert any("HAL" in c for c in companies)
    print(f"  PASS: GovIndia returned {len(res)} expanded PSU opportunities: {[c[:10] for c in companies]}")

def test_orchestrator_and_scheduler_integration():
    print("Testing Orchestrator and Scheduler integration of new platforms...")
    orchestrator = OrchestratorAgent()
    assert hasattr(orchestrator, "themuse")
    assert hasattr(orchestrator, "simplify")
    assert hasattr(orchestrator, "dailyremote")
    
    scheduler = SchedulerService()
    assert hasattr(scheduler.orchestrator, "themuse")
    assert hasattr(scheduler.orchestrator, "simplify")
    assert hasattr(scheduler.orchestrator, "dailyremote")
    print("  PASS: Orchestrator and Scheduler Service attributes verified")

if __name__ == "__main__":
    test_themuse_client()
    test_simplify_client()
    test_dailyremote_client()
    test_expanded_govindia_psus()
    test_orchestrator_and_scheduler_integration()
    print("\nALL THE MUSE, SIMPLIFY, DAILYREMOTE & AUTOMATION TESTS PASSED!")
