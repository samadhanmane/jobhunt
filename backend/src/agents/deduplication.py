import json
import re
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent

def normalize_company(company_str: str) -> str:
    """Normalize company name for robust cross-platform comparison."""
    if not company_str:
        return ""
    c = str(company_str).lower().strip()
    # Remove common corporate suffixes
    c = re.sub(r'\b(inc|llc|ltd|corp|corporation|technologies|tech|solutions|services|group|pvt|co)\b\.?', '', c)
    c = re.sub(r'[^\w\s]', '', c)
    return " ".join(c.split())

class DeduplicationAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)

    async def deduplicate(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Deduplicates job postings across platforms safely:
        - NEVER merges jobs from different companies.
        - Only merges if company matches AND (titles are identical OR embeddings confirm same role).
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

            # Within the same company: check title similarity preserving seniority levels
            kept_in_group = []
            SENIORITY_MODIFIERS = {"senior", "sr", "lead", "principal", "staff", "junior", "jr", "entry", "intern", "associate", "director", "vp", "head", "manager"}

            for candidate in group_jobs:
                cand_title = re.sub(r'[^\w\s]', '', str(candidate.get("title", "")).lower().strip())
                cand_tokens = set(cand_title.split())
                cand_sen = cand_tokens.intersection(SENIORITY_MODIFIERS)
                
                is_dup = False
                for existing in kept_in_group:
                    exist_title = re.sub(r'[^\w\s]', '', str(existing.get("title", "")).lower().strip())
                    exist_tokens = set(exist_title.split())
                    exist_sen = exist_tokens.intersection(SENIORITY_MODIFIERS)
                    
                    # Never merge if seniority modifiers differ (e.g. Senior vs Junior vs Standard)
                    if cand_sen != exist_sen:
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
