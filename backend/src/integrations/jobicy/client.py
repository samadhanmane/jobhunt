import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

class JobicyClient(BaseJobIntegration):
    """
    Jobicy free public remote jobs API integration.
    Endpoint: https://jobicy.com/api/v2/remote-jobs
    """
    BASE_URL = "https://jobicy.com/api/v2/remote-jobs"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        query_clean = re.sub(r'[^\w\s]', '', query.lower())
        tokens = [t.strip() for t in query_clean.split() if len(t.strip()) > 2]
        
        all_jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json"
        }
        
        params = {
            "count": 50,
            "tag": query.replace(" ", "-") if query else "developer"
        }
        
        try:
            async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    jobs_list = data.get("jobs", [])
                    for j in jobs_list:
                        title = str(j.get("jobTitle", ""))
                        company = str(j.get("companyName", ""))
                        desc = clean_html_job_description(str(j.get("jobDescription", "")))
                        job_url = str(j.get("url", ""))
                        job_geo = str(j.get("jobGeo", "Remote"))
                        
                        # Match relevance
                        text_to_check = f"{title.lower()} {desc[:300].lower()}"
                        if not tokens or any(t in text_to_check for t in tokens):
                            # Salary if provided
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
        except Exception as e:
            print(f"Notice: Jobicy fetch error ({e})")
            
        print(f"[Jobicy] Fetched {len(all_jobs)} jobs for '{query}'")
        return all_jobs
