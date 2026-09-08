import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class WorkingNomadsClient(BaseJobIntegration):
    """
    Standardized connector for remote tech jobs from Working Nomads.
    Queries the official public JSON feed:
    https://www.workingnomads.com/api/exposed_jobs/
    """
    API_URL = "https://www.workingnomads.com/api/exposed_jobs/"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        jobs = []
        try:
            async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(self.API_URL)
                if resp.status_code != 200:
                    return []
                data = resp.json()

            for item in data:
                title = str(item.get("title") or "").strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                company = str(item.get("company_name") or "Working Nomads").strip()
                job_loc = str(item.get("location") or "Remote").strip()

                if location and not is_job_location_match(job_loc, location, remote):
                    continue

                url = item.get("url") or ""
                pub_date = item.get("pub_date")
                posted_date = format_posted_date_for_csv(pub_date)

                raw_desc = item.get("description") or ""
                desc_clean = re.sub(r"<[^>]+>", " ", raw_desc).strip()
                tags = item.get("tags") or ""

                jobs.append({
                    "title": title,
                    "company": company,
                    "location": job_loc,
                    "url": url,
                    "posted_date": posted_date,
                    "source": "WorkingNomads",
                    "work_mode": "Remote",
                    "description": f"{desc_clean[:2000]} | Skills: {tags}"
                })
        except Exception as e:
            print(f"[WorkingNomads] Error fetching jobs: {e}")

        return jobs
