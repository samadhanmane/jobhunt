import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from src.models.database import Base

class BlacklistCompany(Base):
    """
    SQLAlchemy model for user-defined company blacklist (career-ops blacklist gate).
    Excludes blacklisted companies from search results and automated email digests.
    """
    __tablename__ = "blacklist_companies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    reason = Column(String(500), nullable=True, default="User preference")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "company_name": self.company_name,
            "reason": self.reason,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
