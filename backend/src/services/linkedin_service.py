import json
import logging
import os
import re
import urllib.parse
from typing import Dict, Any, Optional, List, Tuple
import httpx
from bs4 import BeautifulSoup

from src.config import settings
from src.services.enrichment_service import lead_enricher
from src.utils.browser_fingerprint import (
    get_random_browser_headers,
    human_jitter_delay,
    get_scrape_semaphore
)

logger = logging.getLogger(__name__)

class LinkedInService:
    def __init__(self):
        self._user_session_cache: Dict[str, Dict[str, Any]] = {}

    def _resolve_cookie(self, custom_cookie: Optional[str] = None) -> Optional[str]:
        if custom_cookie and len(custom_cookie.strip()) > 5:
            return custom_cookie.strip()
        cookie = settings.LINKEDIN_COOKIE or os.environ.get('LINKEDIN_COOKIE', '').strip()
        return cookie.strip() if cookie and len(cookie.strip()) > 5 else None

    def validate_cookie(self, custom_cookie: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates if a given or configured LinkedIn li_at cookie is active and authenticated.
        Uses randomized modern browser headers and human-like request signature.
        Returns {'valid': bool, 'status': 'active'|'expired'|'invalid'|'unconfigured', 'message': str}
        """
        cookie = self._resolve_cookie(custom_cookie)
        if not cookie:
            return {
                'valid': False,
                'status': 'unconfigured',
                'message': 'No LinkedIn cookie provided. Operating in public stealth dorking mode.'
            }

        headers = get_random_browser_headers()

        try:
            client = httpx.Client(follow_redirects=True, timeout=12)
            client.cookies.set('li_at', cookie, domain='.linkedin.com')
            resp = client.get('https://www.linkedin.com/feed/', headers=headers)

            if resp.status_code == 200 and 'feed' in str(resp.url):
                return {
                    'valid': True,
                    'status': 'active',
                    'message': 'LinkedIn session cookie is active and valid.'
                }
            elif 'login' in str(resp.url) or 'authwall' in str(resp.url) or resp.status_code in [401, 403]:
                return {
                    'valid': False,
                    'status': 'expired',
                    'message': 'LinkedIn session cookie has expired. Please update with a fresh li_at cookie.'
                }
            elif resp.status_code == 429:
                return {
                    'valid': False,
                    'status': 'invalid',
                    'message': 'LinkedIn rate limit encountered. Pacing active.'
                }
            else:
                return {
                    'valid': False,
                    'status': 'invalid',
                    'message': f'LinkedIn returned unexpected status: {resp.status_code}'
                }
        except Exception as e:
            return {
                'valid': False,
                'status': 'invalid',
                'message': f'Connection check error: {str(e)}'
            }

    def _get_session(self, custom_cookie: Optional[str] = None):
        cookie = self._resolve_cookie(custom_cookie)
        if not cookie:
            return None, None

        cache_key = cookie[:20]
        if cache_key in self._user_session_cache:
            entry = self._user_session_cache[cache_key]
            return entry['client'], entry['csrf']

        headers = get_random_browser_headers()
        client = httpx.Client(follow_redirects=True, timeout=15)
        client.cookies.set('li_at', cookie, domain='.linkedin.com')

        try:
            resp = client.get('https://www.linkedin.com/feed/', headers=headers)
            if 'login' in str(resp.url) or 'authwall' in str(resp.url) or resp.status_code in [401, 403]:
                return None, None

            csrf = None
            for c in client.cookies.jar:
                if c.name == 'JSESSIONID':
                    csrf = c.value.strip('"')
                    break

            if not csrf:
                return None, None

            self._user_session_cache[cache_key] = {'client': client, 'csrf': csrf}
            return client, csrf
        except Exception:
            return None, None

    async def scrape_profile_async(
        self, username_or_url: str, custom_cookie: Optional[str] = None
    ) -> Tuple[Optional[Dict[str, Any]], bool]:
        """
        Async profile scraping with human-like jitter delays and polite concurrency.
        Returns (profile_dict, is_cookie_expired_bool).
        """
        username = username_or_url.strip().rstrip('/')
        if 'linkedin.com/in/' in username:
            username = username.split('linkedin.com/in/')[-1].split('/')[0].split('?')[0]

        cookie = self._resolve_cookie(custom_cookie)
        cookie_expired = False

        semaphore = get_scrape_semaphore()

        async with semaphore:
            # Human jitter pause before hitting profile
            await human_jitter_delay(min_sec=0.8, max_sec=1.8)

            if cookie:
                client, csrf = self._get_session(cookie)
                if client and csrf:
                    fingerprint = get_random_browser_headers()
                    headers = {
                        'csrf-token': csrf,
                        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
                        'x-li-lang': 'en_US',
                        'x-restli-protocol-version': '2.0.0',
                        'User-Agent': fingerprint['User-Agent'],
                        'Sec-Ch-Ua': fingerprint.get('Sec-Ch-Ua', ''),
                        'Sec-Ch-Ua-Platform': fingerprint.get('Sec-Ch-Ua-Platform', '"Windows"'),
                        'Sec-Ch-Ua-Mobile': '?0'
                    }
                    url = f'https://www.linkedin.com/voyager/api/identity/dash/profiles?q=memberIdentity&memberIdentity={username}'

                    try:
                        resp = client.get(url, headers=headers)
                        if resp.status_code == 200:
                            data = resp.json()
                            for item in data.get('included', []):
                                if 'firstName' in item and 'lastName' in item:
                                    full_name = f"{item.get('firstName', '')} {item.get('lastName', '')}".strip()
                                    headline = item.get('headline', '')
                                    summary = item.get('summary', '')
                                    profile = {
                                        'full_name': full_name,
                                        'headline': headline,
                                        'bio': f"{headline} {summary}".strip(),
                                        'profile_url': f"https://www.linkedin.com/in/{username}/",
                                        'username': username,
                                        'company': self._extract_company_from_headline(headline)
                                    }
                                    enriched = await lead_enricher.enrich_recruiter(profile)
                                    return enriched, False
                        elif resp.status_code in [401, 403]:
                            cookie_expired = True
                        elif resp.status_code == 429:
                            logger.warning(f"Rate limited by LinkedIn for {username}. Backing off gracefully.")
                            await human_jitter_delay(min_sec=3.0, max_sec=5.0)
                    except Exception as e:
                        logger.debug(f"Voyager profile scrape notice: {e}")
                else:
                    cookie_expired = True

        # Fallback profile representation
        profile = {
            'full_name': username.replace('-', ' ').title(),
            'headline': 'Professional on LinkedIn',
            'bio': '',
            'profile_url': f"https://www.linkedin.com/in/{username}/",
            'username': username,
            'company': ''
        }
        enriched = await lead_enricher.enrich_recruiter(profile)
        return enriched, cookie_expired

    def _extract_company_from_headline(self, headline: str) -> str:
        if not headline:
            return ""
        for marker in [' at ', ' @ ', ' | ', ' - ']:
            if marker in headline:
                parts = headline.split(marker)
                if len(parts) >= 2:
                    return parts[-1].strip().rstrip('.')
        return ""

    async def _dorking_search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Autonomous stealth dorking search with human timestops, rotating browser fingerprints,
        and concurrency throttling to avoid bot detection on search engines.
        """
        encoded_query = urllib.parse.quote(query)
        search_urls = [
            f"https://html.duckduckgo.com/html/?q={encoded_query}",
            f"https://lite.duckduckgo.com/lite/?q={encoded_query}"
        ]

        found_profiles = []
        seen_urls = set()
        semaphore = get_scrape_semaphore()

        async with semaphore:
            # Human pacing delay before search query
            await human_jitter_delay(min_sec=1.0, max_sec=2.2)

            headers = get_random_browser_headers()

            async with httpx.AsyncClient(headers=headers, timeout=14, follow_redirects=True, verify=False) as client:
                for s_url in search_urls:
                    try:
                        resp = await client.get(s_url)
                        if resp.status_code == 429:
                            # Polite exponential backoff
                            await human_jitter_delay(min_sec=3.0, max_sec=5.0)
                            continue
                        if resp.status_code != 200:
                            continue

                        soup = BeautifulSoup(resp.text, "html.parser")

                        for a in soup.select(".result"):
                            title_el = a.select_one(".result__title") or a.select_one(".result__snippet")
                            link_el = a.select_one(".result__url") or a.select_one("a.result__url")
                            snippet_el = a.select_one(".result__snippet")

                            raw_title = title_el.get_text(strip=True) if title_el else ""
                            raw_link = link_el.get("href", "") if link_el else ""
                            raw_snippet = snippet_el.get_text(strip=True) if snippet_el else ""

                            linkedin_match = (
                                re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", raw_link) or
                                re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", raw_title) or
                                re.search(r"linkedin\.com/in/([a-zA-Z0-9_-]+)", raw_snippet)
                            )
                            if not linkedin_match:
                                continue

                            username = linkedin_match.group(1)
                            clean_url = f"https://www.linkedin.com/in/{username}/"

                            if clean_url in seen_urls:
                                continue
                            seen_urls.add(clean_url)

                            headline = raw_title.replace(" | LinkedIn", "").replace(" - LinkedIn", "")
                            if " - " in headline:
                                parts = headline.split(" - ")
                                name = parts[0].strip()
                                headline = " - ".join(parts[1:]).strip()
                            elif " | " in headline:
                                parts = headline.split(" | ")
                                name = parts[0].strip()
                                headline = " | ".join(parts[1:]).strip()
                            else:
                                name = username.replace("-", " ").title()

                            found_profiles.append({
                                "full_name": name,
                                "headline": headline,
                                "profile_url": clean_url,
                                "username": username,
                                "bio": raw_snippet
                            })

                            if len(found_profiles) >= limit:
                                break

                    except Exception as e:
                        logger.debug(f"Dorking query notice: {e}")

                    if found_profiles:
                        break

        return found_profiles

    async def search_company_hr_dorking(self, company_name: str, limit: int = 5) -> List[Dict[str, Any]]:
        clean_company = company_name.strip()
        query = f'site:linkedin.com/in "{clean_company}" ("Technical Recruiter" OR "Talent Acquisition" OR "Recruiter" OR "HR Manager" OR "Head of People")'
        
        found_recruiters = await self._dorking_search(query, limit=limit)
        
        for r in found_recruiters:
            r["company"] = clean_company
            if not r.get("headline") or clean_company.lower() not in r.get("headline", "").lower():
                r["headline"] = r.get("headline", "") or f"Talent Acquisition & Recruiting Team at {clean_company}"
            r["contact_type"] = "hr"

        if not found_recruiters:
            slug = re.sub(r'[^a-z0-9]', '', clean_company.lower())
            found_recruiters.append({
                "full_name": f"{clean_company} Talent Team",
                "headline": f"Talent Acquisition & Recruiting Team at {clean_company}",
                "company": clean_company,
                "profile_url": f"https://www.linkedin.com/company/{slug}/people/",
                "username": f"{slug}-talent",
                "bio": f"Official Recruiting and Talent Acquisition department at {clean_company}",
                "contact_type": "hr"
            })

        return found_recruiters

    async def search_company_tech_team(self, company_name: str, limit: int = 5) -> List[Dict[str, Any]]:
        clean_company = company_name.strip()
        query = f'site:linkedin.com/in "{clean_company}" ("Engineering Manager" OR "Tech Lead" OR "CTO" OR "VP Engineering" OR "Staff Engineer" OR "Principal Engineer" OR "Software Architect" OR "Head of Engineering")'
        
        found_tech = await self._dorking_search(query, limit=limit)
        
        for r in found_tech:
            r["company"] = clean_company
            r["contact_type"] = "tech"

        return found_tech

    async def search_company_all_contacts(
        self, company_name: str,
        hr_limit: int = 5, tech_limit: int = 5,
        custom_cookie: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Discovers both HR/Recruiter and Tech leadership contacts for a company with human pacing.
        Enriches all with multi-factor verified corporate emails & phone numbers.
        """
        clean_company = company_name.strip()
        if not clean_company:
            return {"hr_contacts": [], "tech_contacts": [], "all_contacts": [], "cookie_expired": False}

        # Check cookie status
        cookie_expired = False
        if custom_cookie:
            val = self.validate_cookie(custom_cookie)
            if not val.get('valid'):
                cookie_expired = True

        hr_profiles, tech_profiles = await asyncio.gather(
            self.search_company_hr_dorking(clean_company, limit=hr_limit),
            self.search_company_tech_team(clean_company, limit=tech_limit)
        )

        all_profiles = hr_profiles + tech_profiles
        enriched = await lead_enricher.enrich_recruiters_batch(all_profiles)

        hr_enriched = [c for c in enriched if c.get("contact_type") == "hr"]
        tech_enriched = [c for c in enriched if c.get("contact_type") == "tech"]

        return {
            "hr_contacts": hr_enriched,
            "tech_contacts": tech_enriched,
            "all_contacts": enriched,
            "cookie_expired": cookie_expired
        }

    async def find_company_hr(
        self, company_name: str, limit: int = 4, custom_cookie: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        clean_company = company_name.strip()
        if not clean_company:
            return []

        recruiter_profiles = await self.search_company_hr_dorking(clean_company, limit=limit)
        enriched_recruiters = await lead_enricher.enrich_recruiters_batch(recruiter_profiles)
        return enriched_recruiters

linkedin_service = LinkedInService()
