import httpx
import re
from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

class RemoteOKClient(BaseJobIntegration):
    """
    RemoteOK public free jobs API integration.
    Endpoint: https://remoteok.com/api
    """
    BASE_URL = "https://remoteok.com/api"
    
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        query_clean = re.sub(r'[^\w\s]', '', query.lower())
        tokens = [t.strip() for t in query_clean.split() if len(t.strip()) > 2]
        
        all_jobs = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "application/json"
        }
        
        try:
            async with httpx.AsyncClient(headers=headers, timeout=10.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL)
                if resp.status_code == 200:
                    data = resp.json()
                    # First item in remoteok API is legal info
                    jobs_list = [j for j in data if isinstance(j, dict) and "position" in j]
                    
                    for j in jobs_list:
                        title = str(j.get("position", ""))
                        company = str(j.get("company", ""))
                        desc = clean_html_job_description(str(j.get("description", "")))
                        tags = [str(t).lower() for t in j.get("tags", [])]
                        job_url = j.get("url") or f"https://remoteok.com/l/{j.get('id', '')}"
                        location_val = j.get("location") or "Remote / Worldwide"
                        
                        text_to_check = f"{title.lower()} {' '.join(tags)} {desc[:300].lower()}"
                        if not tokens or any(t in text_to_check for t in tokens):
                            salary_info = None
                            min_sal = j.get("salary_min")
                            max_sal = j.get("salary_max")
                            if min_sal or max_sal:
                                salary_info = {
                                    "min": min_sal,
                                    "max": max_sal,
                                    "currency": "USD"
                                }
                                
                            all_jobs.append({
                                "title": title,
                                "company": company,
                                "location": location_val,
                                "description": desc,
                                "url": job_url,
                                "source": "remoteok",
                                "posted_date": j.get("date"),
                                "salary_range": salary_info
                            })
                            if len(all_jobs) >= 20:
                                break
        except Exception as e:
            print(f"Notice: RemoteOK fetch error ({e})")
            
        print(f"[RemoteOK] Fetched {len(all_jobs)} jobs for '{query}'")
        return all_jobs
