from sqlalchemy.orm import Session
from src.models.job import Job
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
        except Exception as e:
            self.db.rollback()
            for job in jobs:
                try:
                    self.db.merge(job)
                except Exception:
                    pass
            self.db.commit()
        return jobs

    def get_jobs_by_search_id(self, search_id: str) -> List[Job]:
        return self.db.query(Job).filter(Job.search_id == search_id).order_by(Job.match_score.desc()).all()

    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        return self.db.query(Job).filter(Job.id == job_id).first()
