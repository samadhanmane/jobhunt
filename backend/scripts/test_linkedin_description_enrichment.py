import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.integrations.jobspy.client import JobSpyClient
from src.services.scraper_service import ScraperService

async def test_linkedin_enrichment():
    print("--- [TEST 1] ScraperService Direct LinkedIn URL Extraction ---")
    scraper = ScraperService()
    test_url = "https://www.linkedin.com/jobs/view/4155132223"
    res = await scraper.scrape_url(test_url)
    print("Title:", res.get("title"))
    print("Company:", res.get("company"))
    print("Location:", res.get("location"))
    print(f"Clean Description Length: {len(res.get('clean_text', ''))} characters")
    print(f"Preview: {res.get('clean_text', '')[:200]}...")
    assert len(res.get("clean_text", "")) > 200, "Expected full LinkedIn job description"
    print("[PASSED] Direct LinkedIn scraping verified!")

    print("\n--- [TEST 2] JobSpy Search & Automatic LinkedIn Description Enrichment ---")
    jobspy = JobSpyClient()
    jobs = await jobspy.search(query="AI Engineer", location="Remote", remote=True, results_wanted=5)
    print(f"Total Jobs Returned by JobSpy: {len(jobs)}")
    for idx, j in enumerate(jobs[:3]):
        desc = j.get("description", "")
        print(f"[{idx+1}] {j.get('title')} @ {j.get('company')} ({j.get('source')})")
        print(f"     Description Length: {len(desc)} characters")
        print(f"     Preview: {desc[:120]}...")
    print("[PASSED] JobSpy LinkedIn enrichment verified!")

if __name__ == "__main__":
    asyncio.run(test_linkedin_enrichment())
