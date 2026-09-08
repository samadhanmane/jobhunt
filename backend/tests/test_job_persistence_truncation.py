import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.database import SessionLocal
from src.models.job import Job
from src.repositories.job_repository import JobRepository, _sanitize_job

def test_oversized_job_truncation_protection():
    print("Testing defensive protection against StringDataRightTruncation...")
    
    long_desc_as_location = "Build and optimize infrastructure for Netflix’s machine learning and AI systems, including distributed training, offline and post-training platforms, and inference engines to empower our creative, business, and algorithms teams. Work closely with researchers and engineers to identify performance bottlenecks and solve large-scale infrastructure challenges. The internship lasts at least 12 weeks."
    assert len(long_desc_as_location) > 300
    
    test_id = f"test_trunc_{uuid.uuid4().hex[:12]}"
    test_job = Job(
        id=test_id,
        title="Software Engineer " * 20, # > 300 chars
        company="Global Enterprise " * 20, # > 300 chars
        location=long_desc_as_location, # > 300 chars
        description="Testing defensive truncation in repository.",
        url=f"https://example.com/jobs/{test_id}",
        source="BuiltIn",
        posted_date="2026-09-08",
        search_id="test_search_truncation",
        match_score=85.0,
        experience_fit="Internship / Co-op",
        work_mode="On-site"
    )
    
    # 1. Test unit sanitization
    _sanitize_job(test_job)
    assert len(test_job.location) <= 255
    assert len(test_job.title) <= 255
    assert len(test_job.company) <= 255
    print("  PASS: _sanitize_job truncated fields cleanly")
    
    # 2. Test database persistence via JobRepository
    db = SessionLocal()
    try:
        repo = JobRepository(db)
        saved = repo.add_jobs([test_job])
        assert len(saved) == 1
        
        # Verify retrieved cleanly from PostgreSQL
        retrieved = db.query(Job).filter(Job.id == test_id).first()
        assert retrieved is not None
        assert retrieved.location == long_desc_as_location[:255]
        
        # Cleanup
        db.delete(retrieved)
        db.commit()
        print("  PASS: Oversized job persisted and retrieved without StringDataRightTruncation!")
    finally:
        db.close()

if __name__ == "__main__":
    test_oversized_job_truncation_protection()
    print("\nALL DEFENSIVE TRUNCATION TESTS PASSED!")
