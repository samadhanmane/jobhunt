import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.models.database import get_db
from src.models.user_account import UserAccount
from src.models.blacklist import BlacklistCompany
from src.models.story_bank import StoryBankEntry
from src.models.job import Job
from src.services.auth_service import get_current_user
from src.services.upskill_service import upskill_service
from src.services.repost_detector import repost_detector
from src.services.company_dossier_service import company_dossier_service
from src.services.funnel_analytics_service import funnel_analytics_service
from src.services.interview_prep_service import interview_prep_service
from src.services.document_generator_service import document_generator_service

router = APIRouter(prefix="/api/v1", tags=["Advanced Career-Ops Features"])

# --- Models ---
class SkillGapRequest(BaseModel):
    job_title: str
    job_company: str
    job_description: Optional[str] = ""
    candidate_skills: Optional[List[str]] = []

class BlacklistRequest(BaseModel):
    company_name: str
    reason: Optional[str] = "User preference"

class StoryBankRequest(BaseModel):
    id: Optional[str] = None
    title: str
    situation: str
    task: str
    action: str
    result: str
    reflection: Optional[str] = ""
    technologies: Optional[List[str]] = []
    metrics: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class InterviewPrepRequest(BaseModel):
    job_title: str
    job_company: str
    job_description: Optional[str] = ""

class CoverLetterRequest(BaseModel):
    job_title: str
    job_company: str
    job_location: Optional[str] = "Remote"
    job_description: Optional[str] = ""
    candidate_skills: Optional[List[str]] = []


# ==========================================
# Feature 1: Skill Gap & Upskill Heatmap
# ==========================================
@router.post("/jobs/skill-gap")
async def analyze_skill_gap(
    payload: SkillGapRequest,
    current_user: UserAccount = Depends(get_current_user)
):
    job_dict = {
        "title": payload.job_title,
        "company": payload.job_company,
        "description": payload.job_description,
        "matching_skills": [],
        "missing_skills": []
    }
    return upskill_service.analyze_job_skill_gap(job_dict, payload.candidate_skills or [])

@router.get("/analytics/skills-demand")
async def get_skills_demand(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    # Fetch recent jobs to calculate live market demand
    recent_jobs = db.query(Job).order_by(Job.created_at.desc()).limit(150).all()
    jobs_data = [{
        "matching_skills": j.matching_skills or [],
        "missing_skills": j.missing_skills or []
    } for j in recent_jobs]

    user_skills = []
    if current_user.synced_profile:
        try:
            prof = json.loads(current_user.synced_profile)
            user_skills = prof.get("skills", [])
        except Exception:
            pass

    return {
        "status": "success",
        "market_skill_heatmap": upskill_service.aggregate_market_skill_demand(jobs_data, user_skills)
    }


# ==========================================
# Feature 2: Ghost Job & Repost Status
# ==========================================
@router.get("/jobs/repost-status")
async def check_repost_status(
    company: str,
    title: str,
    url: Optional[str] = "",
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    return repost_detector.record_and_evaluate_repost(company, title, url, db)


# ==========================================
# Feature 3: Company Intelligence Dossier
# ==========================================
@router.get("/company/{company_name}/dossier")
async def get_company_dossier(
    company_name: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    applied_list = []
    if current_user.applied_jobs:
        try:
            applied_list = json.loads(current_user.applied_jobs)
        except Exception:
            pass

    dossier = company_dossier_service.get_company_dossier(company_name, db, applied_list)
    return {"status": "success", "dossier": dossier}


# ==========================================
# Feature 4: Company Blacklist Gate
# ==========================================
@router.get("/blacklist")
async def list_blacklist(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    items = db.query(BlacklistCompany).filter(BlacklistCompany.user_id == current_user.id).all()
    return {"status": "success", "blacklist": [item.to_dict() for item in items]}

@router.post("/blacklist")
async def add_to_blacklist(
    payload: BlacklistRequest,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    comp_clean = payload.company_name.strip()
    existing = db.query(BlacklistCompany).filter(
        BlacklistCompany.user_id == current_user.id,
        BlacklistCompany.company_name.ilike(comp_clean)
    ).first()

    if existing:
        return {"status": "already_exists", "item": existing.to_dict()}

    new_entry = BlacklistCompany(
        user_id=current_user.id,
        company_name=comp_clean,
        reason=payload.reason
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"status": "success", "item": new_entry.to_dict()}

@router.delete("/blacklist/{company_name}")
async def remove_from_blacklist(
    company_name: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    db.query(BlacklistCompany).filter(
        BlacklistCompany.user_id == current_user.id,
        BlacklistCompany.company_name.ilike(company_name.strip())
    ).delete(synchronize_session=False)
    db.commit()
    return {"status": "success", "message": f"{company_name} removed from blacklist."}


# ==========================================
# Feature 5: Pipeline Funnel Velocity Analytics
# ==========================================
@router.get("/analytics/pipeline")
async def get_pipeline_analytics(
    current_user: UserAccount = Depends(get_current_user)
):
    applied_list = []
    if current_user.applied_jobs:
        try:
            applied_list = json.loads(current_user.applied_jobs)
        except Exception:
            pass

    metrics = funnel_analytics_service.calculate_funnel_metrics(applied_list)
    return {"status": "success", "metrics": metrics}


# ==========================================
# Feature 6: STAR+R Interview Story Bank
# ==========================================
@router.get("/stories")
async def get_stories(
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    stories = db.query(StoryBankEntry).filter(StoryBankEntry.user_id == current_user.id).all()
    return {"status": "success", "stories": [s.to_dict() for s in stories]}

@router.post("/stories")
async def save_story(
    payload: StoryBankRequest,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    if payload.id:
        existing = db.query(StoryBankEntry).filter(
            StoryBankEntry.id == payload.id,
            StoryBankEntry.user_id == current_user.id
        ).first()
        if existing:
            existing.title = payload.title
            existing.situation = payload.situation
            existing.task = payload.task
            existing.action = payload.action
            existing.result = payload.result
            existing.reflection = payload.reflection
            existing.technologies = payload.technologies or []
            existing.metrics = payload.metrics or []
            existing.tags = payload.tags or []
            db.commit()
            db.refresh(existing)
            return {"status": "updated", "story": existing.to_dict()}

    new_story = StoryBankEntry(
        user_id=current_user.id,
        title=payload.title,
        situation=payload.situation,
        task=payload.task,
        action=payload.action,
        result=payload.result,
        reflection=payload.reflection,
        technologies=payload.technologies or [],
        metrics=payload.metrics or [],
        tags=payload.tags or []
    )
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
    return {"status": "created", "story": new_story.to_dict()}

@router.delete("/stories/{story_id}")
async def delete_story(
    story_id: str,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    db.query(StoryBankEntry).filter(
        StoryBankEntry.id == story_id,
        StoryBankEntry.user_id == current_user.id
    ).delete(synchronize_session=False)
    db.commit()
    return {"status": "success", "message": "Story removed."}

@router.post("/jobs/interview-prep")
async def get_interview_prep(
    payload: InterviewPrepRequest,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    stories = db.query(StoryBankEntry).filter(StoryBankEntry.user_id == current_user.id).all()
    stories_data = [s.to_dict() for s in stories]

    # Fallback starter stories if user hasn't added any yet
    if not stories_data:
        stories_data = [{
            "id": "starter_1",
            "title": "Agentic AI Multi-Agent Orchestration",
            "situation": "Needed an autonomous multi-agent pipeline to handle parallel ingestion and tool execution without race conditions.",
            "task": "Design and benchmark an asynchronous graph with human-in-the-loop validation.",
            "action": "Implemented LangGraph state machines, integrated Qdrant vector indexing, and wrote FastAPI streaming endpoints.",
            "result": "Cut pipeline latency by 42% and supported 500+ concurrent requests.",
            "technologies": ["Python", "LangGraph", "FastAPI", "Docker", "PyTorch"],
            "metrics": ["42% latency reduction", "500 concurrent req/s"]
        }]

    job_dict = {
        "title": payload.job_title,
        "company": payload.job_company,
        "description": payload.job_description
    }

    matched = interview_prep_service.match_stories_for_job(job_dict, stories_data)
    talking_points = interview_prep_service.generate_talking_points(job_dict, matched[0] if matched else stories_data[0])

    return {
        "status": "success",
        "matched_stories": matched[:3],
        "talking_points": talking_points
    }


# ==========================================
# Feature 7: 1-Click Tailored Cover Letter
# ==========================================
@router.post("/jobs/generate-cover-letter")
async def generate_cover_letter(
    payload: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: UserAccount = Depends(get_current_user)
):
    stories = db.query(StoryBankEntry).filter(StoryBankEntry.user_id == current_user.id).all()
    top_story = stories[0].to_dict() if stories else None

    job_dict = {
        "title": payload.job_title,
        "company": payload.job_company,
        "location": payload.job_location,
        "description": payload.job_description
    }

    user_name = "Candidate"
    if current_user.synced_profile:
        try:
            prof = json.loads(current_user.synced_profile)
            user_name = prof.get("name", "Candidate")
        except Exception:
            pass

    docs = document_generator_service.generate_tailored_cover_letter(
        job=job_dict,
        candidate_name=user_name,
        candidate_email=current_user.email,
        skills=payload.candidate_skills or [],
        story=top_story
    )

    return {"status": "success", **docs}
