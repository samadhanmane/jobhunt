from sqlalchemy.orm import Session
from src.models.job import Job
from src.models.database import SessionLocal
from typing import List, Optional

def _sanitize_job(job: Job):
    """Guarantees no field exceeds database column boundaries."""
    if job.title and len(str(job.title)) > 255:
        job.title = str(job.title)[:255]
    if job.company and len(str(job.company)) > 255:
        job.company = str(job.company)[:255]
    if job.location and len(str(job.location)) > 255:
        job.location = str(job.location)[:255]
    if job.source and len(str(job.source)) > 50:
        job.source = str(job.source)[:50]
    if job.work_mode and len(str(job.work_mode)) > 50:
        job.work_mode = str(job.work_mode)[:50]
    if job.experience_fit and len(str(job.experience_fit)) > 50:
        job.experience_fit = str(job.experience_fit)[:50]
    if job.seniority_level and len(str(job.seniority_level)) > 50:
        job.seniority_level = str(job.seniority_level)[:50]
    if job.source_category and len(str(job.source_category)) > 50:
        job.source_category = str(job.source_category)[:50]
    if job.freshness_label and len(str(job.freshness_label)) > 100:
        job.freshness_label = str(job.freshness_label)[:100]
    if job.repost_badge and len(str(job.repost_badge)) > 100:
        job.repost_badge = str(job.repost_badge)[:100]

class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_jobs(self, jobs: List[Job]) -> List[Job]:
        if not jobs:
            return []
        try:
            for job in jobs:
                _sanitize_job(job)
                self.db.merge(job)
            self.db.commit()
            return jobs
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            # If the session was invalidated by a connection drop during long async scraping,
            # persist jobs cleanly using a fresh database connection
            try:
                with SessionLocal() as fresh_db:
                    for job in jobs:
                        try:
                            fresh_db.merge(job)
                        except Exception:
                            pass
                    fresh_db.commit()
            except Exception as persist_err:
                print(f"Notice: Secondary job persistence error: {persist_err}")
            return jobs

    def get_jobs_by_search_id(self, search_id: str) -> List[Job]:
        try:
            return self.db.query(Job).filter(Job.search_id == search_id).order_by(Job.match_score.desc()).all()
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            try:
                with SessionLocal() as fresh_db:
                    return fresh_db.query(Job).filter(Job.search_id == search_id).order_by(Job.match_score.desc()).all()
            except Exception:
                return []

    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        try:
            return self.db.query(Job).filter(Job.id == job_id).first()
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            try:
                with SessionLocal() as fresh_db:
                    return fresh_db.query(Job).filter(Job.id == job_id).first()
            except Exception:
                return None
