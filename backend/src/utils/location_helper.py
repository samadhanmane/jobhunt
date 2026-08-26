"""
Enhanced Location Matching, Tracking, and Normalization Utility
Provides comprehensive geographic hierarchy, alias resolution, scraper location mapping,
and strict cross-region boundary verification.
"""

import re
from typing import List, Dict, Any, Optional, Set

# Comprehensive Global Tech Hubs & Regions Dictionary
LOCATION_HIERARCHY = {
    "india": {
        "aliases": ["india", "in", "bharat", "south asia"],
        "cities": [
            "pune", "bangalore", "bengaluru", "mumbai", "bombay", "delhi", "new delhi", 
            "hyderabad", "secunderabad", "noida", "gurgaon", "gurugram", "chennai", "madras", 
            "kolkata", "calcutta", "ahmedabad", "jaipur", "indore", "chandigarh", "mohali", 
            "kochi", "cochin", "trivandrum", "thiruvananthapuram", "coimbatore", "nagpur", 
            "bhopal", "visakhapatnam", "vizag", "mysore", "mysuru", "bhubaneswar", "surat", 
            "vadodara", "lucknow", "kanpur", "patna", "ncr", "hinjawadi", "kharadi", 
            "magarpatta", "whitefield", "electronic city", "cyberabad", "hitec city"
        ],
        "states": [
            "maharashtra", "karnataka", "telangana", "tamil nadu", "tamilnadu", "delhi ncr", 
            "uttar pradesh", "haryana", "west bengal", "gujarat", "rajasthan", "kerala", 
            "madhya pradesh", "punjab", "andhra pradesh", "odisha"
        ],
        "indeed_code": "india",
        "linkedin_loc": "India"
    },
    "usa": {
        "aliases": ["united states", "usa", "us", "u.s.", "u.s.a.", "america", "north america"],
        "cities": [
            "san francisco", "sf", "san jose", "palo alto", "mountain view", "sunnyvale", 
            "santa clara", "cupertino", "menlo park", "redwood city", "fremont", "berkeley", 
            "oakland", "san mateo", "san bruno", "bay area", "silicon valley", "los angeles", 
            "la", "san diego", "irvine", "new york", "nyc", "manhattan", "brooklyn", 
            "austin", "dallas", "houston", "san antonio", "fort worth", "seattle", "bellevue", 
            "redmond", "boston", "cambridge", "chicago", "denver", "boulder", "atlanta", 
            "raleigh", "durham", "charlotte", "portland", "phoenix", "salt lake city", 
            "washington dc", "dc", "philadelphia", "minneapolis", "miami", "tampa", "pittsburgh"
        ],
        "states": [
            "california", "ca", "new york", "ny", "texas", "tx", "washington", "wa", 
            "massachusetts", "ma", "illinois", "il", "colorado", "co", "georgia", "ga", 
            "north carolina", "nc", "oregon", "or", "florida", "fl", "arizona", "az", 
            "utah", "ut", "virginia", "va", "maryland", "md", "pennsylvania", "pa", 
            "ohio", "oh", "michigan", "mi", "minnesota", "mn", "new jersey", "nj"
        ],
        "indeed_code": "usa",
        "linkedin_loc": "United States"
    },
    "uk": {
        "aliases": ["united kingdom", "uk", "great britain", "gb", "england", "scotland", "wales", "northern ireland"],
        "cities": [
            "london", "manchester", "birmingham", "edinburgh", "glasgow", "cambridge", 
            "oxford", "bristol", "leeds", "belfast", "sheffield", "newcastle", "nottingham", 
            "liverpool", "reading", "southampton", "cardiff"
        ],
        "states": ["england", "scotland", "wales", "greater london"],
        "indeed_code": "uk",
        "linkedin_loc": "United Kingdom"
    },
    "germany": {
        "aliases": ["germany", "deutschland", "de"],
        "cities": [
            "berlin", "munich", "münchen", "frankfurt", "frankfurt am main", "hamburg", 
            "cologne", "köln", "stuttgart", "düsseldorf", "dusseldorf", "leipzig", 
            "dortmund", "essen", "bremen", "dresden", "nuremberg", "nürnberg", "karlsruhe"
        ],
        "states": ["bavaria", "bayern", "berlin", "hessen", "baden-württemberg", "north rhine-westphalia"],
        "indeed_code": "germany",
        "linkedin_loc": "Germany"
    },
    "canada": {
        "aliases": ["canada", "ca"],
        "cities": [
            "toronto", "vancouver", "montreal", "ottawa", "calgary", "edmonton", 
            "waterloo", "kitchener", "quebec city", "halifax", "winnipeg", "victoria"
        ],
        "states": ["ontario", "on", "british columbia", "bc", "quebec", "qc", "alberta", "ab"],
        "indeed_code": "canada",
        "linkedin_loc": "Canada"
    },
    "australia": {
        "aliases": ["australia", "au", "australasia"],
        "cities": ["sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra", "gold coast"],
        "states": ["nsw", "new south wales", "victoria", "vic", "queensland", "qld", "wa", "western australia"],
        "indeed_code": "australia",
        "linkedin_loc": "Australia"
    },
    "netherlands": {
        "aliases": ["netherlands", "holland", "nl"],
        "cities": ["amsterdam", "rotterdam", "the hague", "utrecht", "eindhoven", "groningen"],
        "states": ["north holland", "south holland"],
        "indeed_code": "netherlands",
        "linkedin_loc": "Netherlands"
    },
    "singapore": {
        "aliases": ["singapore", "sg"],
        "cities": ["singapore"],
        "states": [],
        "indeed_code": "singapore",
        "linkedin_loc": "Singapore"
    },
    "uae": {
        "aliases": ["united arab emirates", "uae", "emirates"],
        "cities": ["dubai", "abu dhabi", "sharjah"],
        "states": ["dubai", "abu dhabi"],
        "indeed_code": "united arab emirates",
        "linkedin_loc": "United Arab Emirates"
    },
    "france": {
        "aliases": ["france", "fr"],
        "cities": ["paris", "lyon", "marseille", "toulouse", "nice", "nantes", "bordeaux"],
        "states": ["ile-de-france"],
        "indeed_code": "france",
        "linkedin_loc": "France"
    },
    "ireland": {
        "aliases": ["ireland", "ie", "republic of ireland"],
        "cities": ["dublin", "cork", "galway", "limerick"],
        "states": ["leinster"],
        "indeed_code": "ireland",
        "linkedin_loc": "Ireland"
    },
    "switzerland": {
        "aliases": ["switzerland", "schweiz", "suisse", "ch"],
        "cities": ["zurich", "zürich", "geneva", "genève", "basel", "lausanne", "bern"],
        "states": ["zurich", "geneva"],
        "indeed_code": "switzerland",
        "linkedin_loc": "Switzerland"
    }
}

# Exclusion patterns for geographically restricted roles
RESTRICTION_PATTERNS = {
    "us_only": [
        "us only", "usa only", "u.s. only", "united states only", "must reside in the us", 
        "must be located in the us", "us citizens only", "authorized to work in the us", 
        "us based", "us timezones", "north america only", "remote - us", "remote (us)", 
        "remote, us", "remote - usa", "remote (usa)", "remote, usa"
    ],
    "eu_only": [
        "eu only", "europe only", "emea only", "must reside in europe", "germany only", 
        "uk only", "united kingdom only", "must be in uk", "must be in germany", 
        "remote - europe", "remote (eu)", "remote, uk", "remote - uk"
    ],
    "india_only": [
        "india only", "must reside in india", "india based", "remote - india", 
        "remote (india)", "remote, in", "remote - in"
    ]
}

REMOTE_KEYWORDS = {"remote", "wfh", "work from home", "anywhere", "worldwide", "virtual", "distributed", "global"}

def detect_country_key(location_str: str) -> Optional[str]:
    """Identifies the country key (india, usa, uk, germany, etc.) from any city, state, or country name."""
    if not location_str:
        return None
    loc = location_str.lower().strip()
    tokens = [t.strip() for t in re.split(r'[,/\s-]+', loc) if len(t.strip()) > 1]
    
    for country_key, info in LOCATION_HIERARCHY.items():
        # Check aliases
        for alias in info["aliases"]:
            if alias in loc or alias in tokens:
                return country_key
        # Check cities
        for city in info["cities"]:
            if city in loc or city in tokens:
                return country_key
        # Check states
        for state in info["states"]:
            if state in loc or state in tokens:
                return country_key
                
    return None

def get_indeed_country_code(location_str: str) -> str:
    """Returns the exact country code expected by JobSpy/Indeed."""
    country_key = detect_country_key(location_str)
    if country_key and country_key in LOCATION_HIERARCHY:
        return LOCATION_HIERARCHY[country_key]["indeed_code"]
    return "usa"

def get_linkedin_location_string(location_str: str) -> str:
    """Returns a clean, canonical location string for LinkedIn searches."""
    loc = (location_str or "").strip()
    if not loc or loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]:
        return "Worldwide"
    
    country_key = detect_country_key(loc)
    if country_key and country_key in LOCATION_HIERARCHY:
        hierarchy = LOCATION_HIERARCHY[country_key]
        loc_lower = loc.lower()
        # Find matching city if specified
        for city in hierarchy["cities"]:
            if city in loc_lower:
                return f"{city.title()}, {hierarchy['linkedin_loc']}"
        return hierarchy["linkedin_loc"]
        
    return loc.title()

def get_search_location_variations(location_str: str) -> List[str]:
    """Generates optimal search variations for multi-platform crawlers."""
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
            
    # Deduplicate preserving order
    seen = set()
    cleaned = []
    for v in variations:
        if v.lower() not in seen:
            seen.add(v.lower())
            cleaned.append(v)
            
    return cleaned

def is_job_location_match(
    job_location: str, 
    pref_location: str, 
    pref_work_mode: str = "any", 
    job_source: str = "",
    job_description: str = ""
) -> bool:
    """
    Evaluates whether a harvested job matches the user's target location criteria.
    Accurately considers city-state-country hierarchy, remote allowances, and strict cross-region exclusions.
    """
    job_loc = (job_location or "").lower().strip()
    pref_loc = (pref_location or "").lower().strip()
    work_mode = (pref_work_mode or "any").lower().strip()
    job_desc = (job_description or "")[:800].lower()
    
    combined_job_text = f"{job_loc} {job_desc}"
    
    is_job_remote = (
        any(k in job_loc for k in REMOTE_KEYWORDS) or 
        "remote" in job_desc or 
        job_source in ["himalayas", "jobicy", "remoteok"]
    )
    
    # 1. Target Location is Worldwide / Empty / Any
    if not pref_loc or pref_loc in ["worldwide", "global", "all", "any"]:
        if work_mode == "remote":
            return is_job_remote
        elif work_mode == "onsite":
            return not (any(k in job_loc for k in ["remote only", "100% remote", "fully remote"]))
        return True

    # 2. Target Location is Explicitly "Remote"
    if pref_loc in ["remote", "wfh", "work from home", "anywhere"]:
        return is_job_remote

    target_country = detect_country_key(pref_loc)
    
    # 3. Check for Strict Cross-Country Mismatches
    if target_country == "india":
        # If job is strictly restricted to US, Europe, or UK and has no Indian presence, REJECT
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["us_only"]):
            return False
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["eu_only"]):
            return False
            
    elif target_country in ["usa", "canada"]:
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["india_only"]):
            return False
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["eu_only"]):
            return False
            
    elif target_country in ["uk", "germany", "france", "ireland", "netherlands", "switzerland"]:
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["india_only"]):
            return False
        if any(p in combined_job_text for p in RESTRICTION_PATTERNS["us_only"]):
            return False

    # 4. Hierarchical Location Match
    if target_country and target_country in LOCATION_HIERARCHY:
        hierarchy = LOCATION_HIERARCHY[target_country]
        
        # Check direct city match in job location
        for city in hierarchy["cities"]:
            if city in pref_loc:
                if city in job_loc:
                    if work_mode == "remote" and not is_job_remote:
                        return False
                    return True
                    
        # Check country / alias match in job location
        for alias in hierarchy["aliases"] + [hierarchy["indeed_code"]]:
            if alias in job_loc:
                if work_mode == "remote" and not is_job_remote:
                    return False
                return True
                
        # Check state match in job location
        for state in hierarchy["states"]:
            if state in job_loc:
                if work_mode == "remote" and not is_job_remote:
                    return False
                return True

    # 5. Token Substring Match
    pref_tokens = [t.strip() for t in re.split(r'[,/\s-]+', pref_loc) if len(t.strip()) > 2]
    if pref_tokens and any(t in job_loc for t in pref_tokens):
        if work_mode == "remote" and not is_job_remote:
            return False
        return True

    # 6. Fallback: Global Remote allowed if not geographically restricted
    if is_job_remote and work_mode != "onsite":
        if "worldwide" in job_loc or "anywhere" in job_loc or "global" in job_loc:
            return True
        if job_source in ["himalayas", "jobicy", "remoteok"]:
            # Make sure it doesn't violate target country
            if target_country == "india" and not any(p in combined_job_text for p in RESTRICTION_PATTERNS["us_only"] + RESTRICTION_PATTERNS["eu_only"]):
                return True
            if target_country == "usa" and not any(p in combined_job_text for p in RESTRICTION_PATTERNS["india_only"] + RESTRICTION_PATTERNS["eu_only"]):
                return True
            if target_country not in ["india", "usa"]:
                return True

    return False
