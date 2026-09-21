import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from fastapi import HTTPException

from src.agents.deduplication import DeduplicationAgent, are_locations_compatible_for_dedup
from src.services.scheduler_service import generate_job_hash, SchedulerService
from src.services.email_service import email_service
from src.services.auth_service import get_admin_credentials, verify_password
from src.utils.location_helper import is_job_location_match
from src.api.routes.contacts import scrape_linkedin_profile, ScrapeProfileRequest

def test_deduplication_multi_office_preservation():
    """Verify deduplication preserves multi-office postings across distinct cities/countries."""
    # 1. Direct helper checks
    assert are_locations_compatible_for_dedup("Pune, India", "Sunnyvale, CA, USA") is False
    assert are_locations_compatible_for_dedup("Pune, India", "Bengaluru, India") is False
    assert are_locations_compatible_for_dedup("Pune, India", "Pune, Maharashtra") is True
    assert are_locations_compatible_for_dedup("Pune, India", "Remote") is True

    # 2. Agent end-to-end deduplication
    agent = DeduplicationAgent()
    jobs = [
        {"title": "Software Engineer", "company": "Google", "location": "Pune, India", "url": "https://careers.google.com/1"},
        {"title": "Software Engineer", "company": "Google", "location": "Mountain View, CA, USA", "url": "https://careers.google.com/2"},
        {"title": "Software Engineer", "company": "Google", "location": "Bengaluru, India", "url": "https://careers.google.com/3"},
        {"title": "Software Engineer", "company": "Google", "location": "Pune, Maharashtra", "url": "https://careers.google.com/4"},
    ]

    deduped = asyncio.run(agent.deduplicate(jobs))
    # Should keep Pune (merged with Pune, Maharashtra), Mountain View, and Bengaluru -> Total 3
    assert len(deduped) == 3
    locations = {j["location"] for j in deduped}
    assert "Mountain View, CA, USA" in locations
    assert "Bengaluru, India" in locations
    assert any("Pune" in loc for loc in locations)

def test_contacts_api_tuple_unpacking():
    """Verify contacts API properly unpacks the (profile, is_expired) tuple."""
    req = ScrapeProfileRequest(profile_url="https://linkedin.com/in/test-recruiter")

    # 1. Failure case: (None, False) -> Must raise HTTP 404
    with patch("src.services.linkedin_service.linkedin_service.scrape_profile_async", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = (None, False)
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(scrape_linkedin_profile(req))
        assert exc_info.value.status_code == 404
        assert "Unable to extract profile" in exc_info.value.detail

    # 2. Expired cookie case: (None, True) -> Must raise HTTP 404 with expired cookie warning
    with patch("src.services.linkedin_service.linkedin_service.scrape_profile_async", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = (None, True)
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(scrape_linkedin_profile(req))
        assert exc_info.value.status_code == 404
        assert "session expired" in exc_info.value.detail.lower()

    # 3. Success case: (dict, False) -> Must return dict in profile
    with patch("src.services.linkedin_service.linkedin_service.scrape_profile_async", new_callable=AsyncMock) as mock_scrape:
        mock_scrape.return_value = ({"name": "Jane Recruiter", "role": "Lead Recruiter"}, False)
        res = asyncio.run(scrape_linkedin_profile(req))
        assert res["status"] == "success"
        assert isinstance(res["profile"], dict)
        assert res["profile"]["name"] == "Jane Recruiter"
        assert res["cookie_expired"] is False

def test_scheduler_hash_includes_location():
    """Verify job hash generates distinct signatures for different locations."""
    job_pune = {"title": "AI Engineer", "company": "Microsoft", "location": "Pune, India"}
    job_us = {"title": "AI Engineer", "company": "Microsoft", "location": "Redmond, WA"}

    hash_pune = generate_job_hash(job_pune)
    hash_us = generate_job_hash(job_us)
    assert hash_pune != hash_us

def test_location_helper_handles_boolean_remote():
    """Verify is_job_location_match handles boolean remote parameter gracefully."""
    # When remote is True, onsite role in US should fail when target is Pune
    match_bool_true = is_job_location_match("Austin, TX", "Pune", True)
    assert match_bool_true is False

    # When remote is False, Pune role should match Pune target
    match_bool_false = is_job_location_match("Pune, Maharashtra, India", "Pune", False)
    assert match_bool_false is True

def test_email_service_no_hardcoded_passwords():
    """Verify email service does not hardcode passwords or sensitive credentials."""
    from src.config import settings
    # Override settings to empty to test safe fallback
    with patch.object(settings, "EMAIL_PASSWORD", ""):
        with patch.dict("os.environ", {"EMAIL_PASSWORD": "", "BREVO_API_KEY": ""}):
            assert email_service._get_password() == ""
            res = email_service._send_via_nodemailer(
                to_email="test@example.com",
                subject="Test",
                html_content="<p>Test</p>",
                attachment_paths=[]
            )
            assert res is False
