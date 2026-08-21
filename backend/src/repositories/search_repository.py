from sqlalchemy.orm import Session
from src.models.search_history import SearchHistory
from typing import Optional

class SearchRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_search(self, search: SearchHistory) -> SearchHistory:
        self.db.merge(search)
        self.db.commit()
        return search

    def update_search_status(self, search_id: str, status: str, total_found: int = 0, unique_count: int = 0) -> Optional[SearchHistory]:
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

    def get_search_by_id(self, search_id: str) -> Optional[SearchHistory]:
        return self.db.query(SearchHistory).filter(SearchHistory.search_id == search_id).first()
