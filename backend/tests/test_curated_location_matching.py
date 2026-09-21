import pytest
from src.agents.ranking import RankingAgent
from src.utils.role_helper import filter_curated_jobs_by_role
from src.utils.location_helper import is_job_location_match, is_india_location

def test_pune_location_excludes_san_francisco_and_london():
    """Verify foreign on-site jobs score <= 30 and are rejected from curated list when Pune is targeted."""
    ranker = RankingAgent()
    candidate_profile = {
        "skills": ["Python", "PyTorch", "FastAPI", "Docker", "Machine Learning"],
        "experience_years": 2.0,
        "seniority": "Mid"
    }
    preferences = {
        "role": "AI Engineer",
        "location": "Pune",
        "work_mode": "all"
    }

    sf_job = {
        "title": "AI Engineer",
        "company": "Silicon Valley AI",
        "location": "San Francisco, CA",
        "description": "We need an AI Engineer skilled in Python, PyTorch, FastAPI, Docker, and Machine Learning.",
        "posted_date": "2026-09-20"
    }

    london_job = {
        "title": "AI Engineer",
        "company": "London Deep Tech",
        "location": "London, UK",
        "description": "Join our London team! Skills: Python, PyTorch, FastAPI, Docker.",
        "posted_date": "2026-09-20"
    }

    scored_sf = ranker._score_job(sf_job, candidate_profile, preferences)
    scored_london = ranker._score_job(london_job, candidate_profile, preferences)

    # Both must be capped at 30 with location_mismatch = True
    assert scored_sf["match_score"] <= 30
    assert scored_sf["location_mismatch"] is True
    assert scored_london["match_score"] <= 30
    assert scored_london["location_mismatch"] is True

    # Curation filter must reject both
    curated = filter_curated_jobs_by_role(
        [scored_sf, scored_london],
        target_role=preferences["role"],
        target_location=preferences["location"],
        work_mode=preferences["work_mode"],
        min_score=40.0
    )
    assert len(curated) == 0

def test_pune_location_accepts_pune_and_hinjawadi():
    """Verify jobs in Pune metro are scored highly and curated."""
    ranker = RankingAgent()
    candidate_profile = {
        "skills": ["Python", "PyTorch", "FastAPI"],
        "experience_years": 2.0
    }
    preferences = {
        "role": "AI Engineer",
        "location": "Pune",
        "work_mode": "all"
    }

    pune_job = {
        "title": "AI Engineer",
        "company": "Pune AI Labs",
        "location": "Pune, Maharashtra, India",
        "description": "Looking for AI Engineer with Python, PyTorch, FastAPI.",
        "posted_date": "2026-09-20"
    }

    hinjawadi_job = {
        "title": "AI Engineer",
        "company": "Tech Mahindra",
        "location": "Hinjawadi, Pune",
        "description": "AI Engineer opening in Hinjawadi with Python and PyTorch.",
        "posted_date": "2026-09-20"
    }

    scored_pune = ranker._score_job(pune_job, candidate_profile, preferences)
    scored_hinjawadi = ranker._score_job(hinjawadi_job, candidate_profile, preferences)

    assert scored_pune["match_score"] >= 80
    assert scored_pune["location_mismatch"] is False
    assert scored_hinjawadi["match_score"] >= 80
    assert scored_hinjawadi["location_mismatch"] is False

    curated = filter_curated_jobs_by_role(
        [scored_pune, scored_hinjawadi],
        target_role=preferences["role"],
        target_location=preferences["location"],
        work_mode=preferences["work_mode"],
        min_score=40.0
    )
    assert len(curated) == 2

def test_remote_us_restriction_rejected_for_pune():
    """Verify US-restricted remote jobs are excluded when Pune is targeted."""
    ranker = RankingAgent()
    candidate_profile = {"skills": ["Python", "PyTorch"]}
    preferences = {"role": "AI Engineer", "location": "Pune", "work_mode": "all"}

    us_remote_job = {
        "title": "AI Engineer",
        "company": "US Corp",
        "location": "Remote (USA Only)",
        "description": "Must reside in the US. Required: Python, PyTorch.",
        "posted_date": "2026-09-20"
    }

    scored = ranker._score_job(us_remote_job, candidate_profile, preferences)
    assert scored["match_score"] <= 30
    assert scored["location_mismatch"] is True

    curated = filter_curated_jobs_by_role(
        [scored],
        target_role="AI Engineer",
        target_location="Pune",
        work_mode="all"
    )
    assert len(curated) == 0

def test_india_location_helper_preposition_in():
    """Verify that the English preposition 'in' does not trigger false positive India detection."""
    assert is_india_location("San Francisco, CA", title="AI Engineer in San Francisco") is False
    assert is_india_location("Austin, TX", title="Lead Developer in HealthTech") is False
    assert is_india_location("Pune, India", title="AI Engineer") is True
    assert is_india_location("Bengaluru, Karnataka", title="Software Engineer") is True
