import json
import re
import os
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.llm.prompts.rank import RANKING_SYSTEM_PROMPT

GENERIC_STOP_WORDS = {
    "developer", "engineer", "software", "analyst", "specialist", 
    "architect", "consultant", "lead", "senior", "junior", "intern", 
    "technologies", "development", "programming", "applications"
}

MISMATCHED_DOMAINS = [
    "nurse", "nursing", "physician", "doctor", "therapist", "dentist",
    "attorney", "paralegal", "legal counsel",
    "driver", "warehouse", "forklift", "truck", "delivery", "plumber", "electrician",
    "chef", "cook", "bartender", "waiter", "barista", "cashier",
    "real estate", "property manager"
]

class RankingAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)

    def _extract_json_array(self, content: str) -> List[Dict[str, Any]]:
        """Safely extracts JSON array or individual objects from LLM response."""
        content = content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        try:
            parsed = json.loads(content)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            pass

        items = []
        object_blocks = re.findall(r'\{[^{}]*\}', content)
        for block in object_blocks:
            try:
                clean_block = re.sub(r',\s*\}', '}', block)
                obj = json.loads(clean_block)
                items.append(obj)
            except Exception:
                idx_m = re.search(r'"index"\s*:\s*(\d+)', block)
                score_m = re.search(r'"match_score"\s*:\s*(\d+)', block)
                reason_m = re.search(r'"reason"\s*:\s*"([^"]+)"', block)
                if idx_m and score_m:
                    items.append({
                        "index": int(idx_m.group(1)),
                        "match_score": int(score_m.group(1)),
                        "reason": reason_m.group(1) if reason_m else "",
                        "matching_skills": [],
                        "missing_skills": [],
                        "experience_fit": "Good Fit"
                    })
        return items

    def _fast_heuristics_score(self, job: Dict[str, Any], resume_profile: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates match score strictly following the priority order:
        1. Location & Work Mode Fit (Strict Pre-filter)
        2. Experience Level / Seniority Alignment (35%)
        3. Target Role & Related Titles Fit (35%)
        4. Resume-based Skills Match (30%)
        """
        title = str(job.get("title", "")).lower()
        desc = str(job.get("description", "")).lower()
        job_loc = str(job.get("location", "")).lower()
        
        resume_skills = [s for s in resume_profile.get("skills", []) if s.lower() not in GENERIC_STOP_WORDS]
        target_roles = [r.lower() for r in (resume_profile.get("target_roles", []) or [preferences.get("role", "")])]
        
        pref_role_str = str(preferences.get("role", "")).lower().strip()
        pref_loc = str(preferences.get("location", "")).lower().strip()
        pref_work_mode = str(preferences.get("remote_preference", preferences.get("work_mode", "any"))).lower().strip()
        
        # Determine Experience Category
        raw_exp = str(preferences.get("experience_level", preferences.get("experience_years", "0"))).lower().strip()
        if "intern" in raw_exp or raw_exp in ["0", "0.0", "fresher", "internship"] or "intern" in pref_role_str:
            exp_category = "intern"
        elif "entry" in raw_exp or raw_exp in ["1", "1.0", "2", "2.0", "junior"]:
            exp_category = "entry"
        elif "mid" in raw_exp or raw_exp in ["3", "3.0", "4", "4.0", "5", "5.0"]:
            exp_category = "mid"
        elif "senior" in raw_exp or raw_exp in ["6", "7", "8"]:
            exp_category = "senior"
        elif "lead" in raw_exp or "director" in raw_exp or "staff" in raw_exp:
            exp_category = "lead"
        else:
            try:
                val = float(raw_exp)
                if val <= 0.5: exp_category = "intern"
                elif val <= 2.0: exp_category = "entry"
                elif val <= 5.0: exp_category = "mid"
                elif val <= 8.0: exp_category = "senior"
                else: exp_category = "lead"
            except Exception:
                exp_category = "mid"

        score = 0.0

        # --- 1. EXPERIENCE LEVEL & SENIORITY FIT (35%) ---
        is_job_intern = any(w in title for w in ["intern", "internship", "trainee", "apprentice", "fresher", "student", "co-op"])
        is_job_entry = any(w in title for w in ["entry level", "junior", "associate", "graduate", "0-", "0 to "]) or is_job_intern
        is_job_senior = any(w in title for w in ["senior", "sr.", "sr ", "lead", "principal", "staff", "director", "manager", "head of", "architect"])
        is_job_lead = any(w in title for w in ["lead", "principal", "staff", "director", "head of", "chief", "vp"])

        if exp_category == "intern":
            if is_job_intern:
                exp_score = 35.0
                exp_fit = "Internship (Exact Fit)"
            elif is_job_entry and not is_job_senior:
                exp_score = 25.0
                exp_fit = "Entry Level / Graduate"
            elif is_job_senior:
                exp_score = 2.0
                exp_fit = "Senior Role (Requires Experience)"
            else:
                exp_score = 18.0
                exp_fit = "General Level"
        elif exp_category == "entry":
            if is_job_entry and not is_job_senior:
                exp_score = 35.0
                exp_fit = "Entry Level (Exact Fit)"
            elif is_job_intern:
                exp_score = 28.0
                exp_fit = "Internship / Early Career"
            elif is_job_senior:
                exp_score = 2.0
                exp_fit = "Senior Role (Requires Experience)"
            else:
                exp_score = 22.0
                exp_fit = "Standard Fit"
        elif exp_category == "senior":
            if is_job_senior:
                exp_score = 35.0
                exp_fit = "Senior Level (Exact Fit)"
            elif is_job_intern:
                exp_score = 0.0
                exp_fit = "Internship (Underqualified Role)"
            else:
                exp_score = 20.0
                exp_fit = "Mid / Senior Level"
        elif exp_category == "lead":
            if is_job_lead:
                exp_score = 35.0
                exp_fit = "Lead / Principal (Exact Fit)"
            elif is_job_senior:
                exp_score = 28.0
                exp_fit = "Senior Level Fit"
            elif is_job_intern:
                exp_score = 0.0
                exp_fit = "Internship (Underqualified Role)"
            else:
                exp_score = 15.0
                exp_fit = "Mid Level"
        else:  # "mid"
            if not is_job_intern and not is_job_lead:
                exp_score = 35.0
                exp_fit = "Mid Level (Exact Fit)"
            elif is_job_intern:
                exp_score = 10.0
                exp_fit = "Internship Position"
            else:
                exp_score = 25.0
                exp_fit = "Senior Level"
        score += exp_score

        # --- 2. TARGET ROLE & RELATED TITLES FIT (35%) ---
        role_tokens = [w for w in pref_role_str.split() if len(w) > 1 and w not in ["the", "for", "and", "in", "of", "to"]]
        matched_title_tokens = sum(1 for t in role_tokens if t in title)

        if pref_role_str and pref_role_str in title:
            score += 35.0
        elif any(r in title for r in target_roles if len(r) > 3):
            # Matches any LLM-expanded equivalent title
            score += 33.0
        elif role_tokens and matched_title_tokens == len(role_tokens):
            score += 30.0
        elif matched_title_tokens > 0:
            score += 18.0 + (matched_title_tokens / max(len(role_tokens), 1)) * 12.0
        elif any(s.lower() in title for s in resume_skills):
            score += 15.0
        else:
            score += 5.0

        # --- 3. RESUME-BASED SKILLS MATCH (30%) ---
        matched_skills = [s for s in resume_skills if (s.lower() in desc or s.lower() in title)]
        skills_ratio = (len(matched_skills) / max(len(resume_skills), 1)) if resume_skills else 0.6
        score += min(skills_ratio * 30.0, 30.0)

        # Severe penalty for mismatched domains (e.g. doctor, nurse, warehouse)
        is_mismatched = any(m_dom in title for m_dom in MISMATCHED_DOMAINS)
        if is_mismatched:
            score = max(score - 50.0, 5.0)
            exp_fit = "Mismatched Field"

        final_score = min(100.0, round(score, 1))

        # Dynamic match reason
        if final_score >= 80:
            match_reason = f"Excellent match for your {exp_fit.lower()} preference in '{pref_role_str}'."
        elif final_score >= 60:
            match_reason = f"Good alignment with {exp_fit.lower()} requirements and skills."
        else:
            match_reason = f"Partial fit ({exp_fit})."

        return {
            "match_score": final_score,
            "matching_skills": matched_skills[:6],
            "missing_skills": [s for s in resume_skills if s not in matched_skills][:4],
            "experience_fit": exp_fit,
            "match_reason": match_reason
        }

    async def rank_jobs(self, jobs: List[Dict[str, Any]], resume_profile: Dict[str, Any], preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Applies strict location & work mode filters, then ranks jobs using priority heuristics and LLM breakdown.
        """
        if not jobs:
            return []

        pref_loc = str(preferences.get("location", "")).lower().strip()
        loc_tokens = [w for w in pref_loc.replace(",", " ").split() if len(w) > 2 and w not in ["remote", "any", "worldwide", "all", "global"]]
        pref_work_mode = str(preferences.get("remote_preference", preferences.get("work_mode", "any"))).lower().strip()

        # Step 1: Preference Pre-Filter (Location keywords & Work Mode)
        valid_candidates = []
        for job in jobs:
            job_loc = str(job.get("location", "")).lower()
            is_job_remote = "remote" in job_loc or "wfh" in job_loc or "work from home" in job_loc or job.get("source") == "himalayas" or "anywhere" in job_loc or "worldwide" in job_loc
            
            # Location token matching
            is_loc_match = any(t in job_loc for t in loc_tokens) if loc_tokens else True

            if pref_work_mode == "remote":
                # Accept if job is remote OR matches requested city
                if not (is_job_remote or is_loc_match):
                    continue
            elif pref_work_mode == "onsite":
                if is_job_remote:
                    continue
                if loc_tokens and not is_loc_match:
                    continue
            else:
                # Any work mode: accept if matches location OR is remote OR location is general
                if loc_tokens and not (is_loc_match or is_job_remote or not job_loc or job_loc == "n/a"):
                    continue

            valid_candidates.append(job)

        # Fallback: If pre-filter yielded 0 candidates, fallback to all scraped jobs so search never returns 0 results
        if not valid_candidates and jobs:
            print("[RankingAgent] Notice: Pre-filter matched 0 candidates. Preserving all scraped jobs.")
            valid_candidates = jobs

        active_jobs = valid_candidates
            
        # Step 2: Run priority heuristics scoring
        for job in active_jobs:
            heuristic_res = self._fast_heuristics_score(job, resume_profile, preferences)
            job["match_score"] = heuristic_res["match_score"]
            job["matching_skills"] = heuristic_res["matching_skills"]
            job["missing_skills"] = heuristic_res["missing_skills"]
            job["experience_fit"] = heuristic_res["experience_fit"]
            job["match_reason"] = heuristic_res["match_reason"]
            
        jobs_sorted = sorted(active_jobs, key=lambda x: x.get("match_score", 0), reverse=True)
        return jobs_sorted
