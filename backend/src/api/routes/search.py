import json
import os
import shutil
import uuid
import asyncio
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from src.models.database import get_db
from src.models.user import UserProfile
from src.models.search_history import SearchHistory
from src.repositories.user_repository import UserRepository
from src.repositories.search_repository import SearchRepository
from src.services.resume_parser import ResumeParserService
from src.services.job_service import JobService

router = APIRouter()
resume_parser = ResumeParserService()

@router.post("/api/v1/search/parse-resume")
async def parse_resume_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Extracts skills, seniority, experience, and domain from an uploaded resume.
    """
    temp_dir = "temp_resumes"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        parsed_resume = await resume_parser.parse_resume(temp_path)
        return {
            "status": "success",
            "profile": parsed_resume
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@router.post("/api/v1/search")
async def search_jobs(
    resume: Optional[UploadFile] = File(None),
    resume_profile: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    experience_years: Optional[float] = Form(None),
    remote_preference: Optional[str] = Form(None),
    max_age_days: Optional[int] = Form(None),
    source_platform: Optional[str] = Form(None),
    sub_domain: Optional[str] = Form(None),
    experience_tier: Optional[str] = Form(None),
    work_mode: Optional[str] = Form(None),
    ai_facets: Optional[str] = Form(None),
    stipend_range: Optional[str] = Form(None),
    posted_within: Optional[str] = Form(None),
    preferences: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Executes search pipeline: Orchestrates parallel multi-platform harvesting,
    deduplication, AI ranking, and stores results based on pre-harvest criteria.
    """
    temp_path = None
    parsed_resume = {}

    if resume_profile:
        try:
            parsed_json = json.loads(resume_profile)
            if parsed_json and isinstance(parsed_json, dict):
                parsed_resume = parsed_json
        except Exception:
            pass
    
    # 1. Parse Preferences
    pref_dict = {}
    if preferences:
        try:
            pref_dict = json.loads(preferences)
        except Exception:
            pass
            
    # Merge direct form fields if provided
    if role:
        pref_dict["role"] = role.strip()
    if location is not None:
        pref_dict["location"] = location.strip()
    if experience_level:
        exp_lvl = experience_level.strip().lower()
        pref_dict["experience_level"] = exp_lvl
        if exp_lvl == "intern":
            pref_dict["experience_years"] = 0.0
        elif exp_lvl == "entry":
            pref_dict["experience_years"] = 1.0
        elif exp_lvl == "junior":
            pref_dict["experience_years"] = 2.0
        elif exp_lvl == "mid":
            pref_dict["experience_years"] = 4.0
        elif exp_lvl == "senior":
            pref_dict["experience_years"] = 6.0
        elif exp_lvl in ["lead", "principal", "staff"]:
            pref_dict["experience_years"] = 8.0
        elif exp_lvl in ["all", "any"]:
            pref_dict["experience_years"] = None
        else:
            pref_dict["experience_years"] = None
    elif experience_years is not None:
        pref_dict["experience_years"] = experience_years
    if remote_preference:
        pref_dict["remote_preference"] = remote_preference.strip()
    if max_age_days is not None:
        pref_dict["max_age_days"] = max_age_days
    if sub_domain:
        pref_dict["sub_domain"] = sub_domain.strip()
    if experience_tier:
        pref_dict["experience_tier"] = experience_tier.strip()
    if work_mode:
        pref_dict["work_mode"] = work_mode.strip()
        pref_dict["remote_preference"] = work_mode.strip()
    if stipend_range:
        pref_dict["stipend_range"] = stipend_range.strip()
    if posted_within:
        pref_dict["posted_within"] = posted_within.strip()
    if ai_facets:
        try:
            pref_dict["ai_facets"] = json.loads(ai_facets) if isinstance(ai_facets, str) and ai_facets.startswith('[') else [f.strip() for f in ai_facets.split(',')]
        except Exception:
            pref_dict["ai_facets"] = [ai_facets.strip()]
    if source_platform:
        pref_dict["source_platform"] = source_platform.strip().lower()

    if not pref_dict.get("role"):
        pref_dict["role"] = "Software Engineer"
    if "location" not in pref_dict:
        pref_dict["location"] = "Remote"

    # 2. Handle uploaded resume if present
    if resume and resume.filename:
        temp_dir = "temp_resumes"
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, f"{uuid.uuid4()}_{resume.filename}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
            
    try:
        user_id = None
        if temp_path:
            parsed_resume = await resume_parser.parse_resume(temp_path)

        if parsed_resume and (parsed_resume.get("skills") or parsed_resume.get("raw_text")):
            user_id = str(uuid.uuid4())
            user_repo = UserRepository(db)
            profile = UserProfile(
                id=user_id,
                resume_text=parsed_resume.get("raw_text", ""),
                resume_skills=parsed_resume.get("skills", []),
                resume_experience={
                    "experience_years": parsed_resume.get("experience_years", 0.0),
                    "seniority": parsed_resume.get("seniority", "Mid"),
                    "current_role": parsed_resume.get("current_or_recent_role", ""),
                    "core_domain": parsed_resume.get("core_domain", ""),
                    "keywords": parsed_resume.get("keywords", []),
                    "summary": parsed_resume.get("summary", "")
                },
                resume_roles=parsed_resume.get("target_roles", []),
                preferences=pref_dict
            )
            user_repo.save_profile(profile)

        # 3. Execute Search Pipeline synchronously for immediate results
        job_service = JobService(db)
        search_id = str(uuid.uuid4())
        results = await job_service.search_jobs(user_id, pref_dict, search_id=search_id)
        
        return {
            "status": "success",
            "search_id": search_id,
            "total_found": results.get("total_found", 0),
            "unique_count": results.get("unique_count", 0),
            "jobs": results.get("jobs", []),
            "unique_jobs": results.get("unique_jobs", []),
            "raw_jobs": results.get("raw_jobs", []),
            "all_jobs": results.get("all_jobs", [])
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
