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
        
        # Determine Candidate Experience Category from profile & preferences
        cand_years = float(resume_profile.get("experience_years", preferences.get("experience_years", 0)) or 0)
        cand_seniority = str(resume_profile.get("seniority", preferences.get("experience_level", "Mid"))).lower().strip()
        raw_exp = str(preferences.get("experience_level", preferences.get("experience_years", str(cand_years)))).lower().strip()

        if "intern" in cand_seniority or "intern" in raw_exp or cand_years == 0 or raw_exp in ["0", "0.0", "fresher", "internship"] or "intern" in pref_role_str:
            exp_category = "intern"
        elif "junior" in cand_seniority or "entry" in cand_seniority or "entry" in raw_exp or cand_years <= 2.0 or raw_exp in ["1", "1.0", "2", "2.0", "junior"]:
            exp_category = "entry"
        elif "lead" in cand_seniority or "lead" in raw_exp or "director" in raw_exp or "staff" in raw_exp or cand_years >= 8.0:
            exp_category = "lead"
        elif "senior" in cand_seniority or "senior" in raw_exp or cand_years >= 5.0 or raw_exp in ["5", "6", "7", "8"]:
            exp_category = "senior"
        else:
            exp_category = "mid"

        # Extract required experience years from Job Description & Title
        exp_years_found = []
        plus_matches = re.findall(r'(\d+)\s*\+\s*(?:years?|yrs?)\b', desc)
        for m in plus_matches:
            val = int(m)
            if 1 <= val <= 25:
                exp_years_found.append(val)

        min_matches = re.findall(r'(?:minimum|min\.?|at\s+least|requires?|require|with)\s*(\d+)\s*\+?\s*(?:years?|yrs?)\b', desc)
        for m in min_matches:
            val = int(m)
            if 1 <= val <= 25:
                exp_years_found.append(val)

        range_matches = re.findall(r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)\b', desc)
        for m in range_matches:
            val = int(m[0])
            if 1 <= val <= 25:
                exp_years_found.append(val)

        req_years = max(exp_years_found) if exp_years_found else 0

        is_job_intern = any(w in title for w in ["intern", "internship", "trainee", "apprentice", "fresher", "student", "co-op", "graduate intern"])
        is_job_entry = any(w in title for w in ["entry level", "junior", "associate", "graduate", "0-1 year", "0 to 1 year", "0-2 year"]) or is_job_intern or (req_years in [0, 1] and not any(w in title for w in ["senior", "lead", "staff", "principal", "head", "architect"]))
        is_job_senior = any(w in title for w in ["senior", "sr.", "sr ", "lead", "principal", "staff", "director", "manager", "head of", "architect", "vp"]) or (req_years >= 4)
        is_job_lead = any(w in title for w in ["lead", "principal", "staff", "director", "head of", "chief", "vp"]) or (req_years >= 8)

        score = 0.0
        score_cap = 100.0

        # --- 1. EXPERIENCE LEVEL & SENIORITY FIT (35%) ---
        if exp_category == "intern":
            if is_job_senior:
                exp_score = -25.0
                exp_fit = f"Senior Role (Requires {req_years}+ Years)" if req_years >= 4 else "Senior Role (Requires Experience)"
                score_cap = 30.0
            elif is_job_intern:
                exp_score = 35.0
                exp_fit = "Internship (Exact Fit)"
            elif is_job_entry:
                exp_score = 25.0
                exp_fit = "Entry Level / Early Career"
            else:
                exp_score = 0.0
                exp_fit = "Mid Level Role"
                score_cap = 45.0
        elif exp_category == "entry":
            if is_job_senior:
                exp_score = -20.0
                exp_fit = f"Senior Role (Requires {req_years}+ Years)" if req_years >= 4 else "Senior Role (Requires Experience)"
                score_cap = 40.0
            elif is_job_entry and not is_job_senior:
                exp_score = 35.0
                exp_fit = "Entry Level (Exact Fit)"
            elif is_job_intern:
                exp_score = 28.0
                exp_fit = "Internship / Early Career"
            else:
                exp_score = 15.0
                exp_fit = "Mid Level Fit"
        elif exp_category == "senior":
            if is_job_intern:
                exp_score = -25.0
                exp_fit = "Internship (Underqualified Role)"
                score_cap = 25.0
            elif is_job_senior:
                exp_score = 35.0
                exp_fit = "Senior Level (Exact Fit)"
            else:
                exp_score = 20.0
                exp_fit = "Mid / Senior Level"
        elif exp_category == "lead":
            if is_job_intern:
                exp_score = -30.0
                exp_fit = "Internship (Underqualified Role)"
                score_cap = 20.0
            elif is_job_lead:
                exp_score = 35.0
                exp_fit = "Lead / Principal (Exact Fit)"
            elif is_job_senior:
                exp_score = 28.0
                exp_fit = "Senior Level Fit"
            else:
                exp_score = 15.0
                exp_fit = "Mid Level"
        else:  # "mid"
            if is_job_intern:
                exp_score = 5.0
                exp_fit = "Internship Position"
            elif is_job_lead:
                exp_score = 15.0
                exp_fit = "Lead Position"
            else:
                exp_score = 35.0
                exp_fit = "Mid Level (Exact Fit)"

        score += exp_score

        # --- 2. TARGET ROLE & RELATED TITLES FIT (35%) ---
        role_tokens = [w for w in pref_role_str.split() if len(w) > 1 and w not in ["the", "for", "and", "in", "of", "to"]]
        matched_title_tokens = sum(1 for t in role_tokens if t in title)

        if pref_role_str and pref_role_str in title:
            score += 35.0
        elif any(r in title for r in target_roles if len(r) > 3):
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
            score_cap = min(score_cap, 20.0)

        # Apply score cap based on strict seniority disqualification
        raw_final = max(score, 5.0)
        final_score = min(score_cap, min(100.0, round(raw_final, 1)))

        # Dynamic match reason
        if final_score >= 80:
            match_reason = f"Excellent match for your {exp_fit.lower()} preference in '{pref_role_str}'."
        elif final_score >= 60:
            match_reason = f"Good alignment with {exp_fit.lower()} requirements and skills."
        elif final_score <= 35 and "Senior" in exp_fit:
            match_reason = f"Underqualified: {exp_fit}."
        elif final_score <= 35 and "Underqualified" in exp_fit:
            match_reason = f"Overqualified: {exp_fit}."
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
