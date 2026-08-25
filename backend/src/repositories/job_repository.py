from sqlalchemy.orm import Session
from src.models.job import Job
from src.models.database import SessionLocal
from typing import List, Optional

class JobRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_jobs(self, jobs: List[Job]) -> List[Job]:
        if not jobs:
            return []
        try:
            self.db.add_all(jobs)
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
