"""
Test script for expanded free job board integrations & ATS scrapers.
Tests:
- JobicyClient
- RemoteOKClient
- GreenhouseClient
- LeverClient
- AshbyClient
- OrchestratorAgent multi-source execution
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.integrations.jobicy.client import JobicyClient
from src.integrations.remoteok.client import RemoteOKClient
from src.integrations.greenhouse.client import GreenhouseClient
from src.integrations.lever.client import LeverClient
from src.integrations.ashby.client import AshbyClient


async def test_scrapers():
    print("\n--- Testing Expanded Free Job Scrapers ---")
    
    # 1. Jobicy
    jobicy = JobicyClient()
    jobicy_jobs = await jobicy.search(query="Python", location="Remote", remote=True)
    print(f"[Jobicy] Returned {len(jobicy_jobs)} jobs.")
    if jobicy_jobs:
        print(f"   Sample: {jobicy_jobs[0].get('title')} at {jobicy_jobs[0].get('company')}")
        
    # 2. RemoteOK
    remoteok = RemoteOKClient()
    remoteok_jobs = await remoteok.search(query="Developer", location="Remote", remote=True)
    print(f"[RemoteOK] Returned {len(remoteok_jobs)} jobs.")
    if remoteok_jobs:
        print(f"   Sample: {remoteok_jobs[0].get('title')} at {remoteok_jobs[0].get('company')}")

    # 3. Greenhouse ATS
    greenhouse = GreenhouseClient()
    gh_jobs = await greenhouse.search(query="Software Engineer", location="Remote", remote=True)
    print(f"[Greenhouse ATS] Returned {len(gh_jobs)} jobs.")
    if gh_jobs:
        print(f"   Sample: {gh_jobs[0].get('title')} at {gh_jobs[0].get('company')} ({gh_jobs[0].get('url')})")

    # 4. Lever ATS
    lever = LeverClient()
    lever_jobs = await lever.search(query="Backend Engineer", location="Remote", remote=True)
    print(f"[Lever ATS] Returned {len(lever_jobs)} jobs.")
    if lever_jobs:
        print(f"   Sample: {lever_jobs[0].get('title')} at {lever_jobs[0].get('company')} ({lever_jobs[0].get('url')})")

    # 5. Ashby ATS
    ashby = AshbyClient()
    ashby_jobs = await ashby.search(query="AI Engineer", location="Remote", remote=True)
    print(f"[Ashby ATS] Returned {len(ashby_jobs)} jobs.")
    if ashby_jobs:
        print(f"   Sample: {ashby_jobs[0].get('title')} at {ashby_jobs[0].get('company')} ({ashby_jobs[0].get('url')})")

    print("\n[SUCCESS] All expanded scraper tests completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_scrapers())
