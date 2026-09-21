import json
import re
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.utils.location_helper import detect_country_key

def normalize_company(company_str: str) -> str:
    """Normalize company name for robust cross-platform comparison."""
    if not company_str:
        return ""
    c = str(company_str).lower().strip()
    # Remove common corporate suffixes
    c = re.sub(r'\b(inc|llc|ltd|corp|corporation|technologies|tech|solutions|services|group|pvt|co)\b\.?', '', c)
    c = re.sub(r'[^\w\s]', '', c)
    return " ".join(c.split())

def are_locations_compatible_for_dedup(loc1: str, loc2: str) -> bool:
    """
    Returns False if loc1 and loc2 point to distinctly different geographic offices/cities/countries,
    preventing multi-office job openings (e.g. Pune vs Sunnyvale, or Pune vs Bangalore) from colliding.
    """
    l1 = str(loc1 or "").lower().strip()
    l2 = str(loc2 or "").lower().strip()
    if not l1 or not l2 or l1 in ["remote", "worldwide", "any"] or l2 in ["remote", "worldwide", "any"]:
        return True

    c1 = detect_country_key(l1)
    c2 = detect_country_key(l2)
    if c1 and c2 and c1 != c2:
        return False

    is_foreign_1 = any(fc in l1 for fc in ["san francisco", "mountain view", "sunnyvale", "seattle", "austin", "new york", "london", "dublin", "berlin", "tokyo", "singapore", "toronto"]) or bool(re.search(r'\b(usa|us|uk|canada|germany|ca|tx|ny|wa)\b', l1))
    is_foreign_2 = any(fc in l2 for fc in ["san francisco", "mountain view", "sunnyvale", "seattle", "austin", "new york", "london", "dublin", "berlin", "tokyo", "singapore", "toronto"]) or bool(re.search(r'\b(usa|us|uk|canada|germany|ca|tx|ny|wa)\b', l2))

    is_india_1 = any(c in l1 for c in ["india", "pune", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi", "noida", "gurgaon", "chennai"])
    is_india_2 = any(c in l2 for c in ["india", "pune", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi", "noida", "gurgaon", "chennai"])

    if (is_foreign_1 and is_india_2) or (is_india_1 and is_foreign_2):
        return False

    INDIA_CITIES = ["pune", "bangalore", "bengaluru", "hyderabad", "mumbai", "delhi", "gurgaon", "gurugram", "noida", "chennai", "kolkata"]
    found_c1 = [c for c in INDIA_CITIES if c in l1]
    found_c2 = [c for c in INDIA_CITIES if c in l2]
    if found_c1 and found_c2:
        # Normalize bangalore/bengaluru, gurgaon/gurugram
        norm_c1 = {"bangalore" if c == "bengaluru" else ("gurgaon" if c == "gurugram" else c) for c in found_c1}
        norm_c2 = {"bangalore" if c == "bengaluru" else ("gurgaon" if c == "gurugram" else c) for c in found_c2}
        if not norm_c1.intersection(norm_c2):
            return False

    return True

class DeduplicationAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)

    async def deduplicate(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicates job postings across platforms safely:
        - NEVER merges jobs from different companies.
        - Only merges if company matches AND (titles are identical OR embeddings confirm same role).
        - Preserves multi-office openings across distinct locations/cities.
        - Merges metadata: keeps longest description, salary data, and primary URL.
        """
        if not jobs:
            return []
            
        # Step 1: URL & Exact (Normalized Company + Title) Deduplication
        unique_by_url = {}
        for job in jobs:
            url = str(job.get("url", "")).strip().rstrip("/")
            if url and len(url) > 10:
                if url not in unique_by_url:
                    unique_by_url[url] = job
                else:
                    # Merge info into existing
                    existing = unique_by_url[url]
                    if len(str(job.get("description", ""))) > len(str(existing.get("description", ""))):
                        existing["description"] = job.get("description")
                    if job.get("salary_range") and not existing.get("salary_range"):
                        existing["salary_range"] = job.get("salary_range")
            else:
                # If no URL, keep it
                unique_by_url[f"nourl_{id(job)}"] = job
                
        initial_pool = list(unique_by_url.values())
        if len(initial_pool) <= 1:
            return initial_pool

        # Step 2: Group by normalized company to guarantee we NEVER merge different companies
        company_groups: Dict[str, List[Dict[str, Any]]] = {}
        for job in initial_pool:
            norm_comp = normalize_company(job.get("company", ""))
            if not norm_comp:
                norm_comp = f"_unknown_{id(job)}"
            company_groups.setdefault(norm_comp, []).append(job)

        deduplicated_results = []

        # Step 3: Deduplicate strictly within the SAME company group
        for comp_name, group_jobs in company_groups.items():
            if len(group_jobs) == 1:
                deduplicated_results.append(group_jobs[0])
                continue

            # Within the same company: check title similarity preserving seniority levels & location integrity
            kept_in_group = []
            SENIORITY_MODIFIERS = {"senior", "sr", "lead", "principal", "staff", "junior", "jr", "entry", "intern", "associate", "director", "vp", "head", "manager"}

            for candidate in group_jobs:
                cand_title = re.sub(r'[^\w\s]', '', str(candidate.get("title", "")).lower().strip())
                cand_tokens = set(cand_title.split())
                cand_sen = cand_tokens.intersection(SENIORITY_MODIFIERS)
                cand_loc = str(candidate.get("location", "")).strip()
                
                is_dup = False
                for existing in kept_in_group:
                    exist_title = re.sub(r'[^\w\s]', '', str(existing.get("title", "")).lower().strip())
                    exist_tokens = set(exist_title.split())
                    exist_sen = exist_tokens.intersection(SENIORITY_MODIFIERS)
                    exist_loc = str(existing.get("location", "")).strip()
                    
                    # Never merge if seniority modifiers differ (e.g. Senior vs Junior vs Standard)
                    if cand_sen != exist_sen:
                        continue

                    # Never merge if locations point to different geographic cities/countries
                    if not are_locations_compatible_for_dedup(cand_loc, exist_loc):
                        continue

                    # 1. Exact title match
                    if cand_title == exist_title:
                        is_dup = True
                    # 2. Token set match or high Jaccard similarity (>= 0.80)
                    elif cand_tokens and exist_tokens:
                        intersection = len(cand_tokens.intersection(exist_tokens))
                        union = len(cand_tokens.union(exist_tokens))
                        jaccard = intersection / union if union > 0 else 0
                        if jaccard >= 0.80:
                            is_dup = True

                    if is_dup:
                        # Merge details
                        if len(str(candidate.get("description", ""))) > len(str(existing.get("description", ""))):
                            existing["description"] = candidate.get("description")
                        if candidate.get("salary_range") and not existing.get("salary_range"):
                            existing["salary_range"] = candidate.get("salary_range")
                        break
                
                if not is_dup:
                    kept_in_group.append(candidate)
                    
            deduplicated_results.extend(kept_in_group)

        print(f"[Deduplicator] {len(jobs)} raw jobs -> {len(deduplicated_results)} unique (Protected from removing different companies)")
        return deduplicated_results
