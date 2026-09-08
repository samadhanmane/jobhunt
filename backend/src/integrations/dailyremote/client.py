import asyncio
import re
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class DailyRemoteClient(BaseJobIntegration):
    """
    Connector for DailyRemote (Remote software engineering, AI, and developer jobs).
    Extracts live remote developer positions.
    """
    BASE_URL = "https://dailyremote.com/remote-jobs"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

        jobs = []
        try:
            params = {"search": query or "software"}
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    links = soup.find_all("a", href=lambda h: h and "/remote-job/" in h)

                    seen_urls = set()
                    for a in links:
                        href = a.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        full_url = href if href.startswith("http") else f"https://dailyremote.com{href}"
                        title = a.get_text(strip=True)
                        if not title:
                            continue

                        if query and not is_title_role_match(title, query):
                            continue

                        parent = a.find_parent("article") or a.find_parent("div")
                        parent_text = parent.get_text(separator=" | ", strip=True) if parent else ""
                        parts = [p.strip() for p in parent_text.split("|") if p.strip()]

                        company = parts[1] if len(parts) > 1 else "Remote Tech Company"
                        job_loc = "Remote"

                        if location and not is_job_location_match(job_loc, location, True):
                            continue

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "posted_date": format_posted_date_for_csv(None),
                            "source": "DailyRemote",
                            "work_mode": "Remote",
                            "description": f"Remote position: {title} at {company}. Platform: DailyRemote. Context: {parent_text[:200]}"
                        })

                        if len(jobs) >= 20:
                            break
        except Exception as e:
            print(f"[DailyRemote] Notice: {e}")

        return jobs
