from sqlalchemy.orm import Session
from src.models.user import UserProfile
from typing import Optional

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_profile(self, profile: UserProfile) -> UserProfile:
        self.db.merge(profile)
        self.db.commit()
        return profile

    def get_profile(self, user_id: str) -> Optional[UserProfile]:
        return self.db.query(UserProfile).filter(UserProfile.id == user_id).first()
