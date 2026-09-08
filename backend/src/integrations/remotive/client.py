import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.text_cleaner import clean_html_job_description

class RemotiveClient(BaseJobIntegration):
    """
    Official API integration for Remotive (leading remote developer board).
    Endpoint: https://remotive.com/api/remote-jobs?search={query}
    """
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.strip()
        encoded_query = httpx.URL(clean_query).raw_path.decode() if hasattr(httpx.URL(clean_query), 'raw_path') else clean_query
        url = f"https://remotive.com/api/remote-jobs?search={encoded_query}&limit=50"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        jobs = []
        try:
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return []
                data = resp.json()
                raw_jobs = data.get("jobs", []) or []

                for rj in raw_jobs:
                    title = str(rj.get("title", "")).strip()
                    if not title:
                        continue

                    if query and not is_title_role_match(title, query):
                        continue

                    company = str(rj.get("company_name", "Unknown")).strip()
                    job_url = str(rj.get("url", "")).strip()
                    if not job_url:
                        continue

                    job_loc = str(rj.get("candidate_required_location", "Worldwide")).strip()
                    raw_desc = str(rj.get("description", ""))
                    clean_desc = clean_html_job_description(raw_desc)

                    if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "remotive", clean_desc, title, job_url):
                        continue

                    raw_pub = rj.get("publication_date")
                    posted_date = str(raw_pub)[:10] if raw_pub else None

                    salary_text = str(rj.get("salary") or "").strip()
                    salary_range = None
                    if salary_text:
                        sal_match = re.search(r'\$?(\d+[\d,]*)\s*[-–to]+\s*\$?(\d+[\d,]*)', salary_text, re.IGNORECASE)
                        if sal_match:
                            try:
                                min_s = float(sal_match.group(1).replace(",", ""))
                                max_s = float(sal_match.group(2).replace(",", ""))
                                salary_range = {"min": min_s, "max": max_s, "currency": "USD"}
                            except Exception:
                                pass

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": f"Remote ({job_loc})" if "remote" not in job_loc.lower() else job_loc,
                        "description": clean_desc,
                        "url": job_url,
                        "source": "remotive",
                        "posted_date": posted_date,
                        "salary_range": salary_range,
                        "work_mode": "Remote"
                    })
        except Exception:
            pass

        return jobs
