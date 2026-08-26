import httpx
import time
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description
from src.utils.location_helper import is_job_location_match

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9"
}

_HIMALAYAS_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "jobs": []
}

class HimalayasClient(BaseJobIntegration):
    BASE_URL = "https://himalayas.app/jobs/api"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        limit = kwargs.get("limit", 50)
        params = {
            "q": query,
            "limit": limit
        }
        
        try:
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=12.0, follow_redirects=True) as client:
                response = await client.get(self.BASE_URL, params=params)
                if response.status_code == 200:
                    data = response.json()
                    jobs_list = data.get("jobs", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
                    if jobs_list:
                        _HIMALAYAS_CACHE["jobs"] = jobs_list
                        _HIMALAYAS_CACHE["timestamp"] = time.time()
                else:
                    jobs_list = _HIMALAYAS_CACHE.get("jobs", [])
        except Exception:
            jobs_list = _HIMALAYAS_CACHE.get("jobs", [])

        query_clean = re.sub(r'[^\w\s]', '', query.lower())
        tokens = [t.strip() for t in query_clean.split() if len(t.strip()) > 2]
        
        jobs = []
        for job in jobs_list:
            title = job.get("title", "")
            raw_desc = job.get("description", "") or job.get("excerpt", "")
            text_check = f"{title.lower()} {raw_desc[:300].lower()}"
            
            if tokens and not any(t in text_check for t in tokens) and len(jobs) >= 15:
                continue

            min_sal = job.get("minSalary")
            max_sal = job.get("maxSalary")
            currency = job.get("currency", "USD") or job.get("currencyCode", "USD")
            
            locations_list = job.get("locationRestrictions", []) or job.get("locations", [])
            loc_str = ", ".join(locations_list) if isinstance(locations_list, list) and locations_list else str(job.get("location", "Remote"))
            clean_desc = clean_html_job_description(raw_desc)

            if location and not is_job_location_match(loc_str, location, "remote" if remote else "any", "himalayas", clean_desc):
                continue

            jobs.append({
                "title": title,
                "company": job.get("companyName", "") or job.get("company", {}).get("name", "") or "Tech Company",
                "location": loc_str,
                "description": clean_desc,
                "url": job.get("applicationLink", "") or f"https://himalayas.app/jobs/{job.get('guid', '')}",
                "source": "himalayas",
                "posted_date": job.get("pubDate") or job.get("createdAt"),
                "salary_range": {
                    "min": float(min_sal) if min_sal else None,
                    "max": float(max_sal) if max_sal else None,
                    "currency": currency
                } if (min_sal or max_sal) else None
            })
            if len(jobs) >= 25:
                break

        print(f"[Himalayas] Fetched {len(jobs)} jobs for query='{query}'")
        return jobs
