import asyncio
import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.scraper_service import scraper_service
from src.agents.enrichment import EnrichmentAgent
from src.models.database import SessionLocal
from src.services.job_service import JobService

async def test_scraper_unit():
    print("\n--- 1. Testing ScraperService HTML + JSON-LD Cleaning ---")
    
    sample_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Python Backend Engineer at TechCorp</title>
        <meta property="og:title" content="Python Backend Engineer at TechCorp" />
        <meta property="og:site_name" content="TechCorp Inc." />
        <script type="application/ld+json">
        {
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          "title": "Senior Python Backend Engineer",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "TechCorp Global"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "addressLocality": "San Francisco",
              "addressRegion": "CA",
              "addressCountry": "USA"
            }
          },
          "jobLocationType": "TELECOMMUTE",
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": {
              "@type": "QuantitativeValue",
              "minValue": 140000,
              "maxValue": 180000,
              "unitText": "YEAR"
            }
          },
          "description": "<p>We are looking for a <strong>Senior Backend Engineer</strong> with 4+ years experience in Python, FastAPI, and PostgreSQL.</p><p>Nice to have: Docker, Kubernetes, AWS. Visa sponsorship is available.</p>"
        }
        </script>
    </head>
    <body>
        <header><nav>Home | Careers | Login</nav></header>
        <div class="cookie-banner">Accept all cookies</div>
        <div id="job-details">
            <h1>Senior Python Backend Engineer</h1>
            <p>Full-time remote role.</p>
        </div>
        <footer>Copyright 2026 TechCorp</footer>
    </body>
    </html>
    """

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(sample_html, "html.parser")
    json_ld = scraper_service._extract_json_ld(soup)
    print(f"Extracted JSON-LD Title: {json_ld.get('title')}")
    print(f"Extracted JSON-LD Company: {json_ld.get('company')}")
    print(f"Extracted JSON-LD Location: {json_ld.get('location')}")
    print(f"Extracted JSON-LD Salary: {json_ld.get('salary')}")
    print(f"Extracted Clean Text: {json_ld.get('description')[:100]}...")

    assert json_ld.get("title") == "Senior Python Backend Engineer", "Title extraction failed"
    assert "TechCorp" in json_ld.get("company"), "Company extraction failed"
    assert "Remote" in json_ld.get("location"), "Location extraction failed"
    print("[PASSED] ScraperService Unit Test Passed!")

async def test_enrichment_agent():
    print("\n--- 2. Testing EnrichmentAgent with LLM ---")
    enricher = EnrichmentAgent()
    
    mock_scraped = {
        "url": "https://careers.stripe.com/jobs/12345",
        "title": "Backend Software Engineer",
        "company": "Stripe",
        "location": "Remote",
        "posted_date": "2026-08-20",
        "clean_text": """
Role: Backend Software Engineer
Location: Remote (US / Canada)
Salary: $130,000 - $170,000 USD / year

About the role:
We are looking for an engineer with 3+ years of experience building reliable backend services.
Must have: Python, PostgreSQL, REST APIs, Microservices.
Bonus: Go, Kafka, AWS, Docker.
Visa sponsorship is available for qualified applicants.
We offer comprehensive healthcare, 401(k) matching, and remote home office stipend.
"""
    }

    candidate = {
        "skills": ["Python", "PostgreSQL", "FastAPI", "Docker", "AWS"],
        "experience_years": 3.5,
        "seniority": "Mid",
        "target_roles": ["Backend Software Engineer", "Python Developer"]
    }

    enriched = await enricher.enrich_job(mock_scraped, candidate_profile=candidate)
    print(f"Enriched Title: {enriched.get('title')}")
    print(f"Enriched Company: {enriched.get('company')}")
    print(f"Enriched Work Mode: {enriched.get('work_mode')}")
    print(f"Enriched Seniority: {enriched.get('seniority_level')}")
    print(f"Enriched Tech Stack: {enriched.get('tech_stack')}")
    print(f"Enriched Salary: {enriched.get('salary_range')}")
    print(f"Enriched Visa: {enriched.get('visa_sponsorship')}")
    print(f"Match Score: {enriched.get('match_score')}%")
    print(f"Matching Skills: {enriched.get('matching_skills')}")
    print(f"Match Reason: {enriched.get('match_reason')}")

    assert enriched.get("title"), "Title should be populated"
    assert enriched.get("work_mode") == "Remote", "Work mode should be Remote"
    print("[PASSED] EnrichmentAgent LLM Test Passed!")

async def test_job_service_scrape_and_enrich():
    print("\n--- 3. Testing JobService scrape_and_enrich_links end-to-end ---")
    db = SessionLocal()
    try:
        job_service = JobService(db)
        
        # Test with a known accessible tech job page
        test_urls = [
            "https://himalayas.app/companies/wikimedia-foundation/jobs/senior-software-engineer-mediawiki"
        ]
        
        result = await job_service.scrape_and_enrich_links(
            urls=test_urls,
            preferences={
                "role": "Senior Software Engineer",
                "experience_years": 5.0,
                "location": "Remote"
            }
        )
        
        print(f"Pipeline Status: {result.get('status')}")
        print(f"Search ID: {result.get('search_id')}")
        print(f"Total Found: {result.get('total_found')}")
        print(f"Jobs Returned: {len(result.get('jobs', []))}")
        
        if result.get("jobs"):
            job = result["jobs"][0]
            print(f"Sample Job: {job.get('title')} at {job.get('company')}")
            print(f"Match Score: {job.get('match_score')}%")
            print(f"Skills: {job.get('matching_skills')}")
            print(f"Experience Fit: {job.get('experience_fit')}")
            
        print("[PASSED] JobService scrape_and_enrich_links Test Completed Successfully!")
    finally:
        db.close()

async def main():
    await test_scraper_unit()
    await test_enrichment_agent()
    await test_job_service_scrape_and_enrich()

if __name__ == "__main__":
    asyncio.run(main())
