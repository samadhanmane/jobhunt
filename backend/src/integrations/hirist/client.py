import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class HiristClient(BaseJobIntegration):
    """
    Standardized connector for Indian IT and Tech jobs from Hirist.
    Specializes in engineering, AI/ML, and tech leadership in India.
    """
    SEARCH_URL = "https://www.hirist.tech/api/job/search"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://www.hirist.tech/"
        }

        jobs = []
        try:
            params = {
                "q": query or "tech",
                "loc": location or "India",
                "size": 20
            }
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.SEARCH_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    job_list = data.get("jobs", []) or data.get("data", []) or []
                    for item in job_list:
                        title = str(item.get("title") or item.get("job_title") or "").strip()
                        if not title:
                            continue
                        if query and not is_title_role_match(title, query):
                            continue

                        company = str(item.get("company_name") or item.get("company") or "Tech Employer").strip()
                        job_loc = str(item.get("location") or item.get("city") or "India").strip()

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        url = item.get("url") or item.get("job_url") or f"https://www.hirist.tech/j/{item.get('id', '')}"
                        posted_date = format_posted_date_for_csv(item.get("posted_date") or item.get("created_at"))
                        desc = str(item.get("description") or item.get("snippet") or "").strip()
                        desc_clean = re.sub(r"<[^>]+>", " ", desc).strip()

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "Hirist",
                            "work_mode": detect_work_mode(desc_clean or job_loc),
                            "description": desc_clean[:2000] if desc_clean else f"{title} at {company}"
                        })
        except Exception as e:
            print(f"[Hirist] Notice: {e}")

        return jobs
