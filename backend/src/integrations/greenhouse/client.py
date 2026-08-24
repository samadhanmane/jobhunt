import httpx
import re
import urllib.parse
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration

# High-profile tech companies using Greenhouse
DEFAULT_GREENHOUSE_COMPANIES = [
    "stripe", "airbnb", "figma", "github", "gitlab", "cloudflare", "datadog",
    "discord", "reddit", "lyft", "pinterest", "robinhood", "coinbase", "brex",
    "scaleai", "anthropic", "openai", "grammarly", "notion", "airtable", "ramp"
]

class GreenhouseClient(BaseJobIntegration):
    """
    Greenhouse public ATS API & career portal crawler.
    Queries direct public Greenhouse board APIs (https://boards-api.greenhouse.io/v1/boards/{company}/jobs)
    and falls back to search engine dorking.
    """
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2]
        
        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json, text/html"
        }
        
        # 1. Direct Public Board APIs for top companies
        async with httpx.AsyncClient(headers=headers, timeout=8.0, follow_redirects=True) as client:
            for company in DEFAULT_GREENHOUSE_COMPANIES[:8]:
                try:
                    url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        data = resp.json()
                        jobs_list = data.get("jobs", [])
                        for j in jobs_list:
                            title = str(j.get("title", ""))
                            job_loc = str(j.get("location", {}).get("name", "Remote / Global")) if isinstance(j.get("location"), dict) else "Remote"
                            job_url = str(j.get("absolute_url", ""))
                            
                            # Filter match
                            if any(t in title.lower() for t in tokens) if tokens else True:
                                if canonical_url := job_url:
                                    if canonical_url not in seen_urls:
                                        seen_urls.add(canonical_url)
                                        all_jobs.append({
                                            "title": title,
                                            "company": company.title(),
                                            "location": job_loc,
                                            "description": f"Direct ATS listing at {company.title()} for {title}.",
                                            "url": canonical_url,
                                            "source": "greenhouse",
                                            "posted_date": j.get("updated_at"),
                                            "salary_range": None
                                        })
                                        if len(all_jobs) >= 8:
                                            break
                except Exception:
                    continue
                if len(all_jobs) >= 8:
                    break

        print(f"[Greenhouse] Fetched {len(all_jobs)} ATS direct jobs for '{query}'")
        return all_jobs
