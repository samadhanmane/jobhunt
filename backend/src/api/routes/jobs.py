from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
import os, asyncio

from src.models.database import get_db
from src.services.job_service import JobService
from src.repositories.search_repository import SearchRepository

router = APIRouter()

class RAGQueryRequest(BaseModel):
    query: Optional[str] = None
    question: Optional[str] = None

    def get_prompt_text(self) -> str:
        return (self.query or self.question or "").strip()

class ScrapeLinksRequest(BaseModel):
    urls: List[str]
    resume_id: Optional[str] = None
    preferences: Optional[dict] = None

@router.post("/api/v1/jobs/scrape-links")
async def scrape_job_links(request: ScrapeLinksRequest, db: Session = Depends(get_db)):
    """
    Scrapes full page content on given job links using BeautifulSoup / JSON-LD,
    cleans HTML boilerplate, and passes to LLM for deep categorization and candidate match scoring.
    """
    cleaned_urls = [u.strip() for u in request.urls if u and u.strip()]
    if not cleaned_urls:
        raise HTTPException(status_code=400, detail="At least one valid job URL is required.")
        
    job_service = JobService(db)
    results = await job_service.scrape_and_enrich_links(
        urls=cleaned_urls,
        resume_id=request.resume_id,
        preferences=request.preferences or {}
    )
    return results


@router.get("/api/v1/jobs/{search_id}")
def get_jobs(search_id: str, db: Session = Depends(get_db)):
    """
    Retrieve live streaming aggregated, ranked jobs for a search session.
    """
    job_service = JobService(db)
    session_data = job_service.get_session_data(search_id)
    if session_data.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="Search session not found.")
    return session_data

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

class JobHRRequest(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    candidate_skills: Optional[List[str]] = []
    include_tech: Optional[bool] = True
    linkedin_cookie: Optional[str] = None

class InsightsCSVRequest(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    candidate_skills: Optional[List[str]] = []

@router.post("/api/v1/jobs/{job_id}/fetch-hr-contacts")
async def fetch_job_hr_contacts_endpoint(
    job_id: str,
    request: Optional[JobHRRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Discovers HR recruiters and tech leadership for a job's company,
    verifies their corporate emails via SMTP/DNS/website scraping,
    drafts tailored AI cold outreach messages, and saves contacts directly to the job listing.
    """
    job_service = JobService(db)
    cand_name = request.candidate_name if request else "Candidate"
    cand_skills = request.candidate_skills if request else []
    include_tech = request.include_tech if request else True
    custom_cookie = request.linkedin_cookie if request else None
    result = await job_service.fetch_job_hr_contacts(
        job_id=job_id,
        candidate_name=cand_name,
        candidate_skills=cand_skills,
        include_tech=include_tech,
        custom_cookie=custom_cookie
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("message"))
    return result

@router.post("/api/v1/jobs/{search_id}/export-insights")
async def export_company_insights(
    search_id: str,
    request: Optional[InsightsCSVRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Generates a comprehensive CSV with HR emails, tech lead emails, phone numbers,
    company insights, key requirements, and all enrichment data.
    Auto-fetches HR/tech contacts for any job that doesn't have them.
    """
    job_service = JobService(db)
    cand_name = request.candidate_name if request else "Candidate"
    cand_skills = request.candidate_skills if request else []
    file_path = await job_service.generate_company_insights_csv(
        search_id=search_id,
        candidate_name=cand_name,
        candidate_skills=cand_skills
    )

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Insights CSV generation failed or no results found.")

    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=f"company_insights_{search_id}.csv"
    )

