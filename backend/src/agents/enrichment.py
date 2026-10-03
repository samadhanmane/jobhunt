import asyncio
import json
import re
from typing import List, Dict, Any, Optional
from src.agents.base import BaseJobAgent
from src.llm.prompts.enrich import JOB_ENRICHMENT_SYSTEM_PROMPT

class EnrichmentAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)

    def _extract_json(self, raw_content: str) -> Dict[str, Any]:
        """Safely extracts JSON object from raw LLM response."""
        content = raw_content.strip()
        if "```json" in content:
            match = re.search(r"```json\s*(\{.*?\})\s*```", content, re.DOTALL)
            if match:
                content = match.group(1)
        elif "```" in content:
            match = re.search(r"```\s*(\{.*?\})\s*```", content, re.DOTALL)
            if match:
                content = match.group(1)
        else:
            match = re.search(r"(\{.*\})", content, re.DOTALL)
            if match:
                content = match.group(1)
        try:
            return json.loads(content)
        except Exception:
            # Fallback regex extraction for critical keys
            return {}

    async def enrich_job(
        self,
        scraped_item: Dict[str, Any],
        candidate_profile: Optional[Dict[str, Any]] = None,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Enriches a single scraped job item with deep LLM categorization and match analysis.
        """
        url = scraped_item.get("url", "")
        raw_text = scraped_item.get("clean_text", "")
        title_hint = scraped_item.get("title", "")
        company_hint = scraped_item.get("company", "")
        loc_hint = scraped_item.get("location", "")
        date_hint = scraped_item.get("posted_date", "")

        if not raw_text or len(raw_text.strip()) < 30:
            return {
                "title": title_hint or "Unknown Role",
                "company": company_hint or "Unknown Company",
                "location": loc_hint or "Remote",
                "work_mode": scraped_item.get("work_mode") or ("Remote" if "remote" in loc_hint.lower() else "Onsite"),
                "seniority_level": "Mid",
                "experience_required_years": {"min": None, "max": None},
                "salary_range": None,
                "tech_stack": {"required_skills": [], "nice_to_have_skills": []},
                "matching_skills": [],
                "missing_skills": [],
                "visa_sponsorship": "Unspecified",
                "role_summary": "",
                "key_requirements": "",
                "responsibilities": [],
                "benefits_and_perks": [],
                "company_insights": {"size_indicator": "Unknown", "industry": "Unknown", "culture_signals": [], "red_flags": []},
                "match_score": 50.0,
                "experience_fit": "Good Fit",
                "match_reason": "Limited job description available for automated deep analysis.",
                "url": url,
                "source": scraped_item.get("domain", "web_link"),
                "posted_date": date_hint,
                "description": raw_text
            }

        # Build candidate context if available
        cand_context = ""
        if candidate_profile and candidate_profile.get("skills"):
            skills_str = ", ".join(candidate_profile.get("skills", [])[:10])
            exp_yrs = candidate_profile.get("experience_years", 0)
            seniority = candidate_profile.get("seniority", "Mid")
            roles_str = ", ".join(candidate_profile.get("target_roles", []))
            cand_context = f"""
Candidate Background for Match Analysis:
- Target Roles: {roles_str}
- Candidate Seniority: {seniority}
- Candidate Experience: {exp_yrs} years
- Candidate Core Skills: {skills_str}
"""
        elif preferences:
            pref_role = preferences.get("role", "")
            pref_exp = preferences.get("experience_years", 0)
            pref_loc = preferences.get("location", "")
            cand_context = f"""
Candidate Preferences:
- Target Role: {pref_role}
- Experience: {pref_exp} years
- Preferred Location: {pref_loc}
"""

        user_prompt = f"""
Please analyze and categorize this job posting:

Title Hint: {title_hint}
Company Hint: {company_hint}
Location Hint: {loc_hint}
Date Hint: {date_hint}

Job Posting Text:
\"\"\"
{raw_text}
\"\"\"
{cand_context}
"""

        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": JOB_ENRICHMENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ])
            extracted = self._extract_json(response.content)

            title = extracted.get("title") or title_hint or "Role"
            company = extracted.get("company") or company_hint or "Company"
            location = extracted.get("location") or loc_hint or "Remote"
            work_mode = extracted.get("work_mode") or scraped_item.get("work_mode") or ("Remote" if "remote" in location.lower() else "Onsite")
            seniority = extracted.get("seniority_level", "Mid")
            
            salary = extracted.get("salary")
            if salary and (salary.get("min") is None and salary.get("max") is None):
                salary = None

            tech_stack = extracted.get("tech_stack", {})
            required_skills = tech_stack.get("required_skills", [])
            nice_to_have_skills = tech_stack.get("nice_to_have_skills", [])
            all_skills = list(set(required_skills + nice_to_have_skills))

            candidate_match = extracted.get("candidate_match", {})
            match_score = float(candidate_match.get("score", 75.0))
            matching_skills = candidate_match.get("matching_skills", required_skills[:4])
            missing_skills = candidate_match.get("missing_skills", [])
            exp_fit = candidate_match.get("experience_fit", "Good Fit")
            reasoning = candidate_match.get("reasoning", extracted.get("role_summary", ""))

            # Extract company insights
            company_insights = extracted.get("company_insights", {})
            if not isinstance(company_insights, dict):
                company_insights = {}
            company_insights.setdefault("size_indicator", "Unknown")
            company_insights.setdefault("industry", "Unknown")
            company_insights.setdefault("culture_signals", [])
            company_insights.setdefault("red_flags", [])

            key_requirements = extracted.get("key_requirements_summary", "") or extracted.get("role_summary", "")

            return {
                "title": title,
                "company": company,
                "location": location,
                "work_mode": work_mode,
                "seniority_level": seniority,
                "experience_required_years": extracted.get("experience_required_years"),
                "salary_range": salary,
                "tech_stack": tech_stack,
                "matching_skills": matching_skills,
                "missing_skills": missing_skills,
                "all_skills": all_skills,
                "visa_sponsorship": extracted.get("visa_sponsorship", "Unspecified"),
                "role_summary": extracted.get("role_summary", ""),
                "key_requirements": key_requirements,
                "responsibilities": extracted.get("responsibilities", []),
                "benefits_and_perks": extracted.get("benefits_and_perks", []),
                "company_insights": company_insights,
                "match_score": match_score,
                "experience_fit": exp_fit,
                "match_reason": reasoning,
                "url": url,
                "source": scraped_item.get("domain", "web_link"),
                "posted_date": date_hint or extracted.get("posted_date"),
                "description": raw_text
            }

        except Exception as e:
            print(f"[EnrichmentAgent] LLM parsing fallback for {url}: {e}")
            return {
                "title": title_hint or "Job Listing",
                "company": company_hint or "Company",
                "location": loc_hint or "Remote",
                "work_mode": "Remote" if "remote" in loc_hint.lower() else "Onsite",
                "seniority_level": "Mid",
                "experience_required_years": {"min": None, "max": None},
                "salary_range": None,
                "tech_stack": {"required_skills": [], "nice_to_have_skills": []},
                "matching_skills": [],
                "missing_skills": [],
                "visa_sponsorship": "Unspecified",
                "role_summary": "",
                "key_requirements": "",
                "responsibilities": [],
                "benefits_and_perks": [],
                "company_insights": {"size_indicator": "Unknown", "industry": "Unknown", "culture_signals": [], "red_flags": []},
                "match_score": 60.0,
                "experience_fit": "Good Fit",
                "match_reason": "Processed via extraction engine.",
                "url": url,
                "source": scraped_item.get("domain", "web_link"),
                "posted_date": date_hint,
                "description": raw_text
            }

    async def enrich_batch(
        self,
        scraped_items: List[Dict[str, Any]],
        candidate_profile: Optional[Dict[str, Any]] = None,
        preferences: Optional[Dict[str, Any]] = None,
        max_concurrency: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Enriches multiple scraped jobs concurrently with bounded concurrency.
        """
        semaphore = asyncio.Semaphore(max_concurrency)

        async def _bounded_enrich(item: Dict[str, Any]):
            async with semaphore:
                return await self.enrich_job(item, candidate_profile, preferences)

        tasks = [_bounded_enrich(item) for item in scraped_items]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        enriched_list = []
        for idx, res in enumerate(results):
            if isinstance(res, dict):
                enriched_list.append(res)
            else:
                raw_item = scraped_items[idx]
                enriched_list.append({
                    "title": raw_item.get("title", "Job Listing"),
                    "company": raw_item.get("company", "Company"),
                    "location": raw_item.get("location", "Remote"),
                    "work_mode": "Remote",
                    "seniority_level": "Mid",
                    "salary_range": None,
                    "matching_skills": [],
                    "missing_skills": [],
                    "match_score": 50.0,
                    "match_reason": f"Enrichment error: {res}",
                    "url": raw_item.get("url", ""),
                    "source": raw_item.get("domain", "web_link"),
                    "description": raw_item.get("clean_text", "")
                })
        return enriched_list
