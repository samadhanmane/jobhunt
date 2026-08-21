import json
import os
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from src.models.database import get_db
from src.models.email_alert import EmailAlert
from src.models.user_account import UserAccount
from src.services.email_service import email_service
from src.services.scheduler_service import scheduler_service
from src.services.auth_service import get_current_user
from src.utils.date_utils import format_posted_date_for_csv, is_within_days

router = APIRouter(prefix="/api/v1/alerts", tags=["Email Alerts"])

class CreateAlertRequest(BaseModel):
    email: str
    role: str
    location: Optional[str] = "Remote"
    experience_years: Optional[float] = 0.0
    work_mode: Optional[str] = "any"
    max_age_days: Optional[int] = 1
    preferred_time: Optional[str] = "09:00"
    skills: Optional[List[str]] = None

@router.post("")
async def create_alert(
    email: str = Form(...),
    role: str = Form(...),
    location: str = Form("Remote"),
    experience_years: float = Form(0.0),
    work_mode: str = Form("any"),
    max_age_days: int = Form(1),
    preferred_time: str = Form("09:00"),
    resume: Optional[UploadFile] = File(None),
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new daily job email alert scoped to the authenticated user.
    """
    skills = []
    resume_summary = ""

    if resume:
        try:
            import tempfile
            content = await resume.read()
            filename = resume.filename.lower()

            # Save to temp file for parser
            suffix = ".pdf" if filename.endswith(".pdf") else (".docx" if filename.endswith(".docx") else ".txt")
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            from src.services.resume_parser import ResumeParserService
            parser = ResumeParserService()
            profile = await parser.parse_resume(tmp_path)
            skills = profile.get("skills", [])
            resume_summary = profile.get("summary", "")

            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        except Exception as e:
            print(f"Notice: Resume parsing in alert creation skipped: {e}")

    alert = EmailAlert(
        user_id=current_user.id,
        email=email.strip().lower(),
        role=role.strip(),
        location=location.strip(),
        experience_years=experience_years,
        work_mode=work_mode,
        max_age_days=max_age_days,
        preferred_time=preferred_time,
        skills=skills,
        resume_summary=resume_summary,
        sent_job_hashes=[],
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Send welcome confirmation email
    try:
        email_service.send_welcome_confirmation(alert.email, alert.role, alert.location, alert.preferred_time)
    except Exception as e:
        print(f"Notice: Welcome email dispatch error: {e}")

    return {
        "status": "success",
        "message": f"Daily job alert activated for {alert.email}!",
        "alert": {
            "id": alert.id,
            "user_id": alert.user_id,
            "email": alert.email,
            "role": alert.role,
            "location": alert.location,
            "preferred_time": alert.preferred_time,
            "skills": alert.skills
        }
    }

@router.get("")
def list_alerts(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List active email alerts. Standard users see their own alerts; Admins see all.
    """
    query = db.query(EmailAlert).filter(EmailAlert.is_active == True)
    if current_user.role != "admin":
        query = query.filter(EmailAlert.user_id == current_user.id)
        
    alerts = query.order_by(EmailAlert.created_at.desc()).all()
    return [{
        "id": a.id,
        "user_id": a.user_id,
        "email": a.email,
        "role": a.role,
        "location": a.location,
        "experience_years": a.experience_years,
        "work_mode": a.work_mode,
        "preferred_time": a.preferred_time,
        "created_at": a.created_at.isoformat() if a.created_at else "",
        "last_sent_at": a.last_sent_at.isoformat() if a.last_sent_at else None
    } for a in alerts]

@router.post("/test-send")
async def test_send_alert(
    email: str = Form(...),
    role: str = Form(...),
    location: str = Form(""),
    work_mode: str = Form("any"),
    experience_level: str = Form("intern"),
    max_age_days: int = Form(1),
    experience_years: float = Form(0.0),
    resume: Optional[UploadFile] = File(None),
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Directly runs a parallel search with the specified role/location and sends a live test email with curated CSV attachment.
    """
    to_email = email.strip().lower()
    if not to_email or "@" not in to_email:
        raise HTTPException(status_code=400, detail="Invalid email address provided.")

    # Determine if location is specific or worldwide
    raw_loc = location.strip()
    is_worldwide = raw_loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]

    exp_yrs = 0.0 if experience_level == "intern" else (1.0 if experience_level == "entry" else (3.0 if experience_level == "mid" else (6.0 if experience_level == "senior" else 10.0)))
    if experience_years > 0:
        exp_yrs = experience_years

    preferences = {
        "role": role.strip(),
        "location": "" if is_worldwide else raw_loc,
        "remote_preference": work_mode,
        "experience_level": experience_level,
        "experience_years": exp_yrs,
        "max_age_days": max_age_days
    }

    candidate_profile = {
        "skills": [s.strip() for s in role.split() if len(s.strip()) > 2],
        "core_domain": "AI / Machine Learning" if "ai" in role.lower() or "ml" in role.lower() else "Software Engineering",
        "experience_years": exp_yrs,
        "seniority": "Intern" if "intern" in role.lower() else "Junior",
        "target_roles": [role.strip()]
    }

    if resume and resume.filename:
        try:
            import tempfile
            content = await resume.read()
            filename = resume.filename.lower()
            suffix = ".pdf" if filename.endswith(".pdf") else (".docx" if filename.endswith(".docx") else ".txt")
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(content)
                tmp_path = tmp.name

            from src.services.resume_parser import ResumeParserService
            parser = ResumeParserService()
            parsed = await parser.parse_resume(tmp_path)
            if parsed.get("skills"):
                candidate_profile["skills"] = parsed.get("skills", [])
            if parsed.get("core_domain"):
                candidate_profile["core_domain"] = parsed.get("core_domain")
            if parsed.get("top_technologies"):
                candidate_profile["top_technologies"] = parsed.get("top_technologies", [])
            if parsed.get("summary"):
                candidate_profile["summary"] = parsed.get("summary", "")

            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        except Exception as e:
            print(f"Notice: Resume parsing in test send: {e}")

    try:
        raw_jobs = await scheduler_service.orchestrator.orchestrate_search(candidate_profile, preferences)
        unique_jobs = await scheduler_service.deduplicator.deduplicate(raw_jobs)
        
        # Filter unique jobs by date window if specified
        if max_age_days and max_age_days > 0:
            filtered_by_date = [j for j in unique_jobs if is_within_days(j.get("posted_date"), max_age_days)]
            if filtered_by_date:
                unique_jobs = filtered_by_date

        ranked_jobs = await scheduler_service.ranking_agent.rank_jobs(unique_jobs, candidate_profile, preferences)

        # Generate BOTH CSV Reports:
        # CSV 1: All Raw Fetched Jobs (Pre-Deduplication, fully structured)
        # CSV 2: Curated & Filtered Matching Jobs (Post-Deduplication & AI-Ranked)
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        export_dir = os.path.join(backend_root, "exports")
        os.makedirs(export_dir, exist_ok=True)
        import datetime
        import pandas as pd
        today_str = datetime.datetime.now().strftime("%Y-%m-%d")
        
        raw_csv_path = os.path.join(export_dir, f"all_fetched_raw_jobs_{today_str}.csv")
        curated_csv_path = os.path.join(export_dir, f"curated_jobs_{today_str}.csv")

        def build_csv_rows(job_list, is_raw=False):
            rows = []
            for j in job_list:
                loc = (j.get("location") or "").lower()
                work_type = "Remote" if "remote" in loc else ("Hybrid" if "hybrid" in loc else "Onsite")
                salary = ""
                if j.get("salary_range"):
                    min_s = j["salary_range"].get("min")
                    max_s = j["salary_range"].get("max")
                    curr = j["salary_range"].get("currency", "$")
                    if min_s and max_s:
                        salary = f"{min_s:,.0f} - {max_s:,.0f} {curr}"
                    elif min_s:
                        salary = f"> {min_s:,.0f} {curr}"

                score_val = j.get("match_score")
                score_str = f"{round(score_val)}%" if score_val is not None else ("Raw Ingestion" if is_raw else "N/A")
                exp_fit = j.get("experience_fit") or ("Raw Harvested" if is_raw else "Good Fit")
                reason = j.get("match_reason") or ("Directly scraped job posting before deduplication." if is_raw else "")

                rows.append({
                    "Company Name": j.get("company", "Unknown Company"),
                    "Role / Title": j.get("title", "Unknown Title"),
                    "Location": j.get("location", "N/A"),
                    "Work Type": work_type,
                    "Posted Date (YYYY-MM-DD)": format_posted_date_for_csv(j.get("posted_date")),
                    "Salary": salary if salary else "N/A",
                    "Match Score": score_str,
                    "Experience Fit": exp_fit,
                    "Matching Skills": ", ".join(j.get("matching_skills", [])) if j.get("matching_skills") else "N/A",
                    "Missing Skills": ", ".join(j.get("missing_skills", [])) if j.get("missing_skills") else "N/A",
                    "Match Reason": reason,
                    "URL": j.get("url", ""),
                    "Source": j.get("source", "job_board")
                })
            return rows

        # Export CSV 1: All raw jobs
        raw_csv_rows = build_csv_rows(raw_jobs, is_raw=True)
        pd.DataFrame(raw_csv_rows).to_csv(raw_csv_path, index=False, encoding="utf-8-sig")

        # Export CSV 2: Curated matching jobs
        curated_csv_rows = build_csv_rows(ranked_jobs, is_raw=False)
        pd.DataFrame(curated_csv_rows).to_csv(curated_csv_path, index=False, encoding="utf-8-sig")

        # Send Email with BOTH CSV attachments
        summary_note = f"Personalized job report for {role} ({location or 'Worldwide'}). Attached are both the full raw scraped database ({len(raw_jobs)} jobs) and curated matches ({len(ranked_jobs)} jobs)."
        sent = email_service.send_daily_job_digest(
            to_email=to_email,
            role=role,
            location=location,
            jobs=ranked_jobs,
            csv_paths=[raw_csv_path, curated_csv_path],
            summary_note=summary_note,
            raw_total_count=len(raw_jobs)
        )

        return {
            "status": "success" if sent else "error",
            "email": to_email,
            "raw_jobs_count": len(raw_jobs),
            "jobs_sent": len(ranked_jobs),
            "csv_paths": [raw_csv_path, curated_csv_path]
        }
    except Exception as e:
        print(f"Error in direct test email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{alert_id}/send-now")
async def trigger_alert_now(
    alert_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger an immediate test run and send email with CSV attachment."""
    query = db.query(EmailAlert).filter(EmailAlert.id == alert_id)
    if current_user.role != "admin":
        query = query.filter(EmailAlert.user_id == current_user.id)
        
    alert = query.first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    result = await scheduler_service.execute_alert_run(alert_id, db)
    return result

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes or pauses an email alert."""
    query = db.query(EmailAlert).filter(EmailAlert.id == alert_id)
    if current_user.role != "admin":
        query = query.filter(EmailAlert.user_id == current_user.id)
        
    alert = query.first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": "Alert deleted successfully"}
