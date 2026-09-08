import re
from typing import List, Dict, Any, Set, Optional, Tuple

# ==============================================================================
# Comprehensive Technical Skills Taxonomy
# Maps canonical skill display name -> list of aliases/regex keywords
# ==============================================================================
CANONICAL_SKILLS_MAP: Dict[str, List[str]] = {
    # --- AI, ML & Deep Learning ---
    "Python": [r"python", r"py"],
    "PyTorch": [r"pytorch", r"torch"],
    "TensorFlow": [r"tensorflow", r"tf"],
    "Keras": [r"keras"],
    "JAX": [r"jax"],
    "Scikit-Learn": [r"scikit-learn", r"sklearn"],
    "Pandas": [r"pandas"],
    "NumPy": [r"numpy"],
    "OpenCV": [r"opencv", r"cv2"],
    "XGBoost": [r"xgboost"],
    "LightGBM": [r"lightgbm"],
    "Deep Learning": [r"deep learning", r"\bdl\b"],
    "Machine Learning": [r"machine learning", r"\bml\b"],
    "Data Science": [r"data science", r"data scientist"],
    "Data Engineering": [r"data engineering", r"data engineer"],
    "NLP": [r"natural language processing", r"\bnlp\b"],
    "Computer Vision": [r"computer vision", r"\bcv\b"],

    # --- Generative AI & LLMs ---
    "Transformers": [r"transformers", r"hugging\s*face", r"huggingface"],
    "LangChain": [r"langchain"],
    "LangGraph": [r"langgraph"],
    "LlamaIndex": [r"llamaindex", r"llama-index"],
    "RAG": [r"retrieval[-\s]augmented generation", r"\brag\b"],
    "Agentic AI": [r"agentic ai", r"ai agents?", r"multi-agent", r"autonomous agents?"],
    "CrewAI": [r"crewai", r"crew-ai"],
    "AutoGen": [r"autogen"],
    "DSPy": [r"dspy"],
    "vLLM": [r"vllm"],
    "Ollama": [r"ollama"],
    "Prompt Engineering": [r"prompt engineering", r"few-shot prompt"],
    "Fine-Tuning": [r"fine-tuning", r"finetuning", r"peft", r"lora", r"qlora"],
    "RLHF": [r"rlhf", r"dpo"],

    # --- LLM APIs & Providers ---
    "OpenAI API": [r"openai(?:\s*api)?", r"gpt-?4o?", r"chatgpt"],
    "Gemini API": [r"gemini(?:\s*api)?", r"google gemini"],
    "Claude / Anthropic": [r"anthropic", r"claude(?:\s*3)?"],
    "Groq": [r"\bgroq\b"],
    "Mistral AI": [r"mistral(?:\s*ai)?"],
    "Cohere": [r"cohere"],

    # --- Vector Databases ---
    "Pinecone": [r"pinecone"],
    "ChromaDB": [r"chromadb", r"chroma"],
    "Weaviate": [r"weaviate"],
    "Qdrant": [r"qdrant"],
    "Milvus": [r"milvus"],
    "FAISS": [r"faiss"],

    # --- Programming Languages ---
    "Java": [r"\bjava\b"],
    "C++": [r"c\+\+", r"cpp"],
    "C#": [r"c#", r"csharp", r"\.net"],
    "C": [r"(?<![a-zA-Z0-9_#+])c(?![+#a-zA-Z0-9_])"],
    "Go": [r"\bgolang\b", r"\bgo\s+lang\b", r"(?<!\w)go(?!\w)(?=\s*(?:,|/|and|\n|\r|developer|engineer|backend|cloud))"],
    "Rust": [r"\brust\b"],
    "TypeScript": [r"typescript", r"\bts\b"],
    "JavaScript": [r"javascript", r"\bjs\b"],
    "Kotlin": [r"kotlin"],
    "Swift": [r"\bswift\b"],
    "Scala": [r"scala"],
    "Ruby": [r"ruby", r"rails"],
    "PHP": [r"php", r"laravel"],
    "R": [r"\br\s+lang(?:uage)?\b", r"\br\s+programming\b", r"(?<![a-zA-Z0-9_#+])r(?![+#a-zA-Z0-9_])(?=\s*(?:,|/|and|\n|\r)\s*(?:python|sql|julia|sas|spss|matlab|stata))"],
    "SQL": [r"\bsql\b"],
    "Bash / Shell": [r"bash", r"shell script"],

    # --- Backend & APIs ---
    "FastAPI": [r"fastapi"],
    "Flask": [r"flask"],
    "Django": [r"django"],
    "Node.js": [r"node(?:\.js)?", r"nodejs"],
    "Express": [r"express(?:\.js)?"],
    "NestJS": [r"nestjs"],
    "Spring Boot": [r"spring boot", r"spring framework"],
    "GraphQL": [r"graphql"],
    "REST APIs": [r"rest(?:ful)?\s*apis?", r"rest\s*web services?"],
    "Microservices": [r"microservices?", r"service-oriented"],
    "gRPC": [r"grpc"],
    "WebSockets": [r"websockets?"],
    "Celery": [r"celery"],

    # --- Databases & Stores ---
    "PostgreSQL": [r"postgres(?:ql)?"],
    "MySQL": [r"mysql"],
    "MongoDB Atlas": [r"mongodb(?:\s*atlas)?", r"\bmongo\b"],
    "Redis": [r"redis"],
    "Cassandra": [r"cassandra"],
    "DynamoDB": [r"dynamodb"],
    "SQLite": [r"sqlite"],
    "Elasticsearch": [r"elastic(?:\s*search)?"],
    "Neo4j": [r"neo4j"],
    "Snowflake": [r"snowflake"],
    "BigQuery": [r"bigquery"],

    # --- Cloud & DevOps ---
    "Docker": [r"docker", r"containerization"],
    "Kubernetes": [r"kubernetes", r"\bk8s\b"],
    "AWS": [r"\baws\b", r"amazon web services", r"ec2", r"s3", r"lambda"],
    "GCP": [r"\bgcp\b", r"google cloud(?: platform)?"],
    "Azure": [r"\bazure\b", r"microsoft azure"],
    "Terraform": [r"terraform"],
    "Ansible": [r"ansible"],
    "Git": [r"\bgit\b", r"github", r"gitlab"],
    "GitHub Actions": [r"github actions?"],
    "CI/CD": [r"ci[\s/-]?cd", r"continuous integration"],
    "Jenkins": [r"jenkins"],
    "Linux": [r"linux", r"ubuntu"],
    "MLOps": [r"mlops", r"machine learning operations", r"kubeflow", r"mlflow"],

    # --- Frontend & Mobile ---
    "React": [r"react(?:\.js|js)?(?!\s+native)"],
    "Next.js": [r"next(?:\.js|js)?"],
    "Vue": [r"vue(?:\.js|js)?"],
    "Angular": [r"angular(?:\.js|js)?"],
    "Svelte": [r"svelte"],
    "Tailwind CSS": [r"tailwind(?:\s*css)?"],
    "HTML / CSS": [r"html5?", r"css3?"],
    "Redux": [r"redux"],
    "React Native": [r"react native"],
    "Flutter": [r"flutter"],
    "Android": [r"android(?:\s*sdk)?"],
    "iOS": [r"ios(?:\s*sdk)?"],

    # --- Big Data & Streaming ---
    "Apache Spark": [r"spark", r"pyspark", r"apache spark"],
    "Kafka": [r"kafka", r"apache kafka"],
    "Hadoop": [r"hadoop"],
    "Airflow": [r"airflow", r"apache airflow"],
    "RabbitMQ": [r"rabbitmq"],

    # --- Testing & Quality ---
    "Pytest": [r"pytest"],
    "JUnit": [r"junit"],
    "Jest": [r"jest"],
    "Cypress": [r"cypress"],
    "Selenium": [r"selenium"]
}

# Pre-compile regex patterns for performance and exact token boundary security
COMPILED_SKILLS: List[Tuple] = []
for canonical_name, aliases in CANONICAL_SKILLS_MAP.items():
    compiled_patterns = []
    for alias in aliases:
        if alias.startswith(r"\b") or alias.endswith(r"\b") or "(?<" in alias or "(?!" in alias:
            pattern_str = alias
        elif any(sym in alias for sym in [r"\+", "#", r"\."]):
            pattern_str = r'(?:^|[^\w])' + alias + r'(?:$|[^\w])'
        else:
            pattern_str = r'\b' + alias + r'\b'

        try:
            compiled_patterns.append(re.compile(pattern_str, re.IGNORECASE))
        except Exception:
            pass
    COMPILED_SKILLS.append((canonical_name, compiled_patterns))


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts canonical skill names from any job description, requirements or profile text.
    Uses strict regex token boundaries to avoid false positives (e.g. 'c' in 'cloud', 'r' in 'transformers').
    """
    if not text:
        return []

    found_skills = []
    seen = set()

    for canonical_name, patterns in COMPILED_SKILLS:
        for p in patterns:
            if p.search(text):
                if canonical_name not in seen:
                    seen.add(canonical_name)
                    found_skills.append(canonical_name)
                break

    return found_skills


def normalize_skill_name(raw_skill: str) -> str:
    """
    Maps user-entered skill strings to canonical names if recognized.
    e.g. 'openai' -> 'OpenAI API', 'fastapi' -> 'FastAPI', 'ts' -> 'TypeScript'
    """
    s = str(raw_skill or "").strip()
    if not s:
        return ""

    s_lower = s.lower()
    for canonical_name, patterns in COMPILED_SKILLS:
        for p in patterns:
            if p.search(s_lower) or s_lower == canonical_name.lower():
                return canonical_name

    # Return trimmed original capitalization if not in taxonomy
    return s


PARENT_SKILL_IMPLICATIONS: Dict[str, Set[str]] = {
    "Data Science": {"python", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "sql", "r"},
    "Machine Learning": {"python", "tensorflow", "pytorch", "keras", "scikit-learn", "xgboost", "lightgbm", "jax"},
    "Deep Learning": {"tensorflow", "pytorch", "keras", "jax", "transformers"},
    "Data Engineering": {"python", "sql", "spark", "kafka", "hadoop", "airflow", "postgresql", "mysql", "mongodb"},
    "NLP": {"transformers", "spacy", "nltk", "langchain", "rag", "hugging face", "llm"},
    "Computer Vision": {"opencv", "pytorch", "tensorflow", "yolo", "diffusion"},
    "REST APIs": {"fastapi", "flask", "django", "express", "spring boot", "nodejs", "nestjs"},
    "Microservices": {"docker", "kubernetes", "fastapi", "express", "spring boot", "grpc"},
}

def compute_skill_alignment(
    job_text: str,
    candidate_skills: List[str],
    existing_job_skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Computes true two-way skill alignment between a job and a candidate.
    
    CRITICAL CORRECTION:
    - matched: Candidate skills that the job requires/mentions (Intersection)
    - missing: Skills the JOB asks for that the candidate lacks (True Skill Gaps)
    - extras: Candidate skills that exceed the job requirements (Bonus competencies)
    
    A candidate's unused skill is NEVER labeled as a 'missing skill' or 'skill gap'!
    """
    # 1. Normalize candidate skills
    normalized_cand = []
    cand_seen = set()
    for cs in candidate_skills or []:
        norm = normalize_skill_name(cs)
        if norm and norm.lower() not in cand_seen:
            cand_seen.add(norm.lower())
            normalized_cand.append(norm)

    # 2. Extract technical skills required/mentioned by the job
    extracted_from_text = extract_skills_from_text(job_text)
    
    job_skills_set = set()
    canonical_job_skills = []

    # Include explicit job requirements if passed
    for s in (existing_job_skills or []) + extracted_from_text:
        norm = normalize_skill_name(s)
        if norm and norm.lower() not in job_skills_set:
            job_skills_set.add(norm.lower())
            canonical_job_skills.append(norm)

    # 3. Calculate True Matched Skills (Candidate ∩ Job)
    matched = []
    for cs in normalized_cand:
        if cs.lower() in job_skills_set:
            matched.append(cs)

    # 4. Calculate True Missing Skills / Skill Gaps (Job - Candidate)
    missing = []
    for js in canonical_job_skills:
        js_lower = js.lower()
        if js_lower in cand_seen:
            continue
        # Check domain implication (e.g. candidate with TensorFlow & Python fulfills Data Science)
        implications = PARENT_SKILL_IMPLICATIONS.get(js, set())
        if implications and any(impl in cand_seen for impl in implications):
            if js not in matched:
                matched.append(js)
            continue
        missing.append(js)

    # 5. Calculate Candidate Extras / Superpowers (Candidate - Job)
    extras = []
    job_skills_matched_lower = {s.lower() for s in matched}
    for cs in normalized_cand:
        if cs.lower() not in job_skills_set and cs.lower() not in job_skills_matched_lower:
            extras.append(cs)

    # 6. Calculate realistic Skill Fit Coverage %
    if canonical_job_skills:
        coverage_pct = int(round((len(matched) / len(canonical_job_skills)) * 100))
    elif normalized_cand:
        # If job text was too sparse to specify tech stack (e.g. summary snippet),
        # don't penalize candidate - check role/domain alignment
        coverage_pct = 75 if matched else 50
    else:
        coverage_pct = 50

    return {
        "job_skills": canonical_job_skills,
        "candidate_skills": normalized_cand,
        "matched": matched,
        "missing": missing,
        "extras": extras,
        "coverage_pct": min(100, max(0, coverage_pct))
    }
