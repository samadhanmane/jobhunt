from datetime import datetime, timedelta
import asyncio
import re
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode, is_foreign_location
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv, is_within_days, parse_relative_posted_date

def parse_builtin_relative_date(s_val: str) -> Optional[str]:
    """Parses BuiltIn relative date expressions like 'Yesterday', '8 Days Ago', 'Reposted 6 Hours Ago', 'One Month Ago'."""
    return parse_relative_posted_date(s_val)

class BuiltInClient(BaseJobIntegration):
    """
    Connector for Built In (US, India, and Global tech and startup ecosystem).
    Extracts rich job cards including company, level, freshness, and work mode.
    """
    BASE_URL = "https://builtin.com/jobs"
    REMOTE_URL = "https://builtin.com/jobs/remote"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        jobs = []
        max_days = kwargs.get("max_days")
        try:
            # If user explicitly wants remote, query BuiltIn's dedicated remote catalog
            url = self.REMOTE_URL if remote else self.BASE_URL
            params = {"search": query or "software engineer"}
            
            # If target location is India and not remote, pass country=IND filter
            loc_low = str(location or "").lower()
            is_india_target = any(k in loc_low for k in ["india", "bengaluru", "bangalore", "delhi", "mumbai", "pune", "hyderabad", "chennai", "noida", "gurgaon", "gurugram", "kolkata"])
            if is_india_target and not remote:
                params["country"] = "IND"

            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(url, params=params)
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

                        # 1. Extract Real Posted Date from Card
                        posted_date = "N/A"
                        for p in parts[1:6]:
                            parsed_date = parse_builtin_relative_date(p)
                            if parsed_date:
                                posted_date = parsed_date
                                break

                        if posted_date == "N/A":
                            posted_date = format_posted_date_for_csv(None)

                        # Filter by date freshness if max_days is requested
                        if max_days and posted_date != "N/A":
                            if not is_within_days(posted_date, max_days):
                                continue

                        # 2. Extract Real Work Mode (NEVER override to Remote if it is On-site or Hybrid)
                        work_mode = "On-site"
                        for p in parts[2:7]:
                            p_low = p.lower()
                            if "in-office or remote" in p_low or "remote or in-office" in p_low:
                                work_mode = "Remote"
                                break
                            elif "hybrid" in p_low:
                                work_mode = "Hybrid"
                                break
                            elif "in-office" in p_low or "in office" in p_low or "onsite" in p_low or "on-site" in p_low:
                                work_mode = "On-site"
                                break
                            elif "remote" in p_low or "work from home" in p_low:
                                work_mode = "Remote"
                                break

                        # Strict Remote Gate: If user requested Remote jobs, reject strictly On-site or Hybrid jobs!
                        if remote and work_mode not in ["Remote"]:
                            continue

                        # 3. Extract Real Location
                        job_loc = ""
                        for p in parts[3:8]:
                            p_low = p.lower()
                            if any(c in p for c in [", IND", ", USA", ", GBR", ", CAN", ", DEU", ", AUS"]):
                                job_loc = p.strip()[:80]
                                break
                            elif any(k in p_low for k in ["india", "bengaluru", "bangalore", "delhi", "mumbai", "pune", "hyderabad", "chennai", "noida", "gurgaon", "gurugram", "kolkata"]):
                                job_loc = p.strip()[:80]
                                break
                            elif "locations" in p_low:
                                job_loc = p.strip()[:80]
                                break

                        if not job_loc:
                            for p in parts:
                                p_low = p.lower()
                                if len(p) <= 80 and any(k in p_low for k in ["india", "ind", "bengaluru", "bangalore", "delhi", "mumbai", "pune", "hyderabad", "chennai", "usa", "gbr", "can", "deu", "aus", "san francisco", "new york", "austin", "chicago"]):
                                    job_loc = p.strip()[:80]
                                    break

                        if not job_loc:
                            job_loc = "Remote" if work_mode == "Remote" else ("India" if is_india_target else "Global")

                        # 4. Strict Outside India Gate for Indian Targets:
                        if is_india_target:
                            # Reject any job explicitly located in foreign countries/cities
                            if is_foreign_location(job_loc):
                                continue
                            # Reject multi-location if it does not explicitly reference India
                            if "locations" in job_loc.lower() and not any(k in card_text.lower() for k in ["india", ", ind", "bengaluru", "bangalore", "mumbai", "pune", "delhi", "hyderabad", "chennai"]):
                                continue

                        # 5. General Location Match
                        if location and not is_job_location_match(job_loc, location, pref_work_mode="remote" if remote else "any", job_work_mode=work_mode):
                            continue

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "posted_date": posted_date,
                            "source": "BuiltIn",
                            "work_mode": work_mode,
                            "description": f"{title} at {company}. Work Mode: {work_mode}. Location: {job_loc}. Platform: BuiltIn. Details: {card_text[:300]}"
                        })
        except Exception as e:
            print(f"[BuiltIn] Notice: {e}")

        return jobs
