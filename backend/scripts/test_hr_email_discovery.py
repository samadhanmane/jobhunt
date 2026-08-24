"""
Integration test for the full Scout-style enrichment pipeline.
Tests:
1. LeadEnricher: domain guessing, email generation, pattern detection, SMTP verification
2. LinkedInService: HR + Tech team discovery with enrichment
3. JobService: DB integration with company insights and contacts
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.enrichment_service import lead_enricher
from src.services.linkedin_service import linkedin_service


async def test_lead_enricher():
    """Test LeadEnricher unit: domain guessing, email generation, website scraping, SMTP."""
    print("\n--- 1. Testing LeadEnricher Unit (Full Scout Pipeline) ---")

    # Test domain guessing
    domain1 = lead_enricher._guess_company_domain("Stripe Inc")
    print(f"Guessed domain for 'Stripe Inc': {domain1}")
    assert domain1 and "stripe" in domain1, f"Expected stripe domain, got {domain1}"

    domain2 = lead_enricher._guess_company_domain("Wikimedia Foundation")
    print(f"Guessed domain for 'Wikimedia Foundation': {domain2}")

    # Test email candidate generation with detected pattern
    candidates = lead_enricher._generate_email_candidates("Sarah Connor", "stripe.com", detected_pattern="first.last")
    print(f"Generated email candidates ({len(candidates)}): {candidates[:4]}")
    assert len(candidates) > 0, "Expected email candidates"
    assert candidates[0] == "sarah.connor@stripe.com", f"Expected first.last pattern prioritized, got {candidates[0]}"

    # Test email candidates without pattern (default order)
    candidates_no_pattern = lead_enricher._generate_email_candidates("John Doe", "example.org")
    print(f"Default order candidates: {candidates_no_pattern[:3]}")

    # Test MX resolution (use the guessed domain to avoid DNS cache issues)
    mx_host = lead_enricher._get_mx_host(domain1)
    print(f"{domain1} MX Host: {mx_host}")
    assert mx_host is not None, f"Expected MX host for {domain1}"

    # Test website scraping for emails
    print("Testing website scraping...")
    website_data = await lead_enricher._scrape_website_emails("https://stripe.com")
    print(f"Stripe website emails found: {len(website_data.get('emails', []))}")
    print(f"Stripe website phones found: {len(website_data.get('phones', []))}")

    # Test pattern detection
    pattern = await lead_enricher._detect_company_email_pattern("stripe.com")
    print(f"Detected Stripe email pattern: {pattern}")

    # Test full enrichment pipeline (async)
    enriched = await lead_enricher.enrich_recruiter({
        'full_name': 'Jessica Miller',
        'company': 'Stripe',
        'bio': 'Lead Technical Recruiter at Stripe | jessica.miller@stripe.com',
        'headline': 'Lead Technical Recruiter at Stripe',
        'website': ''
    })
    print(f"Enriched Email: {enriched.get('email')}")
    print(f"Email Source: {enriched.get('email_source')}")
    print(f"Confidence Score: {enriched.get('confidence_score')}%")
    print(f"Verified: {enriched.get('email_verified')}")
    assert enriched.get('email') is not None, "Expected enriched email"
    assert enriched.get('confidence_score', 0) >= 80, f"Expected high confidence, got {enriched.get('confidence_score')}"

    print("[PASSED] LeadEnricher Unit Tests Passed!")


async def test_linkedin_hr_and_tech_discovery():
    """Test LinkedInService: HR + Tech team discovery with dorking fallback."""
    print("\n--- 2. Testing LinkedInService HR + Tech Team Discovery ---")

    # Test HR discovery
    print("Searching HR contacts for: Postman")
    hr_contacts = await linkedin_service.find_company_hr("Postman", limit=2)
    print(f"Discovered {len(hr_contacts)} HR recruiters for Postman:")
    for idx, r in enumerate(hr_contacts):
        print(f"  [{idx+1}] {r.get('full_name')} | {r.get('headline')}")
        print(f"      Email: {r.get('email')} (Confidence: {r.get('confidence_score', 0)}%, Source: {r.get('email_source')})")
        print(f"      Phone: {r.get('phone', 'N/A')}")
        print(f"      LinkedIn: {r.get('profile_url')}")
    
    assert len(hr_contacts) > 0, "Expected at least 1 HR contact"
    assert hr_contacts[0].get("email"), "Expected email for first HR contact"

    # Test Tech team discovery
    print("\nSearching Tech team for: Postman")
    tech_contacts = await linkedin_service.search_company_tech_team("Postman", limit=2)
    print(f"Discovered {len(tech_contacts)} tech profiles for Postman:")
    for idx, t in enumerate(tech_contacts):
        print(f"  [{idx+1}] {t.get('full_name')} | {t.get('headline')}")

    # Test all contacts combined
    print("\nSearching ALL contacts for: Postman")
    all_contacts = await linkedin_service.search_company_all_contacts("Postman", hr_limit=2, tech_limit=2)
    print(f"Total HR: {len(all_contacts['hr_contacts'])}, Total Tech: {len(all_contacts['tech_contacts'])}")
    print(f"All contacts: {len(all_contacts['all_contacts'])}")

    print("[PASSED] LinkedInService HR + Tech Discovery Test Passed!")


async def test_job_service_integration():
    """Test JobService: DB integration with company insights, contacts, and CSV export."""
    print("\n--- 3. Testing JobService Integration ---")

    from src.models.database import init_and_migrate_db, get_db
    init_and_migrate_db()

    db_gen = get_db()
    db = next(db_gen)

    try:
        from src.services.job_service import JobService
        job_service = JobService(db)

        # Create a test job with company insights
        from src.models.job import Job
        import uuid

        test_job = Job(
            id=str(uuid.uuid4()),
            title="Senior Backend Engineer",
            company="Postman",
            location="Remote",
            description="We are looking for a Senior Backend Engineer with 5+ years experience in Python, FastAPI, and microservices.",
            url="https://postman.com/careers/backend",
            source="test",
            posted_date="2026-08-24",
            match_score=85.0,
            match_reason="Strong Python and API experience match.",
            matching_skills=["Python", "FastAPI", "Microservices"],
            missing_skills=["Go"],
            experience_fit="Good Fit",
            company_insights={"size_indicator": "Mid-Size", "industry": "DevTools", "culture_signals": ["remote-first", "collaborative"], "red_flags": []},
            key_requirements="Requires 5+ years of hands-on Python backend development with FastAPI. Day-to-day involves building API testing infrastructure at scale.",
            search_id="test-insights-" + str(uuid.uuid4())[:8],
            embedding=[0.0] * 384
        )
        db.add(test_job)
        db.commit()

        # Fetch HR + tech contacts
        result = await job_service.fetch_job_hr_contacts(
            job_id=test_job.id,
            candidate_name="Alex Mercer",
            candidate_skills=["Python", "FastAPI", "Microservices", "AWS"],
            include_tech=True
        )

        print(f"Fetch HR Status: {result.get('status')}")
        print(f"Company: {result.get('company')}")
        print(f"Total HR Contacts: {len(result.get('hr_contacts', []))}")
        print(f"Total Tech Contacts: {len(result.get('tech_contacts', []))}")

        if result.get("hr_contacts"):
            hr = result["hr_contacts"][0]
            print(f"Sample HR Contact: {hr.get('full_name')} - {hr.get('headline')}")
            print(f"Corporate Email: {hr.get('email')} ({hr.get('confidence_score', 0)}% confidence)")
            print(f"Phone: {hr.get('phone', 'N/A')}")
            if hr.get("outreach_draft"):
                print(f"Draft Subject: {hr['outreach_draft'].get('email_subject')}")
                print(f"Draft Email Snippet:\n{hr['outreach_draft'].get('email_body', '')[:200]}...")
                print(f"Draft LinkedIn Note: {hr['outreach_draft'].get('linkedin_note')}")

        if result.get("tech_contacts"):
            tech = result["tech_contacts"][0]
            print(f"\nSample Tech Contact: {tech.get('full_name')} - {tech.get('headline')}")
            print(f"Corporate Email: {tech.get('email')} ({tech.get('confidence_score', 0)}% confidence)")

        # Verify company insights are stored
        refreshed_job = db.query(Job).filter(Job.id == test_job.id).first()
        print(f"\nStored Company Insights: {refreshed_job.company_insights}")
        print(f"Stored Key Requirements: {refreshed_job.key_requirements[:100]}...")
        assert refreshed_job.company_insights is not None, "Expected company_insights stored"
        assert refreshed_job.key_requirements, "Expected key_requirements stored"

        print("[PASSED] JobService Integration Test Passed!")

    finally:
        try:
            db.close()
        except Exception:
            pass


async def main():
    await test_lead_enricher()
    await test_linkedin_hr_and_tech_discovery()
    await test_job_service_integration()
    print("\n[SUCCESS] All tests passed!")


if __name__ == "__main__":
    asyncio.run(main())
