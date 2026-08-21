import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from src.models.database import Base

class EmailAlert(Base):
    """
    SQLAlchemy model for scheduled daily job email automations.
    """
    __tablename__ = "email_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    email = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True, default="Remote")
    experience_years = Column(Float, nullable=True, default=0.0)
    work_mode = Column(String(50), nullable=True, default="any")  # 'remote', 'onsite', 'any'
    max_age_days = Column(Integer, nullable=True, default=1)      # 1 = past 24h, 3, 7
    preferred_time = Column(String(20), nullable=True, default="09:00") # "HH:MM" in 24hr format
    skills = Column(JSON, nullable=True)                          # List of technical skills
    resume_summary = Column(Text, nullable=True)                  # Parsed resume text/summary
    sent_job_hashes = Column(JSON, nullable=True, default=list)   # URLs/hashes of sent jobs to prevent repeat emails
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_sent_at = Column(DateTime, nullable=True)
