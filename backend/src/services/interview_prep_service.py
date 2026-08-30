from typing import Dict, Any, List

class InterviewPrepService:
    """
    STAR+R Story Bank & Interview Talking Points Generator.
    Ported from career-ops story-bank.md and interview prep engine.
    """
    def match_stories_for_job(self, job: Dict[str, Any], stories: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        job_text = ((job.get("title") or "") + " " + (job.get("description") or "")).lower()
        scored_stories = []

        for s in stories:
            score = 0
            # Match technologies
            for tech in (s.get("technologies") or []):
                if tech.lower() in job_text:
                    score += 25
            # Match tags
            for tag in (s.get("tags") or []):
                if tag.lower() in job_text:
                    score += 20
            # Base story presence
            score += 10

            scored_stories.append({**s, "relevance_score": min(score, 100)})

        scored_stories.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_stories

    def generate_talking_points(self, job: Dict[str, Any], top_story: Dict[str, Any]) -> Dict[str, Any]:
        role = job.get("title", "Target Role")
        comp = job.get("company", "Company")
        story_title = top_story.get("title", "Project Achievement")
        situation = top_story.get("situation", "")
        action = top_story.get("action", "")
        result = top_story.get("result", "")

        return {
            "tell_me_about_yourself": f"I am an engineer focused on AI systems. Most recently in {story_title}, {situation}. I spearheaded {action}, resulting in {result}.",
            "technical_deep_dive": f"For {role} at {comp}, my experience with {', '.join(top_story.get('technologies', []))} directly maps to your requirements.",
            "handling_challenges": f"When facing performance bottlenecks, I follow an evidence-based approach: profiling bottlenecks, optimizing vector similarity search, and benchmarking latency reductions.",
            "matched_story_title": story_title
        }

interview_prep_service = InterviewPrepService()
