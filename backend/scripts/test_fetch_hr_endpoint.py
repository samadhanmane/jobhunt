import asyncio
import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models.database import SessionLocal, init_and_migrate_db
from src.models.job import Job
from src.services.job_service import JobService

async def test_fetch_hr():
    init_and_migrate_db()
    db = SessionLocal()

    try:
        # Create a test job in DB
        test_job = Job(
            id="test-hr-job-12345",
            title="Software Engineer",
            company="Postman",
            location="Remote",
            description="Looking for a Python Backend Engineer with FastAPI experience.",
            search_id="test-search-id"
        )
        db.merge(test_job)
        db.commit()

        print("Testing fetch_job_hr_contacts for 'Postman'...")
        service = JobService(db)
        result = await service.fetch_job_hr_contacts(
            job_id="test-hr-job-12345",
            candidate_name="Candidate",
            candidate_skills=["Python", "FastAPI"],
            include_tech=True
        )
        print("Result status:", result.get("status"))
        print("HR Contacts count:", len(result.get("hr_contacts", [])))
        print("Tech Contacts count:", len(result.get("tech_contacts", [])))
        print("Sample HR:", result.get("hr_contacts", [{}])[0] if result.get("hr_contacts") else "None")

    except Exception as e:
        print("EXCEPTION in fetch_job_hr_contacts:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_fetch_hr())
