import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

SMARTRECRUITERS_COMPANIES = [
    {"name": "Visa", "identifier": "visa"},
    {"name": "Bosch", "identifier": "bosch"},
    {"name": "Ubisoft", "identifier": "ubisoft"},
    {"name": "Twitter / X", "identifier": "x"},
    {"name": "Skechers", "identifier": "skechers"},
    {"name": "Avery Dennison", "identifier": "averydennison"}
]

class SmartRecruitersClient(BaseJobIntegration):
    """
    Standardized connector for enterprise job boards hosted on SmartRecruiters.
    Queries the official public postings REST API.
    """
    def __init__(self, companies: Optional[List[Dict[str, Any]]] = None):
        self.companies = companies or SMARTRECRUITERS_COMPANIES

    async def _fetch_company_postings(
        self,
        client: httpx.AsyncClient,
        company_info: Dict[str, Any],
        query: str,
        location: str,
        remote: bool
    ) -> List[Dict[str, Any]]:
        name = company_info["name"]
        identifier = company_info["identifier"]
        api_url = f"https://api.smartrecruiters.com/v1/companies/{identifier}/postings?limit=50"
        if query:
            api_url += f"&q={httpx.URL(query).raw_path.decode() if hasattr(httpx.URL(query), 'raw_path') else query}"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            postings = data.get("content", []) or []

            for p in postings:
                title = str(p.get("name", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                loc_data = p.get("location", {}) or {}
                city = loc_data.get("city", "")
                region = loc_data.get("region", "")
                country = loc_data.get("country", "")
                is_remote_flag = loc_data.get("remote", False)

                loc_parts = [p for p in [city, region, country.upper() if country else ""] if p]
                job_loc = ", ".join(loc_parts) or ("Remote" if is_remote_flag else "Global")

                job_url = str(p.get("applyUrl", "")).strip() or f"https://jobs.smartrecruiters.com/{identifier}/{p.get('id', '')}"
                if not job_url:
                    continue

                dept = p.get("department", {}).get("label", "") if isinstance(p.get("department"), dict) else ""
                exp_lvl = p.get("experienceLevel", {}).get("label", "") if isinstance(p.get("experienceLevel"), dict) else ""
                clean_desc = f"SmartRecruiters posting at {name} for {title}. Department: {dept}. Experience: {exp_lvl}."

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "smartrecruiters", clean_desc, title, job_url):
                    continue

                raw_date = p.get("releasedDate")
                posted_date = str(raw_date)[:10] if raw_date else None
                work_mode = "Remote" if is_remote_flag else detect_work_mode(job_loc, title, clean_desc)

                jobs.append({
                    "title": title,
                    "company": name,
                    "location": job_loc,
                    "description": clean_desc,
                    "url": job_url,
                    "source": "smartrecruiters",
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
                return await self._fetch_company_postings(client, comp, query, location, remote)

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
