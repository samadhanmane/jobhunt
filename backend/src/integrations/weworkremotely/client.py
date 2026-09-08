import asyncio
import re
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class WeWorkRemotelyClient(BaseJobIntegration):
    """
    Standardized connector for remote developer and tech jobs from We Work Remotely.
    Queries official RSS feeds for Programming, DevOps, and Data Science.
    """
    FEEDS = [
        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
        "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss"
    ]

    async def _fetch_feed(self, client: httpx.AsyncClient, feed_url: str, query: str, location: str, remote: bool) -> List[Dict[str, Any]]:
        jobs = []
        try:
            resp = await client.get(feed_url, timeout=15.0)
            if resp.status_code != 200:
                return []

            root = ET.fromstring(resp.content)
            items = root.findall(".//item")

            for item in items:
                raw_title = item.findtext("title") or ""
                link = item.findtext("link") or item.findtext("guid") or ""
                pub_date = item.findtext("pubDate") or ""
                region = item.findtext("region") or "Remote"
                raw_desc = item.findtext("description") or ""

                company = "WeWorkRemotely"
                job_title = raw_title
                if ": " in raw_title:
                    parts = raw_title.split(": ", 1)
                    company = parts[0].strip()
                    job_title = parts[1].strip()

                if not job_title:
                    continue

                if query and not is_title_role_match(job_title, query):
                    continue

                if location and not is_job_location_match(region, location, remote):
                    continue

                posted_date = format_posted_date_for_csv(pub_date)
                desc_clean = re.sub(r"<[^>]+>", " ", raw_desc).strip()

                jobs.append({
                    "title": job_title,
                    "company": company,
                    "location": region or "Remote",
                    "url": link,
                    "posted_date": posted_date,
                    "source": "WeWorkRemotely",
                    "work_mode": "Remote",
                    "description": desc_clean[:2000] if desc_clean else f"{job_title} at {company}"
                })
        except Exception as e:
            print(f"[WeWorkRemotely] Error parsing feed {feed_url}: {e}")

        return jobs

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml"
        }
        async with httpx.AsyncClient(headers=headers, timeout=20.0, follow_redirects=True) as client:
            tasks = [self._fetch_feed(client, f, query, location, remote) for f in self.FEEDS]
            results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        seen_urls = set()
        for r in results:
            if isinstance(r, list):
                for j in r:
                    url = j.get("url")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        all_jobs.append(j)
        return all_jobs
