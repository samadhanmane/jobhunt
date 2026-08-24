import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.agents.ranking import RankingAgent

def test_experience_filtering():
    ranker = RankingAgent()

    # Candidate 1: Intern / Fresher with 0 years experience
    intern_profile = {
        "skills": ["Python", "TensorFlow", "Machine Learning", "PyTorch"],
        "experience_years": 0.0,
        "seniority": "Junior",
        "target_roles": ["AI Engineer", "Machine Learning Engineer"]
    }
    intern_pref = {"role": "AI Engineer", "experience_years": 0}

    # Job A: Senior job requiring 6+ years experience in the description
    job_senior = {
        "title": "Machine Learning Engineer",
        "company": "Bright Vision Technologies",
        "location": "Remote",
        "description": "We are seeking a Machine Learning Engineer to deploy RL systems. Requires 6+ years of hands-on experience with Python and deep learning frameworks."
    }

    # Job B: Explicit Internship job
    job_intern = {
        "title": "AI / Machine Learning Intern",
        "company": "Tech Innovations",
        "location": "Remote",
        "description": "Looking for an energetic AI Intern. Strong Python and TensorFlow fundamentals. 0-1 years experience."
    }

    # Score both for the intern candidate
    res_senior = ranker._fast_heuristics_score(job_senior, intern_profile, intern_pref)
    res_intern = ranker._fast_heuristics_score(job_intern, intern_profile, intern_pref)

    print("\n--- TEST: Intern Candidate (0 Years) ---")
    print(f"Job A (Requires 6+ years): Match Score = {res_senior['match_score']}%, Experience Fit = '{res_senior['experience_fit']}'")
    print(f"Job B (Internship):        Match Score = {res_intern['match_score']}%, Experience Fit = '{res_intern['experience_fit']}'")

    assert res_senior["match_score"] <= 35.0, f"Senior job score should be capped <= 35%, got {res_senior['match_score']}"
    assert "Senior" in res_senior["experience_fit"], f"Expected 'Senior' in fit, got {res_senior['experience_fit']}"
    assert res_intern["match_score"] >= 80.0, f"Intern job score should be >= 80%, got {res_intern['match_score']}"
    assert "Internship" in res_intern["experience_fit"], f"Expected 'Internship' in fit, got {res_intern['experience_fit']}"
    print("[PASSED] Intern experience heuristics verified!")

    # Candidate 2: Senior Engineer with 7 years experience
    senior_profile = {
        "skills": ["Python", "TensorFlow", "Machine Learning", "PyTorch"],
        "experience_years": 7.0,
        "seniority": "Senior",
        "target_roles": ["AI Engineer", "Machine Learning Engineer"]
    }
    senior_pref = {"role": "AI Engineer", "experience_years": 7}

    res_senior_for_sr = ranker._fast_heuristics_score(job_senior, senior_profile, senior_pref)
    res_intern_for_sr = ranker._fast_heuristics_score(job_intern, senior_profile, senior_pref)

    print("\n--- TEST: Senior Candidate (7 Years) ---")
    print(f"Job A (Requires 6+ years): Match Score = {res_senior_for_sr['match_score']}%, Experience Fit = '{res_senior_for_sr['experience_fit']}'")
    print(f"Job B (Internship):        Match Score = {res_intern_for_sr['match_score']}%, Experience Fit = '{res_intern_for_sr['experience_fit']}'")

    assert res_senior_for_sr["match_score"] >= 80.0, f"Senior job score should be >= 80%, got {res_senior_for_sr['match_score']}"
    assert "Senior" in res_senior_for_sr["experience_fit"]
    assert res_intern_for_sr["match_score"] <= 35.0, f"Intern job score for senior should be <= 35%, got {res_intern_for_sr['match_score']}"
    print("[PASSED] Senior experience heuristics verified!")

if __name__ == "__main__":
    test_experience_filtering()
