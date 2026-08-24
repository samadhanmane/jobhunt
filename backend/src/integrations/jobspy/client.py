import asyncio
import re
import pandas as pd
from typing import List, Dict, Any
from functools import partial
from jobspy import scrape_jobs
from src.integrations.base import BaseJobIntegration
from src.utils.text_cleaner import clean_html_job_description

def get_indeed_country(location_str: str) -> str:
    """Map user-entered location or city to a valid JobSpy country code."""
    loc = (location_str or "").lower().strip()
    if not loc or loc in ["remote", "worldwide", "any", "all", ""]:
        return "worldwide"
    
    country_map = {
        "india": "india", "pune": "india", "bangalore": "india", "mumbai": "india", "delhi": "india", 
        "hyderabad": "india", "noida": "india", "gurgaon": "india", "chennai": "india", "kolkata": "india",
        "united states": "usa", "usa": "usa", "us": "usa", "san francisco": "usa", "new york": "usa", 
        "california": "usa", "texas": "usa", "seattle": "usa", "austin": "usa", "chicago": "usa",
        "united kingdom": "uk", "uk": "uk", "london": "uk", "manchester": "uk", "birmingham": "uk",
        "germany": "germany", "berlin": "germany", "munich": "germany", "frankfurt": "germany", "hamburg": "germany",
        "canada": "canada", "toronto": "canada", "vancouver": "canada", "montreal": "canada", "ottawa": "canada",
        "australia": "australia", "sydney": "australia", "melbourne": "australia", "brisbane": "australia",
        "singapore": "singapore",
        "netherlands": "netherlands", "amsterdam": "netherlands", "rotterdam": "netherlands",
        "france": "france", "paris": "france",
        "united arab emirates": "united arab emirates", "uae": "united arab emirates", "dubai": "united arab emirates",
        "switzerland": "switzerland", "zurich": "switzerland", "geneva": "switzerland",
        "poland": "poland", "warsaw": "poland", "krakow": "poland",
        "spain": "spain", "madrid": "spain", "barcelona": "spain"
    }
    
    for key, country_code in country_map.items():
        if key in loc:
            return country_code
            
    return "usa"

import httpx
from bs4 import BeautifulSoup

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

class JobSpyClient(BaseJobIntegration):
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        loop = asyncio.get_event_loop()
        
        # Determine exact country for Indeed/Glassdoor scrapers
        country_indeed = get_indeed_country(location)
        
        # Site names to scrape (LinkedIn + Indeed are fast & reliable)
        site_names = ["linkedin", "indeed"]
        
        # Format clean location string
        is_specific_loc = bool(location and location.lower().strip() not in ["remote", "worldwide", "global", "any", "all", ""])
        loc_clean = location.strip() if is_specific_loc else ("Remote" if remote else "")
        
        # When a specific city/country is given (e.g. Pune, India), target that geo specifically
        is_remote_param = False if is_specific_loc else remote
        
        # Fetch 20 results per scraper for fast 5-second live response
        results_count = kwargs.get("results_wanted", 20)
            
        scrape_func = partial(
            scrape_jobs,
            site_name=site_names,
            search_term=query,
            location=loc_clean,
            results_wanted=results_count,
            hours_old=168,  # 7 days of jobs
            country_indeed=country_indeed,
            is_remote=is_remote_param
        )
        
        try:
            df = await loop.run_in_executor(None, scrape_func)
            if df is None or df.empty:
                return []
            
            raw_jobs = []
            for _, row in df.iterrows():
                min_sal = float(row["min_amount"]) if "min_amount" in row and pd.notna(row["min_amount"]) else None
                max_sal = float(row["max_amount"]) if "max_amount" in row and pd.notna(row["max_amount"]) else None
                currency = str(row.get("currency", "USD")) if "currency" in row and pd.notna(row["currency"]) else "USD"
                
                raw_desc = str(row.get("description", "")) if pd.notna(row.get("description")) else ""
                if raw_desc.strip().lower() in ["none", "nan", "null"]:
                    raw_desc = ""
                
                clean_desc = clean_html_job_description(raw_desc)
                
                raw_jobs.append({
                    "title": str(row.get("title", "")),
                    "company": str(row.get("company", "")),
                    "location": str(row.get("location", "")),
                    "description": clean_desc,
                    "url": str(row.get("job_url", "")),
                    "source": f"jobspy ({row.get('site', 'unknown')})",
                    "posted_date": str(row.get("date_posted", "")) if pd.notna(row.get("date_posted")) else None,
                    "salary_range": {
                        "min": min_sal,
                        "max": max_sal,
                        "currency": currency
                    } if (min_sal or max_sal) else None
                })

            # Asynchronously enrich full descriptions for any jobs that have empty/short descriptions (especially LinkedIn)
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=8.0, follow_redirects=True) as http_client:
                async def enrich_description(job_item):
                    desc = job_item.get("description", "").strip()
                    url = job_item.get("url", "").strip()
                    if (not desc or len(desc) < 80 or desc.lower() in ["none", "nan", "null"]) and "linkedin.com" in url:
                        try:
                            match = re.search(r"(?:view/|currentJobId=|jobs/view/|jobs/)(\d{8,12})", url) or re.search(r"(\d{8,12})", url)
                            if match:
                                job_id = match.group(1)
                                guest_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
                                resp = await http_client.get(guest_url)
                                if resp.status_code == 200:
                                    soup = BeautifulSoup(resp.text, "html.parser")
                                    content_el = soup.select_one(
                                        ".show-more-less-html__markup, .show-more-less-html__markup--clamp-after-5, "
                                        ".description__text, #job-details, .jobs-description__content, "
                                        ".jobs-box__html-content, .jobs-description-content__text, article, main"
                                    )
                                    if content_el:
                                        fetched_desc = clean_html_job_description(str(content_el))
                                        if len(fetched_desc) > 80:
                                            job_item["description"] = fetched_desc
                        except Exception:
                            pass
                    return job_item

                enriched_jobs = await asyncio.gather(*[enrich_description(j) for j in raw_jobs])

            print(f"[JobSpy] Fetched & enriched {len(enriched_jobs)} jobs for query='{query}' location='{loc_clean}' country='{country_indeed}'")
            return enriched_jobs
        except Exception as e:
            print(f"Error scraping with JobSpy (Location: '{location}', Country: '{country_indeed}'): {e}")
            return []
