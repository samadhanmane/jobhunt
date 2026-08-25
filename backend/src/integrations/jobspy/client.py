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
        
        is_specific_loc = bool(location and location.lower().strip() not in ["remote", "worldwide", "global", "any", "all", ""])
        loc_clean = location.strip() if is_specific_loc else ("Remote" if remote else "")
        is_remote_param = False if is_specific_loc else remote
        results_count = kwargs.get("results_wanted", 20)

        import gc

        # Build list of Indeed country domains to scrape
        if is_specific_loc:
            target_countries = [get_indeed_country(location)]
        else:
            # Multi-domain global scraping across top tech hubs
            target_countries = ["usa", "india", "uk"]

        # Run scrapers strictly sequentially (semaphore 1) to guarantee memory stays under 50MB
        sem = asyncio.Semaphore(1)

        async def bounded_scrape(sites, country_code, count):
            async with sem:
                def _do_scrape():
                    try:
                        return scrape_jobs(
                            site_name=sites,
                            search_term=query,
                            location=loc_clean,
                            results_wanted=min(count, 15),
                            hours_old=168,  # 7 days of jobs
                            country_indeed=country_code,
                            is_remote=is_remote_param
                        )
                    except Exception as e:
                        print(f"Notice: JobSpy scrape notice ({sites}, {country_code}): {e}")
                        return None
                res = await loop.run_in_executor(None, _do_scrape)
                gc.collect()
                return res

        # Prepare scraping tasks
        tasks = [bounded_scrape(["linkedin"], "usa", min(results_count, 15))]
        for c in target_countries:
            tasks.append(bounded_scrape(["indeed"], c, 10 if len(target_countries) > 1 else min(results_count, 15)))

        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            dataframes = []
            for res in results:
                if isinstance(res, pd.DataFrame) and not res.empty:
                    dataframes.append(res)

            if not dataframes:
                gc.collect()
                return []

            combined_df = pd.concat(dataframes, ignore_index=True)
            # Deduplicate by job_url if available
            if "job_url" in combined_df.columns:
                combined_df = combined_df.drop_duplicates(subset=["job_url"])

            raw_jobs = []
            for _, row in combined_df.iterrows():
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

            # Explicitly free DataFrame memory immediately
            del combined_df
            del dataframes
            gc.collect()

            # Asynchronously enrich full descriptions for top 8 short LinkedIn jobs with strict semaphore
            enrich_sem = asyncio.Semaphore(2)
            async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=6.0, follow_redirects=True) as http_client:
                async def enrich_description(job_item):
                    desc = job_item.get("description", "").strip()
                    url = job_item.get("url", "").strip()
                    if (not desc or len(desc) < 80 or desc.lower() in ["none", "nan", "null"]) and "linkedin.com" in url:
                        async with enrich_sem:
                            try:
                                match = re.search(r"(?:view/|currentJobId=|jobs/view/|jobs/)(\d{8,12})", url) or re.search(r"(\d{8,12})", url)
                                if match:
                                    job_id = match.group(1)
                                    guest_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
                                    resp = await http_client.get(guest_url)
                                    if resp.status_code == 200:
                                        raw_text = resp.text
                                        # Fast regex extraction without heavy DOM parsing
                                        m = re.search(r'<div class="show-more-less-html__markup[^>]*>(.*?)</div>', raw_text, re.DOTALL)
                                        if m:
                                            fetched_desc = clean_html_job_description(m.group(1))
                                            if len(fetched_desc) > 80:
                                                job_item["description"] = fetched_desc
                            except Exception:
                                pass
                    return job_item

                enriched_jobs = await asyncio.gather(*[enrich_description(j) for j in raw_jobs[:20]])
                if len(raw_jobs) > 20:
                    enriched_jobs.extend(raw_jobs[20:])

            gc.collect()
            print(f"[JobSpy] Fetched & enriched {len(enriched_jobs)} jobs across {len(target_countries)} domains for query='{query}'")
            return enriched_jobs
        except Exception as e:
            print(f"Error scraping with JobSpy (Location: '{location}', Domains: {target_countries}): {e}")
            gc.collect()
            return []
