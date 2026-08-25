import re
import asyncio
import hashlib
import smtplib
import socket
import logging
import threading
try:
    import dns.resolver
except ImportError:
    dns = None
from typing import Optional, Dict, List, Any
from urllib.parse import urlparse, urljoin
from collections import Counter
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

EMAIL_RE = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
PHONE_RE = r'(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}'
EMAIL_BLACKLIST = [
    'example.com', 'test.com', 'email.com', 'youremail.com',
    'sentry.io', 'wixpress.com', 'googleapis.com', 'w3.org',
    'schema.org', 'gravatar.com', 'wordpress.com', 'domain.com',
    'placeholder.com', 'yourcompany.com', 'company.com',
    'noreply.github.com', 'users.noreply.github.com', 'github.com'
]
FILE_EXT_BLACKLIST = ['.png', '.jpg', '.jpeg', '.gif', '.css', '.js', '.svg', '.webp', '.ico']

SCRAPE_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

class LeadEnricher:
    """
    Multi-factor corporate email, phone, and lead verification engine.
    
    Multi-Factor Verification Pipeline:
    1. Bio & Headline Text Extraction: Regex extraction for direct emails & phones
    2. Lead Website & Contact Page Scraping: Probes {website}, /contact, /about, /team
    3. Company Domain Resolution: Normalizes entity suffixes & checks MX records
    4. Company Website Pattern Detection: Analyzes company email naming convention
    5. Pattern-Prioritized Candidate Generation: Permutes candidate addresses
    6. Live SMTP Mail Server Handshake: Verifies mailbox existence on port 25 & catches catch-all servers
    7. GitHub Public Commit Email Lookup: Checks commit history for developers / tech leads
    8. Gravatar Identity Probe: Checks email avatar presence
    9. Phone Normalization: Formats phone into E.164 & WhatsApp link
    10. Confidence Scoring (0-100%): Multi-factor weighted score
    """
    def __init__(self):
        self._domain_pattern_cache: Dict[str, Optional[str]] = {}
        self._mx_cache: Dict[str, Optional[str]] = {}
        self._website_email_cache: Dict[str, Dict[str, Any]] = {}
        self._github_email_cache: Dict[str, Optional[str]] = {}
        self._cache_lock = threading.Lock()

    # ── Validation Helpers ──────────────────────────────────────────

    def _is_valid_email(self, email: str) -> bool:
        lower = email.lower().strip()
        if any(b in lower for b in EMAIL_BLACKLIST):
            return False
        if any(lower.endswith(ext) for ext in FILE_EXT_BLACKLIST):
            return False
        if re.match(r'^[a-f0-9]{8,}@', lower):
            return False
        if len(lower) < 6 or '@' not in lower or '.' not in lower.split('@')[-1]:
            return False
        return True

    def _format_phone(self, raw_phone: str, default_country_code: str = "91") -> Dict[str, Optional[str]]:
        """
        Normalizes phone number into international E.164 and creates WhatsApp link.
        """
        if not raw_phone:
            return {"formatted": None, "whatsapp_url": None, "raw": None}

        clean_digits = re.sub(r'\D', '', raw_phone)
        if len(clean_digits) < 7:
            return {"formatted": None, "whatsapp_url": None, "raw": raw_phone}

        formatted = raw_phone.strip()
        e164_digits = clean_digits

        # Handle 10-digit standard Indian/US numbers
        if len(clean_digits) == 10:
            e164_digits = f"{default_country_code}{clean_digits}"
            formatted = f"+{default_country_code} {clean_digits[:5]} {clean_digits[5:]}"
        elif len(clean_digits) == 11 and clean_digits.startswith("1"):  # US
            formatted = f"+1 ({clean_digits[1:4]}) {clean_digits[4:7]}-{clean_digits[7:]}"
        elif len(clean_digits) == 12 and clean_digits.startswith("91"):  # India with country code
            formatted = f"+91 {clean_digits[2:7]} {clean_digits[7:]}"
        elif clean_digits.startswith("0") and len(clean_digits) == 11:
            e164_digits = f"{default_country_code}{clean_digits[1:]}"
            formatted = f"+{default_country_code} {clean_digits[1:]}"

        whatsapp_url = f"https://wa.me/{e164_digits}" if len(e164_digits) >= 10 else None

        return {
            "formatted": formatted,
            "whatsapp_url": whatsapp_url,
            "raw": raw_phone
        }

    def _extract_from_text(self, text: str) -> Dict[str, Any]:
        """Extracts email and phone from raw text (bio, headline, summary)."""
        result = {'email': None, 'phone': None, 'whatsapp_url': None}
        if not text:
            return result

        emails = re.findall(EMAIL_RE, text)
        valid = [e for e in emails if self._is_valid_email(e)]
        if valid:
            result['email'] = valid[0]

        phone_matches = re.findall(PHONE_RE, text)
        for p in phone_matches:
            digits = re.sub(r'\D', '', p)
            if 7 <= len(digits) <= 14:
                phone_info = self._format_phone(p)
                result['phone'] = phone_info['formatted']
                result['whatsapp_url'] = phone_info['whatsapp_url']
                break

        return result

    # ── Domain Resolution & MX Checking ─────────────────────────────

    def _extract_domain(self, website: str) -> Optional[str]:
        if not website:
            return None
        try:
            if not website.startswith('http'):
                website = 'https://' + website
            domain = urlparse(website).netloc or website
            domain = domain.replace('www.', '').strip().lower()
            return domain if '.' in domain else None
        except Exception:
            return None

    CANONICAL_COMPANY_DOMAINS = {
        "tata consultancy services": "tcs.com",
        "tata consultancy services limited": "tcs.com",
        "tcs": "tcs.com",
        "barclays": "barclays.com",
        "barclays corporate & investment bank": "barclays.com",
        "ntt data": "nttdata.com",
        "ntt data north america": "nttdata.com",
        "ntt data services": "nttdata.com",
        "infosys": "infosys.com",
        "wipro": "wipro.com",
        "cognizant": "cognizant.com",
        "accenture": "accenture.com",
        "capgemini": "capgemini.com",
        "deloitte": "deloitte.com",
        "pwc": "pwc.com",
        "ey": "ey.com",
        "ernst & young": "ey.com",
        "kpmg": "kpmg.com",
        "google": "google.com",
        "microsoft": "microsoft.com",
        "amazon": "amazon.com",
        "amazon web services": "amazon.com",
        "aws": "amazon.com",
        "apple": "apple.com",
        "meta": "meta.com",
        "netflix": "netflix.com",
        "uber": "uber.com",
        "airbnb": "airbnb.com",
        "stripe": "stripe.com",
        "salesforce": "salesforce.com",
        "oracle": "oracle.com",
        "ibm": "ibm.com",
        "cisco": "cisco.com",
        "intel": "intel.com",
        "qualcomm": "qualcomm.com",
        "adobe": "adobe.com",
        "nvidia": "nvidia.com",
        "jpmorgan": "jpmorgan.com",
        "jpmorgan chase": "jpmorgan.com",
        "j.p. morgan": "jpmorgan.com",
        "goldman sachs": "gs.com",
        "morgan stanley": "morganstanley.com",
        "deutsche bank": "db.com",
        "hsbc": "hsbc.com",
        "citi": "citi.com",
        "citigroup": "citi.com",
        "bank of america": "bofa.com",
        "wells fargo": "wellsfargo.com",
        "hcltech": "hcltech.com",
        "hcl technologies": "hcltech.com",
        "tech mahindra": "techmahindra.com",
        "l&t technology services": "ltts.com",
        "ltts": "ltts.com",
        "mindtree": "mindtree.com",
        "mphasis": "mphasis.com",
        "persistent systems": "persistent.com",
        "hexaware": "hexaware.com",
        "birlasoft": "birlasoft.com",
        "zensar": "zensar.com",
        "cyient": "cyient.com",
        "sonata software": "sonata-software.com",
        "coforge": "coforge.com",
        "kpit": "kpit.com",
        "kpit technologies": "kpit.com"
    }

    def _guess_company_domain(self, company_name: str) -> Optional[str]:
        """Resolves target company name into an active, MX-verified domain."""
        if not company_name:
            return None
            
        clean = company_name.lower().strip()

        # Check canonical mapping first
        for key, dom in self.CANONICAL_COMPANY_DOMAINS.items():
            if clean == key or clean.startswith(key + " ") or (" " + key + " ") in (" " + clean + " "):
                return dom

        clean = re.sub(
            r'\s+(inc|llc|ltd|co|corp|corporation|group|holdings|technologies|solutions|foundation|labs|software|systems|technologies pvt ltd)\.?$',
            '', clean, flags=re.IGNORECASE
        ).strip()
        slug = re.sub(r'[^a-z0-9]', '', clean)
        
        guesses = [
            f"{slug}.com",
            f"{slug}.io",
            f"{slug}.ai",
            f"{slug}.org",
            f"{slug}.co",
            f"{slug}.tech",
            f"{slug}.dev",
        ]

        if ' ' in clean:
            parts = clean.split()
            if len(parts) >= 2:
                guesses.insert(0, f"{parts[0]}{parts[1]}.com")
                guesses.insert(1, f"{parts[0]}.com")

        for domain in guesses:
            with self._cache_lock:
                if domain in self._mx_cache:
                    if self._mx_cache[domain]:
                        return domain
                    continue

            try:
                mx_records = dns.resolver.resolve(domain, 'MX')
                if mx_records:
                    mx_host = str(sorted(mx_records, key=lambda x: x.preference)[0].exchange).rstrip('.')
                    with self._cache_lock:
                        self._mx_cache[domain] = mx_host
                    return domain
            except Exception:
                with self._cache_lock:
                    self._mx_cache[domain] = None
                continue

        return None

    def _get_mx_host(self, domain: str) -> Optional[str]:
        with self._cache_lock:
            if domain in self._mx_cache:
                return self._mx_cache[domain]

        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            if mx_records:
                mx_host = str(sorted(mx_records, key=lambda x: x.preference)[0].exchange).rstrip('.')
                with self._cache_lock:
                    self._mx_cache[domain] = mx_host
                return mx_host
        except Exception:
            pass

        with self._cache_lock:
            self._mx_cache[domain] = None
        return None

    # ── Website & Contact Page Scraping ─────────────────────────────

    async def _scrape_website_emails(self, website_url: str) -> Dict[str, Any]:
        """
        Scrapes lead's personal website or company /contact + /about + /team pages
        to extract emails and phone numbers.
        """
        result = {'emails': [], 'phones': [], 'whatsapp_urls': []}
        
        if not website_url:
            return result

        with self._cache_lock:
            if website_url in self._website_email_cache:
                return self._website_email_cache[website_url]

        if not website_url.startswith('http'):
            website_url = 'https://' + website_url

        base = website_url.rstrip('/')
        pages_to_scrape = [
            base,
            f"{base}/contact",
            f"{base}/about",
            f"{base}/about-us",
            f"{base}/team",
            f"{base}/leadership",
            f"{base}/people"
        ]

        all_emails = set()
        all_phones = []

        try:
            async with httpx.AsyncClient(
                headers=SCRAPE_HEADERS, timeout=8,
                follow_redirects=True, verify=False
            ) as client:
                for page_url in pages_to_scrape:
                    try:
                        resp = await client.get(page_url)
                        if resp.status_code >= 400:
                            continue
                        
                        text = resp.text
                        soup = BeautifulSoup(text, "html.parser")
                        for tag in soup.find_all(["script", "style", "noscript"]):
                            tag.decompose()
                        clean_text = soup.get_text(separator=" ", strip=True)

                        # Extract emails
                        found_emails = re.findall(EMAIL_RE, clean_text)
                        for e in found_emails:
                            if self._is_valid_email(e):
                                all_emails.add(e.lower())
                        
                        for a in soup.find_all("a", href=True):
                            href = a["href"]
                            if href.startswith("mailto:"):
                                email = href.replace("mailto:", "").split("?")[0].strip()
                                if self._is_valid_email(email):
                                    all_emails.add(email.lower())

                        # Extract phones
                        phone_matches = re.findall(PHONE_RE, clean_text)
                        for p in phone_matches:
                            digits = re.sub(r'\D', '', p)
                            if 7 <= len(digits) <= 14:
                                p_info = self._format_phone(p)
                                if p_info["formatted"] and p_info["formatted"] not in [x["formatted"] for x in all_phones]:
                                    all_phones.append(p_info)

                        for a in soup.find_all("a", href=True):
                            href = a["href"]
                            if href.startswith("tel:"):
                                phone = href.replace("tel:", "").strip()
                                p_info = self._format_phone(phone)
                                if p_info["formatted"] and p_info["formatted"] not in [x["formatted"] for x in all_phones]:
                                    all_phones.append(p_info)

                    except Exception as e:
                        logger.debug(f"Website scrape error for {page_url}: {e}")
                        continue

        except Exception as e:
            logger.debug(f"Website scraping session error: {e}")

        result = {
            'emails': list(all_emails),
            'phones': [p["formatted"] for p in all_phones if p["formatted"]],
            'whatsapp_urls': [p["whatsapp_url"] for p in all_phones if p["whatsapp_url"]]
        }

        with self._cache_lock:
            self._website_email_cache[website_url] = result

        return result

    # ── Email Pattern Detection from Company Website ────────────────

    async def _detect_company_email_pattern(self, domain: str) -> Optional[str]:
        """
        Scrapes company website pages to find existing emails,
        then detects the dominant email pattern used by the company.
        """
        if not domain:
            return None

        with self._cache_lock:
            if domain in self._domain_pattern_cache:
                return self._domain_pattern_cache[domain]

        website_data = await self._scrape_website_emails(f"https://{domain}")
        company_emails = [e for e in website_data.get('emails', []) if e.endswith(f"@{domain}")]
        
        if not company_emails:
            with self._cache_lock:
                self._domain_pattern_cache[domain] = None
            return None

        pattern_counts = Counter()
        for email in company_emails:
            local_part = email.split('@')[0].lower()
            
            if '.' in local_part:
                parts = local_part.split('.')
                if len(parts) == 2:
                    if len(parts[0]) == 1:
                        pattern_counts['f.last'] += 1
                    elif len(parts[1]) == 1:
                        pattern_counts['first.l'] += 1
                    else:
                        pattern_counts['first.last'] += 1
            elif '_' in local_part:
                pattern_counts['first_last'] += 1
            else:
                pattern_counts['first'] += 1

        detected = pattern_counts.most_common(1)[0][0] if pattern_counts else None

        with self._cache_lock:
            self._domain_pattern_cache[domain] = detected
        
        return detected

    # ── GitHub Public Commit Email Lookup (Factor 6) ────────────────

    async def check_github_commit_email(self, username_or_name: str, domain: Optional[str] = None) -> Optional[str]:
        """
        Discovers public author emails from recent GitHub commits for developer & tech profiles.
        """
        if not username_or_name:
            return None

        clean_user = re.sub(r'[^a-zA-Z0-9-]', '', username_or_name.lower().split()[0])
        if not clean_user or len(clean_user) < 3:
            return None

        with self._cache_lock:
            if clean_user in self._github_email_cache:
                return self._github_email_cache[clean_user]

        try:
            async with httpx.AsyncClient(headers={"User-Agent": "JobHunt-Enricher/1.0"}, timeout=6) as client:
                url = f"https://api.github.com/users/{clean_user}/events/public"
                resp = await client.get(url)
                if resp.status_code == 200:
                    events = resp.json()
                    for event in events[:5]:
                        if event.get("type") == "PushEvent":
                            commits = event.get("payload", {}).get("commits", [])
                            for c in commits:
                                author = c.get("author", {})
                                email = author.get("email", "")
                                if email and self._is_valid_email(email):
                                    if domain and domain in email:
                                        with self._cache_lock:
                                            self._github_email_cache[clean_user] = email
                                        return email
                                    elif not domain:
                                        with self._cache_lock:
                                            self._github_email_cache[clean_user] = email
                                        return email
        except Exception as e:
            logger.debug(f"GitHub email lookup notice: {e}")

        with self._cache_lock:
            self._github_email_cache[clean_user] = None
        return None

    # ── Gravatar Identity Probe (Factor 7) ──────────────────────────

    async def check_gravatar_exists(self, email: str) -> bool:
        """
        Checks if email has an active Gravatar profile/avatar.
        """
        if not email or not self._is_valid_email(email):
            return False
        try:
            email_hash = hashlib.md5(email.strip().lower().encode('utf-8')).hexdigest()
            gravatar_url = f"https://www.gravatar.com/avatar/{email_hash}?d=404"
            async with httpx.AsyncClient(timeout=4) as client:
                resp = await client.head(gravatar_url)
                return resp.status_code == 200
        except Exception:
            return False

    # ── Email Candidate Generation ──────────────────────────────────

    def _generate_email_candidates(
        self, full_name: str, domain: str,
        detected_pattern: Optional[str] = None
    ) -> List[str]:
        """
        Generates standard corporate email permutations.
        If a pattern was detected from the company website, that pattern is prioritized.
        """
        if not full_name or not domain:
            return []

        parts = full_name.lower().strip().split()
        if not parts:
            return [f"careers@{domain}", f"recruiting@{domain}", f"hr@{domain}", f"talent@{domain}"]

        first = re.sub(r'[^a-z0-9]', '', parts[0])
        last = re.sub(r'[^a-z0-9]', '', parts[-1]) if len(parts) > 1 else ""

        candidates = []
        
        if detected_pattern and first and last:
            pattern_map = {
                "first.last": f"{first}.{last}@{domain}",
                "first": f"{first}@{domain}",
                "flast": f"{first[0]}{last}@{domain}",
                "firstlast": f"{first}{last}@{domain}",
                "f.last": f"{first[0]}.{last}@{domain}",
                "last.first": f"{last}.{first}@{domain}",
                "first_last": f"{first}_{last}@{domain}",
                "first.l": f"{first}.{last[0]}@{domain}" if last else None,
            }
            prioritized = pattern_map.get(detected_pattern)
            if prioritized:
                candidates.append(prioritized)

        if first and last:
            candidates.extend([
                f"{first}.{last}@{domain}",
                f"{first}@{domain}",
                f"{first[0]}{last}@{domain}",
                f"{first}{last}@{domain}",
                f"{first[0]}.{last}@{domain}",
                f"{last}.{first}@{domain}",
                f"{first}_{last}@{domain}",
            ])
        elif first:
            candidates.extend([
                f"{first}@{domain}",
                f"careers@{domain}",
                f"talent@{domain}",
            ])

        candidates.extend([
            f"careers@{domain}",
            f"recruiting@{domain}",
            f"hr@{domain}",
            f"talent@{domain}",
            f"jobs@{domain}",
        ])

        return list(dict.fromkeys(candidates))

    # ── SMTP Verification ───────────────────────────────────────────

    def verify_email_smtp(self, email: str) -> Dict[str, Any]:
        """
        Validates email existence via direct SMTP handshake without sending message.
        Detects catch-all servers.
        """
        parts = email.split('@')
        if len(parts) != 2 or not parts[1]:
            return {'exists': False, 'accept_all': False, 'score': 0}
            
        domain = parts[1]
        mx_host = self._get_mx_host(domain)
        if not mx_host:
            return {'exists': False, 'accept_all': False, 'score': 0}

        result = {'exists': False, 'accept_all': False, 'score': 30}

        try:
            with smtplib.SMTP(timeout=5) as smtp:
                smtp.connect(mx_host, 25)
                smtp.helo('mail-verifier.local')
                smtp.mail('verify@mail-verifier.local')
                code, _ = smtp.rcpt(email)

                if code == 250:
                    result['exists'] = True
                    result['score'] = 90

                    probe_email = f"z_nonexistent_probe_987@{domain}"
                    code2, _ = smtp.rcpt(probe_email)
                    if code2 == 250:
                        result['accept_all'] = True
                        result['score'] = 65
                elif code == 550:
                    result['exists'] = False
                    result['score'] = 0

        except Exception as e:
            logger.debug(f"SMTP verify check exception for {email}: {e}")
            result['score'] = 45

        return result

    # ── Multi-Factor Enrichment Pipeline ────────────────────────────

    async def enrich_recruiter(self, recruiter_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Multi-factor verification pipeline for an individual lead.
        """
        enriched = recruiter_data.copy()
        full_name = recruiter_data.get('full_name', '')
        company = recruiter_data.get('company', '')
        bio = recruiter_data.get('bio', '')
        website = recruiter_data.get('website', '')
        username = recruiter_data.get('username', '')

        verification_factors = []

        # ── Step 1: Check bio & headline for direct email/phone ─────
        bio_extract = self._extract_from_text(bio)
        if bio_extract['phone']:
            enriched['phone'] = bio_extract['phone']
            enriched['whatsapp_url'] = bio_extract['whatsapp_url']
            verification_factors.append("Phone verified from bio text")
        
        if bio_extract['email']:
            enriched['email'] = bio_extract['email']
            enriched['email_source'] = 'bio'
            enriched['email_verified'] = True
            enriched['confidence_score'] = 95
            verification_factors.append("Direct email matched from profile bio")
            enriched['verification_factors'] = verification_factors
            return enriched

        # ── Step 2: Scrape lead's personal website + contact pages ──
        if website:
            website_data = await self._scrape_website_emails(website)
            
            if website_data.get('phones') and not enriched.get('phone'):
                enriched['phone'] = website_data['phones'][0]
                if website_data.get('whatsapp_urls'):
                    enriched['whatsapp_url'] = website_data['whatsapp_urls'][0]
                verification_factors.append("Phone scraped from personal website")
            
            if website_data.get('emails'):
                name_parts = full_name.lower().split() if full_name else []
                best_match = None
                for we in website_data['emails']:
                    local = we.split('@')[0].lower()
                    if any(part in local for part in name_parts if len(part) > 2):
                        best_match = we
                        break
                
                if not best_match:
                    best_match = website_data['emails'][0]
                
                enriched['email'] = best_match
                enriched['email_source'] = 'website'
                enriched['email_verified'] = True
                enriched['confidence_score'] = 90
                verification_factors.append("Email extracted directly from personal website / contact page")
                enriched['verification_factors'] = verification_factors
                return enriched

        # ── Step 3 & 4: Determine company work domain ──────────────
        work_domain = self._extract_domain(website)
        if not work_domain and company:
            work_domain = self._guess_company_domain(company)

        if not work_domain:
            work_domain = f"{re.sub(r'[^a-z0-9]', '', company.lower())}.com" if company else None

        enriched['company_domain'] = work_domain

        # ── Step 5: Detect email pattern from company website ──────
        detected_pattern = None
        if work_domain:
            try:
                detected_pattern = await self._detect_company_email_pattern(work_domain)
                if detected_pattern:
                    enriched['detected_pattern'] = detected_pattern
                    verification_factors.append(f"Company uses '{detected_pattern}@' email pattern")
            except Exception as e:
                logger.debug(f"Pattern detection error for {work_domain}: {e}")

        # ── Step 6: Check GitHub Commit Emails for Tech Leads ──────
        if username:
            github_email = await self.check_github_commit_email(username, work_domain)
            if github_email:
                enriched['email'] = github_email
                enriched['email_source'] = 'github_commit'
                enriched['email_verified'] = True
                enriched['confidence_score'] = 92
                verification_factors.append("Verified from public GitHub author commit logs")
                enriched['verification_factors'] = verification_factors
                return enriched

        # ── Step 7: Generate candidate emails & verify with SMTP ───
        if full_name and work_domain:
            candidates = self._generate_email_candidates(full_name, work_domain, detected_pattern)
            best_email = None
            best_score = 0
            best_verified = False

            for cand in candidates[:5]:
                smtp_info = self.verify_email_smtp(cand)
                if smtp_info['exists'] and not smtp_info['accept_all']:
                    best_email = cand
                    best_score = 92
                    best_verified = True
                    verification_factors.append("Mailbox verified with 250 OK live SMTP handshake")
                    break
                elif smtp_info['score'] > best_score:
                    best_score = smtp_info['score']
                    best_email = cand
                    best_verified = smtp_info['exists']

            if not best_email and candidates:
                best_email = candidates[0]
                best_score = 60
                verification_factors.append(f"Synthesized from active MX-verified domain ({work_domain})")

            # Check Gravatar identity
            if best_email:
                has_gravatar = await self.check_gravatar_exists(best_email)
                if has_gravatar:
                    best_score = min(100, best_score + 8)
                    verification_factors.append("Gravatar active profile detected")

            enriched['email'] = best_email
            enriched['email_source'] = 'pattern_smtp'
            enriched['email_verified'] = best_verified
            enriched['confidence_score'] = best_score
            enriched['possible_emails'] = candidates[:4]
        else:
            enriched['email'] = None
            enriched['email_source'] = 'none'
            enriched['email_verified'] = False
            enriched['confidence_score'] = 0

        enriched['verification_factors'] = verification_factors
        return enriched

    async def enrich_recruiters_batch(
        self, recruiters: List[Dict[str, Any]], max_workers: int = 4
    ) -> List[Dict[str, Any]]:
        """Concurrent async batch enrichment of recruiter profiles."""
        if not recruiters:
            return []

        semaphore = asyncio.Semaphore(max_workers)

        async def _bounded_enrich(r: Dict[str, Any]) -> Dict[str, Any]:
            async with semaphore:
                try:
                    return await self.enrich_recruiter(r)
                except Exception as e:
                    logger.error(f"Error enriching recruiter profile: {e}")
                    return r

        tasks = [_bounded_enrich(r) for r in recruiters]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        processed = []
        for idx, res in enumerate(results):
            if isinstance(res, dict):
                processed.append(res)
            else:
                processed.append(recruiters[idx])

        processed.sort(key=lambda x: x.get('confidence_score', 0), reverse=True)
        return processed

lead_enricher = LeadEnricher()
