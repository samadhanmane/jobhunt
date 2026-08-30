import json
import re
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.utils.location_helper import is_job_location_match, is_india_location, detect_work_mode
from src.utils.role_helper import (
    is_title_role_match,
    detect_ai_sub_domain,
    detect_ai_facets,
    detect_experience_tier,
    NEGATIVE_ROLE_KEYWORDS
)

TECH_STACK_CLUSTERS = {
    "python": ["python", "fastapi", "flask", "django", "asyncio"],
    "deep_learning": ["pytorch", "torch", "tensorflow", "keras", "cuda", "huggingface", "transformers"],
    "llm_frameworks": ["langchain", "langgraph", "llamaindex", "dspy", "crewai", "autogen", "vllm", "ollama"],
    "vector_dbs": ["pinecone", "chroma", "chromadb", "weaviate", "qdrant", "faiss", "milvus"],
    "devops_cloud": ["docker", "kubernetes", "k8s", "aws", "gcp", "azure", "git", "linux", "ci/cd"],
    "fullstack": ["react", "next.js", "typescript", "javascript", "node", "tailwind", "sql", "postgresql"]
}

class RankingAgent(BaseJobAgent):
    """
    Explainable 4-Pillar Ranking & Core Filtering Schema Matcher.
    Pillars:
      1. Role & Domain Alignment (35%)
      2. Tech Stack & Skills Fit (30%)
      3. Seniority & Experience Fit (20%)
      4. Location & Work Mode Fit (15%)
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

        # 1. Negative Noise Check
        title_lower = title.lower()
        if not any(k in target_role.lower() for k in ["sales", "support", "marketing"]):
            if any(neg in title_lower for neg in NEGATIVE_ROLE_KEYWORDS):
                role_score = 10
            else:
                role_score = 90 if is_title_role_match(title, target_role) else 50
        else:
            role_score = 80 if is_title_role_match(title, target_role) else 40

        # Sub-domain alignment boost
        pref_sub_domain = preferences.get("sub_domain")
        if pref_sub_domain and pref_sub_domain.lower() != "all":
            if pref_sub_domain.lower() in sub_domain.lower():
                role_score = min(100, role_score + 15)

        # 2. Skills & Tech Stack Score (30%)
        cand_skills = [s.lower().strip() for s in (candidate_profile.get("skills", []) or [])]
        matched_skills = []
        missing_skills = []
        desc_lower = desc.lower()

        # Check candidate skills in description
        for s in cand_skills:
            if s and s in desc_lower or s in title_lower:
                matched_skills.append(s.title())
            elif s:
                missing_skills.append(s.title())

        # Check cluster coverage
        cluster_matches = 0
        for cluster_name, keywords in TECH_STACK_CLUSTERS.items():
            if any(kw in desc_lower for kw in keywords):
                cluster_matches += 1

        skill_score = min(100, int((len(matched_skills) * 15) + (cluster_matches * 10)))
        if not cand_skills:
            skill_score = 75

        # 3. Experience Tier Fit (20%)
        cand_seniority = str(candidate_profile.get("seniority", "Mid")).lower()
        exp_score = 75
        if "intern" in target_role.lower() or target_exp_tier == "intern" or "intern" in cand_seniority:
            if "intern" in job_exp_tier.lower() or "intern" in title_lower:
                exp_score = 100
            elif "entry" in job_exp_tier.lower():
                exp_score = 85
            else:
                exp_score = 30
        elif target_exp_tier:
            if target_exp_tier.lower() in job_exp_tier.lower():
                exp_score = 100
            else:
                exp_score = 60

        # 4. Location & Work Mode Fit (15%)
        loc_score = 70
        is_target_india = "india" in target_loc.lower() or any(c in target_loc.lower() for c in ["pune", "bengaluru", "bangalore", "hyderabad", "mumbai", "delhi"])
        if is_target_india:
            if is_india_location(loc, u, title, desc):
                loc_score = 100
            else:
                loc_score = 25
        elif target_loc.lower() in ["remote", "worldwide", "global", "any"]:
            if work_mode == "Remote":
                loc_score = 100
            else:
                loc_score = 70
        else:
            if is_job_location_match(loc, target_loc, pref_work_mode, "", desc, title, u):
                loc_score = 95
            else:
                loc_score = 40

        # Final Weighted Match Score
        total_score = round(
            (role_score * 0.35) +
            (skill_score * 0.30) +
            (exp_score * 0.20) +
            (loc_score * 0.15)
        )

        match_reason = f"Role Fit: {role_score}% | Skills Fit: {skill_score}% | Experience Fit: {exp_score}% | Location Fit: {loc_score}%"

        enriched_job = dict(job)
        enriched_job.update({
            "match_score": total_score,
            "match_reason": match_reason,
            "role_match_score": role_score,
            "skill_match_score": skill_score,
            "exp_match_score": exp_score,
            "loc_match_score": loc_score,
            "sub_domain": sub_domain,
            "ai_facets": facets,
            "experience_fit": job_exp_tier,
            "work_mode": work_mode,
            "matching_skills": matched_skills[:10],
            "missing_skills": missing_skills[:8],
        })
        return enriched_job

    async def rank_jobs(self, jobs: List[Dict[str, Any]], candidate_profile: Dict[str, Any], preferences: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scores and ranks all unique jobs."""
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
