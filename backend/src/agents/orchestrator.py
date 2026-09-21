import json
import re
import asyncio
from typing import List, Dict, Any
from src.agents.base import BaseJobAgent
from src.integrations.jobspy.client import JobSpyClient
from src.integrations.arbeitnow.client import ArbeitnowClient
from src.integrations.himalayas.client import HimalayasClient
from src.integrations.freehire.client import FreehireClient
from src.integrations.jobicy.client import JobicyClient
from src.integrations.remoteok.client import RemoteOKClient
from src.integrations.greenhouse.client import GreenhouseClient
from src.integrations.lever.client import LeverClient
from src.integrations.ashby.client import AshbyClient
from src.integrations.phenom.client import PhenomClient
from src.integrations.workday.client import WorkdayClient
from src.integrations.smartrecruiters.client import SmartRecruitersClient
from src.integrations.workable.client import WorkableClient
from src.integrations.remotive.client import RemotiveClient
from src.integrations.instahyre.client import InstahyreClient
from src.integrations.ycombinator.client import YCombinatorClient
from src.integrations.recruitee.client import RecruiteeClient
from src.integrations.workingnomads.client import WorkingNomadsClient
from src.integrations.weworkremotely.client import WeWorkRemotelyClient
from src.integrations.cutshort.client import CutshortClient
from src.integrations.hirist.client import HiristClient
from src.integrations.internshala.client import InternshalaClient
from src.integrations.teamtailor.client import TeamtailorClient
from src.integrations.unstop.client import UnstopClient
from src.integrations.aijobs.client import AIJobsClient
from src.integrations.naukri.client import NaukriClient
from src.integrations.apna.client import ApnaClient
from src.integrations.shine.client import ShineClient
from src.integrations.builtin.client import BuiltInClient
from src.integrations.themuse.client import TheMuseClient
from src.integrations.simplify.client import SimplifyClient
from src.llm.prompts.search import QUERY_PLANNER_SYSTEM_PROMPT

class OrchestratorAgent(BaseJobAgent):
    def __init__(self, llm=None):
        super().__init__(llm)
        self.jobspy = JobSpyClient()
        self.arbeitnow = ArbeitnowClient()
        self.himalayas = HimalayasClient()
        self.freehire = FreehireClient()
        self.jobicy = JobicyClient()
        self.remoteok = RemoteOKClient()
        self.greenhouse = GreenhouseClient()
        self.lever = LeverClient()
        self.ashby = AshbyClient()
        self.phenom = PhenomClient()
        self.workday = WorkdayClient()
        self.smartrecruiters = SmartRecruitersClient()
        self.workable = WorkableClient()
        self.remotive = RemotiveClient()
        self.instahyre = InstahyreClient()
        self.ycombinator = YCombinatorClient()
        self.recruitee = RecruiteeClient()
        self.workingnomads = WorkingNomadsClient()
        self.weworkremotely = WeWorkRemotelyClient()
        self.cutshort = CutshortClient()
        self.hirist = HiristClient()
        self.internshala = InternshalaClient()
        self.teamtailor = TeamtailorClient()
        self.unstop = UnstopClient()
        self.aijobs = AIJobsClient()
        self.naukri = NaukriClient()
        self.apna = ApnaClient()
        self.shine = ShineClient()
        self.builtin = BuiltInClient()
        self.themuse = TheMuseClient()
        self.simplify = SimplifyClient()


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
            
            exp_lvl = str(preferences.get("experience_level", "")).lower().strip()
            
            if exp_lvl in ["intern", "0", "internship"] or "intern" in raw_user_role.lower():
                if "intern" not in plan.get("primary_query", "").lower():
                    plan["primary_query"] = f"{plan.get('primary_query', anchor_role)} Intern"
                plan["secondary_queries"] = [
                    f"{anchor_role} Intern",
                    f"{anchor_role} Internship",
                    f"{anchor_role} Trainee",
                    f"{anchor_role} Apprentice"
                ]
            elif exp_lvl in ["entry", "1", "junior", "0-1", "entry_level"] or "junior" in raw_user_role.lower():
                if "junior" not in plan.get("primary_query", "").lower() and "entry" not in plan.get("primary_query", "").lower():
                    plan["primary_query"] = f"Junior {plan.get('primary_query', anchor_role)}"
                plan["secondary_queries"] = [
                    f"Junior {anchor_role}",
                    f"Entry Level {anchor_role}",
                    f"Associate {anchor_role}"
                ]
            elif exp_lvl in ["senior", "5+", "8+", "lead"] or "senior" in raw_user_role.lower():
                if "senior" not in plan.get("primary_query", "").lower():
                    plan["primary_query"] = f"Senior {plan.get('primary_query', anchor_role)}"
                plan["secondary_queries"] = [
                    f"Senior {anchor_role}",
                    f"Lead {anchor_role}",
                    f"Staff {anchor_role}"
                ]

            if not user_loc or user_loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]:
                plan["location"] = ""
                plan["remote_only"] = preferences.get("remote_preference") == "remote"
            else:
                plan["location"] = user_loc
            
            return plan
        except Exception as e:
            print(f"Notice: Query planner fallback ({e})")
            skills = candidate_profile.get("skills", [])
            domain_kws = [w.lower() for w in anchor_role.split() if len(w) > 2] + [s.lower() for s in skills[:6]]
            
            exp_lvl = str(preferences.get("experience_level", "")).lower().strip()
            if exp_lvl in ["intern", "0", "internship"] or "intern" in anchor_role.lower():
                primary_q = f"{anchor_role} Intern" if "intern" not in anchor_role.lower() else anchor_role
                sec_q = [f"{anchor_role} Intern", f"{anchor_role} Internship", f"{anchor_role} Trainee"]
            elif exp_lvl in ["entry", "1", "junior"]:
                primary_q = f"Junior {anchor_role}"
                sec_q = [f"Junior {anchor_role}", f"Entry Level {anchor_role}", f"Associate {anchor_role}"]
            else:
                primary_q = anchor_role
                sec_q = [f"{anchor_role} Remote", f"{anchor_role} Engineer", f"{anchor_role} {user_loc}"]

            return {
                "primary_query": primary_q,
                "secondary_queries": sec_q,
                "domain_keywords": list(set(domain_kws)),
                "skills_filter": skills[:6],
                "experience_level": preferences.get("experience_level", "Mid"),
                "location": "" if (not user_loc or user_loc.lower() in ["remote", "worldwide", "global", "any", "all", ""]) else user_loc,
                "remote_only": user_remote
            }

    async def orchestrate_search(self, candidate_profile: Dict[str, Any], preferences: dict) -> List[Dict[str, Any]]:
        """
        Drives parallel multi-platform search across ALL platforms:
        - JobSpy (LinkedIn, Indeed)
        - Himalayas (Remote tech roles)
        - Arbeitnow (Global & European tech board)
        - Freehire (Specialized skill-matched roles)
        - Jobicy (Remote API jobs)
        - RemoteOK (Live remote developer feed)
        - Greenhouse (Direct corporate ATS boards)
        - Lever (Direct corporate ATS postings)
        - Ashby (High-growth tech ATS postings)
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

        search_queries = []
        for q in [primary_query] + secondary_queries + [raw_user_role] + candidate_profile.get("target_roles", []):
            if q and isinstance(q, str):
                cleaned_q = q.strip()
                if cleaned_q and len(cleaned_q) > 2 and cleaned_q.lower() not in [sq.lower() for sq in search_queries]:
                    search_queries.append(cleaned_q)

        target_queries = search_queries[:3]

        print(f"[Orchestrator] ===========================================")
        print(f"[Orchestrator] Active Search Titles ({len(target_queries)}): {target_queries}")
        print(f"[Orchestrator] Target Location: '{location or 'Worldwide'}'")
        print(f"[Orchestrator] Remote Only: {remote}")
        print(f"[Orchestrator] Domain Keywords: {domain_keywords[:6]}")
        print(f"[Orchestrator] Platforms: JobSpy, Himalayas, Arbeitnow, Freehire, Jobicy, RemoteOK, Greenhouse, Lever, Ashby, Phenom")
        print(f"[Orchestrator] ===========================================")

        import gc
        sem = asyncio.Semaphore(4)

        async def run_guarded(coro):
            async with sem:
                try:
                    res = await coro
                    return res if isinstance(res, list) else []
                except Exception as e:
                    print(f"Notice: scraper error: {e}")
                    return []

        target_src = (preferences.get("source_platform") or preferences.get("sources") or "").lower().strip()
        target_cat = (preferences.get("source_category") or preferences.get("category") or "all").lower().strip()

        tasks = []
        for idx, q_title in enumerate(target_queries):
            # 1. India Platforms (Instahyre, Cutshort, Hirist, Internshala, Unstop, Naukri, JobSpy India)
            if target_cat in ["all", "india"] and (not target_src or target_src in ["instahyre"]):
                if idx == 0:
                    tasks.append(run_guarded(self.instahyre.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india", "startups"] and (not target_src or target_src in ["cutshort"]):
                if idx == 0:
                    tasks.append(run_guarded(self.cutshort.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india"] and (not target_src or target_src in ["hirist"]):
                if idx == 0:
                    tasks.append(run_guarded(self.hirist.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india", "internships"] and (not target_src or target_src in ["internshala"]):
                if idx == 0:
                    tasks.append(run_guarded(self.internshala.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india", "internships"] and (not target_src or target_src in ["unstop"]):
                if idx == 0:
                    tasks.append(run_guarded(self.unstop.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "internships"] and (not target_src or target_src in ["simplify"]):
                if idx == 0:
                    tasks.append(run_guarded(self.simplify.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india"] and (not target_src or target_src in ["naukri"]):
                if idx == 0:
                    tasks.append(run_guarded(self.naukri.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india"] and (not target_src or target_src in ["apna"]):
                if idx == 0:
                    tasks.append(run_guarded(self.apna.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india"] and (not target_src or target_src in ["shine"]):
                if idx == 0:
                    tasks.append(run_guarded(self.shine.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "india"] and (not target_src or target_src in ["jobspy", "linkedin", "indeed"]):
                if idx == 0:
                    tasks.append(run_guarded(self.jobspy.search(query=q_title, location=location, remote=remote)))

            # 2. Enterprise Workday, SmartRecruiters, Phenom, Recruitee & Teamtailor
            if target_cat in ["all", "enterprise_workday"] and (not target_src or target_src in ["workday"]):
                tasks.append(run_guarded(self.workday.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "enterprise_workday"] and (not target_src or target_src in ["smartrecruiters"]):
                tasks.append(run_guarded(self.smartrecruiters.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "enterprise_workday"] and (not target_src or target_src in ["phenom"]):
                tasks.append(run_guarded(self.phenom.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "enterprise_workday", "startups"] and (not target_src or target_src in ["recruitee"]):
                tasks.append(run_guarded(self.recruitee.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "enterprise_workday", "startups"] and (not target_src or target_src in ["teamtailor"]):
                tasks.append(run_guarded(self.teamtailor.search(query=q_title, location=location, remote=remote)))

            # 3. Direct AI Registry & Specialized AI/ML Feeds (Ashby, Greenhouse, Lever, Workable, AIJobs)
            if target_cat in ["all", "ai_registry", "startups"] and (not target_src or target_src in ["ashby"]):
                tasks.append(run_guarded(self.ashby.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "ai_registry"] and (not target_src or target_src in ["greenhouse"]):
                tasks.append(run_guarded(self.greenhouse.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "ai_registry"] and (not target_src or target_src in ["lever"]):
                tasks.append(run_guarded(self.lever.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "ai_registry"] and (not target_src or target_src in ["workable"]):
                tasks.append(run_guarded(self.workable.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "ai_registry"] and (not target_src or target_src in ["aijobs", "kdnuggets"]):
                if idx == 0:
                    tasks.append(run_guarded(self.aijobs.search(query=q_title, location=location, remote=remote)))

            # 4. Startups & High-Growth Ecosystems (Y Combinator, BuiltIn, The Muse)
            if target_cat in ["all", "startups"] and (not target_src or target_src in ["ycombinator", "yc"]):
                if idx == 0:
                    tasks.append(run_guarded(self.ycombinator.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "startups"] and (not target_src or target_src in ["builtin"]):
                if idx == 0:
                    tasks.append(run_guarded(self.builtin.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "startups", "enterprise_workday"] and (not target_src or target_src in ["themuse", "muse"]):
                if idx == 0:
                    tasks.append(run_guarded(self.themuse.search(query=q_title, location=location, remote=remote)))

            # 5. Remote Global Feeds (Remotive, WeWorkRemotely, WorkingNomads, Himalayas, RemoteOK, Jobicy, Arbeitnow, Freehire)
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["remotive"]):
                tasks.append(run_guarded(self.remotive.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["weworkremotely", "wwr"]):
                if idx == 0:
                    tasks.append(run_guarded(self.weworkremotely.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["workingnomads"]):
                if idx == 0:
                    tasks.append(run_guarded(self.workingnomads.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["himalayas"]):
                tasks.append(run_guarded(self.himalayas.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["remoteok"]):
                tasks.append(run_guarded(self.remoteok.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["jobicy"]):
                tasks.append(run_guarded(self.jobicy.search(query=q_title, location=location, remote=remote)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["arbeitnow"]):
                tasks.append(run_guarded(self.arbeitnow.search(query=q_title, location=location, remote=remote, domain_keywords=domain_keywords)))
            if target_cat in ["all", "remote"] and (not target_src or target_src in ["freehire"]):
                tasks.append(run_guarded(self.freehire.search(query=q_title, location=location, remote=remote, skills=skills_filter, seniority=seniority)))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        platform_counts = {}
        for idx, res in enumerate(results):
            if isinstance(res, list):
                for job in res:
                    if job.get("description") and len(job["description"]) > 3000:
                        job["description"] = job["description"][:3000]
                    source = (job.get("source") or "unknown").lower()
                    platform_counts[source] = platform_counts.get(source, 0) + 1

                    # Normalize source_category
                    if any(s in source for s in ["instahyre", "cutshort", "hirist", "naukri", "unstop", "apna", "shine"]) or ("jobspy" in source and "india" in str(job.get("location", "")).lower()):
                        job["source_category"] = "india"
                    elif any(s in source for s in ["internshala", "simplify"]):
                        job["source_category"] = "internships"
                    elif any(s in source for s in ["workday", "smartrecruiters", "phenom", "teamtailor"]):
                        job["source_category"] = "enterprise_workday"
                    elif any(s in source for s in ["ycombinator", "yc", "hn", "builtin", "themuse", "muse"]):
                        job["source_category"] = "startups"
                    elif any(s in source for s in ["weworkremotely", "workingnomads", "remotive", "remoteok", "himalayas", "jobicy", "arbeitnow", "freehire"]):
                        job["source_category"] = "remote"
                    elif any(s in source for s in ["ashby", "greenhouse", "lever", "workable", "aijobs", "kdnuggets"]):
                        job["source_category"] = "ai_registry"
                    elif "recruitee" in source:
                        job["source_category"] = "startups"
                    else:
                        job["source_category"] = "all"



                    all_jobs.append(job)
            else:
                print(f"[Orchestrator] Task {idx} notice: {res}")

        # Career-Ops Feature 4: Company Blacklist Gate
        blacklist = preferences.get("blacklist") or []
        if blacklist:
            blacklist_clean = {b.lower().strip() for b in blacklist if b}
            all_jobs = [j for j in all_jobs if j.get("company", "").lower().strip() not in blacklist_clean]

        del results
        gc.collect()

        print(f"[Orchestrator] ===========================================")
        print(f"[Orchestrator] Total raw jobs gathered: {len(all_jobs)}")
        for platform, count in sorted(platform_counts.items()):
            print(f"[Orchestrator]   -> {platform}: {count} jobs")
        print(f"[Orchestrator] ===========================================")
        return all_jobs
