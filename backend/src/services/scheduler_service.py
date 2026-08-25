import os
import asyncio
import hashlib
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from src.models.database import SessionLocal
from src.models.email_alert import EmailAlert
from src.models.user_account import UserAccount
from src.agents.orchestrator import OrchestratorAgent
from src.agents.deduplication import DeduplicationAgent
from src.agents.ranking import RankingAgent
from src.services.email_service import email_service
from src.services.linkedin_service import linkedin_service
from src.utils.date_utils import format_posted_date_for_csv, is_within_days

def generate_job_hash(job: Dict[str, Any]) -> str:
    """Creates a deterministic hash for a job posting based on title and company."""
    title = str(job.get("title", "")).lower().strip()
    company = str(job.get("company", "")).lower().strip()
    return hashlib.md5(f"{title}|{company}".encode("utf-8")).hexdigest()

class SchedulerService:
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.deduplicator = DeduplicationAgent()
        self.ranking_agent = RankingAgent()

    def cleanup_old_jobs(self, db: Session, days: int = 7) -> int:
        """
        Deletes stored jobs and search sessions older than `days` (default 7 days)
        to keep the database lightweight and performant.
        """
        try:
            from src.models.job import Job
            from src.models.search_history import SearchHistory
            cutoff = datetime.utcnow() - timedelta(days=days)
            
            old_searches = db.query(SearchHistory).filter(SearchHistory.created_at < cutoff).all()
            old_search_ids = [s.search_id for s in old_searches]
            
            deleted_jobs_count = 0
            if old_search_ids:
                deleted_jobs_count = db.query(Job).filter(Job.search_id.in_(old_search_ids)).delete(synchronize_session=False)
                db.query(SearchHistory).filter(SearchHistory.search_id.in_(old_search_ids)).delete(synchronize_session=False)
            
            standalone_del = db.query(Job).filter(Job.created_at < cutoff).delete(synchronize_session=False)
            db.commit()
            total_deleted = deleted_jobs_count + standalone_del
            if total_deleted > 0:
                print(f"[Scheduler] Cleaned up {total_deleted} jobs older than {days} days from database.")
            return total_deleted
        except Exception as e:
            print(f"[Scheduler] Notice during job retention cleanup: {e}")
            db.rollback()
            return 0

    async def execute_alert_run(self, alert_id: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Executes a complete scheduled run for an EmailAlert:
        1. Queries all platforms.
        2. Applies cross-day deduplication (excluding previously emailed jobs).
        3. Ranks with Mistral AI.
        4. Generates CSV attachment.
        5. Sends HTML email digest with CSV.
        6. Updates sent_job_hashes in DB so tomorrow gets fresh jobs.
        """
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            alert = db.query(EmailAlert).filter(EmailAlert.id == alert_id, EmailAlert.is_active == True).first()
            if not alert:
                return {"status": "error", "message": "Alert not found or inactive"}

            print(f"[Scheduler] Running daily alert for '{alert.email}' | Role: '{alert.role}' | Loc: '{alert.location}'")

            # Determine if location is specific or worldwide
            raw_loc = (alert.location or "").strip()
            is_worldwide = raw_loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]
            
            max_days = alert.max_age_days if (alert.max_age_days is not None and alert.max_age_days > 0) else 7

            preferences = {
                "role": alert.role,
                "location": "" if is_worldwide else raw_loc,
                "remote_preference": alert.work_mode or "any",
                "experience_years": alert.experience_years or 0.0,
                "max_age_days": max_days
            }

            candidate_profile = {
                "skills": alert.skills or [],
                "core_domain": "AI / Machine Learning" if "ai" in alert.role.lower() or "ml" in alert.role.lower() else "Software Engineering",
                "experience_years": alert.experience_years or 0.0,
                "seniority": "Intern" if "intern" in alert.role.lower() else "Junior",
                "target_roles": [alert.role]
            }

            # 1. Parallel Multi-Platform Scrape
            raw_jobs = await self.orchestrator.orchestrate_search(candidate_profile, preferences)

            # 2. Intra-Batch Deduplication
            unique_batch = await self.deduplicator.deduplicate(raw_jobs)

            # 3. Cross-Day Deduplication & Date Filtering (Filter out previously sent jobs & old jobs)
            sent_hashes = set(alert.sent_job_hashes or [])
            fresh_jobs = []
            new_hashes = list(sent_hashes)

            for job in unique_batch:
                j_hash = generate_job_hash(job)
                if j_hash not in sent_hashes:
                    # Filter by posted date age if user selected a date window
                    if is_within_days(job.get("posted_date"), max_days):
                        fresh_jobs.append(job)
                        new_hashes.append(j_hash)

            print(f"[Scheduler] Found {len(raw_jobs)} raw jobs -> {len(unique_batch)} unique -> {len(fresh_jobs)} fresh matching date jobs.")

            if not fresh_jobs:
                # If all jobs were previously sent or filtered, use the top 5 highest matching unique jobs as fallback
                fresh_jobs = unique_batch[:5]

            # 4. Rank with LLM
            ranked_jobs = await self.ranking_agent.rank_jobs(fresh_jobs, candidate_profile, preferences)

            # 5. Generate BOTH CSV Reports
            backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            export_dir = os.path.join(backend_root, "exports")
            os.makedirs(export_dir, exist_ok=True)
            today_str = datetime.now().strftime("%Y-%m-%d")
            
            raw_csv_path = os.path.join(export_dir, f"all_fetched_raw_jobs_{alert.id}_{today_str}.csv")
            curated_csv_path = os.path.join(export_dir, f"curated_jobs_{alert.id}_{today_str}.csv")

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

            raw_csv_rows = build_csv_rows(raw_jobs, is_raw=True)
            pd.DataFrame(raw_csv_rows).to_csv(raw_csv_path, index=False, encoding="utf-8-sig")

            curated_csv_rows = build_csv_rows(ranked_jobs, is_raw=False)
            pd.DataFrame(curated_csv_rows).to_csv(curated_csv_path, index=False, encoding="utf-8-sig")

            # 6. Send Email Digest with Attachments
            summary_note = f"Personalized daily report for {alert.role} ({alert.location or 'Worldwide'}). Attached are both the full raw scraped database ({len(raw_jobs)} jobs) and curated matches ({len(ranked_jobs)} jobs)."
            sent_success = email_service.send_daily_job_digest(
                to_email=alert.email,
                role=alert.role,
                location=alert.location,
                jobs=ranked_jobs,
                csv_paths=[raw_csv_path, curated_csv_path],
                summary_note=summary_note,
                raw_total_count=len(raw_jobs)
            )

            # 7. Update Database with sent hashes and last_sent_at
            try:
                db_alert = db.query(EmailAlert).filter(EmailAlert.id == alert.id).first()
                if db_alert:
                    db_alert.sent_job_hashes = new_hashes[-300:]
                    db_alert.last_sent_at = datetime.utcnow()
                    db.commit()
            except Exception as db_err:
                print(f"[Scheduler] Notice during database hash update ({db_err}). Continuing gracefully.")
                try:
                    db.rollback()
                except Exception:
                    pass

            # 8. Record in AutomationHistory for interactive website inspection
            try:
                from src.models.automation_history import AutomationHistory
                history_record = AutomationHistory(
                    alert_id=alert.id,
                    user_id=alert.user_id,
                    recipient_email=alert.email,
                    role=alert.role,
                    location=alert.location or "Remote",
                    work_mode=alert.work_mode or "any",
                    experience_years=alert.experience_years or 0.0,
                    max_age_days=alert.max_age_days or 1,
                    preferred_time=alert.preferred_time or "09:00",
                    total_raw_found=len(raw_jobs),
                    total_unique_found=len(unique_batch),
                    total_curated_sent=len(ranked_jobs),
                    curated_jobs=ranked_jobs,
                    unique_jobs=unique_batch,
                    raw_jobs=raw_jobs,
                    sent_at=datetime.utcnow()
                )
                db.add(history_record)
                db.commit()
            except Exception as hist_err:
                print(f"[Scheduler] Notice during automation history save: {hist_err}")
                try:
                    db.rollback()
                except Exception:
                    pass

            return {
                "status": "success" if sent_success else "partial",
                "email": alert.email,
                "raw_jobs_count": len(raw_jobs),
                "jobs_sent": len(ranked_jobs),
                "csv_paths": [raw_csv_path, curated_csv_path]
            }
        except Exception as e:
            print(f"[Scheduler] Error executing alert {alert_id}: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            if close_db:
                db.close()

    async def check_scheduled_alerts_cookie_health(self):
        """
        Health Sentinel: Proactively checks LinkedIn session cookies for all active users
        1 hour prior to their scheduled automation and periodically every 6-12 hours.
        Dispatches an email alert if a cookie has expired.
        """
        db = SessionLocal()
        try:
            active_alerts = db.query(EmailAlert).filter(EmailAlert.is_active == True).all()
            if not active_alerts:
                return

            now_utc = datetime.utcnow()
            now_ist = now_utc + timedelta(hours=5, minutes=30)

            for alert in active_alerts:
                user = None
                if alert.user_id:
                    user = db.query(UserAccount).filter(UserAccount.id == alert.user_id).first()
                if not user:
                    user = db.query(UserAccount).filter(UserAccount.email == alert.email).first()

                cookie_to_check = alert.linkedin_cookie or (user.linkedin_cookie if user else None)
                if not cookie_to_check or len(cookie_to_check.strip()) < 10:
                    continue

                # Check if checked recently in last 6 hours unless upcoming in next 60 minutes
                pref_time = (alert.preferred_time or "09:00").strip()
                should_check = False

                last_checked = user.linkedin_cookie_checked_at if user else None
                if not last_checked or (now_utc - last_checked).total_seconds() > 6 * 3600:
                    should_check = True

                # Also check if scheduled automation is ~1 hour away
                try:
                    pref_parts = pref_time.split(":")
                    pref_h, pref_m = int(pref_parts[0]), int(pref_parts[1])
                    curr_h, curr_m = now_utc.hour, now_utc.minute
                    diff_mins = ((pref_h - curr_h) * 60 + (pref_m - curr_m)) % 1440
                    if 45 <= diff_mins <= 75:
                        should_check = True
                except Exception:
                    pass

                if should_check:
                    validation = linkedin_service.validate_cookie(cookie_to_check)
                    status = validation.get("status", "invalid")

                    if user:
                        user.linkedin_cookie_status = status
                        user.linkedin_cookie_checked_at = now_utc
                        db.commit()

                    if status == "expired":
                        last_notified = user.linkedin_cookie_last_notified_at if user else None
                        if not last_notified or (now_utc - last_notified).total_seconds() > 12 * 3600:
                            print(f"[Scheduler/Health] Detected EXPIRED LinkedIn cookie for {alert.email}. Sending notification email...")
                            email_service.send_cookie_expired_alert(
                                to_email=alert.email,
                                scheduled_time=pref_time,
                                role=alert.role
                            )
                            if user:
                                user.linkedin_cookie_last_notified_at = now_utc
                                db.commit()

        except Exception as e:
            print(f"[Scheduler/Health] Cookie health check notice: {e}")
        finally:
            db.close()

    async def check_and_trigger_due_alerts(self):
        """
        Polls active email alerts and triggers execution if current time
        matches preferred_time and alert hasn't been dispatched in the last 20 hours.
        """
        db = SessionLocal()
        try:
            active_alerts = db.query(EmailAlert).filter(EmailAlert.is_active == True).all()
            if not active_alerts:
                return

            now_utc = datetime.utcnow()
            now_hhmm_utc = now_utc.strftime("%H:%M")
            now_ist = now_utc + timedelta(hours=5, minutes=30)
            now_hhmm_ist = now_ist.strftime("%H:%M")

            for alert in active_alerts:
                if alert.last_sent_at and (now_utc - alert.last_sent_at).total_seconds() < 20 * 3600:
                    continue

                pref_time = (alert.preferred_time or "09:00").strip()
                if pref_time in [now_hhmm_utc, now_hhmm_ist]:
                    print(f"[Scheduler] Time match ({pref_time}) for alert '{alert.email}' (Role: {alert.role}). Dispatching now...")
                    asyncio.create_task(self.execute_alert_run(alert.id))
        except Exception as e:
            print(f"[Scheduler] Background polling notice: {e}")
        finally:
            db.close()

    async def start_background_scheduler(self):
        """
        Runs continuous background scheduler loop checking alerts every 60s
        and cookie health every 10 minutes.
        """
        print("[Scheduler] Automated daily email background worker started.")
        health_check_counter = 0

        while True:
            try:
                await self.check_and_trigger_due_alerts()
                
                # Run Cookie Health Sentinel every 10 minutes (10 loops * 60s)
                health_check_counter += 1
                if health_check_counter >= 10:
                    health_check_counter = 0
                    await self.check_scheduled_alerts_cookie_health()

            except Exception as loop_err:
                print(f"[Scheduler] Background loop error: {loop_err}")
            await asyncio.sleep(60)

scheduler_service = SchedulerService()
