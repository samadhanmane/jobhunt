import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from src.models.database import Base

class UserAccount(Base):
    """
    User account model for JWT authentication, role-based access, and per-user LinkedIn cookie settings.
    """
    __tablename__ = "user_accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="user", nullable=False)  # 'admin' or 'user'
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Per-User LinkedIn Cookie Settings
    linkedin_cookie = Column(Text, nullable=True)
    linkedin_cookie_status = Column(String(50), default="unconfigured", nullable=False)  # 'active', 'expired', 'invalid', 'unconfigured'
    linkedin_cookie_checked_at = Column(DateTime, nullable=True)
    linkedin_cookie_last_notified_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "has_linkedin_cookie": bool(self.linkedin_cookie and len(self.linkedin_cookie.strip()) > 5),
            "linkedin_cookie_status": self.linkedin_cookie_status or ("active" if self.linkedin_cookie else "unconfigured"),
            "linkedin_cookie_checked_at": self.linkedin_cookie_checked_at.isoformat() if self.linkedin_cookie_checked_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
