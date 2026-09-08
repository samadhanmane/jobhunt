import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

RECRUITEE_COMPANIES = [
    {"name": "Bunq", "subdomain": "bunq"},
    {"name": "Channable", "subdomain": "channable"},
    {"name": "Helloprint", "subdomain": "helloprint"},
    {"name": "Personio", "subdomain": "personio"},
]

class RecruiteeClient(BaseJobIntegration):
    """
    Standardized connector for job boards hosted on Recruitee.
    Queries Recruitee's public Careers Site API:
    https://{subdomain}.recruitee.com/api/offers/
    (No authentication required).
    """
    def __init__(self, companies: Optional[List[Dict[str, Any]]] = None):
        self.companies = companies or RECRUITEE_COMPANIES

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
        api_url = f"https://{subdomain}.recruitee.com/api/offers/"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            offers = data.get("offers", []) or []

            for p in offers:
                title = str(p.get("title", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                is_remote_flag = bool(p.get("remote", False))
                city = str(p.get("city") or "").strip()
                country = str(p.get("country_code") or p.get("country") or "").strip()
                state = str(p.get("state_code") or p.get("state_name") or "").strip()

                loc_parts = [part for part in [city, state, country] if part]
                job_loc = ", ".join(loc_parts) or ("Remote" if is_remote_flag else "Global")

                if location and not is_job_location_match(job_loc, location, remote):
                    continue

                if remote and not (is_remote_flag or "remote" in job_loc.lower()):
                    continue

                apply_url = p.get("careers_url") or f"https://{subdomain}.recruitee.com/o/{p.get('slug', '')}"
                posted_date = format_posted_date_for_csv(p.get("created_at") or p.get("published_at"))

                desc = ""
                translations = p.get("translations", {})
                if translations and "en" in translations:
                    desc = translations["en"].get("description", "") or ""
                if not desc:
                    desc = p.get("description", "") or ""
                # Clean html tags
                desc_clean = re.sub(r"<[^>]+>", " ", desc).strip()
                work_mode = "Remote" if is_remote_flag else detect_work_mode(desc_clean or job_loc)

                jobs.append({
                    "title": title,
                    "company": name,
                    "location": job_loc,
                    "url": apply_url,
                    "posted_date": posted_date,
                    "source": "Recruitee",
                    "work_mode": work_mode,
                    "description": desc_clean[:2000] if desc_clean else f"{title} at {name}"
                })
        except httpx.RequestError:
            pass
        except Exception as e:
            pass

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
