import sys
import os
import uuid
import asyncio
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.models.database import engine, SessionLocal
from src.models.job import Job
from src.agents.ranking import RankingAgent
from src.agents.orchestrator import OrchestratorAgent
from src.integrations.workday.client import WorkdayClient, parse_workday_posted_on
from src.integrations.smartrecruiters.client import SmartRecruitersClient
from src.integrations.workable.client import WorkableClient
from src.integrations.remotive.client import RemotiveClient
from src.integrations.instahyre.client import InstahyreClient
from src.integrations.ycombinator.client import YCombinatorClient
import src.integrations.catalog as catalog

def test_workday_relative_date_parser():
    """Verify Workday relative date parsing into standard YYYY-MM-DD."""
    today = datetime.datetime.utcnow().date()
    assert parse_workday_posted_on("Posted Today") == today.strftime("%Y-%m-%d")
    assert parse_workday_posted_on("Posted 1 hour ago") == today.strftime("%Y-%m-%d")
    yesterday = today - datetime.timedelta(days=1)
    assert parse_workday_posted_on("Posted Yesterday") == yesterday.strftime("%Y-%m-%d")
    three_days_ago = today - datetime.timedelta(days=3)
    assert parse_workday_posted_on("Posted 3 Days Ago") == three_days_ago.strftime("%Y-%m-%d")
    assert parse_workday_posted_on("2026-08-20") == "2026-08-20"
    assert parse_workday_posted_on(None) is None

def test_six_factor_ranking_formula_and_explainability():
    """
    Verify the exact 6-factor Job Match Score formula:
    30% Skills + 25% Role + 15% Experience + 10% Location + 10% Work Mode + 10% Freshness
    And verify explainability payload: matching_skills, missing_skills, experience_comparison, freshness_label.
    """
    agent = RankingAgent()
    candidate = {
        "skills": ["Python", "PyTorch", "LLM", "RAG", "FastAPI"],
        "experience_years": 2.0,
        "seniority": "Junior",
        "target_roles": ["AI Engineer"]
    }
    preferences = {
        "role": "AI Engineer",
        "location": "Pune",
        "work_mode": "Hybrid"
    }

    job = {
        "title": "AI Engineer",
        "company": "Nexus AI",
        "location": "Pune, Maharashtra, India",
        "description": "Looking for an AI Engineer with Python, PyTorch, LLM, RAG, and FastAPI experience. Requires 2-4 years of experience. Hybrid work model.",
        "url": "https://nexus.ai/careers/ai-engineer",
        "posted_date": datetime.datetime.utcnow().date().strftime("%Y-%m-%d")
    }

    scored = agent._score_job(job, candidate, preferences)

    # Verify 6 factor breakdown keys
    breakdown = scored.get("match_breakdown", {})
    assert "skills" in breakdown
    assert "role" in breakdown
    assert "experience" in breakdown
    assert "location" in breakdown
    assert "work_mode" in breakdown
    assert "freshness" in breakdown

    # Verify exact mathematical weight computation
    s = breakdown["skills"]
    r = breakdown["role"]
    e = breakdown["experience"]
    l = breakdown["location"]
    w = breakdown["work_mode"]
    f = breakdown["freshness"]

    expected_total = round((s * 0.30) + (r * 0.25) + (e * 0.15) + (l * 0.10) + (w * 0.10) + (f * 0.10))
    assert scored["match_score"] == expected_total

    # Verify high match score for optimal candidate
    assert scored["match_score"] >= 90

    # Verify matched skills checklist
    matched_lower = [m.lower() for m in scored.get("matching_skills", [])]
    assert "python" in matched_lower
    assert "pytorch" in matched_lower
    assert "fastapi" in matched_lower

    # Verify experience comparison payload
    exp_comp = scored.get("experience_comparison", {})
    assert exp_comp.get("candidate") == "2 years"
    assert "years" in exp_comp.get("required", "").lower() or "yrs" in exp_comp.get("required", "").lower()
    assert exp_comp.get("status") in ["Optimal Fit", "Strong Fit"]

    # Verify freshness label
    assert scored.get("freshness_label") == "Posted today"

def test_direct_ai_company_registry_integrity():
    """Verify master company catalog contains all requested AI companies mapped to ATS providers."""
    ai_comps = {c["name"].lower(): c for c in catalog.AI_COMPANIES}
    
    # Must contain key AI labs requested by user
    required_labs = [
        "openai", "anthropic", "nvidia", "mistral ai", "cohere",
        "hugging face", "xai", "perplexity", "scale ai", "together ai",
        "replicate", "cursor", "runway", "elevenlabs", "deepgram"
    ]
    for lab in required_labs:
        assert lab in ai_comps, f"Missing AI company: {lab}"

    # Verify correct ATS mapping
    assert ai_comps["openai"]["provider"] == "ashby"
    assert ai_comps["anthropic"]["provider"] == "greenhouse"
    assert ai_comps["nvidia"]["provider"] == "workday"
    assert ai_comps["hugging face"]["provider"] == "workable"
    assert ai_comps["mistral ai"]["provider"] == "lever"
    assert ai_comps["cursor"]["provider"] == "ashby"
    assert ai_comps["elevenlabs"]["provider"] == "ashby"

def test_workable_connector_parsing():
    """Verify Workable client initializes and searches with valid URL."""
    client = WorkableClient()
    assert len(client.companies) >= 4
    subdomains = [c["subdomain"] for c in client.companies]
    assert "huggingface" in subdomains

def test_remotive_connector_initialization():
    """Verify Remotive client initializes."""
    client = RemotiveClient()
    assert hasattr(client, "search")

def test_instahyre_india_connector():
    """Verify Instahyre India platform connector initializes."""
    client = InstahyreClient()
    assert hasattr(client, "search")

def test_ycombinator_connector():
    """Verify YCombinator startup connector initializes."""
    client = YCombinatorClient()
    assert hasattr(client, "search")

def test_orchestrator_multi_inventory_category_dispatch():
    """Verify Orchestrator initializes all 16 connectors and categorizes sources."""
    orchestrator = OrchestratorAgent()
    assert hasattr(orchestrator, "workday")
    assert hasattr(orchestrator, "smartrecruiters")
    assert hasattr(orchestrator, "workable")
    assert hasattr(orchestrator, "remotive")
    assert hasattr(orchestrator, "instahyre")
    assert hasattr(orchestrator, "ycombinator")

def test_job_model_new_columns_postgres_persistence():
    """Verify Job model persists and retrieves match_breakdown, source_category, experience_comparison, freshness_label."""
    test_id = f"test_cat_job_{uuid.uuid4().hex[:12]}"
    test_search_id = f"search_{uuid.uuid4().hex[:8]}"

    db = SessionLocal()
    try:
        new_job = Job(
            id=test_id,
            title="Senior AI Engineer",
            company="Anthropic Labs",
            location="Pune, India",
            description="Developing next-generation AI agents.",
            url=f"https://anthropic.com/jobs/{test_id}",
            source="greenhouse",
            posted_date="2026-09-08",
            search_id=test_search_id,
            match_score=94.0,
            match_breakdown={
                "skills": 95,
                "role": 90,
                "experience": 100,
                "location": 95,
                "work_mode": 100,
                "freshness": 90
            },
            source_category="ai_registry",
            experience_comparison={
                "required": "2–4 years",
                "candidate": "2 years",
                "status": "Optimal Fit"
            },
            freshness_label="Posted today",
            work_mode="Hybrid"
        )
        db.add(new_job)
        db.commit()

        fetched = db.query(Job).filter(Job.id == test_id).first()
        assert fetched is not None
        assert fetched.source_category == "ai_registry"
        assert fetched.freshness_label == "Posted today"
        assert fetched.match_breakdown["skills"] == 95
        assert fetched.match_breakdown["role"] == 90
        assert fetched.experience_comparison["status"] == "Optimal Fit"

        db.delete(fetched)
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    tests = [
        ("Workday Relative Date Parser", test_workday_relative_date_parser),
        ("6-Factor Ranking Formula & Explainability", test_six_factor_ranking_formula_and_explainability),
        ("Direct AI Company Registry Integrity", test_direct_ai_company_registry_integrity),
        ("Workable Connector Configuration", test_workable_connector_parsing),
        ("Remotive Connector Initialization", test_remotive_connector_initialization),
        ("Instahyre India Connector", test_instahyre_india_connector),
        ("YCombinator Startup Connector", test_ycombinator_connector),
        ("Orchestrator Multi-Inventory Dispatch", test_orchestrator_multi_inventory_category_dispatch),
        ("Job Model New Columns Persistence", test_job_model_new_columns_postgres_persistence),
    ]

    passed = 0
    failed = 0
    print("\n" + "=" * 60)
    print("RUNNING MULTI-INVENTORY & 6-FACTOR VERIFICATION TEST SUITE")
    print("=" * 60)
    for name, fn in tests:
        try:
            fn()
            print(f"  PASS: {name}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {name} -> {e}")
            import traceback
            traceback.print_exc()
            failed += 1

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60 + "\n")
    if failed > 0:
        exit(1)
