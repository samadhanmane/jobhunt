import re
from typing import List, Dict, Any, Set

SKILL_CLUSTERS = {
    "Deep Learning": ["pytorch", "tensorflow", "keras", "neural networks", "backpropagation", "cnn", "rnn", "cuda"],
    "NLP & LLMs": ["transformers", "huggingface", "llm", "langchain", "llamaindex", "rag", "vector db", "prompt engineering", "bert", "gpt"],
    "Agentic Systems": ["langgraph", "crewai", "autogen", "function calling", "tool use", "multi-agent", "agentic workflows"],
    "MLOps & Deployment": ["docker", "kubernetes", "fastapi", "mlflow", "wandb", "triton", "onnx", "tensorrt", "vllm", "ci/cd", "aws", "gcp"],
    "Data & Feature Engineering": ["pandas", "numpy", "scikit-learn", "sql", "postgresql", "spark", "dbt", "data pipelines"],
    "Computer Vision": ["opencv", "yolo", "segmentation", "object detection", "diffusion", "vision transformers"]
}

PROJECT_SUGGESTIONS = {
    "langgraph": "Build a multi-agent research assistant with human-in-the-loop validation using LangGraph.",
    "rag": "Implement a hybrid sparse/dense RAG pipeline with reciprocal rank fusion and reranking.",
    "docker": "Containerize a FastAPI model inference service with multi-stage Docker builds.",
    "fastapi": "Create an asynchronous streaming SSE endpoint for model text generation.",
    "triton": "Deploy an ONNX runtime model to Triton Inference Server with dynamic batching.",
    "vllm": "Set up high-throughput LLM serving with PagedAttention using vLLM.",
    "vector db": "Integrate Qdrant or Pinecone with metadata filtering and semantic deduplication."
}

class UpskillService:
    """
    Skill Gap & Upskill Intelligence Service.
    Ported from career-ops jd-skill-gap.mjs and upskill.mjs.
    """
    def analyze_job_skill_gap(self, job: Dict[str, Any], candidate_skills: List[str]) -> Dict[str, Any]:
        user_skills_clean = {s.lower().strip() for s in candidate_skills if s}
        
        # Extract skills from job
        job_skills = set()
        for s in (job.get("matching_skills") or []):
            job_skills.add(s.lower().strip())
        for s in (job.get("missing_skills") or []):
            job_skills.add(s.lower().strip())

        # Also parse text if skills list is sparse
        desc = (job.get("description") or "") + " " + (job.get("key_requirements") or "")
        desc_lower = desc.lower()
        
        all_known_tech = [
            "python", "pytorch", "tensorflow", "langchain", "llamaindex", "langgraph", "fastapi",
            "docker", "kubernetes", "sql", "postgres", "mongodb", "redis", "qdrant", "pinecone",
            "chromadb", "aws", "gcp", "azure", "git", "linux", "triton", "vllm", "mlflow",
            "opencv", "scikit-learn", "pandas", "numpy", "huggingface", "transformers"
        ]
        for tech in all_known_tech:
            if re.search(r'\b' + re.escape(tech) + r'\b', desc_lower):
                job_skills.add(tech)

        if not job_skills:
            job_skills = {"python", "machine learning", "pytorch"}

        verified = []
        supported = []
        missing = []

        # Build candidate cluster coverage
        candidate_clusters = set()
        for cluster, techs in SKILL_CLUSTERS.items():
            if any(t in user_skills_clean for t in techs):
                candidate_clusters.add(cluster)

        for skill in job_skills:
            if skill in user_skills_clean:
                verified.append(skill.title())
            else:
                # Check if candidate has transferable skills in the same cluster
                is_supported = False
                for cluster, techs in SKILL_CLUSTERS.items():
                    if skill in techs and cluster in candidate_clusters:
                        supported.append(skill.title())
                        is_supported = True
                        break
                if not is_supported:
                    missing.append(skill.title())

        total = len(verified) + len(supported) + len(missing)
        coverage_pct = round(((len(verified) + 0.5 * len(supported)) / total * 100) if total > 0 else 0)

        # Learning recommendations for top gaps
        recommendations = []
        for gap in missing[:4]:
            g_low = gap.lower()
            rec = PROJECT_SUGGESTIONS.get(g_low, f"Build a hands-on GitHub demo showcasing {gap} in an AI workflow.")
            recommendations.append({"skill": gap, "action": rec})

        return {
            "verified_skills": sorted(verified),
            "supported_skills": sorted(supported),
            "missing_skills": sorted(missing),
            "coverage_percentage": coverage_pct,
            "readiness_level": "High" if coverage_pct >= 75 else ("Medium" if coverage_pct >= 50 else "Growth"),
            "recommendations": recommendations
        }

    def aggregate_market_skill_demand(self, jobs: List[Dict[str, Any]], candidate_skills: List[str]) -> List[Dict[str, Any]]:
        user_skills_clean = {s.lower().strip() for s in candidate_skills if s}
        freq = {}
        total_jobs = len(jobs) or 1

        for j in jobs:
            skills = (j.get("matching_skills") or []) + (j.get("missing_skills") or [])
            for s in set(skills):
                s_clean = s.strip().title()
                freq[s_clean] = freq.get(s_clean, 0) + 1

        results = []
        for skill_name, count in sorted(freq.items(), key=lambda x: x[1], reverse=True)[:15]:
            demand_pct = round((count / total_jobs) * 100)
            is_owned = skill_name.lower() in user_skills_clean
            priority = "Critical" if demand_pct >= 50 and not is_owned else ("Important" if demand_pct >= 25 and not is_owned else "Maintained")
            results.append({
                "skill": skill_name,
                "demand_percentage": demand_pct,
                "job_count": count,
                "is_owned": is_owned,
                "priority": priority
            })

        return results

upskill_service = UpskillService()
