import os
import sys
import asyncio
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.integrations.catalog import (
    COMPANY_CATALOG,
    AI_COMPANIES,
    RECRUITEE_COMPANIES,
    SMARTRECRUITERS_COMPANIES,
    WORKDAY_COMPANIES,
    GREENHOUSE_COMPANIES,
    ASHBY_COMPANIES,
    LEVER_COMPANIES,
    WORKABLE_COMPANIES
)
from src.integrations.recruitee.client import RecruiteeClient
from src.integrations.workingnomads.client import WorkingNomadsClient
from src.integrations.weworkremotely.client import WeWorkRemotelyClient
from src.integrations.cutshort.client import CutshortClient
from src.integrations.hirist.client import HiristClient
from src.integrations.internshala.client import InternshalaClient
from src.integrations.usajobs.client import USAJobsClient
from src.integrations.teamtailor.client import TeamtailorClient
from src.integrations.unstop.client import UnstopClient
from src.integrations.aijobs.client import AIJobsClient
from src.integrations.naukri.client import NaukriClient
from src.integrations.govindia.client import GovIndiaClient
from src.agents.orchestrator import OrchestratorAgent

def test_company_registry_integrity():
    print("Testing dynamic company registry loading and coverage...")
    assert len(COMPANY_CATALOG) >= 50, f"Expected >=50 companies, got {len(COMPANY_CATALOG)}"
    assert len(AI_COMPANIES) >= 15, f"Expected >=15 AI companies, got {len(AI_COMPANIES)}"
    assert len(RECRUITEE_COMPANIES) >= 1, "Expected Recruitee companies in catalog"
    assert len(WORKDAY_COMPANIES) >= 5, "Expected Workday enterprise companies in catalog"
    assert len(SMARTRECRUITERS_COMPANIES) >= 3, "Expected SmartRecruiters companies in catalog"

    # Verify key employers
    names = {c["name"].lower() for c in COMPANY_CATALOG}
    for req in ["openai", "anthropic", "nvidia", "mistral ai", "bunq", "visa", "adobe"]:
        assert req in names, f"Required employer '{req}' missing from dynamic catalog"
    print("  PASS: Dynamic Company Registry Integrity")

def test_recruitee_connector():
    print("Testing Recruitee connector structure...")
    client = RecruiteeClient()
    assert len(client.companies) >= 1
    assert client.companies[0]["name"] == "Bunq"
    print("  PASS: Recruitee Connector")

def test_working_nomads_connector():
    print("Testing Working Nomads connector structure...")
    client = WorkingNomadsClient()
    assert client.API_URL == "https://www.workingnomads.com/api/exposed_jobs/"
    print("  PASS: Working Nomads Connector")

def test_weworkremotely_connector():
    print("Testing We Work Remotely connector structure...")
    client = WeWorkRemotelyClient()
    assert len(client.FEEDS) >= 2
    assert "remote-programming-jobs.rss" in client.FEEDS[0]
    print("  PASS: We Work Remotely Connector")

def test_india_and_internship_connectors():
    print("Testing India & Internship connectors...")
    cutshort = CutshortClient()
    hirist = HiristClient()
    internshala = InternshalaClient()
    unstop = UnstopClient()
    naukri = NaukriClient()

    assert cutshort.SEARCH_URL == "https://cutshort.io/api/v1/jobs/search"
    assert hirist.SEARCH_URL == "https://www.hirist.tech/api/job/search"
    assert internshala.SEARCH_URL == "https://internshala.com/api/v2/search/internships"
    assert unstop.SEARCH_URL == "https://unstop.com/api/public/opportunity/search-result"
    assert naukri.SEARCH_URL == "https://www.naukri.com/jobapi/v3/search"
    print("  PASS: India & Internship Connectors Structure (Cutshort, Hirist, Internshala, Unstop, Naukri)")

def test_teamtailor_connector():
    print("Testing Teamtailor connector structure...")
    client = TeamtailorClient()
    assert len(client.companies) >= 3
    assert client.companies[0]["name"] == "Kry / Livi"
    print("  PASS: Teamtailor Connector")

def test_aijobs_connector():
    print("Testing AIJobs connector structure...")
    client = AIJobsClient()
    assert len(client.FEEDS) >= 1
    assert "kdnuggets.com" in client.FEEDS[0]["url"]
    print("  PASS: AIJobs Connector")

def test_usajobs_and_govindia_connectors():
    print("Testing Government & Public Sector connectors...")
    usajobs = USAJobsClient()
    govindia = GovIndiaClient()

    assert usajobs.SEARCH_URL == "https://data.usajobs.gov/api/search"
    # When no API key is provided, search must return gracefully without throwing
    res = asyncio.run(usajobs.search(query="Software Engineer"))
    assert isinstance(res, list)

    psu_res = asyncio.run(govindia.search(query="Computer Science"))
    assert isinstance(psu_res, list)
    assert len(psu_res) >= 1
    assert any("ISRO" in j["company"] for j in psu_res)
    print("  PASS: Government & PSU Connectors (USAJOBS & GovIndia ISRO/DRDO/BEL)")

def test_orchestrator_multi_category_expansion():
    print("Testing orchestrator integration of all new connectors...")
    orch = OrchestratorAgent()
    assert hasattr(orch, "recruitee")
    assert hasattr(orch, "workingnomads")
    assert hasattr(orch, "weworkremotely")
    assert hasattr(orch, "cutshort")
    assert hasattr(orch, "hirist")
    assert hasattr(orch, "internshala")
    assert hasattr(orch, "unstop")
    assert hasattr(orch, "naukri")
    assert hasattr(orch, "usajobs")
    assert hasattr(orch, "teamtailor")
    assert hasattr(orch, "aijobs")
    assert hasattr(orch, "govindia")
    print("  PASS: Orchestrator Multi-Category Expansion (All 20+ Connectors Active)")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("RUNNING UNIVERSAL MULTI-CATEGORY EXPANSION TEST SUITE")
    print("=" * 60)
    test_company_registry_integrity()
    test_recruitee_connector()
    test_working_nomads_connector()
    test_weworkremotely_connector()
    test_india_and_internship_connectors()
    test_teamtailor_connector()
    test_aijobs_connector()
    test_usajobs_and_govindia_connectors()
    test_orchestrator_multi_category_expansion()
    print("=" * 60)
    print("RESULTS: ALL 9 TESTS PASSED")
    print("=" * 60 + "\n")
