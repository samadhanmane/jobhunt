import os
import sys
import asyncio

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.integrations.apna.client import ApnaClient
from src.integrations.hiredoor.client import HireDoorClient
from src.integrations.builtin.client import BuiltInClient
from src.agents.orchestrator import OrchestratorAgent

def test_apna_client():
    print("Testing ApnaClient...")
    client = ApnaClient()
    assert client.BASE_URL == "https://apna.co/jobs"
    res = asyncio.run(client.search(query="python", location="Bengaluru"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "Apna"
    print(f"  PASS: ApnaClient returned {len(res)} jobs")

def test_hiredoor_client():
    print("Testing HireDoorClient...")
    client = HireDoorClient()
    assert client.BASE_URL == "https://hiredoor.in/jobs"
    res = asyncio.run(client.search(query="engineer", location="pune"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "HireDoor"
        assert sample["url"].startswith("https://hiredoor.in/jobs/")
    print(f"  PASS: HireDoorClient returned {len(res)} jobs")

def test_builtin_client():
    print("Testing BuiltInClient...")
    client = BuiltInClient()
    assert client.BASE_URL == "https://builtin.com/jobs"
    res = asyncio.run(client.search(query="software engineer"))
    assert isinstance(res, list)
    if res:
        sample = res[0]
        assert "title" in sample
        assert "company" in sample
        assert "url" in sample
        assert sample["source"] == "BuiltIn"
    print(f"  PASS: BuiltInClient returned {len(res)} jobs")

def test_orchestrator_integration():
    print("Testing Orchestrator registration of Apna, HireDoor, and BuiltIn...")
    orchestrator = OrchestratorAgent()
    assert hasattr(orchestrator, "apna")
    assert hasattr(orchestrator, "hiredoor")
    assert hasattr(orchestrator, "builtin")
    print("  PASS: Orchestrator attributes verified")

if __name__ == "__main__":
    test_apna_client()
    test_hiredoor_client()
    test_builtin_client()
    test_orchestrator_integration()
    print("\nALL APNA, HIREDOOR, BUILTIN TESTS PASSED!")
