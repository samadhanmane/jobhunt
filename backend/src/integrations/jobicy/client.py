import httpx
import re
import time
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

_JOBICY_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "jobs": []
}

class JobicyClient(BaseJobIntegration):
    """
    Jobicy free public remote jobs API integration with in-memory caching.
    Endpoint: https://jobicy.com/api/v2/remote-jobs
    """
    BASE_URL = "https://jobicy.com/api/v2/remote-jobs"
    
    async def _fetch_all_jobs(self) -> List[Dict[str, Any]]:
        now = time.time()
        if _JOBICY_CACHE["jobs"] and (now - _JOBICY_CACHE["timestamp"] < 120):
            return _JOBICY_CACHE["jobs"]

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params={"count": 50})
                if resp.status_code == 200:
                    data = resp.json()
                    jobs_list = data.get("jobs", [])
                    _JOBICY_CACHE["jobs"] = jobs_list
                    _JOBICY_CACHE["timestamp"] = now
                    return jobs_list
        except Exception as e:
            print(f"Notice: Jobicy fetch notice ({e})")
            
        return _JOBICY_CACHE.get("jobs", [])

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        query_clean = re.sub(r'[^\w\s]', '', query.lower())
        tokens = [t.strip() for t in query_clean.split() if len(t.strip()) > 2]
        
        all_jobs = []
        jobs_list = await self._fetch_all_jobs()
        
        for j in jobs_list:
            title = str(j.get("jobTitle", ""))
            company = str(j.get("companyName", ""))
            desc = clean_html_job_description(str(j.get("jobDescription", "")))
            job_url = str(j.get("url", ""))
            job_geo = str(j.get("jobGeo", "Remote"))
            
            text_to_check = f"{title.lower()} {desc[:300].lower()}"
            if not tokens or any(t in text_to_check for t in tokens):
                salary_info = None
                min_sal = j.get("annualSalaryMin")
                max_sal = j.get("annualSalaryMax")
                if min_sal or max_sal:
                    salary_info = {
                        "min": min_sal,
                        "max": max_sal,
                        "currency": j.get("salaryCurrency", "USD")
                    }
                    
                all_jobs.append({
                    "title": title,
                    "company": company,
                    "location": f"Remote ({job_geo})" if job_geo else "Remote",
                    "description": desc,
                    "url": job_url,
                    "source": "jobicy",
                    "posted_date": j.get("pubDate"),
                    "salary_range": salary_info
                })
                if len(all_jobs) >= 25:
                    break
                    
        print(f"[Jobicy] Fetched {len(all_jobs)} jobs for '{query}'")
        return all_jobs
