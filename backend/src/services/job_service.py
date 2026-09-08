from src.services.repost_detector import repost_detector
from src.services.upskill_service import upskill_service
from src.models.database import SessionLocal
import os
import gc
import uuid
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import asyncio
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

# Global In-Memory Cache for Live Streaming Search Sessions (LRU with capacity 50 and TTL 1 hour)
ACTIVE_SEARCH_SESSIONS: Dict[str, Dict[str, Any]] = {}
SESSION_TIMESTAMPS: Dict[str, float] = {}
MAX_ACTIVE_SESSIONS = 50
SESSION_TTL_SECONDS = 3600

def _prune_active_sessions():
    """Prunes expired sessions (older than 1 hr) and evicts oldest if above capacity."""
    import gc
    import time
    now = time.time()
    expired = [sid for sid, t in list(SESSION_TIMESTAMPS.items()) if now - t > SESSION_TTL_SECONDS]
    for sid in expired:
        ACTIVE_SEARCH_SESSIONS.pop(sid, None)
        SESSION_TIMESTAMPS.pop(sid, None)
    while len(ACTIVE_SEARCH_SESSIONS) > MAX_ACTIVE_SESSIONS:
        oldest_sid = min(SESSION_TIMESTAMPS.keys(), key=lambda k: SESSION_TIMESTAMPS[k], default=None)
        if oldest_sid:
            ACTIVE_SEARCH_SESSIONS.pop(oldest_sid, None)
            SESSION_TIMESTAMPS.pop(oldest_sid, None)
        else:
            break
    gc.collect()

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
            from src.utils.text_cleaner import extract_job_experience_metadata
            from src.utils.location_helper import detect_work_mode
            db_jobs = []
            for idx, j in enumerate(enriched_jobs):
                emb = embeddings[idx] if idx < len(embeddings) else [0.0] * 384
                raw_date = j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)

                raw_title = j.get("title", "Unknown Role")
                raw_desc = j.get("description", "")
                raw_exp = extract_job_experience_metadata(raw_title, raw_desc, j.get("experience_fit", ""))

                db_job = Job(
                    id=str(uuid.uuid4()),
                    title=raw_title,
                    company=j.get("company", "Unknown Company"),
                    location=j.get("location", "Remote"),
                    description=raw_desc,
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
                    work_mode=j.get("work_mode") or detect_work_mode(j.get("location", "Remote"), raw_title, raw_desc),
                    is_repost=j.get("is_repost", False),
                    repost_badge=j.get("repost_badge", "Standard"),
                    supported_skills=j.get("supported_skills", []),
                    skill_coverage_pct=int(j.get("skill_coverage_pct", 0)),
                    sub_domain=j.get("sub_domain", "AI/ML General"),
                    ai_facets=j.get("ai_facets", []),
                    experience_required=raw_exp["experience_required"],
                    min_experience_years=raw_exp["min_experience_years"],
                    seniority_level=raw_exp["seniority_level"],
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

            # Optional pre-harvest date freshness filter
            max_days = preferences.get("max_age_days")
            if max_days and isinstance(max_days, (int, float)) and max_days > 0:
                from src.utils.date_utils import is_within_days
                date_filtered = [j for j in unique_jobs if is_within_days(j.get("posted_date"), int(max_days))]
                if date_filtered:
                    unique_jobs = date_filtered

            unique_count = len(unique_jobs)
            
            # 4. Rank with candidate profile, skill match, gap analysis, and reason
            ranked_jobs = await self.ranker.rank_jobs(unique_jobs, candidate_profile, preferences)
            
            # 5. Attach Repost Detection & 3-Tier Skill Gap to live search results
            top_ranked_jobs = ranked_jobs[:40]
            try:
                db_temp = SessionLocal()
                for j in top_ranked_jobs:
                    repost_info = repost_detector.record_and_evaluate_repost(j.get("company"), j.get("title"), j.get("url"), db_temp)
                    j["is_repost"] = repost_info.get("is_repost", False)
                    j["repost_badge"] = repost_info.get("badge_label", "Active Opening")

                    gap_info = upskill_service.analyze_job_skill_gap(j, candidate_profile.get("skills", []))
                    j["supported_skills"] = gap_info.get("supported_skills", [])
                    j["skill_coverage_pct"] = gap_info.get("coverage_percentage", 0)
                db_temp.close()
            except Exception as e:
                print(f"Notice attaching live intelligence: {e}")
            texts = [f"{j.get('title', '')} {j.get('company', '')} {j.get('description', '')}"[:1000] for j in top_ranked_jobs]
            embeddings = embedding_client.get_embeddings(texts)

            from src.utils.text_cleaner import extract_job_experience_metadata
            from src.utils.location_helper import detect_work_mode
            db_jobs = []
            for idx, j in enumerate(top_ranked_jobs):
                emb = embeddings[idx] if idx < len(embeddings) else [0.0] * 384
                
                # Format posted_date cleanly to YYYY-MM-DD or N/A
                raw_date = j.get("posted_date")
                formatted_date = format_posted_date_for_csv(raw_date)
                
                raw_title = j.get("title", "Unknown Role")
                raw_desc = j.get("description", "")
                raw_exp = extract_job_experience_metadata(raw_title, raw_desc, j.get("experience_fit", ""))

                db_job = Job(
                    id=str(uuid.uuid4()),
                    title=raw_title,
                    company=j.get("company", "Unknown Company"),
                    location=j.get("location", "Remote"),
                    description=raw_desc,
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
                    work_mode=j.get("work_mode") or detect_work_mode(j.get("location", "Remote"), raw_title, raw_desc),
                    is_repost=j.get("is_repost", False),
                    repost_badge=j.get("repost_badge", "Standard"),
                    supported_skills=j.get("supported_skills", []),
                    skill_coverage_pct=int(j.get("skill_coverage_pct", 0)),
                    sub_domain=j.get("sub_domain", "AI/ML General"),
                    ai_facets=j.get("ai_facets", []),
                    experience_required=raw_exp["experience_required"],
                    min_experience_years=raw_exp["min_experience_years"],
                    seniority_level=raw_exp["seniority_level"],
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
                    "sub_domain": raw_j.get("sub_domain", "AI/ML General"),
                    "ai_facets": raw_j.get("ai_facets", []),
                    "work_mode": raw_j.get("work_mode", "Remote"),
                    "role_match_score": raw_j.get("role_match_score", 70),
                    "skill_match_score": raw_j.get("skill_match_score", 70),
                    "exp_match_score": raw_j.get("exp_match_score", 70),
                    "loc_match_score": raw_j.get("loc_match_score", 70),
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

            # Initialize active streaming search session with pruning
            import time
            _prune_active_sessions()
            SESSION_TIMESTAMPS[search_id] = time.time()
            curated_jobs = self.get_results(search_id)
            ACTIVE_SEARCH_SESSIONS[search_id] = {
                "status": "harvesting",
                "raw_jobs": list(all_raw_payload[-150:]),
                "unique_jobs": list(all_unique_payload[-100:]),
                "jobs": list(curated_jobs[:40])
            }

            # Seen sets to prevent duplicates across streaming rounds
            seen_urls = set(j.get("url", "").strip().lower() for j in raw_jobs if j.get("url"))
            seen_titles = set(f"{(j.get('company') or '').lower().strip()}|{(j.get('title') or '').lower().strip()}" for j in unique_jobs)

            cand_name = candidate_profile.get("current_or_recent_role") or "Candidate"
            cand_skills = candidate_profile.get("skills", [])
            custom_cookie = preferences.get("linkedin_cookie")

            # 1. Trigger continuous live background harvesting across remaining queries/boards
            try:
                asyncio.create_task(
                    self.background_harvest_stream(
                        search_id=search_id,
                        candidate_profile=candidate_profile,
                        preferences=preferences,
                        initial_seen_urls=seen_urls,
                        initial_seen_titles=seen_titles,
                        custom_cookie=custom_cookie
                    )
                )
            except Exception as stream_err:
                print(f"Notice: Background harvest stream initialization: {stream_err}")

            # 2. Trigger automatic parallel background contact enrichment for top discovered jobs
            try:
                asyncio.create_task(
                    self.background_enrich_all_jobs_contacts(
                        search_id=search_id,
                        candidate_name=cand_name,
                        candidate_skills=cand_skills,
                        custom_cookie=custom_cookie
                    )
                )
            except Exception as task_err:
                print(f"Notice: Background enrichment task initialization: {task_err}")

            import gc
            gc.collect()

            return {
                "search_id": search_id,
                "total_found": total_found,
                "unique_count": unique_count,
                "status": "harvesting",
                "jobs": curated_jobs,
                "unique_jobs": all_unique_payload,
                "raw_jobs": all_raw_payload,
                "all_jobs": all_unique_payload
            }
            
        except Exception as e:
            print(f"Error executing job search pipeline: {e}")
            self.search_repo.update_search_status(search_id, "failed")
            raise e

    def get_session_data(self, search_id: str) -> Dict[str, Any]:
        """
        Retrieves the latest live streaming jobs (Raw, Unique, and Curated) for a search session.
        """
        if search_id in ACTIVE_SEARCH_SESSIONS:
            sess = ACTIVE_SEARCH_SESSIONS[search_id]
            raw_list = sess.get("raw_jobs", [])
            uniq_list = sess.get("unique_jobs", [])
            curated_list = sess.get("jobs", [])
            return {
                "search_id": search_id,
                "status": sess.get("status", "completed"),
                "total_found": len(raw_list),
                "unique_count": len(uniq_list),
                "jobs": curated_list,
                "unique_jobs": uniq_list,
                "raw_jobs": raw_list,
                "all_jobs": uniq_list
            }

        search_record = self.search_repo.get_search_by_id(search_id)
        if not search_record:
            return {
                "search_id": search_id,
                "status": "not_found",
                "total_found": 0,
                "unique_count": 0,
                "jobs": [],
                "unique_jobs": [],
                "raw_jobs": [],
                "all_jobs": []
            }

        db_jobs = self.get_results(search_id)
        return {
            "search_id": search_id,
            "status": search_record.status,
            "total_found": search_record.total_found or len(db_jobs),
            "unique_count": search_record.unique_count or len(db_jobs),
            "jobs": db_jobs,
            "unique_jobs": db_jobs,
            "raw_jobs": db_jobs,
            "all_jobs": db_jobs
        }

    async def background_harvest_stream(
        self,
        search_id: str,
        candidate_profile: dict,
        preferences: dict,
        initial_seen_urls: set,
        initial_seen_titles: set,
        custom_cookie: Optional[str] = None
    ):
        """
        Continuously discovers subsequent batches of jobs in the background,
        deduplicating and streaming new results live into the active search session.
        """
        import asyncio
        from src.utils.text_cleaner import extract_job_experience_metadata
        from src.utils.date_utils import format_posted_date_for_csv
        from src.models.database import SessionLocal

        try:
            plan = await self.orchestrator.get_search_plan(candidate_profile, preferences)
            primary_query = plan.get("primary_query", preferences.get("role", "Software Engineer"))
            location = plan.get("location", preferences.get("location", ""))
            remote = plan.get("remote_only", False)
            skills_filter = plan.get("skills_filter", [])
            seniority = plan.get("seniority") or preferences.get("experience_level") or candidate_profile.get("seniority") or "mid"
            domain_keywords = plan.get("domain_keywords", []) or []
            secondary_queries = plan.get("secondary_queries", [])
            raw_user_role = preferences.get("role", "").strip()
            exp_lvl = str(preferences.get("experience_level", "")).lower().strip()

            if exp_lvl in ["intern", "0", "internship"] or "intern" in raw_user_role.lower():
                extra_variants = [f"{raw_user_role} Intern", f"{primary_query} Remote", f"{raw_user_role} Internship", f"{raw_user_role} Trainee", f"{primary_query} 2026"]
            elif exp_lvl in ["entry", "1", "junior", "0-1", "entry_level"] or "junior" in raw_user_role.lower():
                extra_variants = [f"Junior {raw_user_role}", f"Entry Level {raw_user_role}", f"Associate {raw_user_role}", f"{primary_query} Remote"]
            elif exp_lvl in ["senior", "5+", "8+", "lead"] or "senior" in raw_user_role.lower():
                extra_variants = [f"Senior {raw_user_role}", f"Lead {raw_user_role}", f"Staff {raw_user_role}", f"{primary_query} Remote"]
            else:
                extra_variants = [f"{raw_user_role} Specialist", f"{primary_query} Remote", f"{primary_query} Worldwide", f"{raw_user_role} Developer"]

            additional_queries = []
            for q in secondary_queries + extra_variants:
                if q and isinstance(q, str):
                    cleaned_q = q.strip()
                    if cleaned_q and len(cleaned_q) > 2 and cleaned_q.lower() not in [sq.lower() for sq in additional_queries]:
                        additional_queries.append(cleaned_q)

            query_batches = [
                additional_queries[:2],
                additional_queries[2:5],
                [primary_query, f"{raw_user_role} Remote"]
            ]

            seen_urls = set(initial_seen_urls)
            seen_titles = set(initial_seen_titles)

            for round_idx, q_batch in enumerate(query_batches):
                if not q_batch or search_id not in ACTIVE_SEARCH_SESSIONS:
                    break

                await asyncio.sleep(2.0)

                tasks = []
                for q_title in q_batch:
                    tasks.append(self.orchestrator.himalayas.search(query=q_title, location=location, remote=remote))
                    tasks.append(self.orchestrator.arbeitnow.search(query=q_title, location=location, remote=remote, domain_keywords=domain_keywords))
                    tasks.append(self.orchestrator.freehire.search(query=q_title, location=location, remote=remote, skills=skills_filter, seniority=seniority))
                    tasks.append(self.orchestrator.jobicy.search(query=q_title, location=location, remote=remote))
                    tasks.append(self.orchestrator.remoteok.search(query=q_title, location=location, remote=remote))
                    tasks.append(self.orchestrator.greenhouse.search(query=q_title, location=location, remote=remote))
                    tasks.append(self.orchestrator.lever.search(query=q_title, location=location, remote=remote))
                    tasks.append(self.orchestrator.ashby.search(query=q_title, location=location, remote=remote))

                results = await asyncio.gather(*tasks, return_exceptions=True)
                new_raw_batch = []
                for res in results:
                    if isinstance(res, list):
                        for j in res:
                            u = j.get("url", "").strip().lower()
                            if u and u in seen_urls:
                                continue
                            if u:
                                seen_urls.add(u)
                            new_raw_batch.append(j)

                if not new_raw_batch or search_id not in ACTIVE_SEARCH_SESSIONS:
                    gc.collect()
                    continue

                new_raw_payload = []
                for raw_j in new_raw_batch:
                    raw_title = raw_j.get("title", "Unknown Role")
                    raw_desc = (raw_j.get("description") or "")[:1000]
                    raw_exp = extract_job_experience_metadata(raw_title, raw_desc, raw_j.get("experience_fit", ""))
                    raw_date = raw_j.get("posted_date")
                    formatted_date = format_posted_date_for_csv(raw_date)

                    new_raw_payload.append({
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
                        "match_reason": raw_j.get("match_reason", "Live streaming job listing."),
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

                new_unique_batch = []
                for raw_j in new_raw_batch:
                    comp = (raw_j.get("company") or "").lower().strip()
                    t = (raw_j.get("title") or "").lower().strip()
                    key = f"{comp}|{t}"
                    if key in seen_titles:
                        continue
                    seen_titles.add(key)
                    new_unique_batch.append(raw_j)

                new_ranked = await self.ranker.rank_jobs(new_unique_batch, candidate_profile, preferences) if new_unique_batch else []
                new_unique_payload = []
                for rj in new_ranked:
                    rtitle = rj.get("title", "Unknown Role")
                    rdesc = (rj.get("description") or "")[:1000]
                    rexp = extract_job_experience_metadata(rtitle, rdesc, rj.get("experience_fit", ""))
                    rdate = rj.get("posted_date")
                    fdate = format_posted_date_for_csv(rdate)
                    new_unique_payload.append({
                        "id": str(uuid.uuid4()),
                        "title": rtitle,
                        "company": rj.get("company", "Unknown Company"),
                        "location": rj.get("location", "Remote"),
                        "description": rdesc,
                        "url": rj.get("url", ""),
                        "source": rj.get("source", "unknown"),
                        "posted_date": fdate,
                        "salary_range": rj.get("salary_range"),
                        "match_score": float(rj.get("match_score", 50.0)),
                        "match_reason": rj.get("match_reason", "Live streaming unique role."),
                        "matching_skills": rj.get("matching_skills", []),
                        "missing_skills": rj.get("missing_skills", []),
                        "experience_fit": rj.get("experience_fit", "Standard Fit"),
                        "experience_required": rexp["experience_required"],
                        "min_experience_years": rexp["min_experience_years"],
                        "seniority_level": rexp["seniority_level"],
                        "key_requirements": rj.get("key_requirements", ""),
                        "company_insights": rj.get("company_insights") or {},
                        "hr_contacts": [],
                        "tech_contacts": []
                    })

                if search_id in ACTIVE_SEARCH_SESSIONS:
                    sess = ACTIVE_SEARCH_SESSIONS[search_id]
                    sess["raw_jobs"] = (sess["raw_jobs"] + new_raw_payload)[-150:]
                    sess["unique_jobs"] = (sess["unique_jobs"] + new_unique_payload)[-100:]

                    all_curated = sess["jobs"] + new_unique_payload
                    all_curated.sort(key=lambda x: x.get("match_score", 0), reverse=True)
                    sess["jobs"] = all_curated[:40]

                    try:
                        with SessionLocal() as stream_db:
                            from src.repositories.search_repository import SearchRepository
                            from src.repositories.job_repository import JobRepository
                            from src.models.job import Job
                            
                            db_jobs = []
                            for uj in new_unique_payload:
                                db_jobs.append(Job(
                                    id=uj["id"],
                                    search_id=search_id,
                                    title=uj.get("title", ""),
                                    company=uj.get("company", ""),
                                    location=uj.get("location", "Remote"),
                                    description=uj.get("description", ""),
                                    url=uj.get("url", ""),
                                    source=uj.get("source", "unknown"),
                                    posted_date=uj.get("posted_date", ""),
                                    salary_range=uj.get("salary_range"),
                                    match_score=uj.get("match_score", 50.0),
                                    match_reason=uj.get("match_reason", ""),
                                    matching_skills=uj.get("matching_skills", []),
                                    missing_skills=uj.get("missing_skills", []),
                                    experience_fit=uj.get("experience_fit", "Standard Fit"),
                                    key_requirements=uj.get("key_requirements", ""),
                                    company_insights=uj.get("company_insights", {}),
                                    hr_contacts=[],
                                    tech_contacts=[]
                                ))
                            if db_jobs:
                                JobRepository(stream_db).add_jobs(db_jobs)

                            SearchRepository(stream_db).update_search_status(
                                search_id, 
                                "harvesting", 
                                total_found=len(sess["raw_jobs"]), 
                                unique_count=len(sess["unique_jobs"])
                            )
                    except Exception as db_err:
                        print(f"Notice: stream DB save notice: {db_err}")

                del new_raw_batch
                del new_unique_batch
                del results
                gc.collect()

            if search_id in ACTIVE_SEARCH_SESSIONS:
                ACTIVE_SEARCH_SESSIONS[search_id]["status"] = "completed"
                try:
                    with SessionLocal() as stream_db:
                        from src.repositories.search_repository import SearchRepository
                        SearchRepository(stream_db).update_search_status(
                            search_id, 
                            "completed", 
                            total_found=len(ACTIVE_SEARCH_SESSIONS[search_id]["raw_jobs"]), 
                            unique_count=len(ACTIVE_SEARCH_SESSIONS[search_id]["unique_jobs"])
                        )
                except Exception:
                    pass

        except Exception as stream_err:
            print(f"Notice: Streaming harvest notice: {stream_err}")
            if search_id in ACTIVE_SEARCH_SESSIONS:
                ACTIVE_SEARCH_SESSIONS[search_id]["status"] = "completed"

    def get_latest_background_pool(self, role: Optional[str] = None, location: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieves all recently harvested background jobs from the database across background searches,
        scheduled automations, and live stream rounds, ensuring users get all background findings even
        if they closed the website tab.
        """
        from src.models.job import Job
        from src.models.automation_history import AutomationHistory
        from src.utils.text_cleaner import extract_job_experience_metadata
        
        try:
            query = self.db.query(Job)
            if role and len(role.strip()) > 2:
                role_tok = role.strip().split()[0].lower()
                query = query.filter(Job.title.ilike(f"%{role_tok}%"))
            if location and location.strip().lower() not in ["remote", "worldwide", "any", "all", ""]:
                loc_tok = location.strip().split()[0].lower()
                query = query.filter(Job.location.ilike(f"%{loc_tok}%"))
                
            db_jobs = query.order_by(Job.created_at.desc(), Job.match_score.desc()).limit(150).all()
            
            curated_list = []
            seen = set()
            for j in db_jobs:
                key = (j.url or f"{j.title}-{j.company}").lower().strip()
                if key in seen:
                    continue
                seen.add(key)
                exp_meta = extract_job_experience_metadata(j.title, j.description or "", j.experience_fit or "")
                curated_list.append({
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

            # Also pull recently recorded AutomationHistory snapshots
            try:
                histories = self.db.query(AutomationHistory).order_by(AutomationHistory.executed_at.desc()).limit(5).all()
                for h in histories:
                    for cj in (h.curated_jobs or []):
                        key = (cj.get("url") or f"{cj.get('title')}-{cj.get('company')}").lower().strip()
                        if key not in seen:
                            seen.add(key)
                            curated_list.append(cj)
            except Exception:
                pass

            return {
                "status": "success",
                "total_found": len(curated_list),
                "unique_count": len(curated_list),
                "jobs": curated_list,
                "unique_jobs": curated_list,
                "raw_jobs": curated_list
            }
        except Exception as e:
            print(f"Notice: get_latest_background_pool: {e}")
            return {
                "status": "error",
                "total_found": 0,
                "unique_count": 0,
                "jobs": [],
                "unique_jobs": [],
                "raw_jobs": []
            }

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
                "experience_required": j.experience_required or exp_meta["experience_required"],
                "min_experience_years": j.min_experience_years if j.min_experience_years is not None else exp_meta["min_experience_years"],
                "seniority_level": j.seniority_level or exp_meta["seniority_level"],
                "work_mode": j.work_mode or "Remote",
                "is_repost": j.is_repost or False,
                "repost_badge": j.repost_badge or "Standard",
                "supported_skills": j.supported_skills or [],
                "skill_coverage_pct": j.skill_coverage_pct or 0,
                "sub_domain": j.sub_domain or "AI/ML General",
                "ai_facets": j.ai_facets or [],
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

    async def background_enrich_all_jobs_contacts(
        self,
        search_id: str,
        candidate_name: str = "Candidate",
        candidate_skills: Optional[List[str]] = None,
        custom_cookie: Optional[str] = None
    ):
        """
        Runs automatically in the background after search completion.
        Discovers HR & Tech contacts in parallel with a concurrency semaphore
        and drafts personalized outreach messages for every single job.
        """
        import asyncio
        from src.models.database import SessionLocal
        from src.services.linkedin_service import linkedin_service
        from src.llm.prompts.outreach import COLD_OUTREACH_SYSTEM_PROMPT
        import json

        await asyncio.sleep(0.5)

        try:
            with SessionLocal() as db:
                jobs = db.query(Job).filter(Job.search_id == search_id).all()
                job_list = [{"id": j.id, "company": j.company, "title": j.title, "matching_skills": j.matching_skills, "hr_contacts": j.hr_contacts, "tech_contacts": j.tech_contacts} for j in jobs]
        except Exception as read_err:
            print(f"Background contact enrichment read notice: {read_err}")
            return

        if not job_list:
            return

        company_cache = {}
        sem = asyncio.Semaphore(5)

        async def _enrich_job(job_info: Dict[str, Any]):
            async with sem:
                job_id = job_info["id"]
                if job_info.get("hr_contacts") and job_info.get("tech_contacts"):
                    return

                comp_name = (job_info.get("company") or "").strip()
                if not comp_name or comp_name.lower() in ("unknown", "various", "confidential"):
                    return

                try:
                    if comp_name in company_cache:
                        hr_profiles, tech_profiles = company_cache[comp_name]
                    else:
                        all_contacts = await linkedin_service.search_company_all_contacts(
                            comp_name, hr_limit=3, tech_limit=3, custom_cookie=custom_cookie
                        )
                        hr_profiles = all_contacts.get("hr_contacts", [])
                        tech_profiles = all_contacts.get("tech_contacts", [])
                        company_cache[comp_name] = (hr_profiles, tech_profiles)

                    cand_skills = candidate_skills or job_info.get("matching_skills") or []
                    skills_str = ", ".join(cand_skills[:5]) if cand_skills else "Software Engineering"

                    async def _draft(contacts_list: List[Dict]) -> List[Dict]:
                        enriched = []
                        for r in contacts_list:
                            item = r.copy()
                            rec_name = r.get('full_name', '').split()[0] if r.get('full_name') else 'there'
                            prompt = f"""
Candidate Name: {candidate_name}
Target Role: {job_info.get('title')}
Candidate Core Skills: {skills_str}

Recruiter Details:
- Name: {r.get('full_name', 'Recruiter')}
- Title: {r.get('headline', 'Talent Acquisition')}
- Company: {comp_name}
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
                                    "email_subject": outreach_data.get("email_subject", f"Application for {job_info.get('title')} - {candidate_name}"),
                                    "email_body": outreach_data.get("email_body", ""),
                                    "linkedin_note": outreach_data.get("linkedin_connection_note", "")
                                }
                            except Exception:
                                item["outreach_draft"] = {
                                    "email_subject": f"Application for {job_info.get('title')} - {candidate_name}",
                                    "email_body": f"Hi {rec_name},\n\nI noticed {comp_name} is hiring for a {job_info.get('title')} and wanted to reach out directly given my background in {skills_str}.\n\nBest regards,\n{candidate_name}",
                                    "linkedin_note": f"Hi {rec_name}, I'd love to connect regarding {job_info.get('title')} opportunities at {comp_name}!"
                                }
                            enriched.append(item)
                        return enriched

                    enriched_hr = await _draft(hr_profiles)
                    enriched_tech = await _draft(tech_profiles)

                    with SessionLocal() as inner_db:
                        job_rec = inner_db.query(Job).filter(Job.id == job_id).first()
                        if job_rec:
                            job_rec.hr_contacts = enriched_hr
                            job_rec.tech_contacts = enriched_tech
                            inner_db.commit()
                except Exception as err:
                    print(f"Notice: Background job contact enrichment error for {job_id}: {err}")

        try:
            await asyncio.gather(*[_enrich_job(j_info) for j_info in job_list], return_exceptions=True)
        except Exception as e:
            print(f"Background contact enrichment notice: {e}")

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