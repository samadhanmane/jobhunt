from src.config import settings
from src.core.thread_pool import run_in_worker_thread
from src.models.blacklist import BlacklistCompany
from src.services.repost_detector import repost_detector
from src.services.upskill_service import upskill_service
from src.utils.liveness_helper import check_job_liveness
from src.utils.location_helper import is_india_location
import os
import gc
import uuid
import asyncio
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
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
    """Creates a deterministic hash for a job posting based on title, company, and location."""
    title = str(job.get("title", "")).lower().strip()
    company = str(job.get("company", "")).lower().strip()
    location = str(job.get("location", "")).lower().strip()
    return hashlib.md5(f"{title}|{company}|{location}".encode("utf-8")).hexdigest()

class SchedulerService:
    def __init__(self):
        self.orchestrator = OrchestratorAgent()
        self.deduplicator = DeduplicationAgent()
        self.ranking_agent = RankingAgent()
        self._discovery_running = False
        self._stop_discovery_requested = False
        self._schedule_changed_event = None
        self._alert_lock = None
        self._queued_or_running_alert_ids = set()
        self._alert_queue = []
        self._alert_worker_running = False

    def _get_schedule_event(self) -> asyncio.Event:
        if self._schedule_changed_event is None:
            self._schedule_changed_event = asyncio.Event()
        return self._schedule_changed_event

    def notify_schedule_changed(self):
        """Signals the background scheduler to recalibrate sleep time when an alert is added/updated/deleted."""
        event = self._get_schedule_event()
        event.set()

    def _get_alert_lock(self):
        if self._alert_lock is None:
            self._alert_lock = asyncio.Lock()
        return self._alert_lock

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
        3. Ranks with Google Gemini AI.
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

            exp_lvl = getattr(alert, "experience_level", None) or "all"
            if exp_lvl == "all" and getattr(alert, "experience_years", 0.0) is not None:
                yrs = float(alert.experience_years or 0.0)
                if yrs == 0.0 and "intern" in alert.role.lower():
                    exp_lvl = "intern"
                elif 0.0 < yrs <= 1.0:
                    exp_lvl = "entry"
                elif 1.0 < yrs <= 2.5:
                    exp_lvl = "junior"
                elif 2.5 < yrs <= 5.0:
                    exp_lvl = "mid"
                elif 5.0 < yrs <= 8.0:
                    exp_lvl = "senior"
                elif yrs > 8.0:
                    exp_lvl = "lead"

            sub_dom = getattr(alert, "sub_domain", "All") or "All"
            exp_tier = getattr(alert, "experience_tier", "all") or "all"
            facets = getattr(alert, "ai_facets", []) or []

            preferences = {
                "role": alert.role,
                "location": "" if is_worldwide else raw_loc,
                "remote_preference": alert.work_mode or "any",
                "work_mode": alert.work_mode or "any",
                "experience_level": exp_lvl,
                "experience_tier": exp_tier,
                "sub_domain": sub_dom,
                "ai_facets": facets,
                "experience_years": alert.experience_years or 0.0,
                "max_age_days": max_days,
                "is_alert_run": True
            }

            candidate_profile = {
                "skills": alert.skills or [],
                "core_domain": "AI / Machine Learning" if "ai" in alert.role.lower() or "ml" in alert.role.lower() else "Software Engineering",
                "experience_years": alert.experience_years or 0.0,
                "seniority": exp_lvl.title() if exp_lvl != "all" else ("Intern" if "intern" in alert.role.lower() else "Junior"),
                "target_roles": [alert.role]
            }

            # 1. Parallel Multi-Platform Scrape with Blacklist Gate
            user_blacklist = []
            if alert.user_id:
                try:
                    bl_entries = db.query(BlacklistCompany).filter(BlacklistCompany.user_id == alert.user_id).all()
                    user_blacklist = [b.company_name.lower().strip() for b in bl_entries if b.company_name]
                except Exception:
                    user_blacklist = []
            preferences["blacklist"] = user_blacklist

            raw_jobs = await self.orchestrator.orchestrate_search(candidate_profile, preferences)

            # Enforce Blacklist Filtering
            if user_blacklist:
                raw_jobs = [j for j in raw_jobs if j.get("company", "").lower().strip() not in user_blacklist]

            # Enforce Location Alignment on Raw Jobs (prevents foreign jobs from leaking into raw reports)
            if alert.location and alert.location.lower() not in ["worldwide", "global", "all", "any", "remote", ""]:
                from src.utils.location_helper import is_job_location_match
                raw_jobs = [
                    j for j in raw_jobs
                    if is_job_location_match(
                        job_location=j.get("location", ""),
                        pref_location=alert.location,
                        pref_work_mode=alert.work_mode or "any",
                        job_source=j.get("source", ""),
                        job_description=j.get("description", "")[:800],
                        job_title=j.get("title", ""),
                        job_url=j.get("url", "")
                    )
                ]

            # 2. Intra-Batch Deduplication
            unique_batch = await self.deduplicator.deduplicate(raw_jobs)

            # 3. Cross-Day Deduplication & Date Filtering (Filter out previously sent jobs & old jobs)
            sent_hashes = set(alert.sent_job_hashes or [])
            fresh_jobs = []

            for job in unique_batch:
                j_hash = generate_job_hash(job)
                if j_hash not in sent_hashes:
                    # Filter by posted date age if user selected a date window
                    if is_within_days(job.get("posted_date"), max_days):
                        fresh_jobs.append(job)

            # Freshness fallback: if strict date filter yields 0 fresh jobs, progressively expand window for unsent openings
            if not fresh_jobs:
                print(f"[Scheduler] Notice: 0 unsent jobs found strictly within {max_days}d for '{alert.email}'. Expanding to 3-day window for unsent openings...")
                for job in unique_batch:
                    j_hash = generate_job_hash(job)
                    if j_hash not in sent_hashes:
                        if is_within_days(job.get("posted_date"), 3):
                            fresh_jobs.append(job)

            if not fresh_jobs:
                print(f"[Scheduler] Notice: 0 unsent jobs found within 3 days for '{alert.email}'. Expanding to 7-day window for unsent openings...")
                for job in unique_batch:
                    j_hash = generate_job_hash(job)
                    if j_hash not in sent_hashes:
                        if is_within_days(job.get("posted_date"), 7):
                            fresh_jobs.append(job)

            if not fresh_jobs:
                print(f"[Scheduler] Notice: 0 unsent jobs found within 7 days for '{alert.email}'. Expanding to 14-day window for unsent openings...")
                for job in unique_batch:
                    j_hash = generate_job_hash(job)
                    if j_hash not in sent_hashes:
                        if is_within_days(job.get("posted_date"), 14):
                            fresh_jobs.append(job)

            print(f"[Scheduler] Found {len(raw_jobs)} raw jobs -> {len(unique_batch)} unique -> {len(fresh_jobs)} fresh matching date jobs.")

            if not fresh_jobs:
                print(f"[Scheduler] Notice: 0 fresh unsent jobs found across all windows for '{alert.email}'.")

            # 4. Rank with LLM & Heuristics
            ranked_jobs = await self.ranking_agent.rank_jobs(fresh_jobs, candidate_profile, preferences) if fresh_jobs else []

            # Filter curated matches strictly by targeted title/role, location, and seniority fit
            from src.utils.role_helper import filter_curated_jobs_by_role
            curated_jobs = filter_curated_jobs_by_role(
                ranked_jobs,
                target_role=alert.role,
                experience_level=exp_lvl,
                sub_domain=sub_dom,
                min_score=40.0,
                target_location=alert.location or "",
                work_mode=alert.work_mode or "any"
            )

            # Attach Repost Detection and 3-Tier Skill Gap to curated jobs
            for j in curated_jobs:
                repost_info = repost_detector.record_and_evaluate_repost(j.get("company"), j.get("title"), j.get("url"), db)
                j["is_repost"] = repost_info.get("is_repost", False)
                j["repost_badge"] = repost_info.get("badge_label", "Active Opening")

                gap_info = upskill_service.analyze_job_skill_gap(j, alert.skills or [])
                j["supported_skills"] = gap_info.get("supported_skills", [])
                j["skill_coverage_pct"] = gap_info.get("coverage_percentage", 0)

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
                        "Sub-Domain": j.get("sub_domain", "AI/ML General"),
                        "AI Facets": ", ".join(j.get("ai_facets", [])) if j.get("ai_facets") else "Standard AI",
                        "Repost Status": j.get("repost_badge", "Active Opening"),
                        "Supported Skills": ", ".join(j.get("supported_skills", [])) if j.get("supported_skills") else "N/A",
                        "Location": j.get("location", "N/A"),
                        "Work Type": j.get("work_mode", work_type),
                        "Posted Date (YYYY-MM-DD)": format_posted_date_for_csv(j.get("posted_date")),
                        "Salary": salary if salary else "N/A",
                        "Match Score": score_str,
                        "Role Fit": f"{round(j.get('role_match_score', score_val or 0))}%",
                        "Skills Fit": f"{round(j.get('skill_match_score', score_val or 0))}%",
                        "Experience Fit": j.get("experience_fit", exp_fit),
                        "Matching Skills": ", ".join(j.get("matching_skills", [])) if j.get("matching_skills") else "N/A",
                        "Missing Skills": ", ".join(j.get("missing_skills", [])) if j.get("missing_skills") else "N/A",
                        "Match Reason": reason,
                        "URL": j.get("url", ""),
                        "Source": j.get("source", "job_board")
                    })
                return rows

            def write_csv_file(file_path, rows):
                import csv
                if not rows:
                    with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
                        f.write("Company Name,Role / Title,Location,Work Type,Posted Date (YYYY-MM-DD),Salary,Match Score,Experience Fit,Matching Skills,Missing Skills,Match Reason,URL,Source\n")
                    return
                fieldnames = list(rows[0].keys())
                with open(file_path, "w", newline="", encoding="utf-8-sig") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(rows)

            raw_csv_rows = build_csv_rows(raw_jobs, is_raw=True)
            write_csv_file(raw_csv_path, raw_csv_rows)

            curated_csv_rows = build_csv_rows(curated_jobs, is_raw=False)
            write_csv_file(curated_csv_path, curated_csv_rows)

            # 6. Send Email Digest with Attachments
            summary_note = f"Personalized daily report for {alert.role} ({alert.location or 'Worldwide'}). Attached are both the full raw scraped database ({len(raw_jobs)} jobs) and curated matches ({len(curated_jobs)} jobs)."
            sent_success = email_service.send_daily_job_digest(
                to_email=alert.email,
                role=alert.role,
                location=alert.location,
                jobs=curated_jobs,
                csv_paths=[raw_csv_path, curated_csv_path],
                summary_note=summary_note,
                raw_total_count=len(raw_jobs)
            )

            # 7. Update Database with sent hashes and last_sent_at ONLY on successful delivery
            if sent_success:
                try:
                    sent_curated_hashes = list(sent_hashes)
                    for j in curated_jobs:
                        sent_curated_hashes.append(generate_job_hash(j))
                    alert.sent_job_hashes = list(dict.fromkeys(sent_curated_hashes))[-300:]
                    alert.last_sent_at = datetime.utcnow()
                    db.commit()
                    print(f"[Scheduler] [OK] Alert {alert.id} ({alert.email}) successfully delivered and last_sent_at updated.")
                except Exception as db_err:
                    print(f"[Scheduler] Notice during database hash update ({db_err}). Continuing gracefully.")
            else:
                print(f"[Scheduler] [WARN] Email delivery failed or partial for {alert.email}. last_sent_at preserved for safe retry.")

            # 8. Record in AutomationHistory for interactive website inspection
            try:
                from src.models.automation_history import AutomationHistory
                history_record = AutomationHistory(
                    alert_id=alert_id,
                    user_id=getattr(alert, "user_id", None),
                    recipient_email=alert.email,
                    role=alert.role,
                    location=alert.location or "Remote",
                    work_mode=alert.work_mode or "any",
                    experience_level=exp_lvl,
                    experience_years=alert.experience_years or 0.0,
                    max_age_days=alert.max_age_days or 1,
                    preferred_time=alert.preferred_time or "09:00",
                    total_raw_found=len(raw_jobs),
                    total_unique_found=len(unique_batch),
                    total_curated_sent=len(curated_jobs),
                    curated_jobs=curated_jobs,
                    unique_jobs=unique_batch,
                    raw_jobs=raw_jobs,
                    sent_at=datetime.utcnow()
                )
                db.add(history_record)
                db.commit()
            except Exception as hist_err:
                print(f"[Scheduler] Notice during automation history save: {hist_err}")

            return {
                "status": "success" if sent_success else "partial",
                "email": alert.email,
                "raw_jobs_count": len(raw_jobs),
                "jobs_sent": len(curated_jobs),
                "csv_paths": [raw_csv_path, curated_csv_path]
            }
        except Exception as e:
            print(f"[Scheduler] Error executing alert {alert_id}: {e}")
            return {"status": "error", "message": str(e)}
        finally:
            try:
                del raw_jobs
            except Exception:
                pass
            try:
                del unique_batch
            except Exception:
                pass
            try:
                del fresh_jobs
            except Exception:
                pass
            try:
                del ranked_jobs
            except Exception:
                pass
            try:
                del curated_jobs
            except Exception:
                pass
            gc.collect()
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
                    validation = await linkedin_service.validate_cookie_async(cookie_to_check)
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
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            try:
                db.close()
            except Exception:
                pass

    def get_next_due_alerts_and_delay(self) -> Tuple[List[str], float]:
        """
        Inspects active email alerts and calculates:
        1. List of alert IDs that are due right now (current IST time matches scheduled preferred_time window).
        2. Exact seconds until the next upcoming alert preferred_time in IST.
        Does NOT poll continuously; enables asyncio.sleep(delay) without memory or DB churn.
        """
        db = SessionLocal()
        try:
            active_alerts = db.query(EmailAlert).filter(EmailAlert.is_active == True).all()
            if not active_alerts:
                return [], 3600.0

            now_utc = datetime.utcnow()
            now_ist = now_utc + timedelta(hours=5, minutes=30)
            now_ist_mins = now_ist.hour * 60 + now_ist.minute

            due_alert_ids = []
            upcoming_delays = []

            for alert in active_alerts:
                pref_time = (alert.preferred_time or "09:00").strip()
                try:
                    parts = pref_time.split(":")
                    ph, pm = int(parts[0]), int(parts[1])
                except Exception:
                    ph, pm = 9, 0

                pref_mins = ph * 60 + pm

                # Check if already sent today in IST
                already_sent_today = False
                if alert.last_sent_at:
                    last_sent_ist = alert.last_sent_at + timedelta(hours=5, minutes=30)
                    if (last_sent_ist.date() == now_ist.date() and 
                        (last_sent_ist.hour * 60 + last_sent_ist.minute) >= pref_mins - 2):
                        already_sent_today = True

                if not already_sent_today:
                    if alert.id in self._queued_or_running_alert_ids:
                        # Already queued or running for today -> calculate wait until tomorrow at preferred time
                        delay_mins = (1440 - now_ist_mins) + pref_mins
                        delay_sec = max(5.0, delay_mins * 60.0 - now_ist.second)
                        upcoming_delays.append(delay_sec)
                        continue
                    elif now_ist_mins >= pref_mins:
                        # Scheduled time has arrived or passed today, and alert has not run today -> DUE NOW!
                        due_alert_ids.append(alert.id)
                        continue
                    else:
                        # Scheduled for later today
                        delay_mins = pref_mins - now_ist_mins
                        delay_sec = max(5.0, delay_mins * 60.0 - now_ist.second)
                        upcoming_delays.append(delay_sec)
                        continue

                # If already sent today, next run is tomorrow at pref_mins
                delay_mins = (1440 - now_ist_mins) + pref_mins
                delay_sec = max(5.0, delay_mins * 60.0 - now_ist.second)
                upcoming_delays.append(delay_sec)

            next_delay = min(upcoming_delays) if upcoming_delays else 3600.0
            return due_alert_ids, max(5.0, next_delay)
        except Exception as e:
            print(f"[Scheduler] Notice calculating next alert schedule: {e}")
            return [], 60.0
        finally:
            try:
                db.close()
            except Exception:
                pass

    async def check_and_trigger_due_alerts(self) -> int:
        """
        Polls active email alerts and triggers execution if current IST time
        has reached or passed preferred_time and alert hasn't been dispatched today.
        Guarantees reliable delivery at the scheduled time.
        """
        due_alert_ids, _ = self.get_next_due_alerts_and_delay()
        dispatched_count = 0
        for alert_id in due_alert_ids:
            if alert_id not in self._queued_or_running_alert_ids:
                print(f"[Scheduler] Daily Digest Due: Enqueuing alert ID {alert_id} for execution...")
                self._queued_or_running_alert_ids.add(alert_id)
                self._alert_queue.append(alert_id)
                dispatched_count += 1

        if self._alert_queue and not self._alert_worker_running:
            asyncio.create_task(self._process_alert_queue())

        return dispatched_count

    async def _process_alert_queue(self):
        """
        Processes queued daily email alerts SEQUENTIALLY one at a time.
        Serializing execution prevents memory spikes and OOM crashes on Render's 512MB RAM tier,
        ensuring each alert crawls, digests, emails, updates DB, and frees RAM with garbage collection
        before the next alert begins.
        """
        if self._alert_worker_running:
            return

        lock = self._get_alert_lock()
        async with lock:
            self._alert_worker_running = True
            try:
                while self._alert_queue:
                    alert_id = self._alert_queue.pop(0)
                    print(f"[Scheduler/Worker] 🚀 Starting sequential alert execution for ID: {alert_id} ({len(self._alert_queue)} remaining in queue)")
                    try:
                        res = await self.execute_alert_run(alert_id)
                        print(f"[Scheduler/Worker] ✅ Alert {alert_id} finished with status: {res.get('status')}")
                    except Exception as run_err:
                        print(f"[Scheduler/Worker] ❌ Error executing alert {alert_id}: {run_err}")
                    finally:
                        self._queued_or_running_alert_ids.discard(alert_id)
                        gc.collect()
                        if self._alert_queue:
                            print(f"[Scheduler/Worker] Cooling event loop for 4s before next alert...")
                            await asyncio.sleep(4)
            finally:
                self._alert_worker_running = False
                gc.collect()

    def is_background_discovery_enabled(self) -> bool:
        """
        Returns whether background job discovery crawler is globally enabled.
        Admin can toggle this OFF via Admin Portal to halt all background crawling,
        ensuring jobs are only fetched when users actively search on-demand.
        Fails closed (returns False) on any error to prevent unintended crawling.
        """
        try:
            from src.models.system_setting import SystemSetting
            db = SessionLocal()
            try:
                setting = db.query(SystemSetting).filter(SystemSetting.key == "background_discovery_enabled").first()
                if setting and setting.value is not None:
                    return setting.value.strip().lower() in ["true", "1", "yes", "on"]
            finally:
                db.close()
        except Exception as e:
            print(f"[Scheduler] Notice: Could not read background_discovery_enabled setting ({e}). Failing closed (disabled).")
            return False

        return getattr(settings, "BACKGROUND_DISCOVERY_ENABLED", False)

    def set_background_discovery_enabled(self, enabled: bool, updated_by: str = "admin") -> bool:
        """
        Persists global background discovery status in database for immediate, system-wide effect.
        """
        from src.models.system_setting import SystemSetting
        db = SessionLocal()
        try:
            setting = db.query(SystemSetting).filter(SystemSetting.key == "background_discovery_enabled").first()
            if not setting:
                setting = SystemSetting(
                    key="background_discovery_enabled",
                    value="true" if enabled else "false",
                    description="Controls periodic server-side background job discovery across platforms",
                    updated_by=updated_by
                )
                db.add(setting)
            else:
                setting.value = "true" if enabled else "false"
                setting.updated_by = updated_by
                setting.updated_at = datetime.utcnow()
            db.commit()
            print(f"[Scheduler] Background discovery crawler status set to: {'ENABLED' if enabled else 'DISABLED'} by {updated_by}")
            if not enabled:
                self._stop_discovery_requested = True
                self._discovery_running = False
                print("[Scheduler] Signaled active background crawlers to halt immediately.")
            else:
                self._stop_discovery_requested = False
            return enabled
        finally:
            db.close()

    async def run_continuous_background_job_discovery(self):
        """
        Runs periodic server-side background job discovery across platforms for all
        active user roles, search histories, and email alerts.
        Runs once every 1 hour (configurable) in the background without blocking the event loop,
        ensuring fresh jobs are continuously crawled and persisted to the database with minimal
        bandwidth and CPU usage.
        """
        if not self.is_background_discovery_enabled():
            print("[Background Auto-Discovery] Notice: Background check is disabled by Admin. Skipping discovery cycle.")
            return

        if self._discovery_running:
            print("[Background Auto-Discovery] Notice: Background discovery already running, skipping overlapping cycle.")
            return

        if self._alert_worker_running or bool(self._queued_or_running_alert_ids):
            print("[Background Auto-Discovery] Scheduled daily email alerts are currently processing. Deferring discovery cycle to preserve memory.")
            return

        self._discovery_running = True
        self._stop_discovery_requested = False
        from src.models.job import Job
        from src.models.search_history import SearchHistory
        from src.repositories.job_repository import JobRepository
        from src.utils.text_cleaner import extract_job_experience_metadata

        try:
            # 1. Collect distinct search targets and existing URLs in worker thread pool
            def _collect_targets_and_existing_urls():
                db = SessionLocal()
                try:
                    target_configs = []
                    seen_combos = set()

                    # From recent searches in the last 7 days
                    cutoff = datetime.utcnow() - timedelta(days=7)
                    recent_searches = db.query(SearchHistory).filter(SearchHistory.created_at >= cutoff).order_by(SearchHistory.created_at.desc()).limit(15).all()
                    for s in recent_searches:
                        if not s.role:
                            continue
                        combo_key = f"{s.role.lower().strip()}|{(s.location or '').lower().strip()}"
                        if combo_key not in seen_combos:
                            seen_combos.add(combo_key)
                            pref = s.preferences or {}
                            target_configs.append({
                                "role": s.role.strip(),
                                "location": (s.location or "Worldwide").strip(),
                                "preferences": {
                                    "role": s.role.strip(),
                                    "location": "" if (s.location or "").lower() in ["remote", "worldwide", "global", "any", "all", ""] else s.location,
                                    "remote_preference": pref.get("remote_preference", "any"),
                                    "experience_level": pref.get("experience_level", "all"),
                                    "experience_years": pref.get("experience_years", 0)
                                },
                                "candidate_profile": {
                                    "skills": pref.get("skills") or pref.get("resume_skills") or [],
                                    "core_domain": s.role.strip(),
                                    "experience_years": pref.get("experience_years", 0),
                                    "seniority": pref.get("experience_level", "Mid")
                                }
                            })

                    # Also check EmailAlerts
                    active_alerts = db.query(EmailAlert).filter(EmailAlert.is_active == True).all()
                    for a in active_alerts:
                        if not a.role:
                            continue
                        combo_key = f"{a.role.lower().strip()}|{(a.location or '').lower().strip()}"
                        if combo_key not in seen_combos:
                            seen_combos.add(combo_key)
                            alert_exp = getattr(a, "experience_level", None) or "all"
                            alert_sub = getattr(a, "sub_domain", "All") or "All"
                            alert_facets = getattr(a, "ai_facets", []) or []
                            target_configs.append({
                                "role": a.role.strip(),
                                "location": (a.location or "Worldwide").strip(),
                                "preferences": {
                                    "role": a.role.strip(),
                                    "location": "" if (a.location or "").lower() in ["remote", "worldwide", "global", "any", "all", ""] else a.location,
                                    "remote_preference": a.work_mode or "any",
                                    "work_mode": a.work_mode or "any",
                                    "experience_level": alert_exp,
                                    "experience_tier": alert_exp,
                                    "sub_domain": alert_sub,
                                    "ai_facets": alert_facets,
                                    "experience_years": a.experience_years or 0.0
                                },
                                "candidate_profile": {
                                    "skills": a.skills or [],
                                    "core_domain": a.role.strip(),
                                    "experience_years": a.experience_years or 0.0,
                                    "seniority": alert_exp.title() if alert_exp != "all" else ("Intern" if "intern" in a.role.lower() else "Junior")
                                }
                            })

                    if not target_configs:
                        # Default fallback role if no searches yet
                        target_configs = [{
                            "role": "AI Engineer Intern",
                            "location": "Worldwide",
                            "preferences": {"role": "AI Engineer Intern", "location": "", "remote_preference": "any", "experience_level": "intern", "experience_years": 0},
                            "candidate_profile": {"skills": ["Python", "PyTorch", "Machine Learning"], "core_domain": "AI / ML", "experience_years": 0, "seniority": "Intern"}
                        }]

                    existing_urls = set(u[0].strip().lower() for u in db.query(Job.url).filter(Job.url != "").all() if u[0])
                    return target_configs, existing_urls
                finally:
                    db.close()

            target_configs, existing_db_urls = await run_in_worker_thread(_collect_targets_and_existing_urls)

            # Crawl for top 2 targets per discovery cycle to keep CPU & memory light
            for config in target_configs[:2]:
                if not self.is_background_discovery_enabled() or self._stop_discovery_requested:
                    print("[Background Auto-Discovery] Notice: Background crawler stopped by Admin. Aborting in-progress crawl.")
                    break
                role_name = config["role"]
                loc_name = config["location"]
                print(f"[Background Auto-Discovery] 🔎 Crawling jobs in background for '{role_name}' (Location: {loc_name}) across connected platforms (1-hr interval)...")

                raw_jobs = await self.orchestrator.orchestrate_search(config["candidate_profile"], config["preferences"])
                if not raw_jobs or not self.is_background_discovery_enabled() or self._stop_discovery_requested:
                    continue

                unique_jobs = await self.deduplicator.deduplicate(raw_jobs)

                # PRE-FILTER: Only rank jobs that are not already in database to save CPU and memory
                fresh_unseen_jobs = [j for j in unique_jobs if (j.get("url") or "").strip().lower() not in existing_db_urls]
                if not fresh_unseen_jobs:
                    print(f"[Background Auto-Discovery] ℹ️ All {len(unique_jobs)} discovered jobs for '{role_name}' are already up-to-date in database.")
                    continue

                ranked_jobs = await self.ranking_agent.rank_jobs(fresh_unseen_jobs, config["candidate_profile"], config["preferences"])

                new_db_jobs = []
                for j in ranked_jobs:
                    if float(j.get("match_score", 0.0)) < 35.0:
                        continue
                    url = (j.get("url") or "").strip().lower()
                    if url and url in existing_db_urls:
                        continue
                    if url:
                        existing_db_urls.add(url)

                    rtitle = j.get("title", "Unknown Role")
                    rdesc = (j.get("description") or "")[:3000]
                    rexp = extract_job_experience_metadata(rtitle, rdesc, j.get("experience_fit", ""))
                    rdate = format_posted_date_for_csv(j.get("posted_date"))
                    if rdate == "N/A":
                        rdate = datetime.utcnow().strftime("%Y-%m-%d")

                    new_db_jobs.append(Job(
                        id=str(uuid.uuid4()),
                        search_id=f"auto_discovery_{datetime.utcnow().strftime('%Y%m%d%H%M')}",
                        title=rtitle,
                        company=j.get("company", "Unknown Company"),
                        location=j.get("location", "Remote"),
                        description=rdesc,
                        url=j.get("url", ""),
                        source=j.get("source", "unknown"),
                        posted_date=rdate,
                        salary_range=j.get("salary_range"),
                        match_score=float(j.get("match_score", 50.0)),
                        match_reason=j.get("match_reason", "Background Auto-Discovery Match"),
                        matching_skills=j.get("matching_skills", []),
                        missing_skills=j.get("missing_skills", []),
                        experience_fit=j.get("experience_fit", "Good Fit"),
                        key_requirements=j.get("key_requirements", ""),
                        company_insights=j.get("company_insights") or {},
                        hr_contacts=[],
                        tech_contacts=[]
                    ))

                if new_db_jobs:
                    def _save_new_jobs(jobs_list):
                        db = SessionLocal()
                        try:
                            JobRepository(db).add_jobs(jobs_list)
                        finally:
                            db.close()
                    await run_in_worker_thread(_save_new_jobs, new_db_jobs)
                    print(f"[Background Auto-Discovery] ✅ Saved {len(new_db_jobs)} new background-discovered jobs to database for '{role_name}'.")
                else:
                    print(f"[Background Auto-Discovery] ℹ️ All {len(ranked_jobs)} discovered jobs for '{role_name}' are already up-to-date in database.")

                del raw_jobs
                del unique_jobs
                del fresh_unseen_jobs
                del ranked_jobs
                del new_db_jobs
                gc.collect()

        except Exception as bg_err:
            print(f"[Background Auto-Discovery] Notice: {bg_err}")
        finally:
            self._discovery_running = False
            gc.collect()

    async def _alert_scheduler_loop(self):
        """
        Event-driven daily alert scheduler:
        - Sleeps until the exact scheduled preferred_time arrives (e.g. 09:00 IST).
        - Does NOT poll the database every second or minute, preventing memory and CPU churn.
        - When the scheduled time arrives, dispatches the due alerts sequentially.
        """
        print("[Scheduler] Daily email alert scheduler initialized (event-driven, zero polling overhead).")
        # Allow initial server boot to settle
        await asyncio.sleep(10)

        while True:
            try:
                due_alert_ids, next_delay = self.get_next_due_alerts_and_delay()

                if due_alert_ids:
                    for alert_id in due_alert_ids:
                        if alert_id not in self._queued_or_running_alert_ids:
                            print(f"[Scheduler] ⏰ Scheduled alert time reached for alert ID: {alert_id}. Enqueuing for execution...")
                            self._queued_or_running_alert_ids.add(alert_id)
                            self._alert_queue.append(alert_id)

                    if self._alert_queue and not self._alert_worker_running:
                        asyncio.create_task(self._process_alert_queue())

                    # Recalculate next delay after enqueuing
                    _, next_delay = self.get_next_due_alerts_and_delay()

                # Sleep until the next scheduled alert time (capped at 1800s safety window)
                # If a user adds/edits/deletes an alert, _schedule_changed_event wakes us immediately
                event = self._get_schedule_event()
                wait_sec = max(5.0, min(next_delay, 1800.0))
                next_mins = round(wait_sec / 60, 1)
                print(f"[Scheduler] Sleeping {wait_sec:.0f}s (~{next_mins}m) until next scheduled alert check...")

                try:
                    await asyncio.wait_for(event.wait(), timeout=wait_sec)
                    event.clear()
                    print("[Scheduler] Alert configuration modified by user. Recalibrating schedule...")
                except asyncio.TimeoutError:
                    # Scheduled time reached or safety boundary elapsed
                    pass

            except Exception as loop_err:
                print(f"[Scheduler] Alert scheduler loop notice: {loop_err}")
                await asyncio.sleep(60)

    async def _discovery_crawler_loop(self):
        """
        Periodic auto-discovery crawler loop:
        - When crawler is ENABLED by Admin: discovers fresh jobs across platforms once every 1 hour (configurable).
        - When crawler is DISABLED by Admin: remains completely dormant (sleeps 1 hour with 0 network/DB work).
        """
        await asyncio.sleep(30)

        while True:
            try:
                if self.is_background_discovery_enabled():
                    interval_mins = max(1, getattr(settings, "BACKGROUND_DISCOVERY_INTERVAL_MINUTES", 60))
                    print(f"[Scheduler/Crawler] Background discovery crawler active (interval: {interval_mins}m).")
                    
                    if not self._discovery_running and not self._stop_discovery_requested:
                        await self.run_continuous_background_job_discovery()

                    # Also run cookie health sentinel if crawler enabled
                    asyncio.create_task(self.check_scheduled_alerts_cookie_health())

                    await asyncio.sleep(interval_mins * 60)
                else:
                    # Crawler is STOPPED. Sleep dormant for 1 hour without running queries or scrapers
                    await asyncio.sleep(3600)
            except Exception as crawler_err:
                print(f"[Scheduler/Crawler] Notice: {crawler_err}")
                await asyncio.sleep(60)

    async def start_background_scheduler(self):
        """
        Runs the background workers:
        1. Event-driven daily alert scheduler (sleeps until exact scheduled time; does not poll every second/minute).
        2. Periodic auto-discovery crawler loop (only runs when enabled by Admin; sleeps dormant when stopped).
        """
        asyncio.create_task(self._alert_scheduler_loop())
        asyncio.create_task(self._discovery_crawler_loop())

scheduler_service = SchedulerService()
