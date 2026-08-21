import json
import re
import asyncio
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.integrations.jobspy.client import JobSpyClient
from src.integrations.arbeitnow.client import ArbeitnowClient
from src.integrations.himalayas.client import HimalayasClient
from src.integrations.freehire.client import FreehireClient
from src.llm.prompts.search import QUERY_PLANNER_SYSTEM_PROMPT

class OrchestratorAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)
        self.jobspy = JobSpyClient()
        self.arbeitnow = ArbeitnowClient()
        self.himalayas = HimalayasClient()
        self.freehire = FreehireClient()

    def _extract_json(self, raw_content: str) -> Dict[str, Any]:
        """Safely extract JSON object from LLM response."""
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
        return json.loads(content)

    async def get_search_plan(self, candidate_profile: Dict[str, Any], preferences: dict) -> Dict[str, Any]:
        """
        Dynamically analyzes any target role and candidate background to formulate
        optimized search titles and keyword variations via LLM.
        """
        raw_user_role = preferences.get("role", "").strip()
        user_loc = preferences.get("location", "").strip()
        user_remote = preferences.get("remote_preference", "remote") == "remote"
        
        anchor_role = raw_user_role or (candidate_profile.get('target_roles', ["Professional"])[0] if candidate_profile.get('target_roles') else "Professional")
        
        prompt = f"""
Construct the optimal job board search plan strictly based on the user's requested role title:

User Target Role (PRIORITY): {anchor_role} (Raw input: '{raw_user_role}')
User Location Preference: {user_loc or 'Worldwide (no specific location)'}
Remote Mode: {user_remote}

Candidate Background:
- Core Domain: {candidate_profile.get('core_domain', '')}
- Technical Skills: {candidate_profile.get('top_technologies', []) or candidate_profile.get('skills', [])[:8]}
- Experience: {candidate_profile.get('experience_years', preferences.get('experience_years', 0))} years
- Seniority: {candidate_profile.get('seniority', 'Intern' if 'intern' in anchor_role.lower() else 'Mid')}
"""
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": QUERY_PLANNER_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ])
            plan = self._extract_json(response.content)
            
            # Ensure primary query is grounded in the user's requested role
            if raw_user_role and len(raw_user_role) > 2:
                if "intern" in raw_user_role.lower() and "intern" not in plan.get("primary_query", "").lower():
                    plan["primary_query"] = f"{plan.get('primary_query', anchor_role)} Intern"
            
            # If no location given by user, ensure plan reflects worldwide
            if not user_loc or user_loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]:
                plan["location"] = ""
                plan["remote_only"] = False  # Don't restrict to remote-only, fetch everything
            
            return plan
        except Exception as e:
            print(f"Notice: Query planner fallback ({e})")
            skills = candidate_profile.get("skills", [])
            domain_kws = [w.lower() for w in anchor_role.split() if len(w) > 2] + [s.lower() for s in skills[:6]]
            return {
                "primary_query": anchor_role,
                "secondary_queries": [f"{anchor_role} Remote", f"{anchor_role} Engineer"],
                "domain_keywords": list(set(domain_kws)),
                "skills_filter": skills[:6],
                "seniority": "intern" if "intern" in anchor_role.lower() else "mid",
                "location": user_loc or "",
                "remote_only": False
            }

    async def orchestrate_search(self, candidate_profile: Dict[str, Any], preferences: dict) -> List[Dict[str, Any]]:
        """
        Drives parallel search across ALL platforms using optimized parameters.
        Each platform is queried independently and in parallel.
        Secondary queries are also run on ALL platforms for maximum coverage.
        """
        plan = await self.get_search_plan(candidate_profile, preferences)
        primary_query = plan.get("primary_query", preferences.get("role", "Software Engineer"))
        location = plan.get("location", preferences.get("location", ""))
        remote = plan.get("remote_only", False)
        skills_filter = plan.get("skills_filter", [])
        seniority = plan.get("seniority") or preferences.get("experience_level") or candidate_profile.get("seniority") or "mid"
        domain_keywords = plan.get("domain_keywords", []) or []
        secondary_queries = plan.get("secondary_queries", [])
        raw_user_role = preferences.get("role", "").strip()

        # Build distinct list of all relevant job titles (LLM planned + candidate profile)
        search_queries = []
        for q in [primary_query] + secondary_queries + [raw_user_role] + candidate_profile.get("target_roles", []):
            if q and isinstance(q, str):
                cleaned_q = q.strip()
                if cleaned_q and len(cleaned_q) > 2 and cleaned_q.lower() not in [sq.lower() for sq in search_queries]:
                    search_queries.append(cleaned_q)

        # Limit to top 2 high-intent titles for fast 5-8 second live web search response
        target_queries = search_queries[:4]

        print(f"[Orchestrator] ===========================================")
        print(f"[Orchestrator] Active Search Titles ({len(target_queries)}): {target_queries}")
        print(f"[Orchestrator] Target Location: '{location or 'Worldwide'}'")
        print(f"[Orchestrator] Remote Only: {remote}")
        print(f"[Orchestrator] Domain Keywords: {domain_keywords[:6]}")
        print(f"[Orchestrator] ===========================================")

        tasks = []
        for idx, q_title in enumerate(target_queries):
            # Query JobSpy (LinkedIn & Indeed) for the primary & top secondary title
            if idx < 2:
                tasks.append(self.jobspy.search(query=q_title, location=location, remote=remote))
            # Query Himalayas, Arbeitnow, and Freehire for all expanded titles
            tasks.append(self.himalayas.search(query=q_title, location=location, remote=remote))
            tasks.append(self.arbeitnow.search(query=q_title, location=location, remote=remote, domain_keywords=domain_keywords))
            tasks.append(self.freehire.search(query=q_title, location=location, remote=remote, skills=skills_filter, seniority=seniority))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        platform_counts = {}
        for idx, res in enumerate(results):
            if isinstance(res, list):
                for job in res:
                    source = job.get("source", "unknown")
                    platform_counts[source] = platform_counts.get(source, 0) + 1
                all_jobs.extend(res)
            else:
                print(f"[Orchestrator] Task {idx} failed gracefully: {res}")

        print(f"[Orchestrator] ===========================================")
        print(f"[Orchestrator] Total raw jobs gathered: {len(all_jobs)}")
        for platform, count in sorted(platform_counts.items()):
            print(f"[Orchestrator]   -> {platform}: {count} jobs")
        print(f"[Orchestrator] ===========================================")
        return all_jobs
