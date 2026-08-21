from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
import os

from src.models.database import get_db
from src.services.job_service import JobService
from src.repositories.search_repository import SearchRepository

router = APIRouter()

class RAGQueryRequest(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None

    def get_prompt_text(self) -> str:
        return (self.query or self.question or "").strip()

@router.get("/api/v1/jobs/{search_id}")
def get_jobs(search_id: str, db: Session = Depends(get_db)):
    """
    Retrieve aggregated, ranked jobs for a search session.
    """
    search_repo = SearchRepository(db)
    search_record = search_repo.get_search_by_id(search_id)
    
    if not search_record:
        raise HTTPException(status_code=404, detail="Search session not found.")
        
    job_service = JobService(db)
    jobs = job_service.get_results(search_id)
    
    return {
        "search_id": search_id,
        "status": search_record.status,
        "total_found": search_record.total_found,
        "unique_count": search_record.unique_count,
        "jobs": jobs
    }

@router.post("/api/v1/jobs/{search_id}/query")
async def query_jobs(search_id: str, request: RAGQueryRequest, db: Session = Depends(get_db)):
    """
    Query the matching jobs database session using natural language (RAG).
    """
    query_text = request.get_prompt_text()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query or question field is required.")

    search_repo = SearchRepository(db)
    search_record = search_repo.get_search_by_id(search_id)
    
    if not search_record:
        raise HTTPException(status_code=404, detail="Search session not found.")
        
    job_service = JobService(db)
    answer = await job_service.query_jobs_rag(search_id, query_text)
    
    return {
        "search_id": search_id,
        "query": query_text,
        "answer": answer
    }

@router.get("/api/v1/jobs/{search_id}/export")
def export_jobs(search_id: str, db: Session = Depends(get_db)):
    """
    Generate and download the detailed job results CSV.
    """
    job_service = JobService(db)
    file_path = job_service.generate_jobs_csv(search_id)
    
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV generation failed or no results found.")
        
    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=f"job_matches_{search_id}.csv"
    )
