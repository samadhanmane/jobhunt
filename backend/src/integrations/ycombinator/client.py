import asyncio
import datetime
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.text_cleaner import clean_html_job_description

class YCombinatorClient(BaseJobIntegration):
    """
    Startup & high-growth company connector querying official Y Combinator & Hacker News job postings.
    Endpoints:
    - https://hacker-news.firebaseio.com/v0/jobstories.json
    - https://hacker-news.firebaseio.com/v0/item/{id}.json
    """
    async def _fetch_item(self, client: httpx.AsyncClient, story_id: int) -> Optional[Dict[str, Any]]:
        try:
            resp = await client.get(f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json", timeout=6.0)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }

        jobs = []
        try:
            async with httpx.AsyncClient(headers=headers, timeout=12.0) as client:
                resp = await client.get("https://hacker-news.firebaseio.com/v0/jobstories.json")
                if resp.status_code != 200:
                    return []
                story_ids = resp.json() or []
                # Fetch up to 35 latest YC job stories
                selected_ids = story_ids[:35]

                tasks = [self._fetch_item(client, sid) for sid in selected_ids]
                items = await asyncio.gather(*tasks, return_exceptions=True)

                for item in items:
                    if not isinstance(item, dict):
                        continue

                    raw_title = str(item.get("title", "")).strip()
                    if not raw_title:
                        continue

                    # Extract company name from title e.g. "Opalite Health (YC W26) Is Hiring – Founding GTM"
                    company = "YC Startup"
                    clean_title = raw_title
                    yc_match = re.match(r'^(.*?)\s*(\(YC\s*[^\)]+\))?\s*(?:is hiring|hiring)\s*[:-]?\s*(.*)$', raw_title, re.IGNORECASE)
                    if yc_match:
                        company = yc_match.group(1).strip()
                        if yc_match.group(2):
                            company += f" {yc_match.group(2).strip()}"
                        clean_title = yc_match.group(3).strip() or raw_title
                    else:
                        parts = re.split(r'\s*[-–|]\s*', raw_title)
                        if len(parts) >= 2:
                            company = parts[0].strip()
                            clean_title = " - ".join(parts[1:]).strip()

                    if query and not (is_title_role_match(clean_title, query) or is_title_role_match(raw_title, query)):
                        continue

                    job_url = str(item.get("url") or f"https://news.ycombinator.com/item?id={item.get('id')}").strip()
                    raw_text = str(item.get("text", ""))
                    clean_desc = clean_html_job_description(raw_text) if raw_text else f"{clean_title} at Y Combinator backed startup {company}."

                    job_time = item.get("time")
                    posted_date = None
                    if job_time:
                        posted_date = datetime.datetime.utcfromtimestamp(job_time).strftime("%Y-%m-%d")

                    job_loc = "Remote / San Francisco" if "remote" in raw_title.lower() or "remote" in clean_desc.lower() else "Global"
                    loc_match = re.search(r'\bin\s+([A-Za-z\s,]+)$', raw_title, re.IGNORECASE)
                    if loc_match:
                        job_loc = loc_match.group(1).strip()

                    if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "ycombinator", clean_desc, clean_title, job_url):
                        continue

                    work_mode = "Remote" if "remote" in job_loc.lower() or "remote" in clean_desc.lower() else detect_work_mode(job_loc, clean_title, clean_desc)

                    jobs.append({
                        "title": clean_title,
                        "company": company,
                        "location": job_loc,
                        "description": clean_desc,
                        "url": job_url,
                        "source": "ycombinator",
                        "posted_date": posted_date,
                        "salary_range": None,
                        "work_mode": work_mode
                    })
        except Exception:
            pass

        return jobs
