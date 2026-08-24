import asyncio
import sys
import os
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models.database import SessionLocal, init_and_migrate_db
from src.models.job import Job
from src.models.search_history import SearchHistory
from src.services.job_service import JobService

async def test_llm_csv_pipeline():
    init_and_migrate_db()
    db = SessionLocal()

    search_id = "test-pipeline-search-789"

    try:
        # Create SearchHistory
        search = SearchHistory(
            search_id=search_id,
            role="Machine Learning Engineer",
            location="Remote",
            preferences={"role": "Machine Learning Engineer", "experience_years": 4},
            status="completed"
        )
        db.merge(search)

        # Create rich job record with LLM categorization data
        job = Job(
            id="job-pipeline-test-1",
            title="Senior Machine Learning Engineer",
            company="Bright Vision Technologies",
            location="100% Remote (U.S.)",
            description="Bright Vision Technologies is hiring a Machine Learning Engineer to design, train, and deploy RL-based systems.\n\n• Master's or PhD in Computer Science\n• Strong proficiency in Python and modern deep learning frameworks.\n• Hands-on experience with at least one major RL library.",
            url="https://himalayas.app/jobs/bright-vision-technologies",
            source="himalayas",
            posted_date="2026-08-25",
            salary_range={"min": 155000, "max": 180000, "currency": "USD"},
            match_score=88.5,
            match_reason="Strong fit for ML requirements and Python proficiency.",
            matching_skills=["Python", "Deep Learning", "Reinforcement Learning", "Machine Learning"],
            missing_skills=["RLHF", "Robotics"],
            experience_fit="Good Fit",
            key_requirements="Requires 6+ years experience in reinforcement learning, modern deep learning frameworks, and GPU clusters.",
            company_insights={"size_indicator": "50-200 employees", "industry": "AI & Software Consulting", "culture_signals": ["Fast-paced", "High Autonomy"], "redflags": []},
            hr_contacts=[{
                "full_name": "Sarah Miller",
                "headline": "Senior Tech Recruiter at Bright Vision Technologies",
                "email": "sarah.miller@brightvision.com",
                "confidence_score": 92,
                "phone": "+1-908-676-4399"
            }],
            tech_contacts=[{
                "full_name": "David Chen",
                "headline": "Head of AI & ML Engineering",
                "email": "david.chen@brightvision.com",
                "confidence_score": 85,
                "phone": ""
            }],
            search_id=search_id
        )
        db.merge(job)
        db.commit()

        service = JobService(db)

        # 1. Test generate_jobs_csv
        jobs_csv_path = service.generate_jobs_csv(search_id)
        assert jobs_csv_path and os.path.exists(jobs_csv_path)
        df_jobs = pd.read_csv(jobs_csv_path)
        print("Generated Jobs CSV Columns:", list(df_jobs.columns))
        assert "Full Job Description" in df_jobs.columns
        assert "Key Requirements" in df_jobs.columns
        assert "Matching Skills" in df_jobs.columns
        assert "HR Email" in df_jobs.columns
        assert "Tech Lead Email" in df_jobs.columns
        assert df_jobs["HR Email"].iloc[0] == "sarah.miller@brightvision.com"
        print("[PASSED] Jobs CSV Generation Verified!")

        # 2. Test generate_company_insights_csv
        insights_csv_path = await service.generate_company_insights_csv(search_id)
        assert insights_csv_path and os.path.exists(insights_csv_path)
        df_insights = pd.read_csv(insights_csv_path)
        print("Generated Insights CSV Columns:", list(df_insights.columns))
        assert "Full Job Description" in df_insights.columns
        assert "HR Emails" in df_insights.columns
        assert "Tech Lead Emails" in df_insights.columns
        assert "sarah.miller@brightvision.com" in str(df_insights["HR Emails"].iloc[0])
        print("[PASSED] Company Insights CSV Generation Verified!")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_llm_csv_pipeline())
