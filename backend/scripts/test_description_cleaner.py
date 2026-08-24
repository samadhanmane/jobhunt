import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.text_cleaner import clean_html_job_description

raw_user_html = """<a href="https://himalayas.app/companies/bright-vision-technologies">Bright Vision Technologies</a> is a technology consulting and software development company delivering cloud, AI, data, and enterprise solutions across the United States.<br><br>This is a fantastic opportunity to join an established and well-respected organization offering tremendous career growth potential.<br><br><b>Job Title:</b> Machine Learning Engineer – RL<br><b>Location:</b> 100% Remote (U.S.)<br><b>Position Type:</b> Full-time, Direct W2<br><b>Salary Range:</b> $155,000–$180,000 Annually<br><b>Experience Required:</b> 6+ years<br><br><b>Sponsorship:</b> U.S. Citizens, Green Card Holders, EAD Holders, and H-1B transfer candidates are encouraged to apply. We are unable to sponsor new H-1B visa petitions for this position.<br><br><b>Job Summary:</b><br>We are looking for a Machine Learning Engineer - RL to design, train, and deploy RL-based systems for high-impact decision-making problems where supervised learning alone is insufficient.<br><br><b>Required Qualifications</b><ul>
<li>Master’s or PhD in Computer Science, Machine Learning, or a related field; or equivalent applied experience.</li>
<li>Six or more years of combined RL research and engineering experience.</li>
<li>Strong proficiency in Python and modern deep learning frameworks.</li>
<li>Hands-on experience with at least one major RL library or in-house RL stack.</li>
</ul><br><b>Preferred Qualifications</b><ul>
<li>Experience with RLHF for large language models.</li>
<li>Familiarity with multi-agent RL or hierarchical RL.</li>
</ul><br><b>How to Apply</b><br><br>For immediate consideration, please send your resume to or contact us at (908)676-4399.<p>Originally posted on <a href="https://himalayas.app">Himalayas</a></p>"""

def test_cleaner():
    cleaned = clean_html_job_description(raw_user_html)
    print("\n--- CLEANED DESCRIPTION OUTPUT ---")
    print(cleaned)
    print("----------------------------------\n")

    # Assertions
    assert "<a href=" not in cleaned
    assert "<br>" not in cleaned
    assert "<b>" not in cleaned
    assert "<ul>" not in cleaned
    assert "<li>" not in cleaned
    assert "• Master’s or PhD in Computer Science" in cleaned or "• Master's or PhD in Computer Science" in cleaned
    assert "Job Title: Machine Learning Engineer – RL" in cleaned
    assert "Salary Range: $155,000–$180,000 Annually" in cleaned
    print("[PASSED] HTML Job Description Sanitization & Markdown Formatting Test Passed!")

if __name__ == "__main__":
    test_cleaner()
