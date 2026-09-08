import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

WORKABLE_COMPANIES = [
    {"name": "Hugging Face", "subdomain": "huggingface"},
    {"name": "Toggl", "subdomain": "toggl"},
    {"name": "Doist", "subdomain": "doist"},
    {"name": "Semios", "subdomain": "semios"},
]

class WorkableClient(BaseJobIntegration):
    """
    Standardized connector for job boards hosted on Workable.
    Queries Workable's official widget API endpoint:
    https://apply.workable.com/api/v1/widget/accounts/{subdomain}
    """
    def __init__(self, companies: Optional[List[Dict[str, Any]]] = None):
        self.companies = companies or WORKABLE_COMPANIES

    async def _fetch_company_jobs(
        self,
        client: httpx.AsyncClient,
        company_info: Dict[str, Any],
        query: str,
        location: str,
        remote: bool
    ) -> List[Dict[str, Any]]:
        name = company_info["name"]
        subdomain = company_info["subdomain"]
        api_url = f"https://apply.workable.com/api/v1/widget/accounts/{subdomain}"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            postings = data.get("jobs", []) or []

            for p in postings:
                title = str(p.get("title", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                is_telecommuting = bool(p.get("telecommuting", False))
                city = str(p.get("city") or "").strip()
                country = str(p.get("country") or "").strip()
                state = str(p.get("state") or "").strip()

                loc_parts = [part for part in [city, state, country] if part]
                job_loc = ", ".join(loc_parts) or ("Remote" if is_telecommuting else "Global")

                job_url = str(p.get("url") or p.get("shortlink") or "").strip()
                if not job_url:
                    continue

                dept = str(p.get("department") or "")
                exp_lvl = str(p.get("experience") or "")
                emp_type = str(p.get("employment_type") or "")
                clean_desc = f"Workable posting at {name} for {title}. Department: {dept}. Type: {emp_type}. Level: {exp_lvl}."

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "workable", clean_desc, title, job_url):
                    continue

                raw_date = p.get("published_on") or p.get("created_at")
                posted_date = str(raw_date)[:10] if raw_date else None
                work_mode = "Remote" if is_telecommuting else detect_work_mode(job_loc, title, clean_desc)

                jobs.append({
                    "title": title,
                    "company": name,
                    "location": job_loc,
                    "description": clean_desc,
                    "url": job_url,
                    "source": "workable",
                    "posted_date": posted_date,
                    "salary_range": None,
                    "work_mode": work_mode
                })
        except Exception:
            pass
        return jobs

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        sem = asyncio.Semaphore(6)

        async def fetch_bounded(client, comp):
            async with sem:
                return await self._fetch_company_jobs(client, comp, query, location, remote)

        async with httpx.AsyncClient(headers=headers, timeout=14.0, follow_redirects=True) as client:
            tasks = [fetch_bounded(client, c) for c in self.companies]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list):
                    for j in res:
                        u = j.get("url")
                        if u and u not in seen_urls:
                            seen_urls.add(u)
                            all_jobs.append(j)

        return all_jobs
