import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match
from src.utils.role_helper import is_title_role_match

PHENOM_TENANTS = [
    {
        "name": "Allianz",
        "origin": "https://careers.allianz.com",
        "url_prefix": "global/en"
    }
]

class PhenomClient(BaseJobIntegration):
    """
    Phenom CareerConnect provider.
    Directly queries enterprise Phenom widget endpoints (POST {origin}/widgets)
    for major global employers like Allianz with India centers (Pune, Bengaluru).
    """
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        WHITELIST_2LETTER = {"ai", "ml", "qa", "ui", "ux", "go", "ci", "cd", "r", "c"}
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2 or t in WHITELIST_2LETTER]

        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
            for tenant in PHENOM_TENANTS:
                origin = tenant["origin"]
                url_prefix = tenant["url_prefix"]
                company = tenant["name"]

                payload = {
                    "lang": "en_global",
                    "country": "global",
                    "ddoKey": "refineSearch",
                    "pageName": "search-results",
                    "siteType": "external",
                    "jobs": True,
                    "counts": True,
                    "from": 0,
                    "size": 100,
                    "keywords": query
                }

                try:
                    resp = await client.post(f"{origin}/widgets", json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        jobs_list = data.get("refineSearch", {}).get("data", {}).get("jobs", [])
                        for j in jobs_list:
                            title = str(j.get("title", "")).strip()
                            if not title:
                                continue

                            if query and not is_title_role_match(title, query):
                                continue

                            city = j.get("city", "")
                            state = j.get("state", "")
                            country = j.get("country", "")
                            loc_parts = [p for p in [city, state, country] if p]
                            job_loc = ", ".join(loc_parts) or str(j.get("location", "Remote / Global"))

                            job_id = j.get("jobId", "")
                            slug = re.sub(r'[^a-zA-Z0-9]+', '-', title).strip('-')
                            job_url = f"{origin}/{url_prefix}/job/{job_id}/{slug}" if job_id else str(j.get("applyUrl", ""))

                            if not job_url or job_url in seen_urls:
                                continue

                            clean_desc = str(j.get("description", "") or "")[:3000]

                            if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "phenom", clean_desc):
                                continue

                            seen_urls.add(job_url)
                            raw_date = j.get("postedDate")
                            posted_date = str(raw_date)[:10] if raw_date else None

                            all_jobs.append({
                                "title": title,
                                "company": company,
                                "location": job_loc,
                                "description": clean_desc or f"Direct Phenom enterprise opening at {company} for {title}.",
                                "url": job_url,
                                "source": "phenom",
                                "posted_date": posted_date,
                                "salary_range": None
                            })
                except Exception:
                    continue

        print(f"[Phenom] Fetched {len(all_jobs)} enterprise direct jobs for '{query}'")
        return all_jobs
