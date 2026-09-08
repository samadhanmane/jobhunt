import asyncio
import datetime
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class SimplifyClient(BaseJobIntegration):
    """
    Connector for Simplify open internship & new grad tech positions dataset.
    Pulls live, community-verified software engineering, AI/ML, and data science internships.
    """
    DATA_URL = "https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/.github/scripts/listings.json"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }

        jobs = []
        try:
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.DATA_URL)
                if resp.status_code == 200:
                    listings = resp.json()
                    if isinstance(listings, list):
                        for item in listings:
                            # Filter active positions
                            if not item.get("active", True):
                                continue

                            title = str(item.get("title") or "").strip()
                            if not title:
                                continue

                            if query and not is_title_role_match(title, query):
                                continue

                            company = str(item.get("company_name") or "Tech Employer").strip()
                            locs = item.get("locations", [])
                            loc_str = ", ".join(locs) if isinstance(locs, list) and locs else "Remote / Global"

                            if location and not is_job_location_match(loc_str, location, remote):
                                continue

                            url = item.get("url") or f"https://simplify.jobs/p/{item.get('id', '')}"
                            
                            # Parse date_posted timestamp
                            posted_date = "N/A"
                            raw_ts = item.get("date_posted") or item.get("date_updated")
                            if raw_ts and isinstance(raw_ts, (int, float)):
                                try:
                                    dt = datetime.datetime.utcfromtimestamp(raw_ts)
                                    posted_date = dt.strftime("%Y-%m-%d")
                                except Exception:
                                    posted_date = format_posted_date_for_csv(None)

                            work_mode = "Remote" if "remote" in loc_str.lower() or remote else detect_work_mode(loc_str)

                            jobs.append({
                                "title": f"[Intern/Early Career] {title}",
                                "company": company,
                                "location": loc_str,
                                "url": url,
                                "posted_date": posted_date,
                                "source": "Simplify",
                                "work_mode": work_mode,
                                "description": f"Internship position: {title} at {company}. Locations: {loc_str}. Source: Simplify Jobs."
                            })

                            if len(jobs) >= 25:
                                break
        except Exception as e:
            print(f"[Simplify] Notice: {e}")

        return jobs
