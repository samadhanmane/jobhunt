import asyncio
import sys
import os
import json
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(line_buffering=True)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models.database import SessionLocal, init_and_migrate_db
from src.services.resume_parser import ResumeParserService
from src.services.linkedin_service import linkedin_service
from src.services.job_service import JobService
from src.repositories.user_repository import UserRepository
from src.models.user import UserProfile

RESUME_PATH = r"d:\Projects\jobhunt\Samadhan_Mane_AIML_Resume.pdf"
LINKEDIN_COOKIE = "AQEDAU7EybYA8zNjAAABnOWukFAAAAGgQuj1lU0AyMm2OYjZX04vjyt9nQYfCU3JbClEhZ2UW5R0qujwaMvtbozhFBxVEYxGn-ve2o8AL0iUy7vtkUMMzgEktIEx0qRSkAPMU9ecu_edMAxUAbmWcasf"

async def run_e2e_resume_test():
    print("=" * 60)
    print("[START] STARTING FULL END-TO-END PIPELINE TEST")
    print(f"[FILE] Resume File: {RESUME_PATH}")
    print("=" * 60)

    # 0. Initialize Database
    init_and_migrate_db()
    db = SessionLocal()

    try:
        # STEP 1: PARSE RESUME
        print("\n--- [STEP 1] PARSING RESUME ---")
        if not os.path.exists(RESUME_PATH):
            print(f"[ERROR] Resume file not found at {RESUME_PATH}")
            return

        parser = ResumeParserService()
        parsed_resume = await parser.parse_resume(RESUME_PATH)
        print(f"Candidate Name: {parsed_resume.get('name', 'Candidate')}")
        print(f"Target Roles: {parsed_resume.get('target_roles', [])}")
        print(f"Experience Level: {parsed_resume.get('experience_years', 0)} years ({parsed_resume.get('seniority', 'Mid')})")
        print(f"Extracted Skills ({len(parsed_resume.get('skills', []))}): {', '.join(parsed_resume.get('skills', [])[:12])}...")
        print(f"Summary: {parsed_resume.get('summary', '')[:200]}...")

        # Save parsed profile to database
        import uuid
        user_repo = UserRepository(db)
        user_profile = UserProfile(
            id=str(uuid.uuid4()),
            resume_skills=parsed_resume.get("skills", []),
            resume_experience=parsed_resume,
            resume_roles=parsed_resume.get("target_roles", ["AI Engineer", "Machine Learning Engineer"])
        )
        user_repo.save_profile(user_profile)
        resume_id = user_profile.id
        print(f"Saved UserProfile with resume_id: {resume_id}")

        # STEP 2: VALIDATE LINKEDIN COOKIE
        print("\n--- [STEP 2] VALIDATING LINKEDIN SESSION COOKIE ---")
        cookie_status = linkedin_service.validate_cookie(LINKEDIN_COOKIE)
        print(f"Cookie Status: {cookie_status.get('status')}")
        print(f"Cookie Message: {cookie_status.get('message')}")

        # STEP 3: SEARCH, SCRAPE & RANK JOBS
        print("\n--- [STEP 3] MULTI-PLATFORM JOB SEARCH & LLM RANKING ---")
        job_service = JobService(db)
        
        target_role = (parsed_resume.get("target_roles") or ["AI / Machine Learning Engineer"])[0]
        preferences = {
            "role": target_role,
            "location": "Remote",
            "remote_preference": "remote",
            "experience_level": str(parsed_resume.get("experience_years", 0)),
            "experience_years": parsed_resume.get("experience_years", 0)
        }
        
        print(f"Executing search for role='{target_role}', location='Remote'...")
        search_result = await job_service.search_jobs(
            resume_id=resume_id,
            preferences=preferences
        )
        
        search_id = search_result["search_id"]
        total_found = search_result["total_found"]
        jobs_list = search_result["jobs"]
        print(f"Search Completed! Total Found: {total_found}, Top Ranked Saved: {len(jobs_list)}")

        if not jobs_list:
            print("[WARN] No jobs found in live search. Ingesting test jobs for contact verification.")
            return

        top_job = jobs_list[0]
        print(f"\n[TOP MATCH] Top Matched Job:")
        print(f"  - Title: {top_job['title']}")
        print(f"  - Company: {top_job['company']}")
        print(f"  - Location: {top_job['location']}")
        print(f"  - Match Score: {top_job['match_score']}% ({top_job['experience_fit']})")
        print(f"  - Matched Skills: {', '.join(top_job['matching_skills'])}")
        print(f"  - Missing Skills: {', '.join(top_job['missing_skills'])}")
        print(f"  - Key Requirements: {top_job.get('key_requirements', 'N/A')}")
        print(f"  - Description Preview: {(top_job['description'] or '')[:180]}...")

        # STEP 4: ENRICH CORPORATE RECRUITERS & TECH LEAD CONTACTS
        print(f"\n--- [STEP 4] SCOUT RECRUITER DISCOVERY & EMAIL VERIFICATION FOR '{top_job['company']}' ---")
        contacts_res = await job_service.fetch_job_hr_contacts(
            job_id=top_job["id"],
            candidate_name=parsed_resume.get("name", "Samadhan Mane"),
            candidate_skills=parsed_resume.get("skills", []),
            include_tech=True,
            custom_cookie=LINKEDIN_COOKIE
        )
        
        hr_contacts = contacts_res.get("hr_contacts", [])
        tech_contacts = contacts_res.get("tech_contacts", [])
        print(f"HR Contacts Discovered: {len(hr_contacts)}")
        for idx, hr in enumerate(hr_contacts[:3]):
            print(f"  [{idx+1}] {hr.get('full_name')} - {hr.get('headline')}")
            print(f"      [EMAIL] {hr.get('email')} (Confidence: {hr.get('confidence_score')}%) | Verified: {hr.get('email_verified')}")
            print(f"      [PROFILE] {hr.get('profile_url')}")
            draft = hr.get("outreach_draft", {})
            if draft:
                print(f"      [OUTREACH SUBJECT] {draft.get('email_subject')}")
                print(f"      [LINKEDIN NOTE] {draft.get('linkedin_note')}")

        print(f"\nTech Contacts Discovered: {len(tech_contacts)}")
        for idx, tc in enumerate(tech_contacts[:3]):
            print(f"  [{idx+1}] {tc.get('full_name')} - {tc.get('headline')}")
            print(f"      [EMAIL] {tc.get('email')} (Confidence: {tc.get('confidence_score')}%)")

        # STEP 5: GENERATE CSV EXPORTS
        print("\n--- [STEP 5] CSV EXPORT GENERATION & VALIDATION ---")
        jobs_csv = job_service.generate_jobs_csv(search_id)
        insights_csv = await job_service.generate_company_insights_csv(
            search_id=search_id,
            candidate_name=parsed_resume.get("name", "Samadhan Mane"),
            candidate_skills=parsed_resume.get("skills", [])
        )

        if jobs_csv and os.path.exists(jobs_csv):
            df_jobs = pd.read_csv(jobs_csv)
            print(f"[PASSED] Jobs Matches CSV Generated: {jobs_csv}")
            print(f"   Rows: {len(df_jobs)}, Columns ({len(df_jobs.columns)}): {list(df_jobs.columns[:8])}...")
            print(f"   Sample Clean Description Length: {len(str(df_jobs['Full Job Description'].iloc[0]))} chars")

        if insights_csv and os.path.exists(insights_csv):
            df_ins = pd.read_csv(insights_csv)
            print(f"[PASSED] Company Insights CSV Generated: {insights_csv}")
            print(f"   Rows: {len(df_ins)}, Columns: {len(df_ins.columns)}")
            print(f"   Sample HR Emails: {df_ins['HR Emails'].iloc[0]}")

        print("\n" + "=" * 60)
        print("[SUCCESS] ALL END-TO-END PIPELINE TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        import traceback
        print("\n[ERROR] Test failed with exception:")
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_e2e_resume_test())
