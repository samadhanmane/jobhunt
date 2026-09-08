import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class NaukriClient(BaseJobIntegration):
    """
    Connector for India's primary tech and corporate job portal (Naukri).
    Queries search endpoints with specialized Indian city routing (Pune, Bengaluru, Hyderabad, Delhi NCR, Mumbai).
    """
    SEARCH_URL = "https://www.naukri.com/jobapi/v3/search"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "appid": "109",
            "systemid": "Naukri",
            "clientid": "d3skt0p",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }

        jobs = []
        try:
            params = {
                "noOfResults": 20,
                "urlType": "search_by_keyword",
                "searchType": "adv",
                "keyword": query or "software engineer",
                "location": location or "India"
            }
            async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(self.SEARCH_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    job_details = data.get("jobDetails", []) or []
                    for item in job_details:
                        title = str(item.get("title") or "").strip()
                        if not title:
                            continue

                        if query and not is_title_role_match(title, query):
                            continue

                        company = str(item.get("companyName") or "Naukri Employer").strip()
                        placeholders = item.get("placeholders", [])
                        job_loc = "India"
                        for p in placeholders:
                            if p.get("type") == "location":
                                job_loc = p.get("label", "India")

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        url = f"https://www.naukri.com{item.get('jdURL', '')}" if item.get("jdURL") else f"https://www.naukri.com/job-listings-{item.get('jobId', '')}"
                        posted_date = format_posted_date_for_csv(item.get("createdDate"))
                        desc = str(item.get("jobDescription") or "").strip()
                        desc_clean = re.sub(r"<[^>]+>", " ", desc).strip()

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "Naukri",
                            "work_mode": detect_work_mode(job_loc or desc_clean),
                            "description": desc_clean[:2000] if desc_clean else f"{title} at {company}"
                        })
        except Exception as e:
            print(f"[Naukri] Notice: {e}")

        return jobs
