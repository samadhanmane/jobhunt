import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

TEAMTAILOR_COMPANIES = [
    {"name": "Kry / Livi", "domain": "career.kry.se"},
    {"name": "Epidemic Sound", "domain": "jobs.epidemicsound.com"},
    {"name": "Bambora", "domain": "careers.bambora.com"},
    {"name": "Mentimeter", "domain": "jobs.mentimeter.com"},
    {"name": "Polestar", "domain": "careers.polestar.com"},
]

class TeamtailorClient(BaseJobIntegration):
    """
    Standardized connector for job boards hosted on Teamtailor.
    Queries Teamtailor's public JSON feed at https://{domain}/jobs.json.
    (No authentication required).
    """
    def __init__(self, companies: Optional[List[Dict[str, Any]]] = None):
        self.companies = companies or TEAMTAILOR_COMPANIES

    async def _fetch_company_jobs(
        self,
        client: httpx.AsyncClient,
        company_info: Dict[str, Any],
        query: str,
        location: str,
        remote: bool
    ) -> List[Dict[str, Any]]:
        name = company_info["name"]
        domain = company_info["domain"]
        api_url = f"https://{domain}/jobs.json"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            items = data.get("items", []) or []

            for item in items:
                title = str(item.get("title") or "").strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                url = item.get("url") or ""
                posted_date = format_posted_date_for_csv(item.get("date_published"))
                raw_html = str(item.get("content_html") or "").strip()
                desc_clean = re.sub(r"<[^>]+>", " ", raw_html).strip()

                work_mode = detect_work_mode(desc_clean)
                job_loc = "Global / Remote" if "remote" in work_mode.lower() else "Europe / Global"

                if location and not is_job_location_match(job_loc, location, remote):
                    continue

                jobs.append({
                    "title": title,
                    "company": name,
                    "location": job_loc,
                    "url": url,
                    "posted_date": posted_date,
                    "source": "Teamtailor",
                    "work_mode": work_mode,
                    "description": desc_clean[:2000] if desc_clean else f"{title} at {name}"
                })
        except Exception as e:
            print(f"[Teamtailor] Notice: {name} error: {e}")

        return jobs

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
            tasks = [
                self._fetch_company_jobs(client, comp, query, location, remote)
                for comp in self.companies
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        for r in results:
            if isinstance(r, list):
                all_jobs.extend(r)
        return all_jobs
