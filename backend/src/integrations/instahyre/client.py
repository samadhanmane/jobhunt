import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match

class InstahyreClient(BaseJobIntegration):
    """
    Dedicated India tech platform connector for Instahyre.
    Queries Instahyre's public job search API:
    https://www.instahyre.com/api/v1/job_search?skills={skills}
    """
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.strip()
        encoded_query = httpx.URL(clean_query).raw_path.decode() if hasattr(httpx.URL(clean_query), 'raw_path') else clean_query
        
        # Determine location parameter for Indian hubs if specified
        loc_param = ""
        if location and location.lower().strip() not in ["remote", "worldwide", "global", "any", "all", "india"]:
            loc_param = f"&location={httpx.URL(location.strip()).raw_path.decode() if hasattr(httpx.URL(location.strip()), 'raw_path') else location.strip()}"

        url = f"https://www.instahyre.com/api/v1/job_search?skills={encoded_query}{loc_param}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        jobs = []
        seen_urls = set()

        try:
            async with httpx.AsyncClient(headers=headers, timeout=14.0, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code != 200:
                    return []
                data = resp.json()
                objects = data.get("objects", []) or []

                for obj in objects:
                    title = str(obj.get("title") or obj.get("candidate_title") or "").strip()
                    if not title:
                        continue

                    if query and not is_title_role_match(title, query):
                        continue

                    employer = obj.get("employer", {}) or {}
                    company = str(employer.get("company_name", "Tech Startup")).strip()
                    public_url = str(obj.get("public_url") or "").strip()
                    if not public_url or public_url in seen_urls:
                        continue
                    seen_urls.add(public_url)

                    job_loc = str(obj.get("locations", "India")).strip()
                    keywords = obj.get("keywords", []) or []
                    keyword_str = ", ".join(keywords)
                    note = str(employer.get("instahyre_note") or employer.get("company_tagline") or "").strip()
                    clean_desc = f"{title} opportunity at {company}. Location: {job_loc}. Skills & Tech Stack: {keyword_str}. About Company: {note}"

                    if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "instahyre", clean_desc, title, public_url):
                        continue

                    work_mode = "Remote" if "work from home" in job_loc.lower() or "remote" in job_loc.lower() else detect_work_mode(job_loc, title, clean_desc)

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": job_loc,
                        "description": clean_desc,
                        "url": public_url,
                        "source": "instahyre",
                        "posted_date": None,  # Instahyre objects do not expose explicit post date, freshly indexed
                        "salary_range": None,
                        "work_mode": work_mode
                    })
        except Exception:
            pass

        return jobs
