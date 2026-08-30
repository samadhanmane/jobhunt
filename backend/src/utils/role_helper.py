import re
from typing import List, Dict, Any, Tuple

# Career-ops negative keyword filters for AI/ML and software roles
NEGATIVE_ROLE_KEYWORDS = [
    "account executive", "sales representative", "sales development", "business development",
    "bdr", "sdr", "account manager", "customer success", "customer support", "call center",
    "telemarketing", "inside sales", "recruiter", "talent acquisition", "sourcer",
    "marketing manager", "content creator", "copywriter", "office manager",
    "paralegal", "nurse", "therapist", "warehouse", "driver", "cashier"
]

AI_SUB_DOMAINS = {
    "Agentic Systems": [
        "agent", "agentic", "multi-agent", "autonomous", "state machine", "langgraph",
        "crewai", "autogen", "swarm", "tool use", "function calling"
    ],
    "NLP & LLMs": [
        "llm", "nlp", "prompt", "fine-tuning", "peft", "lora", "transformer", "bert",
        "token", "rag", "retrieval", "embeddings", "generation", "summarization"
    ],
    "Computer Vision": [
        "vision", "cv", "object detection", "segmentation", "yolo", "opencv",
        "diffusion", "image generation", "multimodal vision", "stable diffusion"
    ],
    "Conversational & Voice AI": [
        "voice", "speech", "stt", "tts", "conversational", "audio", "whisper",
        "realtime voice", "callbot", "dialogue"
    ],
    "MLOps & Infrastructure": [
        "mlops", "inference", "triton", "vllm", "tensorrt", "kubernetes", "docker",
        "serving", "model deployment", "quantization", "latency", "pipeline"
    ],
    "Data Science": [
        "data scientist", "predictive", "tabular", "statistical", "pandas",
        "scikit-learn", "xgboost", "analytics"
    ],
    "Full-Stack AI": [
        "full stack", "fullstack", "fastapi", "react", "next.js", "frontend", "backend"
    ]
}

AI_TECHNICAL_FACETS = {
    "RAG Systems": ["rag", "retrieval", "vector", "pinecone", "chroma", "weaviate", "qdrant", "semantic search"],
    "Autonomous Agents": ["agent", "agentic", "langgraph", "crewai", "autogen", "action execution"],
    "Fine-Tuning / PEFT": ["fine-tuning", "peft", "lora", "qlora", "alignment", "rlhf", "dpo"],
    "Model Evaluation": ["evaluation", "evals", "benchmarks", "hallucination", "guardrails"],
    "Conversational & Voice AI": ["voice", "speech", "stt", "tts", "streaming audio", "whisper"],
    "Multimodal Vision": ["multimodal", "vision", "image", "video", "ocr"],
    "LLM Orchestration": ["langchain", "llamaindex", "dspy", "chain", "prompt engineering"],
    "FastAPI Inference": ["fastapi", "serverless", "rest api", "asyncio", "streaming response"],
    "Vector Retrieval & Indexing": ["vector db", "embedding", "faiss", "milvus", "indexing", "chunking"],
    "MLOps & Deployment": ["docker", "kubernetes", "k8s", "triton", "vllm", "ci/cd", "ray"]
}

def detect_ai_sub_domain(title: str, description: str = "") -> str:
    """Classifies an AI/ML job into its core specialized sub-domain."""
    text = f"{title} {description[:1000]}".lower()
    scores = {}
    for domain, kws in AI_SUB_DOMAINS.items():
        count = sum(1 for kw in kws if kw in text)
        if count > 0:
            scores[domain] = count

    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    return "AI/ML General"

def detect_ai_facets(title: str, description: str = "") -> List[str]:
    """Identifies technical AI architecture, modality, and infrastructure tags."""
    text = f"{title} {description[:2000]}".lower()
    matched_facets = []
    for facet, kws in AI_TECHNICAL_FACETS.items():
        if any(kw in text for kw in kws):
            matched_facets.append(facet)
    return matched_facets

def detect_experience_tier(title: str, description: str = "") -> str:
    """Classifies a job into exact career-ops experience tiers."""
    t = title.lower()
    d = description[:1500].lower()

    if any(k in t for k in ["intern", "internship", "co-op", "trainee", "apprentice", "fellow"]):
        return "Internship / Co-op"

    if any(k in t for k in ["principal", "staff", "director", "head of", "lead", "distinguished"]):
        return "Lead / Principal"

    if any(k in t for k in ["senior", "sr.", "sr ", "iii", "expert"]):
        return "Senior (5+ yrs)"

    if any(k in t for k in ["junior", "jr.", "associate", "entry level", "fresher", "new grad", "graduate"]):
        return "Graduate / Entry-level (0–1 yr)"

    # Look for year mentions in description
    min_years = []
    for m in re.findall(r'(\d+)\+?\s*(?:years?|yrs?)', d):
        try:
            val = int(m)
            if 0 <= val <= 25:
                min_years.append(val)
        except Exception:
            pass

    if min_years:
        lowest = min(min_years)
        if lowest == 0:
            return "Internship / Co-op"
        elif lowest == 1:
            return "Graduate / Entry-level (0–1 yr)"
        elif lowest in [2, 3, 4]:
            return "Mid-level (2–4 yrs)"
        elif lowest >= 5 and lowest < 8:
            return "Senior (5+ yrs)"
        elif lowest >= 8:
            return "Lead / Principal"

    return "Mid-level (2–4 yrs)"

def is_title_role_match(job_title: str, target_role: str) -> bool:
    """
    Precision role matcher with negative noise gate and domain synonyms.
    """
    j_title = str(job_title or "").lower().strip()
    t_role = str(target_role or "").lower().strip()

    if not t_role:
        return True

    # 1. Negative Noise Gate: Drop sales/support roles unless specifically searching for them
    if not any(k in t_role for k in ["sales", "support", "marketing", "recruiter"]):
        if any(neg in j_title for neg in NEGATIVE_ROLE_KEYWORDS):
            return False

    # 2. Intern alignment
    if "intern" in t_role and "intern" not in j_title:
        # If user explicitly wants intern, give priority to intern or junior roles
        if not any(k in j_title for k in ["intern", "trainee", "fellow", "junior", "co-op", "entry"]):
            return False

    # 3. Direct token overlap
    role_tokens = [w for w in re.sub(r'[^a-zA-Z0-9]', ' ', t_role).split() if len(w) > 2]
    if not role_tokens:
        return True

    match_count = sum(1 for tok in role_tokens if tok in j_title)
    if match_count >= 1:
        return True

    # Common AI engineering synonyms
    ai_synonyms = ["machine learning", "deep learning", "artificial intelligence", "data science", "llm", "genai", "prompt"]
    if any(s in t_role for s in ai_synonyms) and any(s in j_title for s in ["ai", "ml", "engineer", "scientist", "developer"]):
        return True

    return False

def filter_curated_jobs_by_role(
    ranked_jobs: List[Dict[str, Any]],
    target_role: str = "",
    experience_level: str = "all",
    sub_domain: str = "All",
    min_score: float = 40.0
) -> List[Dict[str, Any]]:
    """
    Curates and filters ranked jobs strictly matching role target,
    negative noise elimination, experience tier, and sub-domain.
    """
    if not ranked_jobs:
        return []

    curated = []
    clean_target = (target_role or "").lower().strip()
    clean_sub = (sub_domain or "All").lower().strip()
    clean_exp = (experience_level or "all").lower().strip()

    for j in ranked_jobs:
        score = float(j.get("match_score", 0.0))
        if score < min_score:
            continue

        title = str(j.get("title", "")).lower()
        
        # Negative noise filter check
        if not any(k in clean_target for k in ["sales", "support", "marketing"]):
            if any(neg in title for neg in NEGATIVE_ROLE_KEYWORDS):
                continue

        # Sub-domain check if specified
        if clean_sub not in ["all", "any", ""]:
            job_sub = str(j.get("sub_domain", "")).lower()
            if clean_sub not in job_sub:
                continue

        # Experience check
        if clean_exp in ["intern", "internship"] and not any(k in title for k in ["intern", "trainee", "fellow", "junior", "co-op", "entry"]):
            continue

        curated.append(j)

    return curated
