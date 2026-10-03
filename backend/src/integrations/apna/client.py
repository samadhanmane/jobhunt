import asyncio
import datetime
import json
import re
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv, is_within_days

class ApnaClient(BaseJobIntegration):
    """
    Connector for India's high-growth professional and tech job network (Apna).
    Queries job listings across major Indian tech hubs and remote roles with verified
    ISO date posted extraction, validThrough expiration filtering, and clean title parsing.
    """
    BASE_URL = "https://apna.co/jobs"
    BADGE_PREFIXES = [
        "urgently hiring", "hot job", "featured", "immediate joiner",
        "actively hiring", "fast hiring", "verified employer", "sponsored"
    ]

    async def _fetch_job_detail(self, client: httpx.AsyncClient, job: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Fetches individual job detail page to extract official JSON-LD datePosted, validThrough, and schema data."""
        try:
            resp = await client.get(job["url"], timeout=4.5)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for s in soup.find_all("script", type="application/ld+json"):
                    if "JobPosting" in s.text:
                        try:
                            data = json.loads(s.text)
                            # 1. Check expiration date (validThrough)
                            valid_through = data.get("validThrough")
                            if valid_through:
                                vt_date = str(valid_through).split("T")[0].strip()
                                today_date = datetime.datetime.utcnow().strftime("%Y-%m-%d")
                                if vt_date < today_date:
                                    # Job posting is officially expired
                                    return None

                            # 2. Extract verified datePosted
                            date_posted = data.get("datePosted")
                            if date_posted:
                                job["posted_date"] = format_posted_date_for_csv(date_posted)

                            # 3. Refine schema title, company, and location
                            if data.get("title"):
                                official_title = str(data["title"]).strip()
                                if len(official_title) >= 3:
                                    job["title"] = official_title

                            hiring_org = data.get("hiringOrganization")
                            if isinstance(hiring_org, dict) and hiring_org.get("name"):
                                job["company"] = str(hiring_org["name"]).strip()

                            job_loc_obj = data.get("jobLocation")
                            if isinstance(job_loc_obj, dict):
                                addr = job_loc_obj.get("address")
                                if isinstance(addr, dict):
                                    city = addr.get("addressLocality") or addr.get("streetAddress")
                                    country = addr.get("addressCountry", "IN")
                                    if city:
                                        job["location"] = f"{city.strip()}, {country}"

                            # 4. Clean description
                            raw_desc = data.get("description")
                            if raw_desc:
                                clean_text = BeautifulSoup(raw_desc, "html.parser").get_text(separator=" ", strip=True)
                                if len(clean_text) > 40:
                                    job["description"] = f"{job['title']} at {job['company']}. Work Mode: {job['work_mode']}. Location: {job['location']}. Details: {clean_text[:600]}"
                        except Exception:
                            pass
                        break
        except Exception:
            pass
        return job

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
        }

        jobs = []
        max_days = kwargs.get("max_days")
        try:
            # When remote=True is requested, search for remote / work from home roles on Apna
            search_query = query or "software"
            if remote and "remote" not in search_query.lower() and "work from home" not in search_query.lower():
                search_query = f"{search_query} remote"

            params = {"text": search_query}
            if location and not remote:
                loc_clean = location.split(",")[0].strip()
                if loc_clean.lower() not in ["india", "any", "all", "worldwide", "global"]:
                    params["location"] = loc_clean

            candidate_jobs = []
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code != 200:
                    return []

                soup = BeautifulSoup(resp.text, "html.parser")
                links = soup.find_all("a", href=lambda h: h and "/job/" in h)

                seen_urls = set()
                for a in links:
                    href = a.get("href", "")
                    if not href or href in seen_urls:
                        continue
                    seen_urls.add(href)

                    full_url = href if href.startswith("http") else f"https://apna.co{href}"
                    raw_text = a.get_text(separator=" | ", strip=True)
                    parts = [p.strip() for p in raw_text.split("|") if p.strip()]

                    # Filter out badges from the beginning of parts
                    while parts and any(parts[0].lower().startswith(b) for b in self.BADGE_PREFIXES):
                        parts.pop(0)

                    title = parts[0] if len(parts) > 0 else "Software Professional"
                    if query and not is_title_role_match(title, query):
                        continue

                    company = parts[1] if len(parts) > 1 else "Apna Employer"
                    job_loc = parts[2] if len(parts) > 2 else "India"

                    # Determine real work mode
                    card_text_lower = raw_text.lower()
                    if "work from office" in card_text_lower or "in-office" in card_text_lower or "in office" in card_text_lower:
                        work_mode = "On-site"
                    elif "work from home" in card_text_lower or "remote" in card_text_lower:
                        work_mode = "Remote"
                    elif "hybrid" in card_text_lower:
                        work_mode = "Hybrid"
                    else:
                        work_mode = detect_work_mode(job_loc, title, raw_text)

                    # Strict Remote Gate: If user requested Remote, reject On-site or Hybrid jobs!
                    if remote and work_mode not in ["Remote"]:
                        continue

                    # Location Matching
                    if location and not is_job_location_match(job_loc, location, pref_work_mode="remote" if remote else "any", job_work_mode=work_mode):
                        continue

                    candidate_jobs.append({
                        "title": title,
                        "company": company,
                        "location": job_loc,
                        "url": full_url,
                        "posted_date": "N/A",
                        "source": "Apna",
                        "work_mode": work_mode,
                        "description": f"{title} at {company}. Work Mode: {work_mode}. Location: {job_loc}. Details: {' | '.join(parts)}"
                    })

                    if len(candidate_jobs) >= 15:
                        break

                if not candidate_jobs:
                    return []

                # Concurrently verify detail pages for JSON-LD datePosted, validThrough expiration, and exact metadata
                detail_tasks = [self._fetch_job_detail(client, j) for j in candidate_jobs]
                detail_results = await asyncio.gather(*detail_tasks, return_exceptions=True)

                for res in detail_results:
                    if isinstance(res, dict) and res is not None:
                        posted_date = res.get("posted_date", "N/A")

                        # Verify date freshness if max_days is requested
                        if max_days:
                            if posted_date == "N/A" or not is_within_days(posted_date, max_days):
                                continue

                        jobs.append(res)
        except Exception as e:
            print(f"[Apna] Notice: {e}")

        return jobs
