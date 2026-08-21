import aiohttp
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration

class HimalayasClient(BaseJobIntegration):
    BASE_URL = "https://himalayas.app/jobs/api/search"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        # Himalayas is a remote job board API — fetch up to 50 results per query
        limit = kwargs.get("limit", 50)
        params = {
            "q": query,
            "limit": limit
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.BASE_URL, params=params, timeout=aiohttp.ClientTimeout(total=15)) as response:
                    if response.status != 200:
                        print(f"[Himalayas] Non-200 response: {response.status}")
                        return []
                    data = await response.json()
                    
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
                        
                        jobs.append({
                            "title": job.get("title", ""),
                            "company": job.get("companyName", "") or job.get("company", {}).get("name", ""),
                            "location": loc_str,
                            "description": job.get("description", ""),
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
