import re
from typing import Optional, List, Dict, Any

INDIA_CITIES = [
    "pune", "bengaluru", "bangalore", "hyderabad", "mumbai", "delhi", "new delhi",
    "noida", "gurgaon", "gurugram", "chennai", "kolkata", "ahmedabad", "indore",
    "jaipur", "kochi", "kerala", "chandigarh", "bhopal", "nagpur", "coimbatore",
    "secunderabad", "karnataka", "maharashtra", "telangana", "tamil nadu"
]

FOREIGN_US_STATES = [
    "california", "texas", "florida", "new york", "washington", "massachusetts",
    "illinois", "georgia", "colorado", "north carolina", "virginia", "ohio",
    "michigan", "pennsylvania", "new jersey", "arizona", "tennessee", "indiana",
    "missouri", "maryland", "wisconsin", "minnesota", "oregon", "utah", "nevada",
    "alabama", "alaska", "arkansas", "connecticut", "delaware", "hawaii", "idaho",
    "iowa", "kansas", "kentucky", "louisiana", "maine", "mississippi", "montana",
    "nebraska", "new hampshire", "new mexico", "north dakota", "oklahoma", "rhode island",
    "south carolina", "south dakota", "vermont", "west virginia", "wyoming"
]

FOREIGN_CITIES = [
    "san francisco", "new york", "nyc", "austin", "seattle", "chicago", "boston",
    "los angeles", "london", "munich", "berlin", "paris", "dublin", "amsterdam",
    "madrid", "barcelona", "sydney", "melbourne", "toronto", "vancouver", "sao paulo",
    "cairo", "taipei", "bucharest", "stuttgart", "singapore", "tokyo", "dallas",
    "houston", "charlotte", "raleigh", "washington", "mountain view", "palo alto",
    "sunnyvale", "santa clara", "san jose", "seoul", "dubai", "denver", "atlanta",
    "miami", "philadelphia", "phoenix", "san diego", "detroit", "minneapolis",
    "pittsburgh", "tampa", "orlando", "baltimore", "salt lake city", "portland",
    "manchester", "birmingham", "edinburgh", "glasgow", "frankfurt", "hamburg",
    "cologne", "warsaw", "krakow", "zurich", "geneva", "stockholm", "oslo",
    "helsinki", "copenhagen", "vienna", "brussels", "lisbon", "tel aviv",
    "montreal", "calgary", "ottawa", "auckland", "brisbane"
]

FOREIGN_COUNTRIES = [
    r'\b(us|u\.s\.|usa|united states|uk|u\.k\.|united kingdom|great britain|england|scotland|canada|germany|deutschland|france|spain|poland|netherlands|australia|brazil|japan|taiwan|egypt|romania|ireland|korea|south korea|dubai|uae|mexico|chile|argentina|peru|colombia|israel|singapore|china|hong kong|sweden|switzerland|italy|portugal|austria|belgium|denmark|norway|finland|czech|hungary|greece|turkey|saudi|philippines|vietnam|indonesia|malaysia|new zealand|south africa|nigeria|kenya)\b',
    r'\b(eu|emea|latam|latin america|europe|dach|na|north america|nordics|benelux|socal|norcal|apac)\b',
    r'\b(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy|dc)\b',
    r'\b(' + '|'.join(FOREIGN_US_STATES) + r')\b'
]

def is_foreign_location(loc_str: str) -> bool:
    """
    Returns True if the location explicitly belongs to a foreign country, foreign state, or foreign city.
    """
    if not loc_str:
        return False
    loc = loc_str.lower().strip()
    
    for rx in FOREIGN_COUNTRIES:
        if re.search(rx, loc, re.IGNORECASE):
            return True
            
    for fc in FOREIGN_CITIES:
        if re.search(r'\b' + re.escape(fc) + r'\b', loc):
            return True
            
    return False

LOCATION_HIERARCHY = {
    "india": {
        "aliases": ["india", "in", "bharat", "ind"],
        "indeed_code": "india",
        "linkedin_loc": "India",
        "cities": INDIA_CITIES,
        "states": ["maharashtra", "karnataka", "telangana", "tamil nadu", "delhi", "haryana", "uttar pradesh"]
    },
    "usa": {
        "aliases": ["united states", "usa", "us", "u.s.", "u.s.a."],
        "indeed_code": "usa",
        "linkedin_loc": "United States",
        "cities": ["san francisco", "new york", "nyc", "austin", "seattle", "chicago", "boston", "los angeles", "dallas"],
        "states": ["california", "texas", "new york", "washington", "massachusetts", "illinois", "florida"]
    },
    "uk": {
        "aliases": ["united kingdom", "uk", "great britain", "england", "scotland"],
        "indeed_code": "uk",
        "linkedin_loc": "United Kingdom",
        "cities": ["london", "manchester", "birmingham", "edinburgh", "cambridge", "oxford"],
        "states": []
    },
    "germany": {
        "aliases": ["germany", "deutschland", "de"],
        "indeed_code": "de",
        "linkedin_loc": "Germany",
        "cities": ["berlin", "munich", "frankfurt", "hamburg", "stuttgart", "cologne"],
        "states": ["bavaria", "berlin", "hesse"]
    },
    "canada": {
        "aliases": ["canada", "ca"],
        "indeed_code": "ca",
        "linkedin_loc": "Canada",
        "cities": ["toronto", "vancouver", "montreal", "ottawa", "calgary"],
        "states": ["ontario", "british columbia", "quebec"]
    }
}

REMOTE_KEYWORDS = {"remote", "wfh", "work from home", "anywhere", "worldwide", "virtual", "distributed", "global", "telecommute"}
HYBRID_KEYWORDS = {"hybrid", "flexible", "part remote"}
ONSITE_KEYWORDS = {"onsite", "on-site", "in-office", "office-based"}

RESTRICTION_PATTERNS = {
    "us_only": [
        "us only", "u.s. only", "united states only", "must reside in the us", 
        "authorized to work in the us", "us citizenship required", "remote - us", 
        "remote (us)", "remote, us", "remote, usa", "remote - usa", "within the us",
        "remote (united states)", "remote - united states", "us based", "usa only",
        "remote (north america)", "remote - north america"
    ],
    "eu_only": [
        "eu only", "europe only", "must reside in europe", "remote - eu", 
        "remote (eu)", "remote, eu", "remote - europe", "remote (europe)", "emea only"
    ],
    "india_only": [
        "india only", "must reside in india", "india based", "remote - india", 
        "remote (india)", "remote, in", "remote - in"
    ]
}

def detect_country_key(location_str: str) -> Optional[str]:
    """Identifies the country key (india, usa, uk, germany, etc.) from location string."""
    if not location_str:
        return None
    loc = location_str.lower().strip()
    tokens = [t.strip() for t in re.split(r'[,/\s-]+', loc) if len(t.strip()) > 1]
    
    for country_key, info in LOCATION_HIERARCHY.items():
        for alias in info["aliases"]:
            if len(alias) <= 2:
                if alias in tokens:
                    return country_key
            else:
                if alias in loc or alias in tokens:
                    return country_key
        for city in info["cities"]:
            if len(city) <= 3:
                if city in tokens:
                    return country_key
            else:
                if city in loc or city in tokens:
                    return country_key
        for state in info["states"]:
            if len(state) <= 3:
                if state in tokens:
                    return country_key
            else:
                if state in loc or state in tokens:
                    return country_key
    return None

def get_indeed_country_code(location_str: str) -> str:
    """Returns the exact country code expected by JobSpy/Indeed."""
    country_key = detect_country_key(location_str)
    if country_key and country_key in LOCATION_HIERARCHY:
        return LOCATION_HIERARCHY[country_key]["indeed_code"]
    return "india"

def get_linkedin_location_string(location_str: str) -> str:
    """Returns a clean canonical location string for LinkedIn searches."""
    loc = (location_str or "").strip()
    if not loc or loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]:
        return "Worldwide"
    country_key = detect_country_key(loc)
    if country_key and country_key in LOCATION_HIERARCHY:
        hierarchy = LOCATION_HIERARCHY[country_key]
        loc_lower = loc.lower()
        for city in hierarchy["cities"]:
            if city in loc_lower:
                return f"{city.title()}, {hierarchy['linkedin_loc']}"
        return hierarchy["linkedin_loc"]
    return loc.title()

def get_search_location_variations(location_str: str) -> List[str]:
    """Generates search variations for multi-platform crawlers."""
    loc = (location_str or "").strip()
    if not loc or loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]:
        return ["Worldwide", "Remote"]
    variations = [loc]
    country_key = detect_country_key(loc)
    if country_key and country_key in LOCATION_HIERARCHY:
        hierarchy = LOCATION_HIERARCHY[country_key]
        canonical_country = hierarchy["linkedin_loc"]
        loc_lower = loc.lower()
        found_city = None
        for city in hierarchy["cities"]:
            if city in loc_lower:
                found_city = city.title()
                break
        if found_city:
            variations.append(f"{found_city}, {canonical_country}")
            variations.append(found_city)
            variations.append(canonical_country)
        else:
            variations.append(canonical_country)
    seen = set()
    cleaned = []
    for v in variations:
        if v.lower() not in seen:
            seen.add(v.lower())
            cleaned.append(v)
    return cleaned

def is_india_location(location: str, url: str = "", title: str = "", description: str = "") -> bool:
    """
    Career-ops verified India location matcher.
    Returns True if the job is located in an Indian tech hub or is open Remote without foreign lockouts.
    """
    loc = str(location or "").lower().strip()
    if not loc:
        return False
        
    u = str(url or "").lower()
    t = str(title or "").lower()
    d = str(description or "")[:800].lower()
    combined = f"{loc} {t} {d}"

    # 1. Foreign exclusions FIRST (strict negative gate)
    if is_foreign_location(loc) or is_foreign_location(d[:300]):
        return False

    for city in FOREIGN_CITIES:
        pattern = r'\b' + re.escape(city) + r'\b'
        if re.search(pattern, loc) or re.search(pattern, t):
            return False

    if any(p in combined for p in RESTRICTION_PATTERNS["us_only"] + RESTRICTION_PATTERNS["eu_only"]):
        return False

    # 2. Explicit India indicators
    for city in INDIA_CITIES:
        pattern = r'\b' + re.escape(city) + r'\b'
        if re.search(pattern, loc) or re.search(pattern, t):
            return True

    if re.search(r'\b(india|bharat)\b', loc) or re.search(r'\b(india|bharat)\b', t):
        return True

    # Check for two-letter country code 'IN' only in location string
    if re.search(r'(?:^|[,\s])in(?:[,\s]|$)', loc):
        return True

    # 3. Open Remote indicator (without foreign lockouts)
    is_remote = any(k in loc for k in REMOTE_KEYWORDS) or any(k in t for k in ["remote", "worldwide"]) or "worldwide" in loc or "anywhere" in loc
    if is_remote:
        # Must not have any foreign residency or authorization restrictions
        if not is_foreign_location(loc) and not is_foreign_location(t):
            return True

    return False

def detect_work_mode(location_str: str, title_str: str = "", description_str: str = "") -> str:
    """Detects clean work mode: 'Remote', 'Hybrid', or 'On-site'."""
    loc_lower = str(location_str or "").lower()
    t_lower = str(title_str or "").lower()
    desc_snippet = str(description_str or "")[:400].lower()

    # Check for explicit on-site indicators or negative remote phrases
    NEGATIVE_REMOTE_PATTERNS = [
        "not remote", "no remote", "non-remote", "strictly on-site", 
        "strictly onsite", "on-site only", "onsite only", "in-office only"
    ]
    if any(neg in loc_lower or neg in desc_snippet for neg in NEGATIVE_REMOTE_PATTERNS):
        return "On-site"

    # Prioritize location and title metadata
    if any(k in loc_lower for k in HYBRID_KEYWORDS) or any(k in t_lower for k in HYBRID_KEYWORDS):
        return "Hybrid"
    if any(k in loc_lower for k in REMOTE_KEYWORDS) or any(k in t_lower for k in REMOTE_KEYWORDS):
        return "Remote"

    # Check description snippet
    if any(k in desc_snippet for k in HYBRID_KEYWORDS):
        return "Hybrid"
    if any(k in desc_snippet for k in REMOTE_KEYWORDS):
        return "Remote"

    return "On-site"

def is_job_location_match(
    job_location: str, 
    pref_location: str, 
    pref_work_mode: str = "any", 
    job_source: str = "",
    job_description: str = "",
    job_title: str = "",
    job_url: str = ""
) -> bool:
    """
    Enhanced location & work arrangement matcher with precision city and country rules.
    """
    job_loc = str(job_location or "").lower().strip()
    pref_loc = str(pref_location or "").lower().strip()
    if isinstance(pref_work_mode, bool):
        work_mode = "remote" if pref_work_mode else "any"
    else:
        work_mode = str(pref_work_mode or "any").lower().strip()
    job_desc = str(job_description or "")[:800].lower()
    t = str(job_title or "").lower()
    u = str(job_url or "").lower()
    job_work_mode = detect_work_mode(job_loc, t, job_desc).lower()

    # Work Mode check
    if work_mode in ["remote", "remote_only"]:
        if job_work_mode != "remote" and not any(k in job_loc for k in REMOTE_KEYWORDS):
            return False
    elif work_mode in ["hybrid"]:
        if job_work_mode != "hybrid":
            return False
    elif work_mode in ["onsite", "on-site"]:
        if job_work_mode == "remote":
            return False

    # If location is empty or worldwide
    if not pref_loc or pref_loc in ["worldwide", "global", "all", "any", "remote"]:
        return True

    # Indian Metro Areas mapping
    METRO_AREAS = {
        "pune": ["pune", "hinjawadi", "kharadi", "magarpatta", "hadapsar", "baner", "wakad"],
        "bangalore": ["bangalore", "bengaluru", "whitefield", "electronic city", "bellandur", "koramangala"],
        "bengaluru": ["bangalore", "bengaluru", "whitefield", "electronic city", "bellandur", "koramangala"],
        "mumbai": ["mumbai", "bombay", "navi mumbai", "thane", "andheri", "powai"],
        "hyderabad": ["hyderabad", "secunderabad", "hitec city", "cyberabad", "gachibowli"],
        "delhi": ["delhi", "new delhi", "noida", "gurgaon", "gurugram", "faridabad", "ghaziabad", "ncr"],
        "noida": ["noida", "greater noida", "delhi", "ncr"],
        "gurgaon": ["gurgaon", "gurugram", "delhi", "ncr"],
        "gurugram": ["gurgaon", "gurugram", "delhi", "ncr"],
        "chennai": ["chennai", "madras"],
        "kolkata": ["kolkata", "calcutta"],
        "ahmedabad": ["ahmedabad"],
        "indore": ["indore"],
        "jaipur": ["jaipur"],
        "kochi": ["kochi", "cochin", "kerala"],
    }

    # Check if target location is in India
    is_target_india = (
        detect_country_key(pref_loc) == "india" or
        "india" in pref_loc or
        any(c in pref_loc for c in INDIA_CITIES) or
        any(c in pref_loc for c in METRO_AREAS.keys())
    )

    if is_target_india:
        # STRICT FOREIGN REJECTION GATE:
        # Any foreign country, US state, or foreign city is immediately rejected
        if is_foreign_location(job_loc):
            return False

        if any(p in f"{t} {job_desc}" for p in RESTRICTION_PATTERNS["us_only"] + RESTRICTION_PATTERNS["eu_only"]):
            return False

        # Check if user requested a specific Indian metro
        target_city_terms = None
        for city_key, sub_terms in METRO_AREAS.items():
            pattern = r'\b' + re.escape(city_key) + r'\b'
            if re.search(pattern, pref_loc):
                target_city_terms = sub_terms
                break

        if target_city_terms:
            # City must be physically present in job location or job title
            loc_title_text = f"{job_loc} {t}"
            matches_target_city = any(re.search(r'\b' + re.escape(term) + r'\b', loc_title_text) for term in target_city_terms)
            if matches_target_city:
                return True

            # If the job is remote and user explicitly requested remote work mode, check if it's an Indian remote opening
            if work_mode in ["remote", "remote_only"] and job_work_mode == "remote":
                return is_india_location(job_loc, u, t, job_desc)

            return False

        # If general India requested ("India", "Bharat")
        return is_india_location(job_loc, u, t, job_desc)

    # For other countries/regions
    target_country = detect_country_key(pref_loc)
    if target_country and target_country in LOCATION_HIERARCHY:
        hierarchy = LOCATION_HIERARCHY[target_country]
        for c in hierarchy["cities"]:
            if c in job_loc:
                return True
        for a in hierarchy["aliases"]:
            if a in job_loc:
                return True

    # Token match for other regions or cities
    pref_tokens = [t.strip() for t in re.split(r'[,/\s-]+', pref_loc) if len(t.strip()) > 2]
    if any(tok in job_loc for tok in pref_tokens):
        return True

    return False
