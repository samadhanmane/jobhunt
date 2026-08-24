import os
import uuid
import datetime
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sklearn.metrics.pairwise import cosine_similarity

from src.config import settings
from src.agents.orchestrator import OrchestratorAgent
from src.agents.deduplication import DeduplicationAgent
from src.agents.ranking import RankingAgent
from src.agents.enrichment import EnrichmentAgent
from src.services.scraper_service import scraper_service
from src.repositories.job_repository import JobRepository
from src.repositories.search_repository import SearchRepository
from src.repositories.user_repository import UserRepository
from src.models.job import Job
from src.models.search_history import SearchHistory
from src.models.user import UserProfile
from src.llm.embeddings import embedding_client
from src.llm.llm_client import get_llm
from src.services.vector_service import vector_service
from src.utils.date_utils import format_posted_date_for_csv

class JobService:
    def __init__(self, db: Session):
        self.db = db
        self.job_repo = JobRepository(db)
        self.search_repo = SearchRepository(db)
        self.user_repo = UserRepository(db)
        
        self.orchestrator = OrchestratorAgent()
        self.deduplicator = DeduplicationAgent()
        self.ranker = RankingAgent()
        self.enricher = EnrichmentAgent()
        self.scraper = scraper_service
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = get_llm()
        return self._llm

    async def scrape_and_enrich_links(
        self,
        urls: List[str],
        resume_id: Optional[str] = None,
        preferences: Optional[dict] = None,
        search_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Scrapes content from provided URLs using BeautifulSoup / JSON-LD,
        cleans and passes text to LLM for rich taxonomy categorization and match scoring,
        and saves results to the database and vector index.
        """
        if not search_id:
            search_id = str(uuid.uuid4())
        
        pref_dict = preferences or {}
        user_profile = self.user_repo.get_profile(resume_id) if resume_id else None
        
        if user_profile and user_profile.resume_skills:
            candidate_profile = {
                "core_domain": user_profile.resume_experience.get("core_domain", "") if user_profile.resume_experience else "",
                "skills": user_profile.resume_skills or [],
                "top_technologies": (user_profile.resume_skills or [])[:8],
                "experience_years": user_profile.resume_experience.get("experience_years", pref_dict.get("experience_years", 0)) if user_profile.resume_experience else pref_dict.get("experience_years", 0),
                "seniority": user_profile.resume_experience.get("seniority", "Mid") if user_profile.resume_experience else "Mid",
                "current_or_recent_role": user_profile.resume_experience.get("current_role", "") if user_profile.resume_experience else "",
                "target_roles": user_profile.resume_roles or [pref_dict.get("role", "Software Engineer")],
                "keywords": user_profile.resume_experience.get("keywords", []) if user_profile.resume_experience else [],
                "summary": user_profile.resume_experience.get("summary", "") if user_profile.resume_experience else ""
            }
        else:
            pref_role = pref_dict.get("role", "Software Engineer")
            candidate_profile = {
                "skills": [s.strip() for s in pref_role.split() if len(s.strip()) > 2],
                "top_technologies": [],
                "experience_years": float(pref_dict.get("experience_years", 0) or 0),
                "seniority": "Senior" if float(pref_dict.get("experience_years", 0) or 0) >= 5 else "Mid",
                "current_or_recent_role": pref_role,
                "target_roles": [pref_role],
                "summary": f"Professional with {pref_dict.get('experience_years', 0)} years of experience in {pref_role}."
            }

        # Create SearchHistory tracking record
        search_history = SearchHistory(
            search_id=search_id,
            role=pref_dict.get("role", "Custom Job Links"),
            location=pref_dict.get("location", "Various"),
            preferences={"urls": urls, **pref_dict},
            status="processing"
        )
        self.search_repo.create_search(search_history)

        try:
            # 1. Scrape and clean raw HTML / JSON-LD
            scraped_items = await self.scraper.scrape_multiple_urls(urls)
            
            # 2. Enrich and categorize with LLM
            enriched_jobs = await self.enricher.enrich_batch(
                scraped_items=scraped_items,
                candidate_profile=candidate_profile,
                preferences=pref_dict
            )

            # Sort enriched jobs by match score descending
            enriched_jobs.sort(key=lambda x: float(x.get("match_score", 0.0)), reverse=True)

            # 3. Generate embeddings
            texts = [f"{j.get('title', '')} {j.get('company', '')} {j.get('description', '')}"[:1000] for j in enriched_jobs]
            embeddings = embedding_client.get_embeddings(texts) if texts else []

            # 4. Save to Database
            db_jobs = []
            for idx, j in enumerate(enriched_jobs):
                emb = embeddings[idx] if idx < len(embeddings) else [0.0] * 384
                raw_date = j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)
                if formatted_date == "N/A":
                    formatted_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")

                db_job = Job(
                    id=str(uuid.uuid4()),
                    title=j.get("title", "Unknown Role"),
                    company=j.get("company", "Unknown Company"),
                    location=j.get("location", "Remote"),
                    description=j.get("description", ""),
                    url=j.get("url", ""),
                    source=j.get("source", "web_link"),
                    posted_date=formatted_date,
                    salary_range=j.get("salary_range"),
                    match_score=float(j.get("match_score", 0.0)),
                    match_reason=j.get("match_reason", ""),
                    matching_skills=j.get("matching_skills", []),
                    missing_skills=j.get("missing_skills", []),
                    experience_fit=j.get("experience_fit", "Good Fit"),
                    company_insights=j.get("company_insights"),
                    key_requirements=j.get("key_requirements", ""),
                    search_id=search_id,
                    embedding=emb
                )
                db_jobs.append(db_job)

            if db_jobs:
                self.job_repo.add_jobs(db_jobs)

            # 5. Upsert to Pinecone
            try:
                pinecone_payload = [{
                    "id": db_j.id,
                    "title": db_j.title,
                    "company": db_j.company,
                    "location": db_j.location,
                    "match_score": db_j.match_score,
                    "posted_date": db_j.posted_date,
                    "url": db_j.url,
                    "embedding": db_j.embedding
                } for db_j in db_jobs]
                vector_service.upsert_job_vectors(search_id, pinecone_payload)
            except Exception as e:
                print(f"Pinecone vector indexing note: {e}")

            # Update search record
            self.search_repo.update_search_status(search_id, "completed", len(urls), len(db_jobs))

            return {
                "search_id": search_id,
                "total_found": len(urls),
                "unique_count": len(db_jobs),
                "status": "completed",
                "jobs": self.get_results(search_id)
            }

        except Exception as e:
            print(f"Error scraping & enriching links: {e}")
            self.search_repo.update_search_status(search_id, "failed")
            raise e


    async def search_jobs(self, resume_id: Optional[str], preferences: dict, search_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute full search pipeline: Orchestrate -> Parallel Scrape -> Deduplicate -> Deep Rank -> Save.
        """
        if not search_id:
            search_id = str(uuid.uuid4())
        
        # 1. Build Candidate Profile from parsed resume or preferences
        user_profile = self.user_repo.get_profile(resume_id) if resume_id else None
        
        if user_profile and user_profile.resume_skills:
            candidate_profile = {
                "core_domain": user_profile.resume_experience.get("core_domain", "") if user_profile.resume_experience else "",
                "skills": user_profile.resume_skills or [],
                "top_technologies": (user_profile.resume_skills or [])[:8],
                "experience_years": user_profile.resume_experience.get("experience_years", preferences.get("experience_years", 0)) if user_profile.resume_experience else preferences.get("experience_years", 0),
                "seniority": user_profile.resume_experience.get("seniority", "Mid") if user_profile.resume_experience else "Mid",
                "current_or_recent_role": user_profile.resume_experience.get("current_role", "") if user_profile.resume_experience else "",
                "target_roles": user_profile.resume_roles or [preferences.get("role", "Software Engineer")],
                "keywords": user_profile.resume_experience.get("keywords", []) if user_profile.resume_experience else [],
                "summary": user_profile.resume_experience.get("summary", "") if user_profile.resume_experience else ""
            }
        else:
            # Construct candidate profile from user input preferences
            pref_role = preferences.get("role", "Software Engineer")
            candidate_profile = {
                "skills": [s.strip() for s in pref_role.split() if len(s.strip()) > 2],
                "top_technologies": [],
                "experience_years": float(preferences.get("experience_years", 0) or 0),
                "seniority": "Senior" if float(preferences.get("experience_years", 0) or 0) >= 5 else "Mid",
                "current_or_recent_role": pref_role,
                "target_roles": [pref_role],
                "summary": f"Professional with {preferences.get('experience_years', 0)} years of experience in {pref_role}."
            }
        
        # Create SearchHistory record
        search_history = SearchHistory(
            search_id=search_id,
            role=preferences.get("role", "Software Engineer"),
            location=preferences.get("location", "Remote"),
            preferences=preferences,
            status="processing"
        )
        self.search_repo.create_search(search_history)
        
        try:
            # 2. Scrape raw jobs via LLM query planner + parallel multi-platform fetching
            raw_jobs = await self.orchestrator.orchestrate_search(candidate_profile, preferences)
            total_found = len(raw_jobs)
            
            # 3. Deduplicate using exact hashing & cosine similarity
            unique_jobs = await self.deduplicator.deduplicate(raw_jobs)
            unique_count = len(unique_jobs)
            
            # 4. Rank with candidate profile, skill match, gap analysis, and reason
            ranked_jobs = await self.ranker.rank_jobs(unique_jobs, candidate_profile, preferences)
            
            # 5. Batch generate embeddings for top 40 best matched jobs (prevents event loop database locking)
            top_ranked_jobs = ranked_jobs[:40]
            texts = [f"{j.get('title', '')} {j.get('company', '')} {j.get('description', '')}"[:1000] for j in top_ranked_jobs]
            embeddings = embedding_client.get_embeddings(texts)

            db_jobs = []
            for idx, j in enumerate(top_ranked_jobs):
                emb = embeddings[idx] if idx < len(embeddings) else [0.0] * 384
                
                # Format posted_date cleanly to YYYY-MM-DD or N/A
                raw_date = j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)
                if formatted_date == "N/A":
                    formatted_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
                
                db_job = Job(
                    id=str(uuid.uuid4()),
                    title=j.get("title", "Unknown Role"),
                    company=j.get("company", "Unknown Company"),
                    location=j.get("location", "Remote"),
                    description=j.get("description", ""),
                    url=j.get("url", ""),
                    source=j.get("source", "unknown"),
                    posted_date=formatted_date,
                    salary_range=j.get("salary_range"),
                    match_score=float(j.get("match_score", 0.0)),
                    match_reason=j.get("match_reason", ""),
                    matching_skills=j.get("matching_skills", []),
                    missing_skills=j.get("missing_skills", []),
                    experience_fit=j.get("experience_fit", "Good Fit"),
                    company_insights=j.get("company_insights"),
                    key_requirements=j.get("key_requirements", ""),
                    search_id=search_id,
                    embedding=emb
                )
                db_jobs.append(db_job)
                
            self.job_repo.add_jobs(db_jobs)
            
            # Upsert vectors to Pinecone Cloud
            try:
                pinecone_payload = [{
                    "id": db_j.id,
                    "title": db_j.title,
                    "company": db_j.company,
                    "location": db_j.location,
                    "match_score": db_j.match_score,
                    "posted_date": db_j.posted_date,
                    "url": db_j.url,
                    "embedding": db_j.embedding
                } for db_j in db_jobs]
                vector_service.upsert_job_vectors(search_id, pinecone_payload)
            except Exception as e:
                print(f"Pinecone indexing notice: {e}")
            
            # Update search history status
            self.search_repo.update_search_status(search_id, "completed", total_found, unique_count)
            
            # Format all unique deduplicated jobs for the "All Harvested Jobs" view
            from src.utils.text_cleaner import extract_job_experience_metadata
            all_unique_payload = []
            for raw_j in unique_jobs:
                raw_title = raw_j.get("title", "Unknown Role")
                raw_desc = raw_j.get("description", "")
                raw_exp = extract_job_experience_metadata(raw_title, raw_desc, raw_j.get("experience_fit", ""))
                
                raw_date = raw_j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)
                if formatted_date == "N/A":
                    formatted_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
                    
                all_unique_payload.append({
                    "id": str(uuid.uuid4()),
                    "title": raw_title,
                    "company": raw_j.get("company", "Unknown Company"),
                    "location": raw_j.get("location", "Remote"),
                    "description": raw_desc,
                    "url": raw_j.get("url", ""),
                    "source": raw_j.get("source", "unknown"),
                    "posted_date": formatted_date,
                    "salary_range": raw_j.get("salary_range"),
                    "match_score": float(raw_j.get("match_score", 50.0)),
                    "match_reason": raw_j.get("match_reason", "Discovered across job boards."),
                    "matching_skills": raw_j.get("matching_skills", []),
                    "missing_skills": raw_j.get("missing_skills", []),
                    "experience_fit": raw_j.get("experience_fit", "Standard Fit"),
                    "experience_required": raw_exp["experience_required"],
                    "min_experience_years": raw_exp["min_experience_years"],
                    "seniority_level": raw_exp["seniority_level"],
                    "key_requirements": raw_j.get("key_requirements", ""),
                    "company_insights": raw_j.get("company_insights") or {},
                    "hr_contacts": [],
                    "tech_contacts": []
                })

            # Format all raw harvested jobs (without deduplication)
            all_raw_payload = []
            for raw_j in raw_jobs:
                raw_title = raw_j.get("title", "Unknown Role")
                raw_desc = raw_j.get("description", "")
                raw_exp = extract_job_experience_metadata(raw_title, raw_desc, raw_j.get("experience_fit", ""))
                
                raw_date = raw_j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)
                if formatted_date == "N/A":
                    formatted_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
                    
                all_raw_payload.append({
                    "id": str(uuid.uuid4()),
                    "title": raw_title,
                    "company": raw_j.get("company", "Unknown Company"),
                    "location": raw_j.get("location", "Remote"),
                    "description": raw_desc,
                    "url": raw_j.get("url", ""),
                    "source": raw_j.get("source", "unknown"),
                    "posted_date": formatted_date,
                    "salary_range": raw_j.get("salary_range"),
                    "match_score": float(raw_j.get("match_score", 50.0)),
                    "match_reason": raw_j.get("match_reason", "Raw job board listing."),
                    "matching_skills": raw_j.get("matching_skills", []),
                    "missing_skills": raw_j.get("missing_skills", []),
                    "experience_fit": raw_j.get("experience_fit", "Standard Fit"),
                    "experience_required": raw_exp["experience_required"],
                    "min_experience_years": raw_exp["min_experience_years"],
                    "seniority_level": raw_exp["seniority_level"],
                    "key_requirements": raw_j.get("key_requirements", ""),
                    "company_insights": raw_j.get("company_insights") or {},
                    "hr_contacts": [],
                    "tech_contacts": []
                })

            return {
                "search_id": search_id,
                "total_found": total_found,
                "unique_count": unique_count,
                "status": "completed",
                "jobs": self.get_results(search_id),
                "unique_jobs": all_unique_payload,
                "raw_jobs": all_raw_payload,
                "all_jobs": all_unique_payload
            }
            
        except Exception as e:
            print(f"Error executing job search pipeline: {e}")
            self.search_repo.update_search_status(search_id, "failed")
            raise e

    def get_results(self, search_id: str) -> List[Dict[str, Any]]:
        from src.utils.text_cleaner import extract_job_experience_metadata
        jobs = self.job_repo.get_jobs_by_search_id(search_id)
        results = []
        for j in jobs:
            exp_meta = extract_job_experience_metadata(j.title, j.description or "", j.experience_fit or "")
            results.append({
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "description": j.description,
                "url": j.url,
                "source": j.source,
                "posted_date": j.posted_date,
                "salary_range": j.salary_range,
                "match_score": j.match_score,
                "match_reason": j.match_reason,
                "matching_skills": j.matching_skills or [],
                "missing_skills": j.missing_skills or [],
                "experience_fit": j.experience_fit or "Good Fit",
                "experience_required": exp_meta["experience_required"],
                "min_experience_years": exp_meta["min_experience_years"],
                "seniority_level": exp_meta["seniority_level"],
                "key_requirements": j.key_requirements or "",
                "company_insights": j.company_insights or {},
                "hr_contacts": j.hr_contacts or [],
                "tech_contacts": j.tech_contacts or []
            })
        return results

    async def fetch_job_hr_contacts(
        self,
        job_id: str,
        candidate_name: Optional[str] = "Candidate",
        candidate_skills: Optional[List[str]] = None,
        include_tech: bool = True,
        custom_cookie: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Discovers HR recruiters and tech leadership for the job's company,
        verifies their corporate emails via SMTP/DNS website scraping,
        drafts tailored cold outreach messages, and saves contacts to the job record.
        """
        from src.services.linkedin_service import linkedin_service
        from src.llm.prompts.outreach import COLD_OUTREACH_SYSTEM_PROMPT
        import json

        job = self.db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"status": "error", "message": f"Job ID {job_id} not found."}

        # Check if already cached
        if job.hr_contacts and (not include_tech or job.tech_contacts):
            return {
                "status": "success",
                "job_id": job_id,
                "company": job.company,
                "cached": True,
                "cookie_expired": False,
                "hr_contacts": job.hr_contacts or [],
                "tech_contacts": job.tech_contacts or []
            }

        # Discover & verify all contacts
        cookie_expired = False
        if include_tech:
            all_contacts = await linkedin_service.search_company_all_contacts(
                job.company, hr_limit=4, tech_limit=4, custom_cookie=custom_cookie
            )
            hr_profiles = all_contacts["hr_contacts"]
            tech_profiles = all_contacts["tech_contacts"]
            cookie_expired = all_contacts.get("cookie_expired", False)
        else:
            hr_profiles = await linkedin_service.find_company_hr(job.company, limit=4, custom_cookie=custom_cookie)
            tech_profiles = []

        cand_skills = candidate_skills or job.matching_skills or []
        skills_str = ", ".join(cand_skills) if cand_skills else "Software Engineering"

        # Generate outreach drafts for all contacts
        async def _draft_outreach(contacts_list: List[Dict]) -> List[Dict]:
            enriched = []
            for r in contacts_list:
                item = r.copy()
                prompt = f"""
Candidate Name: {candidate_name or 'Candidate'}
Target Role: {job.title}
Candidate Core Skills: {skills_str}

Recruiter Details:
- Name: {r.get('full_name', 'Talent Team')}
- Title: {r.get('headline', 'Recruiter')}
- Company: {job.company}
"""
                try:
                    resp = await self.llm.ainvoke([
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
                        "email_subject": outreach_data.get("email_subject", f"Application for {job.title} - {candidate_name}"),
                        "email_body": outreach_data.get("email_body", ""),
                        "linkedin_note": outreach_data.get("linkedin_connection_note", "")
                    }
                except Exception:
                    rec_name = r.get('full_name', '').split()[0] if r.get('full_name') else 'there'
                    item["outreach_draft"] = {
                        "email_subject": f"Application for {job.title} - {candidate_name}",
                        "email_body": f"Hi {rec_name},\n\nI noticed {job.company} is hiring for a {job.title} and wanted to reach out directly given my background in {skills_str}.\n\nBest regards,\n{candidate_name}",
                        "linkedin_note": f"Hi {rec_name}, I'd love to connect regarding open {job.title} opportunities at {job.company}!"
                    }
                enriched.append(item)
            return enriched

        enriched_hr = await _draft_outreach(hr_profiles)
        enriched_tech = await _draft_outreach(tech_profiles)

        # Save to database (safely wrapped)
        try:
            job.hr_contacts = enriched_hr
            job.tech_contacts = enriched_tech
            self.db.commit()
        except Exception as db_err:
            try:
                self.db.rollback()
            except Exception:
                pass

        return {
            "status": "success",
            "job_id": job_id,
            "company": job.company,
            "cached": False,
            "cookie_expired": cookie_expired,
            "hr_contacts": enriched_hr,
            "tech_contacts": enriched_tech
        }


    async def query_jobs_rag(self, search_id: str, query_text: str) -> str:
        """
        Answers a user query about search results using local vector RAG and rich metadata filtering.
        """
        jobs = self.job_repo.get_jobs_by_search_id(search_id)
        if not jobs:
            return "No jobs found for this search session."
            
        query_emb = embedding_client.get_embedding(query_text)
        
        similarities = []
        for j in jobs:
            if j.embedding:
                try:
                    sim = cosine_similarity([query_emb], [j.embedding])[0][0]
                    similarities.append((sim, j))
                except Exception:
                    similarities.append((0.0, j))
            else:
                similarities.append((0.0, j))
                
        similarities.sort(key=lambda x: x[0], reverse=True)
        # Select top 30 relevant jobs to give the LLM broad visibility for filtering queries
        top_matches = [item[1] for item in similarities[:30]]
        
        context = ""
        for idx, j in enumerate(top_matches):
            skills_str = ", ".join(j.matching_skills or [])
            context += (
                f"[{idx+1}] {j.title}\n"
                f"  - Company: {j.company}\n"
                f"  - Location: {j.location}\n"
                f"  - Posted Date: {j.posted_date}\n"
                f"  - Match Score: {j.match_score}%\n"
                f"  - Experience Fit: {j.experience_fit}\n"
                f"  - Skills: {skills_str}\n"
                f"  - URL: {j.url}\n"
                f"  - Summary: {(j.description or '')[:250]}\n\n"
            )
            
        prompt = f"""
You are an elite AI technical recruiter and career advisor. Analyze the retrieved job dataset and provide a high-precision, comprehensive answer tailored to the user's query.

CORE INSTRUCTIONS & STRICT FILTER RULES:
1. STRICT SENIORITY ALIGNMENT:
   - If the user asks for "internship", "intern", "trainee", or "fresher", ONLY include roles that are explicitly Internship/Trainee positions (e.g. "AI Intern", "Machine Learning Intern", "Research Scientist Intern").
   - NEVER include or recommend "Sr. Engineer", "Senior Data Scientist", "Staff", "Lead", or experienced roles as internships.
   - If a role is Senior or Staff, it is STRICTLY DISQUALIFIED from internship queries.

2. STRICT LOCATION VERIFICATION:
   - If the user specifies a location (e.g. "Pune, India"), inspect the Location field of every job carefully.
   - ONLY list jobs that physically match that city/region under that specific location heading.
   - If no physical vacancies exist in that city in the current dataset, explicitly state: "No internships strictly located in [City] were found in the current listings." Then, clearly present verified Remote opportunities as alternatives under a separate heading.

3. STRUCTURED & POLISHED RESPONSE FORMAT:
   - Use clear markdown sections with bold company names, role titles, and direct markdown links: [Apply Here](url).
   - Format:
     - **[Company Name]** — **[Job Title]**
       - 📍 Location: [Location]
       - 📅 Posted Date: [Posted Date]
       - 🎯 Match Score: [Score]% | [Experience Fit]
       - 🛠️ Key Skills: [Matching Skills]
       - 🔗 Link: [Apply Here](URL)
   - Add a brief "💡 Recruiter Tip" at the end highlighting 1-2 skills the candidate should showcase on their resume for these specific openings.

Retrieved Job Listings Context:
{context}

User Query:
{query_text}
"""
        # Check if the user query is an instruction to set up an email alert or automation
        query_lower = query_text.lower()
        if any(w in query_lower for w in ["email alert", "send email", "daily email", "automate", "send me email", "notify me", "schedule email"]):
            import re
            from src.models.email_alert import EmailAlert
            email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", query_text)
            
            if email_match:
                extracted_email = email_match.group(0).lower()
                role_extracted = "AI / Machine Learning Intern" if "intern" in query_lower else "Machine Learning Engineer"
                time_match = re.search(r"(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)", query_lower)
                pref_time = "09:00"
                if time_match:
                    raw_time = time_match.group(1).replace(" ", "")
                    if "pm" in raw_time:
                        h = int(re.sub(r"\D", "", raw_time.split(":")[0]))
                        pref_time = f"{h+12 if h < 12 else 12}:00"
                    elif "am" in raw_time:
                        h = int(re.sub(r"\D", "", raw_time.split(":")[0]))
                        pref_time = f"{h:02d}:00"
                
                # Check if alert already exists
                existing = self.db.query(EmailAlert).filter(EmailAlert.email == extracted_email, EmailAlert.is_active == True).first()
                if not existing:
                    new_alert = EmailAlert(
                        email=extracted_email,
                        role=role_extracted,
                        location="Pune, India" if "pune" in query_lower else "Remote",
                        experience_years=0.0 if "intern" in query_lower else 1.0,
                        work_mode="remote" if "remote" in query_lower else "any",
                        preferred_time=pref_time,
                        sent_job_hashes=[]
                    )
                    self.db.add(new_alert)
                    self.db.commit()
                
                return f"⚡ **Daily Job Alert Successfully Activated!**\n\n- **Recipient:** `{extracted_email}`\n- **Target Role:** `{role_extracted}`\n- **Target Location:** `{'Pune, India' if 'pune' in query_lower else 'Remote / Worldwide'}`\n- **Delivery Schedule:** Daily at `{pref_time}` with top matches and CSV attachment.\n\nYou will receive your first automated digest at your scheduled time. You can also trigger an instant test email anytime from the **🔔 Daily Job Alerts** section below!"
            else:
                return "📧 **Setting Up Daily Email Automation**\n\nI can automatically scrape, deduplicate, and email you the top matching jobs and CSV spreadsheet every day at your preferred time!\n\nPlease provide:\n1. **Your Email Address** (e.g. `yourname@gmail.com`)\n2. **Target Role** (e.g. `AI/ML Intern`)\n3. **Target City or Remote** (e.g. `Pune, India` or `Remote`)\n4. **Preferred Delivery Time** (e.g. `09:00 AM`)\n5. *(Optional)* Upload your resume in the **🔔 Daily Job Alerts** section below to get deep skill-gap matching!"

        try:
            response = await self.llm.ainvoke(prompt)
            return response.content.strip()
        except Exception as e:
            return f"Error executing RAG query: {str(e)}"

    def generate_jobs_csv(self, search_id: str) -> Optional[str]:
        """
        Generates a detailed CSV file containing all job listings with
        HR contacts, tech contacts, company insights, and key requirements.
        """
        jobs = self.job_repo.get_jobs_by_search_id(search_id)
        if not jobs:
            return None
            
        data = []
        for j in jobs:
            loc = (j.location or "").lower()
            work_type = "Remote" if "remote" in loc else ("Hybrid" if "hybrid" in loc else "Onsite")
            
            salary = ""
            if j.salary_range:
                min_sal = j.salary_range.get("min")
                max_sal = j.salary_range.get("max")
                curr = j.salary_range.get("currency", "USD")
                if min_sal and max_sal:
                    salary = f"{min_sal}-{max_sal} {curr}"
                elif min_sal:
                    salary = f"> {min_sal} {curr}"
                elif max_sal:
                    salary = f"< {max_sal} {curr}"

            # Extract company insights
            insights = j.company_insights or {}
            company_size = insights.get("size_indicator", "Unknown")
            industry = insights.get("industry", "Unknown")
            culture = ", ".join(insights.get("culture_signals", []))
            red_flags = ", ".join(insights.get("red_flags", []))

            # Extract HR contact info
            hr_contacts = j.hr_contacts or []
            hr_name = hr_contacts[0].get("full_name", "") if hr_contacts else ""
            hr_email = hr_contacts[0].get("email", "") if hr_contacts else ""
            hr_confidence = f"{hr_contacts[0].get('confidence_score', 0)}%" if hr_contacts else ""
            hr_phone = hr_contacts[0].get("phone", "") if hr_contacts else ""

            # Extract tech contact info
            tech_contacts = j.tech_contacts or []
            tech_name = tech_contacts[0].get("full_name", "") if tech_contacts else ""
            tech_email = tech_contacts[0].get("email", "") if tech_contacts else ""
            tech_confidence = f"{tech_contacts[0].get('confidence_score', 0)}%" if tech_contacts else ""
            tech_phone = tech_contacts[0].get("phone", "") if tech_contacts else ""
                    
            data.append({
                "Company Name": j.company,
                "Role / Title": j.title,
                "Location": j.location,
                "Work Type": work_type,
                "Posted Date (YYYY-MM-DD)": format_posted_date_for_csv(j.posted_date),
                "Salary": salary if salary else "N/A",
                "Match Score": f"{round(j.match_score or 0)}%",
                "Experience Fit": j.experience_fit or "Good Fit",
                "Matching Skills": ", ".join(j.matching_skills or []),
                "Missing Skills": ", ".join(j.missing_skills or []),
                "Key Requirements": j.key_requirements or "",
                "Company Size": company_size,
                "Industry": industry,
                "Culture Signals": culture,
                "Red Flags": red_flags,
                "HR Contact Name": hr_name,
                "HR Email": hr_email,
                "HR Email Confidence": hr_confidence,
                "HR Phone": hr_phone,
                "Tech Lead Name": tech_name,
                "Tech Lead Email": tech_email,
                "Tech Lead Email Confidence": tech_confidence,
                "Tech Lead Phone": tech_phone,
                "Full Job Description": j.description or "",
                "Match Reason": j.match_reason or "",
                "URL": j.url or "",
                "Source": j.source or ""
            })
            
        df = pd.DataFrame(data)
        export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "exports")
        os.makedirs(export_dir, exist_ok=True)
        
        file_path = os.path.join(export_dir, f"jobs_export_{search_id}.csv")
        df.to_csv(file_path, index=False, encoding="utf-8-sig")
        return file_path

    async def generate_company_insights_csv(self, search_id: str, candidate_name: str = "Candidate", candidate_skills: Optional[List[str]] = None) -> Optional[str]:
        """
        Generates a comprehensive CSV with HR emails, tech lead emails, phone numbers,
        company insights, and all enrichment data for every job in the search.
        Auto-fetches HR/tech contacts for any job that doesn't have them yet.
        """
        from src.services.linkedin_service import linkedin_service

        jobs = self.job_repo.get_jobs_by_search_id(search_id)
        if not jobs:
            return None

        # Auto-fetch contacts for top matched jobs that don't have them yet (limit to top 5 for fast response)
        for job in jobs[:5]:
            if not job.hr_contacts or not job.tech_contacts:
                try:
                    await self.fetch_job_hr_contacts(
                        job_id=job.id,
                        candidate_name=candidate_name,
                        candidate_skills=candidate_skills,
                        include_tech=True
                    )
                except Exception as e:
                    print(f"Auto-fetch contacts error for {job.company}: {e}")

        # Re-query to get updated contacts
        self.db.expire_all()
        jobs = self.job_repo.get_jobs_by_search_id(search_id)

        data = []
        for j in jobs:
            loc = (j.location or "").lower()
            work_type = "Remote" if "remote" in loc else ("Hybrid" if "hybrid" in loc else "Onsite")

            salary = ""
            if j.salary_range:
                min_sal = j.salary_range.get("min")
                max_sal = j.salary_range.get("max")
                curr = j.salary_range.get("currency", "USD")
                if min_sal and max_sal:
                    salary = f"{min_sal}-{max_sal} {curr}"
                elif min_sal:
                    salary = f"> {min_sal} {curr}"
                elif max_sal:
                    salary = f"< {max_sal} {curr}"

            insights = j.company_insights or {}

            # Collect ALL HR contacts
            hr_contacts = j.hr_contacts or []
            all_hr_names = "; ".join([c.get("full_name", "") for c in hr_contacts if c.get("full_name")])
            all_hr_emails = "; ".join([c.get("email", "") for c in hr_contacts if c.get("email")])
            all_hr_phones = "; ".join([c.get("phone", "") for c in hr_contacts if c.get("phone")])
            all_hr_confidence = "; ".join([f"{c.get('confidence_score', 0)}%" for c in hr_contacts])

            # Collect ALL tech contacts
            tech_contacts = j.tech_contacts or []
            all_tech_names = "; ".join([c.get("full_name", "") for c in tech_contacts if c.get("full_name")])
            all_tech_emails = "; ".join([c.get("email", "") for c in tech_contacts if c.get("email")])
            all_tech_phones = "; ".join([c.get("phone", "") for c in tech_contacts if c.get("phone")])
            all_tech_confidence = "; ".join([f"{c.get('confidence_score', 0)}%" for c in tech_contacts])

            data.append({
                "Company Name": j.company,
                "Role / Title": j.title,
                "Location": j.location,
                "Work Type": work_type,
                "Posted Date": format_posted_date_for_csv(j.posted_date),
                "Salary": salary or "N/A",
                "Match Score": f"{round(j.match_score or 0)}%",
                "Experience Fit": j.experience_fit or "Good Fit",
                "Matching Skills": ", ".join(j.matching_skills or []),
                "Missing Skills": ", ".join(j.missing_skills or []),
                "Key Requirements": j.key_requirements or "",
                "Company Size": insights.get("size_indicator", "Unknown"),
                "Industry": insights.get("industry", "Unknown"),
                "Culture Signals": ", ".join(insights.get("culture_signals", [])),
                "Red Flags": ", ".join(insights.get("red_flags", [])),
                "HR Contact Names": all_hr_names,
                "HR Emails": all_hr_emails,
                "HR Email Confidence": all_hr_confidence,
                "HR Phones": all_hr_phones,
                "Tech Lead Names": all_tech_names,
                "Tech Lead Emails": all_tech_emails,
                "Tech Lead Email Confidence": all_tech_confidence,
                "Tech Lead Phones": all_tech_phones,
                "Full Job Description": j.description or "",
                "Match Reason": j.match_reason or "",
                "URL": j.url or "",
                "Source": j.source or ""
            })

        df = pd.DataFrame(data)
        export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "exports")
        os.makedirs(export_dir, exist_ok=True)

        file_path = os.path.join(export_dir, f"company_insights_{search_id}.csv")
        df.to_csv(file_path, index=False, encoding="utf-8-sig")
        return file_path