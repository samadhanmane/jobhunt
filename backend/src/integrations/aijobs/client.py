import asyncio
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class AIJobsClient(BaseJobIntegration):
    """
    Dedicated connector for AI, Machine Learning, and Data Science job feeds.
    Aggregates from KDnuggets, AI-Jobs, and open data science career feeds.
    """
    FEEDS = [
        {"url": "https://www.kdnuggets.com/feed", "source": "KDnuggets"},
    ]

    async def _fetch_feed(self, client: httpx.AsyncClient, feed_info: Dict[str, str], query: str, location: str, remote: bool) -> List[Dict[str, Any]]:
        feed_url = feed_info["url"]
        source_name = feed_info["source"]
        jobs = []
        try:
            resp = await client.get(feed_url, timeout=12.0)
            if resp.status_code != 200:
                return []

            root = ET.fromstring(resp.content)
            items = root.findall(".//item")

            for item in items:
                title = item.findtext("title") or ""
                link = item.findtext("link") or ""
                pub_date = item.findtext("pubDate") or ""
                desc = item.findtext("description") or ""

                if not title:
                    continue

                # Filter for AI/ML/Data science or matching query
                title_lower = title.lower()
                ai_terms = ["ai", "ml", "data", "machine learning", "deep learning", "nlp", "vision", "scientist", "engineer"]
                if not any(t in title_lower for t in ai_terms) and not is_title_role_match(title, query):
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                company = "AI Employer"
                if " at " in title:
                    parts = title.split(" at ", 1)
                    title = parts[0].strip()
                    company = parts[1].strip()
                elif " - " in title:
                    parts = title.split(" - ", 1)
                    title = parts[0].strip()
                    company = parts[1].strip()

                desc_clean = re.sub(r"<[^>]+>", " ", desc).strip()
                work_mode = detect_work_mode(desc_clean)
                job_loc = "Remote / Global" if "remote" in work_mode.lower() else "Global"

                if location and not is_job_location_match(job_loc, location, remote):
                    continue

                jobs.append({
                    "title": f"[AI/ML] {title}",
                    "company": company,
                    "location": job_loc,
                    "url": link,
                    "posted_date": format_posted_date_for_csv(pub_date),
                    "source": source_name,
                    "work_mode": work_mode,
                    "description": desc_clean[:2000] if desc_clean else f"{title} at {company}"
                })
        except Exception as e:
            print(f"[AIJobs] Notice parsing {feed_url}: {e}")

        return jobs

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml"
        }
        async with httpx.AsyncClient(headers=headers, timeout=15.0, follow_redirects=True) as client:
            tasks = [self._fetch_feed(client, f, query, location, remote) for f in self.FEEDS]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        for r in results:
            if isinstance(r, list):
                all_jobs.extend(r)
        return all_jobs
