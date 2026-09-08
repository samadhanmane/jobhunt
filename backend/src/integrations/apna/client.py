import asyncio
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class ApnaClient(BaseJobIntegration):
    """
    Connector for India's high-growth professional and tech job network (Apna).
    Queries job listings across major Indian tech hubs and remote roles.
    """
    BASE_URL = "https://apna.co/jobs"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        jobs = []
        try:
            params = {"text": query or "software"}
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    links = soup.find_all("a", href=lambda h: h and "/job/" in h)
                    
                    seen_urls = set()
                    for a in links:
                        href = a.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        full_url = href if href.startswith("http") else f"https://apna.co{href}"
                        text = a.get_text(separator=" | ", strip=True)
                        parts = [p.strip() for p in text.split("|") if p.strip()]

                        title = parts[0] if len(parts) > 0 else "Software Professional"
                        if query and not is_title_role_match(title, query):
                            continue

                        company = parts[1] if len(parts) > 1 else "Apna Employer"
                        job_loc = parts[2] if len(parts) > 2 else "India"

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        work_mode = "Remote" if "remote" in text.lower() or "work from home" in text.lower() or remote else detect_work_mode(text)
                        desc = f"{title} at {company}. Location: {job_loc}. Details: {' | '.join(parts)}"

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "posted_date": format_posted_date_for_csv(None),
                            "source": "Apna",
                            "work_mode": work_mode,
                            "description": desc
                        })
        except Exception as e:
            print(f"[Apna] Notice: {e}")

        return jobs
