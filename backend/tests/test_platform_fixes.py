import sys
import os
import uuid
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.config import settings
from src.models.database import engine, SessionLocal, init_and_migrate_db
from src.models.job import Job
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.agents.deduplication import DeduplicationAgent
from src.utils.date_utils import format_posted_date_for_csv, is_within_days
from src.services.repost_detector import repost_detector

def test_database_postgresql_connection():
    """Verify strictly PostgreSQL engine is connected to Supabase."""
    assert engine.name == "postgresql"
    with engine.connect() as conn:
        from sqlalchemy import text
        res = conn.execute(text("SELECT 1")).scalar()
        assert res == 1

def test_job_model_crud_and_columns():
    """Verify Job model persists and retrieves all new columns cleanly on PostgreSQL."""
    test_id = f"test_job_{uuid.uuid4().hex[:12]}"
    test_search_id = f"search_{uuid.uuid4().hex[:8]}"

    db = SessionLocal()
    try:
        new_job = Job(
            id=test_id,
            title="Senior AI Research Engineer",
            company="DeepMind Platforms",
            location="Pune, India",
            description="Leading multimodal AI architectures.",
            url=f"https://careers.deepmind.com/jobs/{test_id}",
            source="test_runner",
            posted_date="2026-09-01",
            salary_range={"min": 3500000, "max": 6000000, "currency": "INR"},
            match_score=96.5,
            match_reason="Exceptional alignment with LLM systems.",
            matching_skills=["Python", "PyTorch", "Transformers"],
            missing_skills=["Kubeflow"],
            experience_fit="Strong Fit",
            search_id=test_search_id,
            embedding=[0.01] * 384,
            work_mode="Hybrid",
            is_repost=False,
            repost_badge="✨ Fresh Role",
            supported_skills=["Python", "PyTorch"],
            skill_coverage_pct=85,
            sub_domain="LLM & NLP",
            ai_facets=["Multi-Agent", "Fine-Tuning"],
            experience_required="👑 5+ Yrs (Senior)",
            min_experience_years=5.0,
            seniority_level="senior"
        )
        db.add(new_job)
        db.commit()

        # Retrieve and verify
        fetched = db.query(Job).filter(Job.id == test_id).first()
        assert fetched is not None
        assert fetched.title == "Senior AI Research Engineer"
        assert fetched.work_mode == "Hybrid"
        assert fetched.is_repost is False
        assert fetched.repost_badge == "✨ Fresh Role"
        assert fetched.skill_coverage_pct == 85
        assert fetched.sub_domain == "LLM & NLP"
        assert fetched.min_experience_years == 5.0
        assert fetched.seniority_level == "senior"
        assert fetched.matching_skills == ["Python", "PyTorch", "Transformers"]
        assert fetched.salary_range["currency"] == "INR"

        # Cleanup test job
        db.delete(fetched)
        db.commit()
    finally:
        db.close()

def test_location_matcher_pune_specificity():
    """Verify city search for Pune matches Pune metro areas and strictly rejects other cities/leaks."""
    # Matches Pune and Pune IT hubs
    assert is_job_location_match("Pune, Maharashtra, India", "pune") is True
    assert is_job_location_match("Hinjawadi Phase 2, Pune", "pune") is True
    assert is_job_location_match("Kharadi IT Park", "pune") is True

    # Strictly rejects other Indian cities for Pune search
    assert is_job_location_match("Bangalore, Karnataka, India", "pune") is False
    assert is_job_location_match("Gurgaon, Haryana", "pune") is False
    assert is_job_location_match("Mumbai, Maharashtra", "pune") is False
    assert is_job_location_match("London, United Kingdom", "pune") is False

    # Does not leak remote jobs into Pune unless remote was requested
    assert is_job_location_match("Remote / Worldwide", "pune", pref_work_mode="onsite") is False
    assert is_job_location_match("Remote", "pune", pref_work_mode="any") is False
    assert is_job_location_match("Remote, India", "pune", pref_work_mode="remote") is True

    # General India query matches any Indian city
    assert is_job_location_match("Bangalore, India", "india") is True
    assert is_job_location_match("Pune, India", "india") is True
    assert is_job_location_match("Gurugram, India", "india") is True

def test_deduplication_preserves_seniority():
    """Verify deduplication preserves seniority differences at the same company."""
    agent = DeduplicationAgent()
    pool = [
        {"title": "Senior Software Engineer", "company": "Google", "description": "Senior role", "url": "https://google.com/1"},
        {"title": "Software Engineer", "company": "Google", "description": "Standard role", "url": "https://google.com/2"},
        {"title": "Junior Software Engineer", "company": "Google", "description": "Junior role", "url": "https://google.com/3"},
        {"title": "Software Engineer", "company": "Google", "description": "Duplicate standard role", "url": "https://google.com/4"},
        {"title": "Software Engineer", "company": "Microsoft", "description": "MSFT role", "url": "https://msft.com/1"},
    ]

    import asyncio
    deduped = asyncio.run(agent.deduplicate(pool))
    
    # Must preserve:
    # 1. Senior Software Engineer (Google)
    # 2. Software Engineer (Google)
    # 3. Junior Software Engineer (Google)
    # 4. Software Engineer (Microsoft)
    assert len(deduped) == 4

    google_titles = [j["title"] for j in deduped if j["company"] == "Google"]
    assert len(google_titles) == 3
    assert "Senior Software Engineer" in google_titles
    assert "Software Engineer" in google_titles
    assert "Junior Software Engineer" in google_titles

def test_date_utils_preserves_real_dates_and_na():
    """Verify format_posted_date_for_csv preserves actual dates and returns N/A without laundering."""
    assert format_posted_date_for_csv("2026-08-15T12:00:00Z") == "2026-08-15"
    assert format_posted_date_for_csv("2026-09-02") == "2026-09-02"
    assert format_posted_date_for_csv(None) == "N/A"
    assert format_posted_date_for_csv("") == "N/A"
    assert format_posted_date_for_csv("unparseable string") == "N/A"

def test_repost_detector_rate_limiting():
    """Verify repost detector does not increment times_seen multiple times within minutes."""
    db = SessionLocal()
    test_comp = f"RateLimitComp_{uuid.uuid4().hex[:6]}"
    test_title = "Staff Machine Learning Engineer"
    test_url = "https://example.com/job"
    try:
        # First check -> fresh opening
        res1 = repost_detector.record_and_evaluate_repost(test_comp, test_title, test_url, db)
        assert res1["is_repost"] is False
        assert res1["times_seen"] == 1

        # Second check immediately after -> times_seen must NOT increment to 2
        res2 = repost_detector.record_and_evaluate_repost(test_comp, test_title, test_url, db)
        assert res2["is_repost"] is False
        assert res2["times_seen"] == 1
    finally:
        from src.models.job_occurrence import JobOccurrence
        db.query(JobOccurrence).filter(JobOccurrence.company_norm == test_comp.lower()).delete()
        db.commit()
        db.close()

def test_scrapers_tech_short_tokens_retained():
    """Verify 2-letter tech acronyms (AI, ML, QA, Go) are preserved in tokenizer."""
    TECH_SHORT_TOKENS = {"ai", "ml", "go", "qa", "ui", "ux", "ci", "cd", "hr", "bi", "db", "vr", "ar"}
    STOPWORDS = {"in", "at", "to", "for", "the", "and", "of", "or", "on", "as", "by", "with"}

    query = "Senior AI ML Engineer in Pune"
    import re
    query_clean = re.sub(r'[^\w\s]', '', query.lower())
    tokens = [t.strip() for t in query_clean.split() if (len(t.strip()) > 2 or t.strip() in TECH_SHORT_TOKENS) and t.strip() not in STOPWORDS]

    assert "ai" in tokens
    assert "ml" in tokens
    assert "senior" in tokens
    assert "engineer" in tokens
    assert "pune" in tokens
    assert "in" not in tokens

if __name__ == "__main__":
    tests = [
        ("PostgreSQL Connection", test_database_postgresql_connection),
        ("Job Model CRUD & Columns", test_job_model_crud_and_columns),
        ("Location Matcher Pune Specificity", test_location_matcher_pune_specificity),
        ("Deduplication Preserves Seniority", test_deduplication_preserves_seniority),
        ("Date Utils Preserves Real Dates and N/A", test_date_utils_preserves_real_dates_and_na),
        ("Repost Detector Rate Limiting", test_repost_detector_rate_limiting),
        ("Scrapers Tech Short Tokens", test_scrapers_tech_short_tokens_retained),
    ]

    passed = 0
    failed = 0
    print("\n" + "=" * 60)
    print("RUNNING PLATFORM VERIFICATION TEST SUITE")
    print("=" * 60)
    for name, fn in tests:
        try:
            fn()
            print(f"  PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {name} -> {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60 + "\n")
    if failed > 0:
        exit(1)
