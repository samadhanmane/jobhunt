import httpx
import re
import asyncio
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.integrations.catalog import LEVER_COMPANIES
from src.utils.location_helper import is_job_location_match
from src.utils.role_helper import is_title_role_match

class LeverClient(BaseJobIntegration):
    """
    Lever public ATS API integration.
    Queries direct public Lever posting APIs (https://api.lever.co/v0/postings/{slug}?mode=json)
    for companies like Mistral AI, Palantir, Sanctuary AI, Spotify, etc.
    """
    def __init__(self):
        self.companies = LEVER_COMPANIES

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
        api_url = f"https://api.lever.co/v0/postings/{slug}?mode=json"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=12.0)
            if resp.status_code != 200:
                return []
            postings = resp.json()
            if not isinstance(postings, list):
                return []

            for p in postings:
                title = str(p.get("text", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                categories = p.get("categories", {}) or {}
                loc_cat = categories.get("location", "")
                team_cat = categories.get("team", "")
                commitment = categories.get("commitment", "")
                work_type = p.get("workplaceType", "")

                job_loc = loc_cat or "Remote / Global"
                if work_type and work_type.lower() not in job_loc.lower():
                    job_loc = f"{job_loc} ({work_type})"

                job_url = str(p.get("hostedUrl", "")).strip()
                if not job_url:
                    continue

                clean_desc = str(p.get("descriptionPlain", "") or "")[:3000]

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "lever", clean_desc):
                    continue

                created_at = p.get("createdAt")
                posted_date = None
                if created_at:
                    try:
                        import datetime
                        posted_date = datetime.datetime.utcfromtimestamp(created_at / 1000).strftime("%Y-%m-%d")
                    except Exception:
                        pass

                salary_range = None
                salary_desc = p.get("salaryDescription")
                if salary_desc:
                    salary_range = {"min": None, "max": None, "currency": str(salary_desc)}

                jobs.append({
                    "title": title,
                    "company": company_name,
                    "location": job_loc,
                    "description": clean_desc or f"Direct Lever ATS role at {company_name} for {title}.",
                    "url": job_url,
                    "source": "lever",
                    "posted_date": posted_date,
                    "salary_range": salary_range
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

        print(f"[Lever] Fetched {len(all_jobs)} ATS direct jobs for '{query}' across {len(self.companies)} verified companies")
        return all_jobs
