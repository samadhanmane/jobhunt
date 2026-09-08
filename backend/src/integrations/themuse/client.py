import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class TheMuseClient(BaseJobIntegration):
    """
    Connector for The Muse public jobs API (US & global engineering, tech, and enterprise roles).
    Official public REST endpoint: https://www.themuse.com/api/public/jobs
    """
    BASE_URL = "https://www.themuse.com/api/public/jobs"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        jobs = []
        try:
            params = {
                "page": 1,
                "category": "Software Engineering" if any(k in query.lower() for k in ["software", "engineer", "developer", "backend", "frontend", "fullstack", "ai", "data"]) else ""
            }
            # Remove empty category param if not matched
            if not params["category"]:
                del params["category"]

            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", []) or []

                    for item in results:
                        title = str(item.get("name") or "").strip()
                        if not title:
                            continue

                        if query and not is_title_role_match(title, query):
                            continue

                        company = str(item.get("company", {}).get("name") or "The Muse Employer").strip()
                        locs = [l.get("name", "") for l in item.get("locations", []) if l.get("name")]
                        job_loc = ", ".join(locs) if locs else "Remote / US"

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        levels = [lvl.get("name", "") for lvl in item.get("levels", []) if lvl.get("name")]
                        level_str = ", ".join(levels) if levels else "Mid Level"

                        url = item.get("refs", {}).get("landing_page") or f"https://www.themuse.com/jobs/{item.get('short_name', '')}"
                        posted_date = format_posted_date_for_csv(item.get("publication_date"))

                        desc_html = str(item.get("contents") or "").strip()
                        desc_clean = re.sub(r"<[^>]+>", " ", desc_html).strip()

                        work_mode = "Remote" if "flexible / remote" in job_loc.lower() or remote else detect_work_mode(job_loc)

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "The Muse",
                            "work_mode": work_mode,
                            "description": f"{title} at {company}. Level: {level_str}. Location: {job_loc}. Description: {desc_clean[:2000]}"
                        })
        except Exception as e:
            print(f"[TheMuse] Notice: {e}")

        return jobs
