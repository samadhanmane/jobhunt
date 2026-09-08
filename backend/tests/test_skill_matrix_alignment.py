import sys
import os
import asyncio

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from src.utils.skill_helper import (
    extract_skills_from_text,
    compute_skill_alignment,
    normalize_skill_name
)
from src.agents.ranking import RankingAgent

def test_token_boundary_accuracy():
    print("Testing token boundary accuracy (C, R, Go, C++, etc.)...")
    # Should match C++, Python, SQL, but NOT standalone C, R, or Go
    text = "We are seeking a C++ developer with Python and SQL experience in cloud computing and algorithms."
    skills = extract_skills_from_text(text)
    
    assert "C++" in skills
    assert "Python" in skills
    assert "SQL" in skills
    assert "C" not in skills, "Failed: 'c' in 'cloud' was falsely matched as C language"
    assert "Go" not in skills, "Failed: 'go' in 'algorithms' was falsely matched as Go language"
    print("  PASS: Token boundary accuracy verified with zero false positives")

def test_user_exact_skill_alignment():
    print("Testing user exact 20-skill alignment scenario...")
    cand_skills = [
        "Python", "TensorFlow", "LangChain", "OpenAI API", "Gemini API",
        "Groq", "Mistral AI", "Transformers", "RAG", "Agentic AI",
        "Pinecone", "ChromaDB", "MongoDB Atlas", "Keras", "FastAPI",
        "Docker", "AWS", "React", "TypeScript", "SQL"
    ]
    
    # 1. Sparse job like Novartis India with only Python & TensorFlow mentioned
    novartis_text = (
        "AI and Data Science Engineering Intern at Novartis India. "
        "Details: AI and Data Science Engineering Intern | Python | TensorFlow | "
        "Work from Office | Full Time | Freshers only | Internship"
    )
    alignment = compute_skill_alignment(novartis_text, cand_skills)
    
    assert "Python" in alignment["matched"]
    assert "TensorFlow" in alignment["matched"]
    assert len(alignment["matched"]) >= 2
    
    # CRITICAL INVARIANT: The other 18 skills must NOT be listed in missing / gaps!
    assert len(alignment["missing"]) == 0, f"Expected 0 skill gaps, got {alignment['missing']}"
    assert "LangChain" not in alignment["missing"]
    assert "OpenAI API" not in alignment["missing"]
    assert "React" not in alignment["missing"]
    assert "SQL" not in alignment["missing"]
    
    # They should be properly recognized in extras
    assert "LangChain" in alignment["extras"]
    assert "Docker" in alignment["extras"]
    assert "React" in alignment["extras"]
    print("  PASS: Novartis India job produced 0 false gaps and accurately populated extras")

def test_true_skill_gaps_detection():
    print("Testing true skill gaps detection...")
    cand_skills = ["Python", "TensorFlow", "React"]
    
    # Job requires C++, Kubernetes, AWS, and Python
    job_text = "Requires strong proficiency in C++, Kubernetes, AWS cloud, and Python."
    alignment = compute_skill_alignment(job_text, cand_skills)
    
    assert "Python" in alignment["matched"]
    # Candidate lacks C++, Kubernetes, AWS -> these are TRUE gaps
    assert "C++" in alignment["missing"]
    assert "Kubernetes" in alignment["missing"]
    assert "AWS" in alignment["missing"]
    
    # Candidate has extra React -> not required by job
    assert "React" in alignment["extras"]
    assert "React" not in alignment["missing"]
    print("  PASS: True skill gaps and candidate extras accurately partitioned")

def test_ranking_agent_alignment():
    print("Testing RankingAgent end-to-end scoring and skill payload...")
    agent = RankingAgent()
    candidate = {
        "skills": ["Python", "TensorFlow", "LangChain", "Docker", "FastAPI"],
        "seniority": "Intern",
        "experience_years": 0.0,
        "target_roles": ["AI Intern"]
    }
    preferences = {
        "role": "AI Intern",
        "location": "Worldwide",
        "remote_preference": "any"
    }
    
    job = {
        "title": "AI Intern",
        "company": "TechCo",
        "location": "Remote",
        "description": "Looking for an AI Intern with Python and LangChain experience. Kubernetes is a plus.",
        "url": "https://example.com/ai-intern",
        "posted_date": "2026-09-08"
    }
    
    ranked = asyncio.run(agent.rank_jobs([job], candidate, preferences))[0]
    
    assert "Python" in ranked["matching_skills"]
    assert "LangChain" in ranked["matching_skills"]
    assert "Kubernetes" in ranked["missing_skills"]
    assert "Docker" not in ranked["missing_skills"]
    assert "Docker" in ranked["supported_skills"]
    assert "TensorFlow" in ranked["supported_skills"]
    assert ranked["skill_coverage_pct"] >= 60
    assert ranked["match_score"] >= 70
    print("  PASS: RankingAgent properly formats matching_skills, missing_skills, and supported_skills")

if __name__ == "__main__":
    test_token_boundary_accuracy()
    test_user_exact_skill_alignment()
    test_true_skill_gaps_detection()
    test_ranking_agent_alignment()
    print("\nALL SKILL MATRIX ALIGNMENT TESTS PASSED!")
