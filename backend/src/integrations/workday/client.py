import asyncio
import datetime
import re
from typing import List, Dict, Any, Optional
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

# Verified Enterprise Workday Tenants with tech & engineering hubs
WORKDAY_TENANTS = [
    {"name": "NVIDIA", "tenant": "nvidia", "site": "NVIDIAExternalCareerSite", "wd_num": 1},
    {"name": "Adobe", "tenant": "adobe", "site": "external_experienced", "wd_num": 5},
    {"name": "Salesforce", "tenant": "salesforce", "site": "External_Career_Site", "wd_num": 1},
    {"name": "Target", "tenant": "target", "site": "targetcareers", "wd_num": 5},
    {"name": "Cisco", "tenant": "cisco", "site": "Cisco_Jobs", "wd_num": 1},
    {"name": "PayPal", "tenant": "paypal", "site": "jobs", "wd_num": 1},
    {"name": "Autodesk", "tenant": "autodesk", "site": "Ext", "wd_num": 1},
    {"name": "Workday", "tenant": "workday", "site": "Workday", "wd_num": 1},
    {"name": "Qualcomm", "tenant": "qualcomm", "site": "External", "wd_num": 5},
    {"name": "AMD", "tenant": "amd", "site": "AMD_Careers", "wd_num": 1}
]

def parse_workday_posted_on(posted_on_str: Optional[str]) -> Optional[str]:
    """Parses Workday relative dates like 'Posted Today', 'Posted 3 Days Ago' into YYYY-MM-DD."""
    if not posted_on_str:
        return None
    s = posted_on_str.lower().strip()
    today = datetime.datetime.utcnow().date()

    if "today" in s or "hour" in s or "minute" in s:
        return today.strftime("%Y-%m-%d")
    if "yesterday" in s:
        return (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    
    match = re.search(r'posted\s+(\d+)\+?\s+days?\s+ago', s)
    if match:
        days = int(match.group(1))
        return (today - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    
    # Check standard ISO or date string
    return format_posted_date_for_csv(posted_on_str)

class WorkdayClient(BaseJobIntegration):
    """
    Universal, reusable Workday CXS (Candidate Experience Services) Connector.
    Interfaces directly with Workday's standard public search API across enterprise companies.
    """
    def __init__(self, tenants: Optional[List[Dict[str, Any]]] = None):
        self.tenants = tenants or WORKDAY_TENANTS

    async def _fetch_tenant_jobs(
        self,
        client: httpx.AsyncClient,
        tenant_info: Dict[str, Any],
        query: str,
        location: str,
        remote: bool
    ) -> List[Dict[str, Any]]:
        name = tenant_info["name"]
        tenant = tenant_info["tenant"]
        site = tenant_info["site"]
        wd_num = tenant_info.get("wd_num", 1)

        api_url = f"https://{tenant}.wd{wd_num}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs"
        base_portal = f"https://{tenant}.wd{wd_num}.myworkdayjobs.com/en-US/{site}"

        payload = {
            "appliedFacets": {},
            "limit": 20,
            "offset": 0,
            "searchText": query
        }

        jobs = []
        try:
            resp = await client.post(api_url, json=payload, timeout=12.0)
            if resp.status_code != 200:
                return []
            data = resp.json()
            postings = data.get("jobPostings", []) or []

            for p in postings:
                title = str(p.get("title", "")).strip()
                if not title:
                    continue

                if query and not is_title_role_match(title, query):
                    continue

                job_loc = str(p.get("locationsText", "Remote / Global")).strip()
                external_path = str(p.get("externalPath", "")).strip()
                job_url = f"{base_portal}{external_path}" if external_path else ""
                if not job_url:
                    continue

                bullets = p.get("bulletFields", []) or []
                bullet_str = " | ".join(bullets)

                clean_desc = f"Direct Enterprise role at {name} for {title}. Location: {job_loc}. {bullet_str}"

                if location and not is_job_location_match(job_loc, location, "remote" if remote else "any", "workday", clean_desc, title, job_url):
                    continue

                raw_posted = p.get("postedOn")
                posted_date = parse_workday_posted_on(raw_posted)
                work_mode = detect_work_mode(job_loc, title, clean_desc)

                jobs.append({
                    "title": title,
                    "company": name,
                    "location": job_loc,
                    "description": clean_desc,
                    "url": job_url,
                    "source": "workday",
                    "posted_date": posted_date,
                    "salary_range": None,
                    "work_mode": work_mode
                })
        except Exception:
            pass
        return jobs

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        clean_query = query.lower().strip()
        WHITELIST_2LETTER = {"ai", "ml", "qa", "ui", "ux", "go", "ci", "cd", "r", "c"}
        tokens = [t for t in re.sub(r'[^\w\s]', '', clean_query).split() if len(t) > 2 or t in WHITELIST_2LETTER]

        all_jobs = []
        seen_urls = set()
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        sem = asyncio.Semaphore(6)

        async def fetch_bounded(client, tenant_info):
            async with sem:
                return await self._fetch_tenant_jobs(client, tenant_info, query, location, remote)

        async with httpx.AsyncClient(headers=headers, timeout=14.0, follow_redirects=True) as client:
            tasks = [fetch_bounded(client, t) for t in self.tenants]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, list):
                    for j in res:
                        u = j.get("url")
                        if u and u not in seen_urls:
                            seen_urls.add(u)
                            all_jobs.append(j)

        return all_jobs
