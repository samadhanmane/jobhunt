import json
import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from src.models.database import get_db
from src.services.linkedin_service import linkedin_service
from src.services.enrichment_service import lead_enricher
from src.llm.llm_client import get_llm
from src.llm.prompts.outreach import COLD_OUTREACH_SYSTEM_PROMPT

router = APIRouter()

class FindCompanyHRRequest(BaseModel):
    company: str
    role: Optional[str] = "Software Engineer"
    candidate_name: Optional[str] = "Candidate"
    candidate_skills: Optional[List[str]] = []
    limit: Optional[int] = 4

class FindCompanyTeamRequest(BaseModel):
    company: str
    role: Optional[str] = "Software Engineer"
    candidate_name: Optional[str] = "Candidate"
    candidate_skills: Optional[List[str]] = []
    hr_limit: Optional[int] = 4
    tech_limit: Optional[int] = 4

class ScrapeProfileRequest(BaseModel):
    profile_url: str

@router.get("/api/v1/recruiter/validate-cookie")
def validate_linkedin_cookie():
    """
    Checks if the configured LinkedIn li_at cookie is active and valid.
    """
    status = linkedin_service.validate_cookie()
    return status

@router.post("/api/v1/recruiter/scrape-profile")
async def scrape_linkedin_profile(request: ScrapeProfileRequest):
    """
    Scrapes a LinkedIn profile URL, extracts details and corporate emails
    via website scraping and SMTP verification.
    """
    if not request.profile_url:
        raise HTTPException(status_code=400, detail="Profile URL is required.")
        
    profile = await linkedin_service.scrape_profile_async(request.profile_url)
    if not profile:
        raise HTTPException(status_code=404, detail="Unable to extract profile information.")
        
    return {
        "status": "success",
        "profile": profile
    }

@router.post("/api/v1/recruiter/find-company-hr")
async def find_company_hr(request: FindCompanyHRRequest):
    """
    Discovers HR & Talent Acquisition professionals for a company, verifies their corporate emails
    via DNS/SMTP/website scraping, and drafts tailored AI cold outreach messages.
    """
    company = request.company.strip()
    if not company:
        raise HTTPException(status_code=400, detail="Company name is required.")

    # 1. Discover and enrich HR contacts
    recruiters = await linkedin_service.find_company_hr(company_name=company, limit=request.limit or 4)

    # 2. Generate personalized outreach messages for top recruiters via LLM
    llm = get_llm()
    enriched_with_outreach = []

    for r in recruiters:
        recruiter_item = r.copy()
        cand_skills_str = ", ".join(request.candidate_skills or ["Python", "Engineering"])
        prompt = f"""
Candidate Name: {request.candidate_name or 'Candidate'}
Target Role: {request.role or 'Software Engineer'}
Candidate Core Skills: {cand_skills_str}

Recruiter Details:
- Name: {r.get('full_name', 'Recruiting Team')}
- Title: {r.get('headline', 'Talent Acquisition')}
- Company: {company}
"""
        try:
            resp = await llm.ainvoke([
                {"role": "system", "content": COLD_OUTREACH_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ])
            raw_content = resp.content.strip()
            if "```json" in raw_content:
                raw_content = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                raw_content = raw_content.split("```")[1].split("```")[0].strip()

            outreach_data = json.loads(raw_content)
            recruiter_item["outreach_draft"] = {
                "email_subject": outreach_data.get("email_subject", f"Application for {request.role} at {company}"),
                "email_body": outreach_data.get("email_body", ""),
                "linkedin_note": outreach_data.get("linkedin_connection_note", "")
            }
        except Exception:
            recruiter_item["outreach_draft"] = {
                "email_subject": f"Application for {request.role} - {request.candidate_name}",
                "email_body": f"Hi {r.get('full_name', '').split()[0] if r.get('full_name') else 'there'},\n\nI noticed {company} is hiring for a {request.role} and wanted to reach out directly given my background in {cand_skills_str}.\n\nBest regards,\n{request.candidate_name}",
                "linkedin_note": f"Hi {r.get('full_name', '').split()[0] if r.get('full_name') else 'there'}, I'd love to connect regarding open {request.role} opportunities at {company}!"
            }

        enriched_with_outreach.append(recruiter_item)

    return {
        "status": "success",
        "company": company,
        "total_found": len(enriched_with_outreach),
        "recruiters": enriched_with_outreach
    }

@router.post("/api/v1/recruiter/find-company-team")
async def find_company_team(request: FindCompanyTeamRequest):
    """
    Discovers both HR/Recruiter AND Tech leadership contacts for a company.
    Verifies corporate emails via DNS/SMTP/website scraping and drafts AI cold outreach.
    Returns HR contacts (recruiters, talent acquisition) and tech contacts (eng managers, tech leads, CTOs).
    """
    company = request.company.strip()
    if not company:
        raise HTTPException(status_code=400, detail="Company name is required.")

    # 1. Discover both HR and tech contacts
    all_contacts = await linkedin_service.search_company_all_contacts(
        company_name=company,
        hr_limit=request.hr_limit or 4,
        tech_limit=request.tech_limit or 4
    )

    # 2. Generate outreach drafts for all contacts
    llm = get_llm()
    
    async def _add_outreach(contacts: List[Dict], contact_type: str) -> List[Dict]:
        enriched = []
        for r in contacts:
            item = r.copy()
            cand_skills_str = ", ".join(request.candidate_skills or ["Python", "Engineering"])
            prompt = f"""
Candidate Name: {request.candidate_name or 'Candidate'}
Target Role: {request.role or 'Software Engineer'}
Candidate Core Skills: {cand_skills_str}

{"Recruiter" if contact_type == "hr" else "Tech Lead"} Details:
- Name: {r.get('full_name', 'Team')}
- Title: {r.get('headline', '')}
- Company: {company}
"""
            try:
                resp = await llm.ainvoke([
                    {"role": "system", "content": COLD_OUTREACH_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ])
                raw_content = resp.content.strip()
                if "```json" in raw_content:
                    raw_content = raw_content.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_content:
                    raw_content = raw_content.split("```")[1].split("```")[0].strip()
                outreach_data = json.loads(raw_content)
                item["outreach_draft"] = {
                    "email_subject": outreach_data.get("email_subject", f"Application for {request.role} at {company}"),
                    "email_body": outreach_data.get("email_body", ""),
                    "linkedin_note": outreach_data.get("linkedin_connection_note", "")
                }
            except Exception:
                first_name = r.get('full_name', '').split()[0] if r.get('full_name') else 'there'
                item["outreach_draft"] = {
                    "email_subject": f"Application for {request.role} - {request.candidate_name}",
                    "email_body": f"Hi {first_name},\n\nI noticed {company} is hiring for a {request.role} and wanted to reach out directly given my background in {cand_skills_str}.\n\nBest regards,\n{request.candidate_name}",
                    "linkedin_note": f"Hi {first_name}, I'd love to connect regarding open {request.role} opportunities at {company}!"
                }
            enriched.append(item)
        return enriched

    hr_with_outreach = await _add_outreach(all_contacts["hr_contacts"], "hr")
    tech_with_outreach = await _add_outreach(all_contacts["tech_contacts"], "tech")

    return {
        "status": "success",
        "company": company,
        "hr_contacts": hr_with_outreach,
        "tech_contacts": tech_with_outreach,
        "total_hr": len(hr_with_outreach),
        "total_tech": len(tech_with_outreach),
        "total_contacts": len(hr_with_outreach) + len(tech_with_outreach)
    }
