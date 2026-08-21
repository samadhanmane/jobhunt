from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.models.database import get_db
from src.services.cache_service import cache_service

router = APIRouter()

@router.api_route("/health", methods=["GET", "HEAD"])
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {e}"
        
    cache_status = "healthy" if getattr(cache_service, "client", None) else "offline"
    
    return {
        "status": "ok",
        "database": db_status,
        "cache": cache_status
    }
