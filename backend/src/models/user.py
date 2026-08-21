from sqlalchemy import Column, String, Text, DateTime, JSON
from src.models.database import Base
import datetime

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    
    id = Column(String(100), primary_key=True)
    resume_text = Column(Text, nullable=True)
    resume_skills = Column(JSON, nullable=True)
    resume_experience = Column(JSON, nullable=True)
    resume_roles = Column(JSON, nullable=True)
    preferences = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
