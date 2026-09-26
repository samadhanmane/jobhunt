import asyncio
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

CITY_SLUGS = {
    "pune": "pune",
    "bangalore": "bangalore",
    "bengaluru": "bangalore",
    "hyderabad": "hyderabad",
    "delhi": "delhi",
    "ncr": "delhi",
    "noida": "noida",
    "gurgaon": "gurgaon",
    "gurugram": "gurgaon",
    "mumbai": "mumbai",
    "chennai": "chennai",
    "kolkata": "kolkata",
    "ahmedabad": "ahmedabad",
}

class HireDoorClient(BaseJobIntegration):
    """
    Connector for HireDoor (hiredoor.in) - India's 100% free verified tech & startup job platform.
    Directly extracts verified tech roles, competitive CTCs, work modes, and experience levels.
    """
    BASE_URL = "https://hiredoor.in/jobs"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://hiredoor.in/"
        }

        # Route to city-specific or remote pages if applicable for optimal accuracy
        clean_loc = (location or "").lower().strip()
        matched_city = None
        for key, slug in CITY_SLUGS.items():
            if key in clean_loc:
                matched_city = slug
                break

        if remote and not matched_city:
            target_url = f"{self.BASE_URL}/remote"
        elif matched_city:
            target_url = f"{self.BASE_URL}/{matched_city}"
        else:
            target_url = self.BASE_URL

        params = {}
        if query:
            params["q"] = query.strip()

        jobs = []
        seen_urls = set()

        try:
            async with httpx.AsyncClient(headers=headers, timeout=12.0, follow_redirects=True) as client:
                resp = await client.get(target_url, params=params)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    # Cards are links to /jobs/<slug> with at least two hyphens to avoid city landing paths
                    cards = [
                        a for a in soup.find_all("a")
                        if a.get("href", "").startswith("/jobs/") and len(a.get("href", "").split("-")) > 2
                    ]

                    for c in cards:
                        href = c.get("href", "")
                        if not href or href in seen_urls:
                            continue
                        seen_urls.add(href)

                        full_url = href if href.startswith("http") else f"https://hiredoor.in{href}"

                        # Title
                        title_el = c.find("h3")
                        title = title_el.get_text(strip=True) if title_el else ""
                        if not title:
                            continue

                        # Check role match if query provided
                        if query and not is_title_role_match(title, query):
                            continue

                        # Company
                        company = "Tech Employer"
                        company_el = c.find("div", class_=lambda cl: cl and "font-semibold" in cl)
                        if company_el:
                            company = company_el.get_text(strip=True)
                        elif c.find("img", alt=True):
                            company = c.find("img")["alt"].replace(" logo", "").strip()

                        # Badges (spans)
                        badges = [s.get_text(strip=True) for s in c.find_all("span") if s.get_text(strip=True)]
                        posted_raw = None
                        card_work_mode = "Onsite"
                        emp_type = "Full Time"
                        experience = None

                        for b in badges:
                            b_lower = b.lower()
                            if "ago" in b_lower or "today" in b_lower or "yesterday" in b_lower:
                                posted_raw = b
                            elif b_lower in ["remote", "onsite", "hybrid"]:
                                card_work_mode = b.capitalize()
                            elif "time" in b_lower or "intern" in b_lower or "contract" in b_lower:
                                emp_type = b
                            elif "year" in b_lower or "yr" in b_lower:
                                experience = b

                        # Bottom box: salary & location
                        salary = "Competitive"
                        job_loc = "India"
                        bottom_box = c.find("div", class_=lambda cl: cl and "border-t" in cl)
                        if bottom_box:
                            sal_div = bottom_box.find("div", class_=lambda cl: cl and "font-bold" in cl)
                            loc_div = bottom_box.find("div", class_=lambda cl: cl and "text-muted-foreground" in cl)
                            if sal_div:
                                salary = sal_div.get_text(strip=True)
                            if loc_div:
                                job_loc = loc_div.get_text(strip=True)

                        # Location filtering
                        if location and not is_job_location_match(job_loc, location, remote):
                            continue

                        # Work mode detection
                        if remote or card_work_mode.lower() == "remote":
                            final_work_mode = "Remote"
                        elif card_work_mode.lower() == "hybrid":
                            final_work_mode = "Hybrid"
                        else:
                            final_work_mode = detect_work_mode(f"{job_loc} {card_work_mode}")

                        desc_parts = [
                            f"{title} at {company}.",
                            f"Location: {job_loc}.",
                            f"Work Mode: {final_work_mode} ({emp_type}).",
                            f"Experience: {experience or 'Not specified'}.",
                            f"Salary: {salary}."
                        ]

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": job_loc,
                            "url": full_url,
                            "salary": salary if salary and salary.lower() != "competitive" else None,
                            "posted_date": format_posted_date_for_csv(posted_raw),
                            "source": "HireDoor",
                            "work_mode": final_work_mode,
                            "experience": experience,
                            "description": " ".join(desc_parts)
                        })
        except Exception as e:
            print(f"[HireDoor] Notice: {e}")

        return jobs
