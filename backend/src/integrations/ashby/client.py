import httpx
import re
import asyncio
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.integrations.catalog import ASHBY_COMPANIES
from src.utils.location_helper import is_job_location_match
from src.utils.role_helper import is_title_role_match

INTERVAL_MULTIPLIERS = {
    '1 HOUR': 2080,
    '1 DAY': 260,
    '1 WEEK': 52,
    '2 WEEK': 26,
    '0.5 MONTH': 24,
    '1 MONTH': 12,
    '2 MONTH': 6,
    '3 MONTH': 4,
    '6 MONTH': 2,
    '1 YEAR': 1,
}

def parse_ashby_compensation(job_data: dict) -> dict:
    comp = job_data.get("compensation")
    if not comp or not isinstance(comp, dict):
        return None
    interval = comp.get("interval", "1 YEAR")
    mult = INTERVAL_MULTIPLIERS.get(interval, 1)
    min_val = comp.get("minValue")
    max_val = comp.get("maxValue")
    curr = comp.get("currency", "USD")
    if min_val is None and max_val is None:
        return None
    try:
        min_ann = float(min_val) * mult if min_val is not None else None
        max_ann = float(max_val) * mult if max_val is not None else None
        return {
            "min": int(min_ann) if min_ann else None,
            "max": int(max_ann) if max_ann else None,
            "currency": curr
        }
    except Exception:
        return None

class AshbyClient(BaseJobIntegration):
    """
    Ashby public ATS API integration.
    Queries direct public Ashby posting APIs across 35+ verified AI & Tech company boards from the catalog.
    """
    def __init__(self):
        self.companies = ASHBY_COMPANIES

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
        api_url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true"

        jobs = []
        try:
            resp = await client.get(api_url, timeout=14.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            jobs_list = data.get("jobs", [])
            for j in jobs_list:
                title = str(j.get("title", "")).strip()
                if not title:
                    continue

                if tokens and not is_title_role_match(title, query):
                    continue

                job_loc = str(j.get("location", "Remote / Global")).strip()
                secondary = j.get("secondaryLocations", [])
                if secondary and isinstance(secondary, list):
                    sec_locs = [s.get("location") for s in secondary if isinstance(s, dict) and s.get("location")]
                    if sec_locs:
                        job_loc = f"{job_loc}, {', '.join(sec_locs)}"

                job_url = str(j.get("jobUrl", "")).strip()
                if not job_url:
                    continue

                raw_desc = str(j.get("descriptionHtml", "") or j.get("descriptionPlain", "") or "")
                clean_desc = re.sub(r'<[^>]+>', ' ', raw_desc).strip()[:3000]

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "ashby", clean_desc):
                    continue

                raw_date = j.get("publishedDate")
                posted_date = str(raw_date)[:10] if raw_date else None
                salary = parse_ashby_compensation(j)

                jobs.append({
                    "title": title,
                    "company": company_name,
                    "location": job_loc,
                    "description": clean_desc or f"Direct Ashby ATS role at {company_name} for {title}.",
                    "url": job_url,
                    "source": "ashby",
                    "posted_date": posted_date,
                    "salary_range": salary
                })
        except Exception:
            pass
        return jobs

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2]

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

        async with httpx.AsyncClient(headers=headers, timeout=16.0, follow_redirects=True) as client:
            tasks = [fetch_bounded(client, c) for c in self.companies]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list):
                    for job in res:
                        u = job.get("url")
                        if u and u not in seen_urls:
                            seen_urls.add(u)
                            all_jobs.append(job)

        print(f"[Ashby] Fetched {len(all_jobs)} ATS direct jobs for '{query}' across {len(self.companies)} verified companies")
        return all_jobs
