import re
from typing import List, Dict, Any, Tuple

# Career-ops negative keyword filters for AI/ML and software roles
NEGATIVE_ROLE_KEYWORDS = [
    "account executive", "sales representative", "sales development", "business development",
    "bdr", "sdr", "account manager", "customer success", "customer support", "call center",
    "telemarketing", "inside sales", "recruiter", "talent acquisition", "sourcer",
    "marketing manager", "content creator", "copywriter", "office manager",
    "paralegal", "nurse", "therapist", "warehouse", "driver", "cashier",
    "microbiologist", "microbiology", "healthcare", "medical", "clinical", "pharmacist",
    "legal engineer", "legal", "attorney", "coding specialist", "sap consultant", "sap",
    "hr data", "payroll", "customer service", "operations manager", "field service engineer",
    "mechanical designer", "document specialist", "claims specialist", "billing", "receptionist"
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

    # 1. Negative Noise Gate: Drop sales/support/healthcare/legal/admin roles unless specifically searching for them
    if not any(k in t_role for k in ["sales", "support", "marketing", "recruiter", "medical", "legal", "microbiologist"]):
        if any(neg in j_title for neg in NEGATIVE_ROLE_KEYWORDS):
            return False

    # 2. Intern alignment
    if "intern" in t_role:
        if not any(k in j_title for k in ["intern", "trainee", "fellow", "co-op", "student"]):
            if "junior" not in j_title and "entry" not in j_title:
                return False

    # 3. Direct token overlap (ignoring generic words like 'engineer', 'developer', 'manager')
    generic_words = {"engineer", "developer", "manager", "lead", "senior", "junior", "associate", "specialist", "analyst", "intern"}
    role_tokens = [w for w in re.sub(r'[^a-zA-Z0-9]', ' ', t_role).split() if len(w) >= 2 and w not in generic_words]

    # AI / ML domain specific check
    ai_targets = [
        "ai", "ml", "aiml", "ai/ml", "ai-ml", "machine learning", "deep learning",
        "llm", "genai", "nlp", "vision", "rag", "data science", "artificial intelligence"
    ]
    is_ai_target = (
        any(a in t_role for a in ai_targets) or
        bool(re.search(r'\b(ai[/\-_ ]?ml|aiml)\b', t_role)) or
        "aiml" in t_role.replace(" ", "")
    )
    if is_ai_target:
        ai_title_indicators = [
            "aiml", "ai", "ml", "ai/ml", "ai-ml", "machine learning", "deep learning",
            "llm", "genai", "nlp", "vision", "rag", "data science", "data scientist",
            "prompt", "artificial intelligence"
        ]
        for ind in ai_title_indicators:
            if len(ind) <= 4:
                if re.search(r'\b' + re.escape(ind) + r'\b', j_title):
                    return True
            else:
                if ind in j_title:
                    return True
        # Check compound regex pattern
        if re.search(r'\b(ai[/\-_ ]?ml|aiml)\b', j_title):
            return True
        return False

    if role_tokens:
        if any(tok in j_title for tok in role_tokens):
            return True

    # Fallback exact word check
    return any(w in j_title for w in t_role.split() if len(w) > 3)


def filter_curated_jobs_by_role(
    ranked_jobs: List[Dict[str, Any]],
    target_role: str = "",
    experience_level: str = "all",
    sub_domain: str = "All",
    min_score: float = 40.0,
    target_location: str = "",
    work_mode: str = "any"
) -> List[Dict[str, Any]]:
    """
    Curates and filters ranked jobs strictly matching role target,
    negative noise elimination, experience tier, sub-domain, and geographic location.
    """
    if not ranked_jobs:
        return []

    curated = []
    clean_target = (target_role or "").lower().strip()
    clean_sub = (sub_domain or "All").lower().strip()
    clean_exp = (experience_level or "all").lower().strip()
    clean_loc = (target_location or "").strip()
    clean_mode = (work_mode or "any").strip()

    for j in ranked_jobs:
        score = float(j.get("match_score", 0.0))
        if score < min_score:
            continue

        # Reject jobs with explicit location mismatch flag
        if j.get("location_mismatch") is True:
            continue

        # Geographic Location verification
        if clean_loc and clean_loc.lower() not in ["worldwide", "global", "all", "any", "remote", ""]:
            job_loc = str(j.get("location") or "")
            job_desc = str(j.get("description") or "")[:800]
            job_title = str(j.get("title") or "")
            job_url = str(j.get("url") or "")
            from src.utils.location_helper import is_job_location_match
            if not is_job_location_match(
                job_location=job_loc,
                pref_location=clean_loc,
                pref_work_mode=clean_mode,
                job_description=job_desc,
                job_title=job_title,
                job_url=job_url
            ):
                continue
        elif clean_loc and clean_loc.lower() == "remote":
            job_loc = str(j.get("location") or "")
            job_desc = str(j.get("description") or "")[:800]
            job_title = str(j.get("title") or "")
            from src.utils.location_helper import detect_work_mode
            if detect_work_mode(job_loc, job_title, job_desc).lower() != "remote":
                continue

        title = str(j.get("title", "")).lower()

        # Precision role matcher gate
        if clean_target and not is_title_role_match(title, clean_target):
            continue
        
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

