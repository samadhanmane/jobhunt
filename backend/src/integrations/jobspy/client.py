import asyncio
import re
import pandas as pd
from typing import List, Dict, Any
from functools import partial
from jobspy import scrape_jobs
from src.integrations.base import BaseJobIntegration

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
            
    return "worldwide"

class JobSpyClient(BaseJobIntegration):
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        loop = asyncio.get_event_loop()
        
        # Determine exact country for Indeed/Glassdoor scrapers
        country_indeed = get_indeed_country(location)
        
        # Site names to scrape (Glassdoor only supports specific countries, not worldwide)
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
            
            jobs = []
            for _, row in df.iterrows():
                min_sal = float(row["min_amount"]) if "min_amount" in row and pd.notna(row["min_amount"]) else None
                max_sal = float(row["max_amount"]) if "max_amount" in row and pd.notna(row["max_amount"]) else None
                currency = str(row.get("currency", "USD")) if "currency" in row and pd.notna(row["currency"]) else "USD"
                
                jobs.append({
                    "title": str(row.get("title", "")),
                    "company": str(row.get("company", "")),
                    "location": str(row.get("location", "")),
                    "description": str(row.get("description", "")),
                    "url": str(row.get("job_url", "")),
                    "source": f"jobspy ({row.get('site', 'unknown')})",
                    "posted_date": str(row.get("date_posted", "")) if pd.notna(row.get("date_posted")) else None,
                    "salary_range": {
                        "min": min_sal,
                        "max": max_sal,
                        "currency": currency
                    } if (min_sal or max_sal) else None
                })
            print(f"[JobSpy] Fetched {len(jobs)} jobs for query='{query}' location='{loc_clean}' country='{country_indeed}'")
            return jobs
        except Exception as e:
            print(f"Error scraping with JobSpy (Location: '{location}', Country: '{country_indeed}'): {e}")
            return []
