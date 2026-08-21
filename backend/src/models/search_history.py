from sqlalchemy import Column, String, Integer, DateTime, JSON
from src.models.database import Base
import datetime

class SearchHistory(Base):
    __tablename__ = 'search_history'
    
    search_id = Column(String(100), primary_key=True)
    user_id = Column(String(36), nullable=True, index=True)
    role = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    preferences = Column(JSON, nullable=True)
    status = Column(String(50), default="processing")  # processing, completed, failed
    total_found = Column(Integer, default=0)
    unique_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
