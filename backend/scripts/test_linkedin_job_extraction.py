import asyncio
import sys
import os
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.scraper_service import ScraperService

linkedin_mock_html = """
<!DOCTYPE html>
<html>
<head>
    <title>Senior Software Engineer - Google | LinkedIn</title>
</head>
<body>
    <div class="top-card-layout__entity-info">
        <h1 class="top-card-layout__title text-heading-large">Senior Software Engineer, Core ML</h1>
        <a class="topcard__org-name-link topcard__flavor--black-link" href="https://linkedin.com/company/google">Google</a>
        <span class="topcard__flavor topcard__flavor--bullet">Mountain View, CA (Hybrid)</span>
    </div>

    <div class="decorated-job-posting__details">
        <section class="description">
            <h2 class="text-heading-large">About the job</h2>
            <div class="show-more-less-html__markup show-more-less-html__markup--clamp-after-5">
                Google is looking for a Senior Software Engineer to build next-generation ML infrastructure.<br><br>
                <b>Responsibilities:</b>
                <ul>
                    <li>Architect and build scalable distributed systems for LLM training.</li>
                    <li>Collaborate with cross-functional research and infrastructure teams.</li>
                    <li>Optimize low-level GPU and TPU performance across clusters.</li>
                </ul>
                <br>
                <b>Minimum Qualifications:</b>
                <ul>
                    <li>Bachelor's degree in Computer Science or related technical field.</li>
                    <li>5+ years of software engineering experience in C++ and Python.</li>
                </ul>
            </div>
            <ul class="description__job-criteria-list">
                <li class="description__job-criteria-item">
                    <h3 class="description__job-criteria-subheader">Seniority level</h3>
                    <span class="description__job-criteria-text description__job-criteria-text--criteria">Mid-Senior level</span>
                </li>
                <li class="description__job-criteria-item">
                    <h3 class="description__job-criteria-subheader">Employment type</h3>
                    <span class="description__job-criteria-text description__job-criteria-text--criteria">Full-time</span>
                </li>
                <li class="description__job-criteria-item">
                    <h3 class="description__job-criteria-subheader">Job function</h3>
                    <span class="description__job-criteria-text description__job-criteria-text--criteria">Engineering and Information Technology</span>
                </li>
            </ul>
        </section>
    </div>
</body>
</html>
"""

def test_linkedin_dom_extraction():
    scraper = ScraperService()
    soup = BeautifulSoup(linkedin_mock_html, "html.parser")
    dom_data = scraper._clean_dom_and_extract_text(soup)

    print("\n--- EXTRACTED LINKEDIN ABOUT THE JOB TEXT ---")
    print(dom_data["clean_text"])
    print("--------------------------------------------\n")

    assert "Google is looking for a Senior Software Engineer" in dom_data["clean_text"]
    assert "• Architect and build scalable distributed systems for LLM training." in dom_data["clean_text"]
    assert "### Job Criteria" in dom_data["clean_text"]
    assert "• Seniority level: Mid-Senior level" in dom_data["clean_text"]
    assert "• Employment type: Full-time" in dom_data["clean_text"]
    assert "<br>" not in dom_data["clean_text"]
    assert "<div" not in dom_data["clean_text"]
    assert "<li" not in dom_data["clean_text"]

    print("[SUCCESS] LinkedIn 'About the job' Section & Job Criteria extraction verified!")

if __name__ == "__main__":
    test_linkedin_dom_extraction()
