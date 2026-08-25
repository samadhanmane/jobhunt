import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON
from src.models.database import Base

class AutomationHistory(Base):
    """
    SQLAlchemy model for storing historical automated email job digests.
    Maintains full snapshot of curated, unique, and raw jobs sent to user.
    """
    __tablename__ = "automation_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    recipient_email = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True, default="Remote")
    work_mode = Column(String(50), nullable=True, default="any")
    experience_level = Column(String(50), nullable=True, default="all")
    experience_years = Column(Float, nullable=True, default=0.0)
    max_age_days = Column(Integer, nullable=True, default=1)
    preferred_time = Column(String(20), nullable=True, default="09:00")
    
    total_raw_found = Column(Integer, default=0)
    total_unique_found = Column(Integer, default=0)
    total_curated_sent = Column(Integer, default=0)
    
    curated_jobs = Column(JSON, nullable=True) # List of curated ranked jobs
    unique_jobs = Column(JSON, nullable=True)  # List of unique deduplicated jobs
    raw_jobs = Column(JSON, nullable=True)     # List of raw scraped jobs
    
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)
