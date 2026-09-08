import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

class ArbeitnowClient(BaseJobIntegration):
    BASE_URL = "https://www.arbeitnow.com/api/job-board-api"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        domain_keywords = kwargs.get("domain_keywords", []) or []
        
        # Build set of search matching tokens from query and domain keywords
        TECH_SHORT_TOKENS = {"ai", "ml", "go", "qa", "ui", "ux", "ci", "cd", "hr", "bi", "db", "vr", "ar"}
        STOPWORDS = {"in", "at", "to", "for", "the", "and", "of", "or", "on", "as", "by", "with"}
        query_clean = re.sub(r'[^\w\s]', '', query.lower())
        tokens = [t.strip() for t in query_clean.split() if (len(t.strip()) > 2 or t.strip() in TECH_SHORT_TOKENS) and t.strip() not in STOPWORDS]
        
        # Avoid generic tokens if specific ones exist
        tech_tokens = [t for t in tokens if t not in ["engineer", "developer", "senior", "junior", "lead", "staff", "intern"]]
        active_match_terms = set(tech_tokens if tech_tokens else tokens)
        for dk in domain_keywords:
            if isinstance(dk, str) and len(dk.strip()) > 2:
                active_match_terms.add(dk.lower().strip())
        
        all_jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        # Fetch multiple pages for broader coverage
        async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
            for page in range(1, 4):  # Up to 3 pages
                params = {
                    "search": query,
                    "page": page,
                }
                loc_lower = (location or "").lower().strip()
                if loc_lower and loc_lower not in ["remote", "worldwide", "global", "any", "all", ""]:
                    params["location"] = location
                
                if remote:
                    params["remote_only"] = "true"
                    
                try:
                    response = await client.get(self.BASE_URL, params=params)
                    if response.status_code != 200:
                        break
                    data = response.json()
                    jobs_data = data.get("data", [])
                    
                    if not jobs_data:
                        break
                    
                    for job in jobs_data:
                        title = str(job.get("title", ""))
                        company = str(job.get("company_name", ""))
                        desc = clean_html_job_description(str(job.get("description", "")))
                        tags = [str(t).lower() for t in job.get("tags", [])]
                        
                        text_to_check = f"{title.lower()} {' '.join(tags)} {desc[:400].lower()}"
                        
                        is_relevant = False
                        if not active_match_terms:
                            is_relevant = True
                        else:
                            for term in active_match_terms:
                                if term in text_to_check:
                                    is_relevant = True
                                    break
                                    
                        if is_relevant:
                            all_jobs.append({
                                "title": title,
                                "company": company,
                                "location": job.get("location", "Remote / Global"),
                                "description": desc,
                                "url": job.get("url", ""),
                                "source": "arbeitnow",
                                "posted_date": job.get("created_at"),
                                "salary_range": None
                            })
                except Exception as e:
                    print(f"Notice: Arbeitnow page {page} fetch notice: {e}")
                    break
        
        print(f"[Arbeitnow] Fetched {len(all_jobs)} relevant jobs for query='{query}'")
        return all_jobs
