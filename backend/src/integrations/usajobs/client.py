import os
import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class USAJobsClient(BaseJobIntegration):
    """
    Official connector for US Government and public sector technology roles from USAJOBS.
    Queries the official REST API at https://data.usajobs.gov/api/search.
    """
    SEARCH_URL = "https://data.usajobs.gov/api/search"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        api_key = os.getenv("USAJOBS_API_KEY", "")
        email = os.getenv("USAJOBS_EMAIL", "jobhunt@example.com")

        if not api_key:
            return []

        headers = {
            "Host": "data.usajobs.gov",
            "User-Agent": email,
            "Authorization-Key": api_key
        }

        jobs = []
        try:
            params = {
                "Keyword": query or "Software Engineer",
                "LocationName": location or "",
                "ResultsPerPage": 25
            }
            async with httpx.AsyncClient(headers=headers, timeout=12.0) as client:
                resp = await client.get(self.SEARCH_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    search_result = data.get("SearchResult", {})
                    items = search_result.get("SearchResultItems", [])
                    for item in items:
                        matched = item.get("MatchedObjectDescriptor", {})
                        title = matched.get("PositionTitle", "").strip()
                        if not title:
                            continue
                        if query and not is_title_role_match(title, query):
                            continue

                        agency = matched.get("DepartmentName") or matched.get("OrganizationName") or "US Federal Government"
                        job_loc = "United States"
                        pos_locs = matched.get("PositionLocation", [])
                        if pos_locs and isinstance(pos_locs, list):
                            job_loc = pos_locs[0].get("LocationName", "United States")

                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        url = matched.get("PositionURI", "")
                        posted_date = format_posted_date_for_csv(matched.get("PublicationStartDate"))
                        remun = matched.get("PositionRemuneration", [{}])[0] if matched.get("PositionRemuneration") else {}
                        min_sal = remun.get("MinimumRange", "")
                        max_sal = remun.get("MaximumRange", "")
                        salary = f"${min_sal} - ${max_sal}" if min_sal and max_sal else ""

                        jobs.append({
                            "title": f"[Gov] {title}",
                            "company": agency,
                            "location": job_loc,
                            "url": url,
                            "posted_date": posted_date,
                            "source": "USAJOBS",
                            "work_mode": "Remote" if "remote" in job_loc.lower() or remote else detect_work_mode(job_loc),
                            "salary": salary,
                            "description": f"Federal government position: {title} at {agency}. Location: {job_loc}."
                        })
        except Exception as e:
            print(f"[USAJOBS] Notice: {e}")

        return jobs
