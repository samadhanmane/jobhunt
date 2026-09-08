import asyncio
import re
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class ShineClient(BaseJobIntegration):
    """
    Connector for India's major tech & corporate job board (Shine).
    Directly extracts job listings across major tech hubs.
    """
    BASE_URL = "https://www.shine.com/job-search"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        jobs = []
        try:
            slug = (query or "software-engineer").strip().replace(" ", "-").lower()
            url = f"{self.BASE_URL}/{slug}-jobs"
            
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    links = soup.find_all("a", href=lambda h: h and "/jobs/" in h and not "/jobs/search" in h)
                    
                    seen_urls = set()
                    for a in links:
                        href = a.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        full_url = href if href.startswith("http") else f"https://www.shine.com{href}"
                        title = a.get_text(strip=True)
                        if not title:
                            continue

                        if query and not is_title_role_match(title, query):
                            continue

                        parent = a.find_parent("div")
                        parent_text = parent.get_text(separator=" | ", strip=True) if parent else ""
                        parts = [p.strip() for p in parent_text.split("|") if p.strip()]

                        company = parts[1] if len(parts) > 1 else "Shine Employer"
                        job_loc = location or "India"

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        work_mode = "Remote" if remote or "remote" in parent_text.lower() else detect_work_mode(parent_text)

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "posted_date": format_posted_date_for_csv(None),
                            "source": "Shine",
                            "work_mode": work_mode,
                            "description": f"{title} at {company}. Platform: Shine. Location: {job_loc}."
                        })
        except Exception as e:
            print(f"[Shine] Notice: {e}")

        return jobs
