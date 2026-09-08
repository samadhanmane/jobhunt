import httpx
import re
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.integrations.catalog import GREENHOUSE_COMPANIES
from src.utils.location_helper import is_job_location_match
from src.utils.role_helper import is_title_role_match

class GreenhouseClient(BaseJobIntegration):
    """
    High-throughput Greenhouse ATS integration.
    Queries verified Greenhouse board APIs (https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true)
    across all 35+ verified AI & Tech company boards from the catalog.
    """
    def __init__(self):
        self.companies = GREENHOUSE_COMPANIES

    async def _fetch_company_board(
        self,
        client: httpx.AsyncClient,
        company_entry: Dict[str, Any],
        tokens: List[str],
        query: str,
        location: str,
        remote: bool
    ) -> List[Dict[str, Any]]:
        slug = company_entry.get("slug")
        company_name = company_entry.get("name", slug.title() if slug else "Company")
        api_url = company_entry.get("api") or f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true"
        if "content=true" not in api_url:
            api_url += ("&" if "?" in api_url else "?") + "content=true"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            jobs_list = data.get("jobs", [])
            for j in jobs_list:
                title = str(j.get("title", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                job_loc = ""
                if isinstance(j.get("location"), dict):
                    job_loc = str(j.get("location", {}).get("name", "")).strip()
                elif isinstance(j.get("location"), str):
                    job_loc = j.get("location").strip()
                if not job_loc:
                    job_loc = "Remote / Global"

                offices = j.get("offices", [])
                if offices and isinstance(offices, list):
                    office_names = [o.get("name") for o in offices if isinstance(o, dict) and o.get("name")]
                    if office_names:
                        job_loc = f"{job_loc} ({', '.join(office_names)})"

                job_url = str(j.get("absolute_url", "")).strip()
                if not job_url:
                    continue

                content_html = j.get("content", "") or ""
                clean_desc = ""
                if content_html:
                    soup = BeautifulSoup(content_html, "html.parser")
                    clean_desc = soup.get_text(separator="\n").strip()[:3000]

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "greenhouse", clean_desc):
                    continue

                raw_date = j.get("updated_at")
                posted_date = str(raw_date)[:10] if raw_date else None

                jobs.append({
                    "title": title,
                    "company": company_name,
                    "location": job_loc,
                    "description": clean_desc or f"Direct ATS listing at {company_name} for {title}.",
                    "url": job_url,
                    "source": "greenhouse",
                    "posted_date": posted_date,
                    "salary_range": None
                })
        except Exception:
            pass
        return jobs

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        WHITELIST_2LETTER = {"ai", "ml", "qa", "ui", "ux", "go", "ci", "cd", "r", "c"}
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2 or t in WHITELIST_2LETTER]

        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        sem = asyncio.Semaphore(8)

        async def fetch_bounded(client, company):
            async with sem:
                return await self._fetch_company_board(client, company, tokens, query, location, remote)

        async with httpx.AsyncClient(headers=headers, timeout=14.0, follow_redirects=True) as client:
            tasks = [fetch_bounded(client, c) for c in self.companies]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list):
                    for job in res:
                        u = job.get("url")
                        if u and u not in seen_urls:
                            seen_urls.add(u)
                            all_jobs.append(job)

        print(f"[Greenhouse] Fetched {len(all_jobs)} ATS direct jobs for '{query}' across {len(self.companies)} verified companies")
        return all_jobs
