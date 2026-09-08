import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class UnstopClient(BaseJobIntegration):
    """
    Standardized connector for early-career, fresher tech jobs and hiring challenges from Unstop.
    Queries Unstop's public opportunities API:
    https://unstop.com/api/public/opportunity/search-result?opportunity=jobs
    """
    SEARCH_URL = "https://unstop.com/api/public/opportunity/search-result"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://unstop.com/jobs"
        }

        jobs = []
        try:
            params = {
                "opportunity": "jobs",
                "per_page": 30,
                "q": query or "software"
            }
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.SEARCH_URL, params=params)
                if resp.status_code != 200:
                    return []
                data = resp.json()
                opps = data.get("data", {}).get("data", []) or []

                for item in opps:
                    title = str(item.get("title") or "").strip()
                    if not title:
                        continue

                    if query and not is_title_role_match(title, query):
                        continue

                    org = item.get("organisation", {}) or {}
                    company = str(org.get("name") or "Tech Company").strip()

                    job_loc = "India"
                    locs = item.get("locations", [])
                    if locs and isinstance(locs, list):
                        loc_names = [str(l.get("city") or l.get("name") or "") for l in locs if isinstance(l, dict)]
                        if any(loc_names):
                            job_loc = ", ".join([l for l in loc_names if l])

                    if location and not is_job_location_match(job_loc, location, remote):
                        continue

                    seo_url = item.get("seo_url") or item.get("url") or ""
                    url = f"https://unstop.com/jobs/{seo_url}" if seo_url and not seo_url.startswith("http") else (seo_url or f"https://unstop.com/jobs/{item.get('id', '')}")
                    posted_date = format_posted_date_for_csv(item.get("start_date") or item.get("created_at"))

                    jobs.append({
                        "title": f"[Fresher/Early-Career] {title}",
                        "company": company,
                        "location": job_loc,
                        "url": url,
                        "posted_date": posted_date,
                        "source": "Unstop",
                        "work_mode": detect_work_mode(job_loc),
                        "description": f"Early career opportunity: {title} at {company}. Location: {job_loc}."
                    })
        except Exception as e:
            print(f"[Unstop] Notice: {e}")

        return jobs
