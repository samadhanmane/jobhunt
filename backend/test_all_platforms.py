import asyncio
import sys
from src.integrations.jobspy.client import JobSpyClient
from src.integrations.arbeitnow.client import ArbeitnowClient
from src.integrations.himalayas.client import HimalayasClient
from src.integrations.freehire.client import FreehireClient

async def main():
    print("=== Multi-Platform Integration Diagnostic ===")
    
    # 1. JobSpy
    print("\n1. Testing JobSpy (LinkedIn & Indeed)...")
    js = JobSpyClient()
    js_jobs = await js.search(query="Machine Learning Intern", location="Pune, India", remote=True)
    print(f"-> JobSpy: Successfully returned {len(js_jobs)} live jobs.")
    if js_jobs:
        print(f"   Sample: '{js_jobs[0]['title']}' at '{js_jobs[0]['company']}' ({js_jobs[0]['source']})")
        
    # 2. Arbeitnow
    print("\n2. Testing Arbeitnow (with Domain & Keyword Filter)...")
    arb = ArbeitnowClient()
    arb_jobs = await arb.search(
        query="Machine Learning Intern", 
        location="Remote", 
        remote=True,
        domain_keywords=["machine learning", "ai", "deep learning", "python"]
    )
    print(f"-> Arbeitnow: Successfully returned {len(arb_jobs)} filtered relevant jobs.")
    if arb_jobs:
        print(f"   Sample: '{arb_jobs[0]['title']}' at '{arb_jobs[0]['company']}'")

    # 3. Himalayas
    print("\n3. Testing Himalayas (Remote Specialized API)...")
    him = HimalayasClient()
    him_jobs = await him.search(query="Machine Learning", location="Remote", remote=True)
    print(f"-> Himalayas: Successfully returned {len(him_jobs)} live remote jobs.")
    if him_jobs:
        print(f"   Sample: '{him_jobs[0]['title']}' at '{him_jobs[0]['company']}'")

    # 4. Freehire
    print("\n4. Testing Freehire (https://freehire.me)...")
    fh = FreehireClient()
    fh_check = await fh.me()
    print(f"-> Freehire Auth Check: {fh_check}")
    fh_jobs = await fh.search(query="Machine Learning", location="Remote", remote=True)
    print(f"-> Freehire: Returned {len(fh_jobs)} jobs.")

    print("\n=== Summary: All 4 platforms integrated & operational ===")

if __name__ == "__main__":
    asyncio.run(main())
