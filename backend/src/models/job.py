from sqlalchemy import Column, String, Text, Float, DateTime, JSON
from src.models.database import Base
import datetime

class Job(Base):
    __tablename__ = 'jobs'
    
    id = Column(String(100), primary_key=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String(1000), nullable=True)
    source = Column(String(50), nullable=True)
    posted_date = Column(String(100), nullable=True)  # Formatted date string e.g. "2026-08-19"
    salary_range = Column(JSON, nullable=True)
    match_score = Column(Float, nullable=True)
    match_reason = Column(Text, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    experience_fit = Column(String(50), nullable=True)
    search_id = Column(String(100), nullable=False)
    embedding = Column(JSON, nullable=True)
    hr_contacts = Column(JSON, nullable=True)
    tech_contacts = Column(JSON, nullable=True)
    company_insights = Column(JSON, nullable=True)
    key_requirements = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

