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
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = get_llm()
        return self._llm

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
            
            # 5. Generate embeddings and save to Database
            db_jobs = []
            for j in ranked_jobs:
                job_text = f"{j.get('title', '')} {j.get('company', '')} {j.get('description', '')}"
                emb = embedding_client.get_embedding(job_text[:1000])
                
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
            
            return {
                "search_id": search_id,
                "total_found": total_found,
                "unique_count": unique_count,
                "status": "completed",
                "jobs": self.get_results(search_id)
            }
            
        except Exception as e:
            print(f"Error executing job search pipeline: {e}")
            self.search_repo.update_search_status(search_id, "failed")
            raise e

    def get_results(self, search_id: str) -> List[Dict[str, Any]]:
        jobs = self.job_repo.get_jobs_by_search_id(search_id)
        return [{
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
            "experience_fit": j.experience_fit or "Good Fit"
        } for j in jobs]

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
        Generates a detailed CSV file containing all job listings.
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