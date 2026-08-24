import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration

DEFAULT_ASHBY_COMPANIES = [
    "anthropic", "linear", "retool", "postman", "synthesia", "cursor",
    "perplexity", "elevenlabs", "mistral", "vercel", "supabase", "resend"
]

class AshbyClient(BaseJobIntegration):
    """
    Ashby public ATS API integration.
    Queries direct public Ashby posting APIs (https://api.ashbyhq.com/posting-api/job-board/{company}).
    """
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2]
        
        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        async with httpx.AsyncClient(headers=headers, timeout=8.0, follow_redirects=True) as client:
            for company in DEFAULT_ASHBY_COMPANIES[:8]:
                try:
                    url = f"https://api.ashbyhq.com/posting-api/job-board/{company}"
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        jobs_list = data.get("jobs", [])
                        for j in jobs_list:
                            title = str(j.get("title", ""))
                            job_loc = str(j.get("location", "Remote / Global"))
                            job_url = str(j.get("jobUrl", ""))
                            
                            if any(t in title.lower() for t in tokens) if tokens else True:
                                if job_url and job_url not in seen_urls:
                                    seen_urls.add(job_url)
                                    all_jobs.append({
                                        "title": title,
                                        "company": company.title(),
                                        "location": job_loc,
                                        "description": f"Direct Ashby ATS role at {company.title()} for {title}.",
                                        "url": job_url,
                                        "source": "ashby",
                                        "posted_date": j.get("publishedDate"),
                                        "salary_range": None
                                    })
                                    if len(all_jobs) >= 8:
                                        break
                except Exception:
                    continue
                if len(all_jobs) >= 8:
                    break

        print(f"[Ashby] Fetched {len(all_jobs)} ATS direct jobs for '{query}'")
        return all_jobs
