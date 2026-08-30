from src.utils.cadence_helper import calculate_followup_milestone
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
    background_tasks: BackgroundTasks,
    email: str = Form(...),
    role: str = Form(...),
    location: str = Form("Remote"),
    experience_level: str = Form("all"),
    experience_years: float = Form(0.0),
    experience_tier: str = Form("all"),
    sub_domain: str = Form("All"),
    ai_facets_json: Optional[str] = Form(None),
    stipend_range: Optional[str] = Form(None),
    work_mode: str = Form("any"),
    max_age_days: int = Form(1),
    preferred_time: str = Form("09:00"),
    skills_json: Optional[str] = Form(None),
    resume_summary: Optional[str] = Form(None),
    resume: Optional[UploadFile] = File(None),
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new daily job email alert scoped to the authenticated user.
    Executes in milliseconds with zero-blocking background welcome email.
    """
    skills = []
    if skills_json:
        try:
            parsed_s = json.loads(skills_json)
            if isinstance(parsed_s, list):
                skills = [str(s).strip() for s in parsed_s if s]
        except Exception:
            pass

    if not skills and resume:
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
            profile = await parser.parse_resume(tmp_path)
            skills = profile.get("skills", [])
            if not resume_summary:
                resume_summary = profile.get("summary", "")

            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        except Exception as e:
            print(f"Notice: Resume parsing in alert creation skipped: {e}")

    # Compute experience_years if not explicitly passed
    calc_exp_years = experience_years
    if calc_exp_years == 0.0 and experience_level != "all":
        exp_map = {"intern": 0.0, "entry": 1.0, "junior": 2.0, "mid": 4.0, "senior": 6.0, "lead": 8.0}
        calc_exp_years = exp_map.get(experience_level.lower(), 0.0)

    alert = EmailAlert(
        user_id=current_user.id,
        email=email.strip().lower(),
        role=role.strip(),
        location=location.strip(),
        experience_level=experience_level.strip().lower(),
        experience_years=calc_exp_years,
        experience_tier=experience_tier.strip().lower() if experience_tier else "all",
        sub_domain=sub_domain.strip() if sub_domain else "All",
        ai_facets=json.loads(ai_facets_json) if ai_facets_json and ai_facets_json.startswith('[') else [],
        stipend_range=stipend_range.strip() if stipend_range else None,
        work_mode=work_mode,
        max_age_days=max_age_days,
        preferred_time=preferred_time,
        skills=skills,
        resume_summary=resume_summary or "",
        sent_job_hashes=[],
        is_active=True
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Send welcome confirmation email in background task (non-blocking)
    try:
        background_tasks.add_task(
            email_service.send_welcome_confirmation,
            alert.email,
            alert.role,
            alert.location,
            alert.preferred_time
        )
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
            "experience_level": alert.experience_level or "all",
            "experience_years": alert.experience_years,
            "work_mode": alert.work_mode,
            "preferred_time": alert.preferred_time,
            "skills": alert.skills,
            "created_at": alert.created_at.isoformat() if alert.created_at else ""
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
        "experience_level": a.experience_level or "all",
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

        # Filter curated matches strictly by targeted title/role and seniority fit
        from src.utils.role_helper import filter_curated_jobs_by_role
        curated_jobs = filter_curated_jobs_by_role(
            ranked_jobs,
            target_role=role,
            experience_level=experience_level,
            min_score=40.0
        )
        if not curated_jobs:
            curated_jobs = [j for j in ranked_jobs if j.get("match_score", 0) >= 30][:10]

        # Generate BOTH CSV Reports without pandas (Zero-RAM pure Python)
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        export_dir = os.path.join(backend_root, "exports")
        os.makedirs(export_dir, exist_ok=True)
        import datetime
        import csv
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

        def write_csv_file(file_path, rows):
            if not rows:
                with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
                    f.write("Company Name,Role / Title,Location,Work Type,Posted Date (YYYY-MM-DD),Salary,Match Score,Experience Fit,Matching Skills,Missing Skills,Match Reason,URL,Source\n")
                return
            fieldnames = list(rows[0].keys())
            with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)

        # Export CSV 1: All raw jobs
        raw_csv_rows = build_csv_rows(raw_jobs, is_raw=True)
        write_csv_file(raw_csv_path, raw_csv_rows)

        # Export CSV 2: Curated matching jobs
        curated_csv_rows = build_csv_rows(curated_jobs, is_raw=False)
        write_csv_file(curated_csv_path, curated_csv_rows)

        # Send Email with BOTH CSV attachments
        summary_note = f"Personalized job report for {role} ({location or 'Worldwide'}). Attached are both the full raw scraped database ({len(raw_jobs)} jobs) and curated matches ({len(curated_jobs)} jobs)."
        sent = email_service.send_daily_job_digest(
            to_email=to_email,
            role=role,
            location=location,
            jobs=curated_jobs,
            csv_paths=[raw_csv_path, curated_csv_path],
            summary_note=summary_note,
            raw_total_count=len(raw_jobs)
        )

        # Record in AutomationHistory for website inspection
        try:
            from src.models.automation_history import AutomationHistory
            history_record = AutomationHistory(
                user_id=current_user.id if current_user else None,
                recipient_email=to_email,
                role=role,
                location=location or "Remote",
                work_mode=work_mode or "any",
                experience_level=experience_level or "all",
                experience_years=exp_yrs,
                max_age_days=max_age_days or 1,
                total_raw_found=len(raw_jobs),
                total_unique_found=len(unique_jobs),
                total_curated_sent=len(curated_jobs),
                curated_jobs=curated_jobs,
                unique_jobs=unique_jobs,
                raw_jobs=raw_jobs,
                sent_at=datetime.datetime.utcnow()
            )
            db.add(history_record)
            db.commit()
        except Exception as hist_err:
            print(f"Notice: AutomationHistory save in test-send: {hist_err}")
            try:
                db.rollback()
            except Exception:
                pass

        return {
            "status": "success" if sent else "error",
            "email": to_email,
            "raw_jobs_count": len(raw_jobs),
            "jobs_sent": len(curated_jobs),
            "csv_paths": [raw_csv_path, curated_csv_path]
        }
    except Exception as e:
        print(f"Error in direct test email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_automation_history(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of sent automation digest runs for the authenticated user (ultra-fast columnar metadata query).
    """
    from src.models.automation_history import AutomationHistory
    query = db.query(
        AutomationHistory.id,
        AutomationHistory.alert_id,
        AutomationHistory.role,
        AutomationHistory.location,
        AutomationHistory.work_mode,
        AutomationHistory.experience_level,
        AutomationHistory.experience_years,
        AutomationHistory.max_age_days,
        AutomationHistory.preferred_time,
        AutomationHistory.recipient_email,
        AutomationHistory.total_raw_found,
        AutomationHistory.total_unique_found,
        AutomationHistory.total_curated_sent,
        AutomationHistory.sent_at
    )
    if current_user.role != "admin":
        query = query.filter((AutomationHistory.user_id == current_user.id) | (AutomationHistory.recipient_email == current_user.email))
    
    records = query.order_by(AutomationHistory.sent_at.desc()).limit(30).all()
    
    return {
        "status": "success",
        "history": [{
            "id": r.id,
            "alert_id": r.alert_id,
            "role": r.role,
            "location": r.location,
            "work_mode": r.work_mode,
            "experience_level": r.experience_level,
            "experience_years": r.experience_years,
            "max_age_days": r.max_age_days,
            "preferred_time": r.preferred_time,
            "recipient_email": r.recipient_email,
            "total_raw_found": r.total_raw_found,
            "total_unique_found": r.total_unique_found,
            "total_curated_sent": r.total_curated_sent,
            "sent_at": r.sent_at.isoformat() if r.sent_at else None
        } for r in records]
    }

@router.get("/history/{history_id}")
def get_automation_history_detail(
    history_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the complete historical snapshot (curated, unique, and raw jobs) of an automated run.
    """
    from src.models.automation_history import AutomationHistory
    record = db.query(AutomationHistory).filter(AutomationHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Automation history record not found")
        
    return {
        "status": "success",
        "history": {
            "id": record.id,
            "alert_id": record.alert_id,
            "role": record.role,
            "location": record.location,
            "work_mode": record.work_mode,
            "experience_level": record.experience_level,
            "experience_years": record.experience_years,
            "max_age_days": record.max_age_days,
            "preferred_time": record.preferred_time,
            "recipient_email": record.recipient_email,
            "total_raw_found": record.total_raw_found,
            "total_unique_found": record.total_unique_found,
            "total_curated_sent": record.total_curated_sent,
            "curated_jobs": record.curated_jobs or [],
            "unique_jobs": record.unique_jobs or [],
            "raw_jobs": record.raw_jobs or [],
            "sent_at": record.sent_at.isoformat() if record.sent_at else None
        }
    }

@router.delete("/history/{history_id}")
def delete_automation_history(
    history_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an automation history snapshot."""
    from src.models.automation_history import AutomationHistory
    record = db.query(AutomationHistory).filter(AutomationHistory.id == history_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Automation history record not found")
        
    db.delete(record)
    db.commit()
    return {"status": "success", "message": "History snapshot deleted"}

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

@router.post("/{alert_id}/test")
async def trigger_instant_test_alert(
    alert_id: str,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Instantly triggers a test execution of an EmailAlert and delivers the rich digest.
    """
    alert = db.query(EmailAlert).filter(EmailAlert.id == alert_id, EmailAlert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    res = await scheduler_service.execute_alert_run(alert_id, db)
    return {
        "status": "success",
        "message": f"Test digest dispatched to {alert.email}",
        "result": res
    }

@router.get("/followups")
async def get_application_followups(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns automated follow-up cadence status for applied jobs
    based on career-ops Day 5, Day 12, Day 21 milestones.
    """
    from src.models.user_application import UserApplication
    try:
        apps = db.query(UserApplication).filter(UserApplication.user_id == current_user.id).all()
    except Exception:
        apps = []

    followups = []
    for app in apps:
        app_date = str(app.applied_date or app.created_at or "")[:10]
        milestone = calculate_followup_milestone(app_date)
        followups.append({
            "application_id": app.id,
            "company": app.company_name,
            "role": app.job_title,
            "applied_date": app_date,
            "job_url": app.job_url,
            "cadence": milestone
        })

    # Sort so due and overdue appear first
    followups.sort(key=lambda x: (not x["cadence"]["is_due"], x["cadence"]["days_until_next"] if "days_until_next" in x["cadence"] else 99))
    return {
        "status": "success",
        "total_tracked": len(followups),
        "due_count": sum(1 for f in followups if f["cadence"]["is_due"]),
        "followups": followups
    }
