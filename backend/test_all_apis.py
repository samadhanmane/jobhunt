import asyncio
import os
import sys

# Ensure backend root is in import path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.integrations.jobspy.client import JobSpyClient
from src.integrations.arbeitnow.client import ArbeitnowClient
from src.integrations.himalayas.client import HimalayasClient
from src.integrations.freehire.client import FreehireClient

async def test_platform(name: str, client_instance, query: str, location: str, remote: bool):
    print(f"\n==================================================")
    print(f"Testing Platform: {name}")
    print(f"Query: '{query}', Location: '{location}', Remote: {remote}")
    print(f"==================================================")
    try:
        jobs = await client_instance.search(query=query, location=location, remote=remote)
        print(f"-> SUCCESS: Received {len(jobs)} jobs from {name}")
        if jobs:
            print(f"-> Sample Job:")
            sample = jobs[0]
            print(f"   Title   : {sample.get('title')}")
            print(f"   Company : {sample.get('company')}")
            print(f"   Location: {sample.get('location')}")
            print(f"   Source  : {sample.get('source')}")
            print(f"   URL     : {sample.get('url')[:80]}..." if sample.get('url') else "   URL     : None")
        return {"name": name, "status": "SUCCESS", "count": len(jobs)}
    except Exception as e:
        print(f"-> FAILED: {name} error: {e}")
        return {"name": name, "status": "FAILED", "error": str(e), "count": 0}

async def main():
    query = "Python Developer"
    location = "San Francisco, CA"
    remote = True

    print("\n[STARTING LIVE INTEGRATION TESTS FOR ALL PLATFORMS]")

    # 1. Arbeitnow
    arbeitnow_client = ArbeitnowClient()
    res_arbeitnow = await test_platform("Arbeitnow", arbeitnow_client, "python", location, remote)

    # 2. Himalayas
    himalayas_client = HimalayasClient()
    res_himalayas = await test_platform("Himalayas", himalayas_client, "python", location, remote)

    # 3. Freehire
    freehire_client = FreehireClient()
    res_freehire = await test_platform("Freehire", freehire_client, "python", location, remote)

    # 4. JobSpy (LinkedIn, Indeed, Glassdoor, ZipRecruiter)
    jobspy_client = JobSpyClient()
    res_jobspy = await test_platform("JobSpy", jobspy_client, "Python Developer", location, remote)

    print("\n==================================================")
    print("                 SUMMARY RESULTS                  ")
    print("==================================================")
    for res in [res_arbeitnow, res_himalayas, res_freehire, res_jobspy]:
        status_symbol = "[OK]" if res["status"] == "SUCCESS" and res["count"] > 0 else ("[TIMEOUT/EMPTY]" if res["status"] == "SUCCESS" else "[FAIL]")
        print(f"{status_symbol:<15} | {res['name']:<12} | Status: {res['status']:<8} | Jobs Found: {res['count']}")
    print("==================================================\n")

if __name__ == "__main__":
    asyncio.run(main())
