import asyncio
import re
import json
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup, Tag

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
}

class ScraperService:
    def __init__(self, max_concurrency: int = 5, timeout_seconds: int = 15):
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.timeout = timeout_seconds

    def _extract_json_ld(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """
        Extracts Schema.org JobPosting metadata from <script type="application/ld+json"> tags.
        """
        extracted = {}
        scripts = soup.find_all("script", type="application/ld+json")
        for script in scripts:
            try:
                if not script.string:
                    continue
                data = json.loads(script.string.strip())
                # Could be a list of objects or a single dict
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if isinstance(item, dict):
                        # Direct JobPosting or nested in @graph
                        if item.get("@type") == "JobPosting":
                            return self._normalize_json_ld_job(item)
                        if "@graph" in item and isinstance(item["@graph"], list):
                            for g_item in item["@graph"]:
                                if isinstance(g_item, dict) and g_item.get("@type") == "JobPosting":
                                    return self._normalize_json_ld_job(g_item)
            except Exception:
                continue
        return extracted

    def _normalize_json_ld_job(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize JSON-LD schema into clean dictionary fields."""
        title = data.get("title") or data.get("name") or ""
        
        company = ""
        hiring_org = data.get("hiringOrganization")
        if isinstance(hiring_org, dict):
            company = hiring_org.get("name", "")
        elif isinstance(hiring_org, str):
            company = hiring_org

        location = ""
        job_loc = data.get("jobLocation")
        if isinstance(job_loc, dict):
            addr = job_loc.get("address")
            if isinstance(addr, dict):
                loc_parts = [addr.get("addressLocality"), addr.get("addressRegion"), addr.get("addressCountry")]
                location = ", ".join([p for p in loc_parts if p])
            elif isinstance(addr, str):
                location = addr
        elif isinstance(job_loc, list) and job_loc:
            first_loc = job_loc[0]
            if isinstance(first_loc, dict):
                addr = first_loc.get("address")
                if isinstance(addr, dict):
                    loc_parts = [addr.get("addressLocality"), addr.get("addressRegion"), addr.get("addressCountry")]
                    location = ", ".join([p for p in loc_parts if p])

        # Remote check
        is_telecommute = data.get("jobLocationType") == "TELECOMMUTE" or data.get("applicantLocationRequirements") is not None
        if is_telecommute and not location:
            location = "Remote"
        elif is_telecommute and "remote" not in location.lower():
            location = f"Remote ({location})" if location else "Remote"

        # Salary
        salary_info = None
        base_salary = data.get("baseSalary") or data.get("estimatedSalary")
        if isinstance(base_salary, dict):
            val = base_salary.get("value")
            curr = base_salary.get("currency", "USD")
            if isinstance(val, dict):
                salary_info = {
                    "min": val.get("minValue"),
                    "max": val.get("maxValue") or val.get("value"),
                    "currency": curr,
                    "unit": base_salary.get("unitText", "YEAR")
                }
            elif isinstance(val, (int, float)):
                salary_info = {
                    "min": val,
                    "max": val,
                    "currency": curr,
                    "unit": base_salary.get("unitText", "YEAR")
                }

        # Raw description HTML / Text
        raw_desc = data.get("description", "")
        if raw_desc and "<" in raw_desc:
            desc_soup = BeautifulSoup(raw_desc, "html.parser")
            desc_text = desc_soup.get_text(separator="\n", strip=True)
        else:
            desc_text = raw_desc

        return {
            "title": title,
            "company": company,
            "location": location,
            "description": desc_text,
            "posted_date": data.get("datePosted"),
            "employment_type": data.get("employmentType"),
            "salary": salary_info
        }

    def _clean_dom_and_extract_text(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """
        Strips unwanted noisy elements and extracts clean textual content and meta tags.
        """
        # Extract Meta tags
        meta_title = ""
        meta_company = ""
        meta_desc = ""

        og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "og:title"})
        if og_title and og_title.get("content"):
            meta_title = og_title["content"].strip()

        og_site = soup.find("meta", property="og:site_name") or soup.find("meta", attrs={"name": "og:site_name"})
        if og_site and og_site.get("content"):
            meta_company = og_site["content"].strip()

        og_desc = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
        if og_desc and og_desc.get("content"):
            meta_desc = og_desc["content"].strip()

        if not meta_title and soup.title and soup.title.string:
            meta_title = soup.title.string.strip()

        # Remove noisy tags
        unwanted_tags = [
            "script", "style", "noscript", "iframe", "svg", "footer", 
            "nav", "aside", "form", "button", "input", "select", "option",
            "canvas", "audio", "video"
        ]
        for tag in soup.find_all(unwanted_tags):
            tag.decompose()

        # Remove noisy classes / ids (cookie banners, ads, footers, popups)
        noise_patterns = re.compile(
            r"(^|[\s_-])(cookie|banner|consent|footer|nav|site-header|modal|popup|ad-container|advertisement|sidebar|newsletter|social-share)($|[\s_-])",
            re.IGNORECASE
        )
        for el in soup.find_all(attrs={"class": noise_patterns}):
            el.decompose()
        for el in soup.find_all(attrs={"id": noise_patterns}):
            el.decompose()

        # Try to find high-value content containers first (prioritizing LinkedIn and ATS markup)
        content_selectors = [
            ".show-more-less-html__markup",
            ".show-more-less-html__markup--clamp-after-5",
            ".description__text",
            "#job-details",
            ".job-details",
            ".jobs-description__content",
            ".jobs-box__html-content",
            ".jobs-description-content__text",
            ".decorated-job-posting__details",
            ".job-description",
            ".posting-requirements",
            ".job-posting",
            "[data-automation-id='jobPostingDescription']",
            "main",
            "article",
            ".content",
            "#content"
        ]

        target_element = None
        for selector in content_selectors:
            found = soup.select_one(selector)
            if found and len(found.get_text(strip=True)) > 80:
                target_element = found
                break

        if not target_element:
            target_element = soup.body or soup

        # Extract cleanly structured text using clean_html_job_description
        from src.utils.text_cleaner import clean_html_job_description
        cleaned_text = clean_html_job_description(str(target_element))

        # Check for LinkedIn job criteria list (Seniority level, Employment type, Job function, Industries)
        criteria_list = soup.select_one(".description__job-criteria-list")
        if criteria_list:
            criteria_items = []
            for li in criteria_list.find_all("li"):
                header = li.find(["h3", "h4", "span", "div"], class_=re.compile(r"subheader|header|title|label", re.I))
                val = li.find(["span", "div", "p"], class_=re.compile(r"criteria-text|text|criteria|item|value", re.I))
                h_text = header.get_text(strip=True) if header else ""
                v_text = val.get_text(strip=True) if val else li.get_text(strip=True)
                if h_text and v_text and h_text != v_text:
                    criteria_items.append(f"• {h_text}: {v_text}")
                elif v_text:
                    criteria_items.append(f"• {v_text}")

            if criteria_items:
                cleaned_text += "\n\n### Job Criteria\n" + "\n".join(criteria_items)

        # Limit to 5000 characters to optimize LLM tokens while retaining all critical data
        if len(cleaned_text) > 5000:
            cleaned_text = cleaned_text[:5000] + "\n...[Content truncated for analysis]..."

        return {
            "meta_title": meta_title,
            "meta_company": meta_company,
            "meta_desc": meta_desc,
            "clean_text": cleaned_text
        }

    async def scrape_url(self, url: str, client: Optional[httpx.AsyncClient] = None) -> Dict[str, Any]:
        """
        Scrapes and cleans a single job URL.
        """
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()

        result = {
            "url": url,
            "domain": domain,
            "title": "",
            "company": "",
            "location": "",
            "posted_date": None,
            "clean_text": "",
            "status": "success",
            "error": None
        }

        async with self.semaphore:
            close_client = False
            if client is None:
                client = httpx.AsyncClient(
                    headers=DEFAULT_HEADERS,
                    timeout=self.timeout,
                    follow_redirects=True,
                    verify=False
                )
                close_client = True

            try:
                # Custom handling for certain URLs like LinkedIn public jobs
                fetch_headers = dict(DEFAULT_HEADERS)
                is_linkedin = "linkedin.com" in domain
                if is_linkedin:
                    match = re.search(r"(?:view/|currentJobId=|jobs/view/|jobs/)(\d{8,12})", url) or re.search(r"(\d{8,12})", url)
                    if match:
                        clean_linkedin_id = match.group(1)
                        url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{clean_linkedin_id}"

                resp = await client.get(url, headers=fetch_headers)
                if resp.status_code >= 400:
                    result["status"] = "failed"
                    result["error"] = f"HTTP {resp.status_code}"
                    return result

                html_content = resp.text
                soup = BeautifulSoup(html_content, "html.parser")

                # If LinkedIn Guest API response
                if is_linkedin:
                    top_title = soup.select_one(".topcard__title, .top-card-layout__title, h1, h2")
                    top_company = soup.select_one(".topcard__org-name-link, .topcard__flavor, a[data-tracking-control-name*='topcard-org-name']")
                    top_loc = soup.select_one(".topcard__flavor--bullet, .top-card-layout__first-subline")
                    if top_title and top_title.get_text(strip=True):
                        result["title"] = top_title.get_text(strip=True)
                    if top_company and top_company.get_text(strip=True):
                        result["company"] = top_company.get_text(strip=True)
                    if top_loc and top_loc.get_text(strip=True):
                        result["location"] = top_loc.get_text(strip=True)

                # 1. Try extracting structured JSON-LD (Schema.org)
                json_ld = self._extract_json_ld(soup)
                if json_ld and json_ld.get("title") and len(json_ld.get("description", "")) > 80:
                    result["title"] = result["title"] or json_ld.get("title", "")
                    result["company"] = result["company"] or json_ld.get("company", "")
                    result["location"] = result["location"] or json_ld.get("location", "")
                    result["posted_date"] = json_ld.get("posted_date")
                    result["clean_text"] = json_ld.get("description", "")
                    return result

                # 2. Fallback to DOM cleaning and extraction
                dom_data = self._clean_dom_and_extract_text(soup)
                result["title"] = result["title"] or json_ld.get("title") or dom_data.get("meta_title", "")
                result["company"] = result["company"] or json_ld.get("company") or dom_data.get("meta_company", "")
                result["location"] = result["location"] or json_ld.get("location", "")
                result["posted_date"] = json_ld.get("posted_date")
                result["clean_text"] = dom_data.get("clean_text", "")

                # If text is too short, provide meta description
                if len(result["clean_text"]) < 80 and dom_data.get("meta_desc"):
                    result["clean_text"] = dom_data["meta_desc"]

                if not result["clean_text"]:
                    result["status"] = "failed"
                    result["error"] = "Empty job content extracted"

                return result

            except Exception as e:
                result["status"] = "failed"
                result["error"] = str(e)
                return result
            finally:
                if close_client:
                    await client.aclose()

    async def scrape_multiple_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """
        Scrapes multiple job URLs concurrently.
        """
        if not urls:
            return []

        async with httpx.AsyncClient(
            headers=DEFAULT_HEADERS,
            timeout=self.timeout,
            follow_redirects=True,
            verify=False
        ) as client:
            tasks = [self.scrape_url(url, client=client) for url in urls if url and isinstance(url, str)]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            processed_results = []
            for idx, res in enumerate(results):
                if isinstance(res, dict):
                    processed_results.append(res)
                else:
                    processed_results.append({
                        "url": urls[idx],
                        "status": "failed",
                        "error": str(res),
                        "clean_text": ""
                    })
            return processed_results

scraper_service = ScraperService()
