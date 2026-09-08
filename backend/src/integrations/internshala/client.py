import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class InternshalaClient(BaseJobIntegration):
    """
    Connector for internships, fresher roles, and early-career tech positions
    from Internshala across Indian tech hubs (Pune, Bengaluru, Hyderabad, Delhi NCR, Remote).
    """
    SEARCH_URL = "https://internshala.com/api/v2/search/internships"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://internshala.com/internships"
        }

        jobs = []
        try:
            params = {
                "keywords": query or "software",
                "location": location or "India",
                "page": 1
            }
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.SEARCH_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    internship_list = data.get("internships", []) or data.get("data", []) or []
                    for item in internship_list:
                        title = str(item.get("title") or item.get("profile") or "").strip()
                        if not title:
                            continue
                        if query and not is_title_role_match(title, query):
                            continue

                        company = str(item.get("company_name") or "Startup / Tech Employer").strip()
                        job_loc = str(item.get("location_names", ["India"])[0] if isinstance(item.get("location_names"), list) and item.get("location_names") else item.get("location", "India")).strip()

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        url = item.get("url") or f"https://internshala.com/internship/detail/{item.get('id', '')}"
                        posted_date = format_posted_date_for_csv(item.get("posted_on") or item.get("start_date"))
                        stipend = str(item.get("stipend", {}).get("salary", "") or "")

                        jobs.append({
                            "title": f"[Intern/Fresher] {title}",
                            "company": company,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "Internshala",
                            "work_mode": "Remote" if "work from home" in job_loc.lower() or remote else detect_work_mode(job_loc),
                            "salary": stipend,
                            "description": f"Internship/Fresher position: {title} at {company}. Stipend/Compensation: {stipend}. Location: {job_loc}."
                        })
        except Exception as e:
            print(f"[Internshala] Notice: {e}")

        return jobs
