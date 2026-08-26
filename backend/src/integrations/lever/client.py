import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match

DEFAULT_LEVER_COMPANIES = [
    "netflix", "spotify", "atlassian", "palantir", "affirm", "kraken",
    "deliveroo", "plaid", "databricks", "hubspot", "benchling", "monzo"
]

class LeverClient(BaseJobIntegration):
    """
    Lever public ATS API integration.
    Queries direct public Lever postings APIs (https://api.lever.co/v0/postings/{company}).
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
            for company in DEFAULT_LEVER_COMPANIES[:8]:
                try:
                    url = f"https://api.lever.co/v0/postings/{company}?mode=json"
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        jobs_list = resp.json()
                        for j in jobs_list:
                            title = str(j.get("text", ""))
                            cats = j.get("categories", {})
                            job_loc = str(cats.get("location", "Remote / Global"))
                            job_url = str(j.get("hostedUrl", ""))
                            desc = str(j.get("descriptionPlain", ""))
                            
                            if any(t in title.lower() for t in tokens) if tokens else True:
                                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "lever", desc):
                                    continue
                                if job_url and job_url not in seen_urls:
                                    seen_urls.add(job_url)
                                    all_jobs.append({
                                        "title": title,
                                        "company": company.title(),
                                        "location": job_loc,
                                        "description": desc[:400] if desc else f"Direct Lever ATS role at {company.title()}.",
                                        "url": job_url,
                                        "source": "lever",
                                        "posted_date": j.get("createdAt"),
                                        "salary_range": None
                                    })
                                    if len(all_jobs) >= 8:
                                        break
                except Exception:
                    continue
                if len(all_jobs) >= 8:
                    break

        print(f"[Lever] Fetched {len(all_jobs)} ATS direct jobs for '{query}'")
        return all_jobs
