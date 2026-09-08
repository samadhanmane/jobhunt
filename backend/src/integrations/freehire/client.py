"""
freehire/client.py - Freehire API Client for Python Backend Services
Integrates Freehire.me API (https://freehire.me) into the job aggregator.
"""
import os
import re
from typing import Any, Dict, List, Optional
import httpx
from src.config import settings
from src.integrations.base import BaseJobIntegration

def extract_freehire_geo(location_str: str):
    if not location_str:
        return None, None
    loc = location_str.lower().strip()
    if loc in ["remote", "worldwide", "global", "any"]:
        return None, None
    
    country_map = {
        "india": "IN", "pune": "IN", "bangalore": "IN", "mumbai": "IN", "delhi": "IN", "hyderabad": "IN", "noida": "IN", "chennai": "IN",
        "united states": "US", "usa": "US", "us": "US", "san francisco": "US", "new york": "US", "california": "US", "texas": "US",
        "united kingdom": "GB", "uk": "GB", "london": "GB", "manchester": "GB",
        "germany": "DE", "berlin": "DE", "munich": "DE",
        "canada": "CA", "toronto": "CA", "vancouver": "CA",
        "australia": "AU", "sydney": "AU", "melbourne": "AU",
        "singapore": "SG",
        "united arab emirates": "AE", "uae": "AE", "dubai": "AE",
        "netherlands": "NL", "amsterdam": "NL"
    }
    country = None
    for k, v in country_map.items():
        if k in loc:
            country = v
            break
            
    parts = [p.strip() for p in re.split(r"[,/ ]", location_str) if p.strip()]
    city = parts[0] if parts and parts[0].lower() not in ["india", "usa", "uk", "germany", "remote", "worldwide"] else None
    return country, city

class FreehireAPIError(Exception):
    """Raised when Freehire API returns an error response."""
    def __init__(self, status_code: int, message: str):
        super().__init__(f"Freehire API Error [{status_code}]: {message}")
        self.status_code = status_code
        self.message = message

class FreehireClient(BaseJobIntegration):
    """
    Client for interacting with the Freehire API (https://freehire.me).
    """
    def __init__(
        self,
        token: Optional[str] = None,
        base_url: str = "https://freehire.me",
        timeout: float = 5.0,
    ):
        self.token = token or settings.FREEHIRE_TOKEN or os.environ.get("FREEHIRE_TOKEN")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _handle_response(self, resp: httpx.Response) -> Dict[str, Any]:
        try:
            data = resp.json()
        except Exception:
            data = {}
        if not resp.is_success:
            err_msg = data.get("error") or data.get("message") or resp.text or "Unknown error"
            raise FreehireAPIError(resp.status_code, err_msg)
        return data

    async def me(self) -> Dict[str, Any]:
        """Verify API token and get authenticated user information."""
        try:
            async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get("/api/v1/auth/me")
                return self._handle_response(resp)
        except Exception as e:
            return {"error": str(e)}

    async def search_jobs(
        self,
        query: str = "",
        remote: bool = False,
        skills: Optional[List[str]] = None,
        region: Optional[str] = None,          # global, us, eu, cis
        country: Optional[str] = None,         # ISO-3166 (US, GB, IN, DE, etc.)
        city: Optional[str] = None,
        company: Optional[str] = None,
        category: Optional[str] = None,
        role: Optional[str] = None,
        seniority: Optional[str] = None,
        employment_type: Optional[str] = None,
        salary_min: Optional[int] = None,
        visa: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"limit": limit, "offset": offset}
        if query:
            params["q"] = query
        if remote:
            params["work_mode"] = "remote"
        if region:
            params["regions"] = region
        if country:
            params["countries"] = country
        if city:
            params["cities"] = city
        if company:
            params["company_slug"] = company
        if category:
            params["category"] = category
        if role:
            params["role"] = role
        if seniority:
            params["seniority"] = seniority
        if employment_type:
            params["employment_type"] = employment_type
        if salary_min:
            params["salary_min"] = salary_min
        if visa:
            params["visa_sponsorship"] = "true"
            
        param_list = [(k, v) for k, v in params.items()]
        if skills:
            for s in skills:
                for part in s.split(","):
                    clean = part.strip()
                    if clean:
                        param_list.append(("skills", clean))

        try:
            async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get("/api/v1/jobs/search", params=param_list)
                return self._handle_response(resp)
        except Exception:
            return {"data": [], "meta": {"total": 0, "limit": limit, "offset": offset}}

    async def get_job(self, slug: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.get(f"/api/v1/jobs/{slug}")
            return self._handle_response(resp)

    async def save_job(self, slug: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.post(f"/api/v1/jobs/{slug}/save")
            return self._handle_response(resp)

    async def unsave_job(self, slug: str) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.delete(f"/api/v1/jobs/{slug}/save")
            return self._handle_response(resp)

    async def apply_job(self, slug: str, on_date: Optional[str] = None) -> Dict[str, Any]:
        body = {}
        if on_date:
            body["applied_at"] = on_date
        async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.post(f"/api/v1/jobs/{slug}/apply", json=body)
            return self._handle_response(resp)

    async def get_tracking(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        async with httpx.AsyncClient(base_url=self.base_url, headers=self._get_headers(), timeout=self.timeout, follow_redirects=True) as client:
            resp = await client.get("/api/v1/me/tracking", params={"limit": limit, "offset": offset})
            return self._handle_response(resp)

    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        """
        Adapter method for BaseJobIntegration and OrchestratorAgent.
        Fetches up to 50 results. Falls back to worldwide if location yields no results.
        """
        try:
            country, city = extract_freehire_geo(location)
            seniority = kwargs.get("seniority")
            skills = kwargs.get("skills", [])
            
            # First attempt: with geo filters
            data = await self.search_jobs(
                query=query,
                remote=remote,
                country=country,
                city=city,
                seniority=seniority,
                skills=skills,
                limit=50
            )
            jobs_data = data.get("data", [])
            
            # Fallback: without city filter
            if not isinstance(jobs_data, list) or len(jobs_data) == 0:
                data = await self.search_jobs(query=query, remote=remote, country=country, seniority=seniority, limit=50)
                jobs_data = data.get("data", [])
            
            # Fallback: worldwide (no geo filters at all)
            if not isinstance(jobs_data, list) or len(jobs_data) == 0:
                data = await self.search_jobs(query=query, remote=remote, limit=50)
                jobs_data = data.get("data", [])
                
            if not isinstance(jobs_data, list):
                jobs_data = []

            jobs = []
            for job in jobs_data:
                min_sal = job.get("salary_min") or job.get("min_salary")
                max_sal = job.get("salary_max") or job.get("max_salary")
                currency = job.get("currency", "USD")
                slug = job.get("public_slug") or job.get("slug", "")
                url = job.get("url") or (f"{self.base_url}/jobs/{slug}" if slug else "")

                loc_parts = []
                if job.get("city"):
                    loc_parts.append(job["city"])
                if job.get("country"):
                    loc_parts.append(job["country"])
                loc_str = ", ".join(loc_parts) if loc_parts else (job.get("location") or ("Remote" if remote else "Unknown"))

                # Enforce location match if user requested a specific location
                if location and location.lower().strip() not in ["remote", "worldwide", "global", "any", "all", ""]:
                    from src.utils.location_helper import is_job_location_match
                    if not is_job_location_match(loc_str, location, "remote" if remote else "any", "freehire", str(job.get("description") or "")):
                        continue

                jobs.append({
                    "title": job.get("title", ""),
                    "company": job.get("company", "") or job.get("company_name", ""),
                    "location": loc_str,
                    "description": job.get("description", "") or job.get("summary", ""),
                    "url": url,
                    "source": "freehire",
                    "posted_date": job.get("created_at") or job.get("posted_at"),
                    "salary_range": {
                        "min": float(min_sal) if min_sal else None,
                        "max": float(max_sal) if max_sal else None,
                        "currency": currency
                    } if (min_sal or max_sal) else None
                })
            print(f"[Freehire] Fetched {len(jobs)} jobs for query='{query}' country='{country}' city='{city}'")
            return jobs
        except Exception as e:
            print(f"Error in Freehire search adapter: {e}")
            return []