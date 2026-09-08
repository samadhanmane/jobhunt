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
                "max_age_days": max_days
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
                print(f"[Scheduler] Notice: 0 fresh unsent jobs matching max_days={max_days}. No stale fallback will be injected.")

            # 4. Rank with LLM & Heuristics
            ranked_jobs = await self.ranking_agent.rank_jobs(fresh_jobs, candidate_profile, preferences) if fresh_jobs else []

            # Filter curated matches strictly by targeted title/role and seniority fit
            from src.utils.role_helper import filter_curated_jobs_by_role
            curated_jobs = filter_curated_jobs_by_role(
                ranked_jobs,
                target_role=alert.role,
                experience_level=exp_lvl,
                sub_domain=sub_dom,
                min_score=40.0
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

            # 7. Update Database with sent hashes and last_sent_at
            try:
                with SessionLocal() as fresh_db:
                    db_alert = fresh_db.query(EmailAlert).filter(EmailAlert.id == alert_id).first()
                    if db_alert:
                        db_alert.sent_job_hashes = new_hashes[-300:]
                        db_alert.last_sent_at = datetime.utcnow()
                        fresh_db.commit()
            except Exception as db_err:
                print(f"[Scheduler] Notice during database hash update ({db_err}). Continuing gracefully.")

            # 8. Record in AutomationHistory for interactive website inspection
            try:
                from src.models.automation_history import AutomationHistory
                with SessionLocal() as fresh_db:
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
                    fresh_db.add(history_record)
                    fresh_db.commit()
            except Exception as hist_err:
                print(f"[Scheduler] Notice during automation history save: {hist_err}")

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
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            try:
                db.close()
            except Exception:
                pass

    async def check_and_trigger_due_alerts(self):
        """
        Polls active email alerts and triggers execution if current IST time
        has reached or passed preferred_time and alert hasn't been dispatched today.
        Guarantees reliable delivery even if the server was sleeping or restarted.
        """
        db = SessionLocal()
        dispatched_count = 0
        try:
            active_alerts = db.query(EmailAlert).filter(EmailAlert.is_active == True).all()
            if not active_alerts:
                return 0

            now_utc = datetime.utcnow()
            now_ist = now_utc + timedelta(hours=5, minutes=30)

            def is_daily_alert_due(pref_time_str: str, last_sent_at: Optional[datetime]) -> bool:
                try:
                    parts = (pref_time_str or "09:00").strip().split(":")
                    ph, pm = int(parts[0]), int(parts[1])
                except Exception:
                    ph, pm = 9, 0

                now_ist_mins = now_ist.hour * 60 + now_ist.minute
                pref_mins = ph * 60 + pm

                # If current IST time has not yet reached scheduled time today -> not due yet
                if now_ist_mins < pref_mins:
                    return False

                # Scheduled time today has arrived or passed!
                if not last_sent_at:
                    return True

                # If last sent was more than 20 hours ago -> definitely due
                if (now_utc - last_sent_at).total_seconds() >= 20 * 3600:
                    return True

                # If last sent was before today's scheduled time in IST -> due today
                last_sent_ist = last_sent_at + timedelta(hours=5, minutes=30)
                today_scheduled_ist = now_ist.replace(hour=ph, minute=pm, second=0, microsecond=0)
                if last_sent_ist < today_scheduled_ist:
                    return True

                return False

            for alert in active_alerts:
                pref_time = (alert.preferred_time or "09:00").strip()
                if is_daily_alert_due(pref_time, alert.last_sent_at):
                    print(f"[Scheduler] Daily Digest Due (Scheduled: {pref_time} IST | Now: {now_ist.strftime('%H:%M')} IST) for '{alert.email}' (Role: {alert.role}). Dispatching now...")
                    # Update last_sent_at immediately to prevent duplicate dispatch during long runs
                    alert.last_sent_at = now_utc
                    db.commit()
                    asyncio.create_task(self.execute_alert_run(alert.id))
                    dispatched_count += 1

            return dispatched_count
        except Exception as e:
            print(f"[Scheduler] Background polling notice: {e}")
            try:
                db.rollback()
            except Exception:
                pass
            return 0
        finally:
            try:
                db.close()
            except Exception:
                pass

    async def run_continuous_background_job_discovery(self):
        """
        Runs periodic server-side background job discovery across platforms for all
        active user roles, search histories, and email alerts.
        This runs 24/7 in the background regardless of whether any browser tabs are open,
        ensuring fresh jobs are continuously crawled and persisted to the database.
        """
        from src.models.job import Job
        from src.models.search_history import SearchHistory
        from src.repositories.job_repository import JobRepository
        from src.utils.text_cleaner import extract_job_experience_metadata

        db = SessionLocal()
        try:
            # 1. Collect distinct search targets from recent SearchHistory & EmailAlert
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

            # Fetch existing job URLs in DB to prevent re-adding duplicates
            existing_db_urls = set(u[0].strip().lower() for u in db.query(Job.url).filter(Job.url != "").all() if u[0])

            # Crawl for top 2 targets per discovery cycle to keep CPU & memory light
            for config in target_configs[:2]:
                role_name = config["role"]
                loc_name = config["location"]
                print(f"[Background Auto-Discovery] 🔎 Crawling jobs in background for '{role_name}' (Location: {loc_name}) across all 30+ connected platforms...")

                raw_jobs = await self.orchestrator.orchestrate_search(config["candidate_profile"], config["preferences"])
                if not raw_jobs:
                    continue

                unique_jobs = await self.deduplicator.deduplicate(raw_jobs)
                ranked_jobs = await self.ranking_agent.rank_jobs(unique_jobs, config["candidate_profile"], config["preferences"])

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
                    JobRepository(db).add_jobs(new_db_jobs)
                    print(f"[Background Auto-Discovery] ✅ Saved {len(new_db_jobs)} new background-discovered jobs to database for '{role_name}'.")
                else:
                    print(f"[Background Auto-Discovery] ℹ️ All {len(ranked_jobs)} discovered jobs for '{role_name}' are already up-to-date in database.")

                del raw_jobs
                del unique_jobs
                del ranked_jobs
                del new_db_jobs
                gc.collect()

        except Exception as bg_err:
            print(f"[Background Auto-Discovery] Notice: {bg_err}")
            try:
                db.rollback()
            except Exception:
                pass
        finally:
            try:
                db.close()
            except Exception:
                pass
            gc.collect()

    async def start_background_scheduler(self):
        """
        Runs continuous background scheduler loop:
        1. Checks daily email alerts every 60s without blocking.
        2. Spawns background auto-discovery crawler every 5 minutes in a separate task.
        3. Spawns cookie health sentinel every 15 minutes in a separate task.
        """
        print("[Scheduler] Automated background worker & continuous job discovery engine started.")
        discovery_counter = 0
        health_check_counter = 0

        # Initial quick alert check 5s after boot
        await asyncio.sleep(5)
        try:
            await self.check_and_trigger_due_alerts()
        except Exception as e:
            print(f"[Scheduler] Initial alert check notice: {e}")

        while True:
            try:
                # 1. Alert check runs strictly every 60s
                await self.check_and_trigger_due_alerts()
                
                # 2. Continuous Background Job Discovery spawned as non-blocking task every 5 minutes
                discovery_counter += 1
                if discovery_counter >= 5:
                    discovery_counter = 0
                    asyncio.create_task(self.run_continuous_background_job_discovery())

                # 3. Cookie Health Sentinel spawned as non-blocking task every 15 minutes
                health_check_counter += 1
                if health_check_counter >= 15:
                    health_check_counter = 0
                    asyncio.create_task(self.check_scheduled_alerts_cookie_health())

            except Exception as loop_err:
                print(f"[Scheduler] Background loop error: {loop_err}")
            await asyncio.sleep(60)

scheduler_service = SchedulerService()
