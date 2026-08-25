from sqlalchemy.orm import Session
from src.models.search_history import SearchHistory
from src.models.database import SessionLocal
from typing import Optional

class SearchRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_search(self, search: SearchHistory) -> SearchHistory:
        try:
            self.db.merge(search)
            self.db.commit()
            return search
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            try:
                with SessionLocal() as fresh_db:
                    fresh_db.merge(search)
                    fresh_db.commit()
            except Exception as e:
                print(f"Notice: Secondary create_search notice: {e}")
            return search

    def update_search_status(self, search_id: str, status: str, total_found: int = 0, unique_count: int = 0) -> Optional[SearchHistory]:
        try:
            search = self.db.query(SearchHistory).filter(SearchHistory.search_id == search_id).first()
            if search:
                search.status = status
                if total_found:
                    search.total_found = total_found
                if unique_count:
                    search.unique_count = unique_count
                self.db.commit()
                self.db.refresh(search)
            return search
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            try:
                with SessionLocal() as fresh_db:
                    search = fresh_db.query(SearchHistory).filter(SearchHistory.search_id == search_id).first()
                    if search:
                        search.status = status
                        if total_found:
                            search.total_found = total_found
                        if unique_count:
                            search.unique_count = unique_count
                        fresh_db.commit()
                    return search
            except Exception as e:
                print(f"Notice: Secondary update_search_status notice: {e}")
                return None

    def get_search_by_id(self, search_id: str) -> Optional[SearchHistory]:
        try:
            return self.db.query(SearchHistory).filter(SearchHistory.search_id == search_id).first()
        except Exception:
            try:
                self.db.rollback()
            except Exception:
                pass
            try:
                with SessionLocal() as fresh_db:
                    return fresh_db.query(SearchHistory).filter(SearchHistory.search_id == search_id).first()
            except Exception:
                return None
