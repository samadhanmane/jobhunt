import json
import re
import datetime
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.utils.location_helper import is_job_location_match, is_india_location, detect_work_mode, detect_country_key
from src.utils.role_helper import (
    is_title_role_match,
    detect_ai_sub_domain,
    detect_ai_facets,
    detect_experience_tier,
    NEGATIVE_ROLE_KEYWORDS
)
from src.utils.text_cleaner import extract_job_experience_metadata
from src.utils.skill_helper import compute_skill_alignment, extract_skills_from_text

TECH_STACK_CLUSTERS = {
    "python": ["python", "fastapi", "flask", "django", "asyncio"],
    "deep_learning": ["pytorch", "torch", "tensorflow", "keras", "cuda", "huggingface", "transformers"],
    "llm_frameworks": ["langchain", "langgraph", "llamaindex", "dspy", "crewai", "autogen", "vllm", "ollama", "rag"],
    "vector_dbs": ["pinecone", "chroma", "chromadb", "weaviate", "qdrant", "faiss", "milvus"],
    "devops_cloud": ["docker", "kubernetes", "k8s", "aws", "gcp", "azure", "git", "linux", "ci/cd"],
    "fullstack": ["react", "next.js", "typescript", "javascript", "node", "tailwind", "sql", "postgresql"]
}

class RankingAgent(BaseJobAgent):
    """
    Explainable 6-Factor Job Match Score Relevance Engine.
    Formula:
      Match Score = 30% Skills + 25% Role + 15% Experience + 10% Location + 10% Work Mode + 10% Freshness
    """
    def __init__(self, llm=None):
        super().__init__(llm)

    def _score_job(self, job: Dict[str, Any], candidate_profile: Dict[str, Any], preferences: Dict[str, Any]) -> Dict[str, Any]:
        title = str(job.get("title", "")).strip()
        desc = str(job.get("description", "")).strip()
        loc = str(job.get("location", "")).strip()
        u = str(job.get("url", ""))

        target_role = preferences.get("role", "Software Engineer")
        target_loc = preferences.get("location", "Worldwide")
        pref_work_mode = preferences.get("work_mode") or preferences.get("remote_preference") or "any"
        target_exp_tier = preferences.get("experience_tier", "")
        req_facets = preferences.get("ai_facets", [])

        # Detect metadata
        sub_domain = detect_ai_sub_domain(title, desc)
        facets = detect_ai_facets(title, desc)
        job_exp_tier = detect_experience_tier(title, desc)
        work_mode = detect_work_mode(loc, title, desc)
        job_meta = extract_job_experience_metadata(title, desc, job_exp_tier)

        # ------------------------------------------------------------------
        # Factor 1: Skills & Tech Stack Fit (30%)
        # ------------------------------------------------------------------
        cand_skills = [s.strip() for s in (candidate_profile.get("skills", []) or []) if s and s.strip()]
        key_reqs = str(job.get("key_requirements", "") or "")
        combined_text = f"{title}\n{desc}\n{key_reqs}"

        alignment = compute_skill_alignment(
            job_text=combined_text,
            candidate_skills=cand_skills,
            existing_job_skills=job.get("matching_skills") or []
        )
        matched_skills = alignment["matched"]
        missing_skills = alignment["missing"]
        job_skills = alignment["job_skills"]
        extras = alignment["extras"]
        skill_coverage_pct = alignment["coverage_pct"]

        # Cluster coverage boost
        desc_lower = desc.lower()
        title_lower = title.lower()
        cluster_matches = 0
        for cluster_name, keywords in TECH_STACK_CLUSTERS.items():
            matched_cluster = False
            for kw in keywords:
                if len(kw) <= 4:
                    if re.search(r'\b' + re.escape(kw) + r'\b', desc_lower) or re.search(r'\b' + re.escape(kw) + r'\b', title_lower):
                        matched_cluster = True
                        break
                else:
                    if kw in desc_lower or kw in title_lower:
                        matched_cluster = True
                        break
            if matched_cluster:
                cluster_matches += 1

        if job_skills:
            # Score based on candidate coverage of the job's actual required skills
            req_coverage = len(matched_skills) / len(job_skills)
            skill_score = min(100, int(round((req_coverage * 85) + min(15, cluster_matches * 5))))
            if not matched_skills and cluster_matches == 0:
                skill_score = max(15, skill_score)
        elif cand_skills:
            # If job description was brief and didn't name tools, award credit for role/cluster alignment
            if cluster_matches > 0:
                skill_score = min(100, 70 + (cluster_matches * 6))
            else:
                skill_score = 65
        else:
            skill_score = min(100, 50 + (cluster_matches * 10))

        # ------------------------------------------------------------------
        # Factor 2: Role & Domain Alignment (25%)
        # ------------------------------------------------------------------
        if not any(k in target_role.lower() for k in ["sales", "support", "marketing", "medical", "legal", "recruiter", "hr"]):
            if any(neg in title_lower for neg in NEGATIVE_ROLE_KEYWORDS):
                role_score = 5
            else:
                role_score = 90 if is_title_role_match(title, target_role) else 20
        else:
            role_score = 80 if is_title_role_match(title, target_role) else 20

        # Sub-domain alignment boost
        pref_sub_domain = preferences.get("sub_domain")
        if pref_sub_domain and pref_sub_domain.lower() != "all":
            if pref_sub_domain.lower() in sub_domain.lower():
                role_score = min(100, role_score + 10)

        # ------------------------------------------------------------------
        # Factor 3: Experience Fit (15%)
        # ------------------------------------------------------------------
        min_required_years = float(job_meta.get("min_experience_years", 2))
        cand_exp_val = candidate_profile.get("experience_years")
        if cand_exp_val is None:
            cand_seniority = str(candidate_profile.get("seniority", "Mid")).lower()
            if "intern" in cand_seniority:
                cand_exp_val = 0.0
            elif "entry" in cand_seniority or "fresher" in cand_seniority:
                cand_exp_val = 1.0
            elif "junior" in cand_seniority:
                cand_exp_val = 2.0
            elif "mid" in cand_seniority:
                cand_exp_val = 3.0
            elif "senior" in cand_seniority:
                cand_exp_val = 5.0
            elif "lead" in cand_seniority or "principal" in cand_seniority:
                cand_exp_val = 8.0
            else:
                cand_exp_val = 2.0
        else:
            try:
                cand_exp_val = float(cand_exp_val)
            except Exception:
                cand_exp_val = 2.0

        req_clean_label = job_meta.get("experience_required", "2–4 Yrs").replace("🌱 ", "").replace("🚀 ", "").replace("⚡ ", "").replace("💼 ", "").replace("👑 ", "").replace("🏆 ", "")
        cand_exp_label = f"{int(cand_exp_val) if cand_exp_val.is_integer() else cand_exp_val} years"
        if cand_exp_val == 0.0:
            cand_exp_label = "0 years (Fresher / Intern)"

        # Compare candidate experience to required experience
        if "intern" in target_role.lower() or target_exp_tier == "intern" or cand_exp_val == 0:
            if "intern" in job_exp_tier.lower() or "intern" in title_lower or min_required_years == 0:
                exp_score = 100
                exp_status = "Optimal Fit"
            elif min_required_years <= 1:
                exp_score = 85
                exp_status = "Good Fit (Entry Level)"
            else:
                exp_score = 30
                exp_status = "Requires More Experience"
        else:
            diff = cand_exp_val - min_required_years
            if abs(diff) <= 1.0:
                exp_score = 100
                exp_status = "Optimal Fit"
            elif diff > 1.0:
                if diff <= 3.0:
                    exp_score = 95
                    exp_status = "Strong Fit"
                else:
                    exp_score = 85
                    exp_status = "Over-qualified"
            else:
                # Candidate under-qualified
                under_by = abs(diff)
                if under_by <= 1.5:
                    exp_score = 70
                    exp_status = "Good Potential"
                elif under_by <= 3.0:
                    exp_score = 45
                    exp_status = "Experience Gap"
                else:
                    exp_score = 25
                    exp_status = "Significant Gap"

        # ------------------------------------------------------------------
        # Factor 4: Location Fit (10%)
        # ------------------------------------------------------------------
        is_worldwide_target = target_loc.lower().strip() in ["", "remote", "worldwide", "global", "any", "all"]
        location_mismatch = False
        if is_worldwide_target:
            if work_mode == "Remote":
                loc_score = 100
            else:
                loc_score = 80
        else:
            if is_job_location_match(loc, target_loc, pref_work_mode, "", desc, title, u):
                loc_score = 100 if (work_mode == "Remote" or pref_work_mode in ["any", "all", ""]) else 95
            else:
                if "india" in target_loc.lower() and is_india_location(loc, u, title, desc):
                    loc_score = 85
                elif is_india_location(target_loc) and not is_india_location(loc, u, title, desc):
                    loc_score = 0
                    location_mismatch = True
                else:
                    target_country = detect_country_key(target_loc)
                    job_country = detect_country_key(loc)
                    if target_country and job_country and target_country != job_country:
                        loc_score = 0
                        location_mismatch = True
                    else:
                        loc_score = 25

        # ------------------------------------------------------------------
        # Factor 5: Work Mode Fit (10%)
        # ------------------------------------------------------------------
        p_mode = pref_work_mode.lower().strip()
        if p_mode in ["any", "all", ""]:
            work_mode_score = 100
        elif p_mode == work_mode.lower():
            work_mode_score = 100
        elif p_mode == "remote":
            work_mode_score = 60 if work_mode == "Hybrid" else 20
        elif p_mode == "hybrid":
            work_mode_score = 85 if work_mode == "Remote" else 80
        elif p_mode in ["onsite", "on-site"]:
            work_mode_score = 85 if work_mode == "Hybrid" else 30
        else:
            work_mode_score = 75

        # ------------------------------------------------------------------
        # Factor 6: Freshness Score (10%)
        # ------------------------------------------------------------------
        raw_posted = job.get("posted_date") or job.get("created_at")
        freshness_label = "Recently posted"
        freshness_score = 50

        if raw_posted and str(raw_posted).strip().lower() not in ["none", "n/a", ""]:
            try:
                posted_str = str(raw_posted)[:10]
                posted_dt = datetime.datetime.strptime(posted_str, "%Y-%m-%d").date()
                today = datetime.datetime.utcnow().date()
                days_old = (today - posted_dt).days

                if days_old <= 0:
                    freshness_score = 100
                    freshness_label = "Posted today"
                elif days_old == 1:
                    freshness_score = 95
                    freshness_label = "Posted yesterday"
                elif days_old <= 3:
                    freshness_score = 85
                    freshness_label = f"Posted {days_old} days ago"
                elif days_old <= 7:
                    freshness_score = 70
                    freshness_label = f"Posted {days_old} days ago"
                elif days_old <= 14:
                    freshness_score = 50
                    freshness_label = f"Posted {days_old} days ago"
                else:
                    freshness_score = 30
                    freshness_label = f"Posted {days_old} days ago"
            except Exception:
                freshness_score = 40
                freshness_label = "Recently posted"
        else:
            freshness_score = 45
            freshness_label = "Recently active"

        # ------------------------------------------------------------------
        # Final Weighted Match Score (6 Factors)
        # 30% Skills + 25% Role + 15% Experience + 10% Location + 10% Work Mode + 10% Freshness
        # ------------------------------------------------------------------
        total_score = round(
            (skill_score * 0.30) +
            (role_score * 0.25) +
            (exp_score * 0.15) +
            (loc_score * 0.10) +
            (work_mode_score * 0.10) +
            (freshness_score * 0.10)
        )

        # Geographic Hard-Cap: Incompatible overseas/foreign location cannot qualify as curated match
        if location_mismatch:
            total_score = min(total_score, 30)

        match_reason = f"Role Fit: {role_score}% | Skills Fit: {skill_score}% | Experience Fit: {exp_score}% | Location Fit: {loc_score}% | Work Mode: {work_mode_score}% | Freshness: {freshness_score}%"

        enriched_job = dict(job)
        enriched_job.update({
            "match_score": total_score,
            "match_reason": match_reason,
            "location_mismatch": location_mismatch,
            "match_breakdown": {
                "skills": skill_score,
                "role": role_score,
                "experience": exp_score,
                "location": loc_score,
                "work_mode": work_mode_score,
                "freshness": freshness_score,
                "location_match": not location_mismatch
            },
            "role_match_score": role_score,
            "skill_match_score": skill_score,
            "exp_match_score": exp_score,
            "loc_match_score": loc_score,
            "work_mode_match_score": work_mode_score,
            "freshness_match_score": freshness_score,
            "sub_domain": sub_domain,
            "ai_facets": facets,
            "experience_fit": job_exp_tier,
            "work_mode": work_mode,
            "matching_skills": matched_skills[:12],
            "missing_skills": missing_skills[:8],
            "supported_skills": extras[:12],
            "skill_coverage_pct": skill_coverage_pct,
            "experience_comparison": {
                "required": req_clean_label,
                "candidate": cand_exp_label,
                "status": exp_status
            },
            "freshness_label": freshness_label,
            "min_experience_years": min_required_years,
            "seniority_level": job_meta.get("seniority_level", "mid")
        })
        return enriched_job

    async def rank_jobs(self, jobs: List[Dict[str, Any]], candidate_profile: Dict[str, Any], preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scores and ranks all unique jobs using the 6-factor relevance engine."""
        if not jobs:
            return []

        ranked = []
        for j in jobs:
            try:
                scored = self._score_job(j, candidate_profile, preferences)
                ranked.append(scored)
            except Exception:
                ranked.append(j)

        # Sort descending by match score
        ranked.sort(key=lambda x: float(x.get("match_score", 0)), reverse=True)
        return ranked

