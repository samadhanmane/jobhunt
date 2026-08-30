import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from src.models.database import Base

class StoryBankEntry(Base):
    """
    SQLAlchemy model for candidate STAR+R interview achievement stories.
    Ported from career-ops story-bank.md for interview preparation.
    """
    __tablename__ = "story_bank_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    situation = Column(Text, nullable=False)
    task = Column(Text, nullable=False)
    action = Column(Text, nullable=False)
    result = Column(Text, nullable=False)
    reflection = Column(Text, nullable=True)
    technologies = Column(JSON, nullable=True, default=list) # e.g. ["PyTorch", "FastAPI", "Docker"]
    metrics = Column(JSON, nullable=True, default=list)      # e.g. ["35% latency reduction", "10k users"]
    tags = Column(JSON, nullable=True, default=list)         # e.g. ["Agentic AI", "Backend Scaling"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "situation": self.situation,
            "task": self.task,
            "action": self.action,
            "result": self.result,
            "reflection": self.reflection,
            "technologies": self.technologies or [],
            "metrics": self.metrics or [],
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
