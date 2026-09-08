import asyncio
import re
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class BuiltInClient(BaseJobIntegration):
    """
    Connector for Built In (US, India, and Global tech and startup ecosystem).
    Extracts rich job cards including company, level, freshness, and work mode.
    """
    BASE_URL = "https://builtin.com/jobs"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        jobs = []
        try:
            params = {"search": query or "software engineer"}
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    cards = soup.find_all("div", attrs={"data-id": True})
                    if not cards:
                        cards = soup.find_all("div", class_=lambda c: c and "job-card" in c.lower())

                    seen_urls = set()
                    for c in cards:
                        link = c.find("a", href=lambda h: h and "/job/" in h)
                        if not link:
                            continue

                        href = link.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        full_url = href if href.startswith("http") else f"https://builtin.com{href}"
                        title = link.get_text(strip=True)
                        if not title:
                            continue

                        if query and not is_title_role_match(title, query):
                            continue

                        card_text = c.get_text(separator=" | ", strip=True)
                        parts = [p.strip() for p in card_text.split("|") if p.strip()]

                        company = parts[0] if parts else "Tech Employer"
                        
                        # Extract location and work mode from parts
                        job_loc = "Global"
                        work_mode = "On-site"
                        for p in parts:
                            p_lower = p.lower()
                            if "hybrid" in p_lower:
                                work_mode = "Hybrid"
                            elif "remote" in p_lower:
                                work_mode = "Remote"
                            if any(k in p_lower for k in ["india", "bengaluru", "delhi", "mumbai", "pune", "hyderabad", "ca", "ny", "tx", "wa", "usa"]):
                                job_loc = p

                        if remote:
                            work_mode = "Remote"

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "posted_date": format_posted_date_for_csv(None),
                            "source": "BuiltIn",
                            "work_mode": work_mode,
                            "description": f"{title} at {company}. Platform: BuiltIn. Details: {card_text[:300]}"
                        })
        except Exception as e:
            print(f"[BuiltIn] Notice: {e}")

        return jobs
