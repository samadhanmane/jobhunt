import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class CutshortClient(BaseJobIntegration):
    """
    Standardized connector for Indian tech and startup jobs from Cutshort.
    Targets tech hubs: Bengaluru, Pune, Hyderabad, Delhi NCR, and Mumbai.
    """
    SEARCH_URL = "https://cutshort.io/api/v1/jobs/search"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://cutshort.io/jobs"
        }

        jobs = []
        try:
            payload = {
                "keyword": query or "software",
                "location": location or "India",
                "isRemote": remote,
                "limit": 25
            }
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.post(self.SEARCH_URL, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    postings = data.get("jobs", []) or data.get("data", []) or []
                    for p in postings:
                        title = str(p.get("title") or "").strip()
                        if not title:
                            continue
                        if query and not is_title_role_match(title, query):
                            continue

                        company = str(p.get("companyName") or p.get("company") or "Indian Tech Startup").strip()
                        job_loc = str(p.get("location") or ("Remote" if p.get("isRemote") else "India")).strip()

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        url = p.get("url") or f"https://cutshort.io/job/{p.get('id', '')}"
                        posted_date = format_posted_date_for_csv(p.get("createdAt") or p.get("postedDate"))
                        desc = str(p.get("description") or "").strip()
                        desc_clean = re.sub(r"<[^>]+>", " ", desc).strip()

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "Cutshort",
                            "work_mode": "Remote" if p.get("isRemote") else detect_work_mode(job_loc),
                            "description": desc_clean[:2000] if desc_clean else f"{title} at {company}"
                        })
        except Exception as e:
            print(f"[Cutshort] Search notice: {e}")

        return jobs
