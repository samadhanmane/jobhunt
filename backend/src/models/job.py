from sqlalchemy import Column, String, Text, Float, DateTime, JSON, Boolean, Integer, Index
from src.models.database import Base
import datetime

class Job(Base):
    __tablename__ = 'jobs'
    __table_args__ = (
        Index('idx_jobs_search_score', 'search_id', 'match_score'),
        Index('idx_jobs_created_score', 'created_at', 'match_score'),
    )
    
    id = Column(String(100), primary_key=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    url = Column(String(1000), nullable=True, index=True)
    source = Column(String(50), nullable=True)
    posted_date = Column(String(100), nullable=True, index=True)  # Formatted date string e.g. "2026-08-19" or "N/A"
    salary_range = Column(JSON, nullable=True)
    match_score = Column(Float, nullable=True)
    match_reason = Column(Text, nullable=True)
    matching_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    experience_fit = Column(String(50), nullable=True)
    search_id = Column(String(100), nullable=False, index=True)
    embedding = Column(JSON, nullable=True)
    hr_contacts = Column(JSON, nullable=True)
    tech_contacts = Column(JSON, nullable=True)
    company_insights = Column(JSON, nullable=True)
    key_requirements = Column(Text, nullable=True)
    
    # Work arrangement & repost detection
    work_mode = Column(String(50), nullable=True)  # "Remote", "Hybrid", "On-site"
    is_repost = Column(Boolean, default=False)
    repost_badge = Column(String(100), nullable=True)
    
    # Skill matching & upskill coverage
    supported_skills = Column(JSON, nullable=True)
    skill_coverage_pct = Column(Integer, default=0)
    
    # AI/ML Sub-domain & facets
    sub_domain = Column(String(100), nullable=True)
    ai_facets = Column(JSON, nullable=True)
    
    # Experience metadata
    experience_required = Column(String(100), nullable=True)
    min_experience_years = Column(Float, nullable=True)
    seniority_level = Column(String(50), nullable=True)
    experience_comparison = Column(JSON, nullable=True)
    
    # 6-Factor Match Breakdown & Source Metadata
    match_breakdown = Column(JSON, nullable=True)
    source_category = Column(String(50), nullable=True, index=True)
    freshness_label = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

