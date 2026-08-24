import httpx
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9"
}

class HimalayasClient(BaseJobIntegration):
    BASE_URL = "https://himalayas.app/jobs/api/search"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        limit = kwargs.get("limit", 50)
        params = {
            "q": query,
            "limit": limit
        }
        
        try:
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=12.0, follow_redirects=True) as client:
                response = await client.get(self.BASE_URL, params=params)
                if response.status_code != 200:
                    print(f"[Himalayas] Non-200 response: {response.status_code}")
                    return []
                data = response.json()
                
                # Handle both list and dict formats
                if isinstance(data, dict):
                    jobs_list = data.get("jobs", [])
                elif isinstance(data, list):
                    jobs_list = data
                else:
                    jobs_list = []
                    
                jobs = []
                for job in jobs_list:
                    min_sal = job.get("minSalary")
                    max_sal = job.get("maxSalary")
                    currency = job.get("currencyCode", "USD")
                    
                    locations_list = job.get("locations", [])
                    loc_str = ", ".join(locations_list) if isinstance(locations_list, list) else str(job.get("location", "Remote"))
                    
                    raw_desc = job.get("description", "")
                    clean_desc = clean_html_job_description(raw_desc)

                    jobs.append({
                        "title": job.get("title", ""),
                        "company": job.get("companyName", "") or job.get("company", {}).get("name", ""),
                        "location": loc_str,
                        "description": clean_desc,
                        "url": job.get("applicationLink", "") or job.get("url", ""),
                        "source": "himalayas",
                        "posted_date": job.get("pubDate") or job.get("createdAt"),
                        "salary_range": {
                            "min": float(min_sal) if min_sal else None,
                            "max": float(max_sal) if max_sal else None,
                            "currency": currency
                        } if (min_sal or max_sal) else None
                    })
                print(f"[Himalayas] Fetched {len(jobs)} jobs for query='{query}'")
                return jobs
        except Exception as e:
            print(f"Error querying Himalayas: {e}")
            return []
