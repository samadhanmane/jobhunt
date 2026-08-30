import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from src.models.database import Base

class JobOccurrence(Base):
    """
    SQLAlchemy model tracking job appearances across scan dates to detect
    ghost jobs and evergreen reposts (career-ops detect-reposts.mjs).
    """
    __tablename__ = "job_occurrences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_norm = Column(String(255), nullable=False, index=True)
    title_norm = Column(String(255), nullable=False, index=True)
    job_url = Column(String(1000), nullable=True)
    first_seen_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    times_seen = Column(Integer, default=1)
