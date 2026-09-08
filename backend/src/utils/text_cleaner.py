import re
import html
from bs4 import BeautifulSoup

def clean_html_job_description(raw_html: str) -> str:
    """
    Transforms messy HTML job descriptions (with <br>, <b>, <ul>, <li>, <p>, <a> tags)
    into clean, beautifully structured human-readable text with bullet points and paragraphs.
    """
    if not raw_html:
        return ""
    if not isinstance(raw_html, str):
        return str(raw_html)

    # Check if string contains HTML tags
    if "<" not in raw_html and ">" not in raw_html:
        return raw_html.strip()

    text = raw_html
    
    # Strip dangerous/irrelevant elements
    text = re.sub(r'<(script|style|svg|iframe|head|meta|noscript)[^>]*>.*?</\1>', '', text, flags=re.DOTALL | re.IGNORECASE)

    # Preserve line breaks for block elements
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<li[^>]*>', '\n• ', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'<(h1|h2|h3|h4|h5|h6)[^>]*>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(h1|h2|h3|h4|h5|h6)>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</(p|div|ul|ol|table|tr|section|article|header|footer)>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<(p|div|ul|ol|table|tr|section|article)[^>]*>', '\n', text, flags=re.IGNORECASE)

    # Parse with BeautifulSoup to strip all remaining markup
    soup = BeautifulSoup(text, "html.parser")
    cleaned = soup.get_text(separator=' ')

    # Unescape HTML entities (&amp;, &nbsp;, &#39;, &rsquo;, etc.)
    cleaned = html.unescape(cleaned)
    # Remove non-breaking space characters
    cleaned = cleaned.replace('\xa0', ' ').replace('&nbsp;', ' ')

    # Normalize whitespace per line and collapse duplicate blank lines
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in cleaned.split('\n')]
    
    result = []
    prev_blank = False
    for line in lines:
        if not line:
            if not prev_blank:
                result.append('')
                prev_blank = True
        else:
            result.append(line)
            prev_blank = False

    return '\n'.join(result).strip()

def extract_job_experience_metadata(title: str, description: str, experience_fit: str = "") -> dict:
    """
    Extracts the exact required experience string, numeric minimum years, and seniority level.
    """
    title_l = (title or "").lower().strip()
    desc_l = (description or "").lower()
    fit_l = (experience_fit or "").lower()

    # 1. Direct Title & Role Classification (Highest Accuracy)
    if any(w in title_l for w in ["intern", "internship", "trainee", "apprentice", "student", "co-op"]) or "intern" in fit_l:
        return {"experience_required": "🌱 Internship (0 Yrs)", "min_experience_years": 0, "seniority_level": "intern"}

    if any(w in title_l for w in ["senior", "sr.", "sr ", "lead", "staff", "principal", "architect", "director", "head of", "vp "]) or "senior" in fit_l or "lead" in fit_l:
        is_lead = any(w in title_l for w in ["lead", "principal", "staff", "architect", "director", "head of"])
        min_y = 8 if is_lead else 5
        label = "🏆 8+ Yrs (Lead / Principal)" if is_lead else "👑 5+ Yrs (Senior)"
        return {"experience_required": label, "min_experience_years": min_y, "seniority_level": "lead" if is_lead else "senior"}

    if any(w in title_l for w in ["entry level", "fresher", "new grad", "graduate", "junior", "jr.", "associate 1"]) or "entry" in fit_l:
        return {"experience_required": "🚀 0–1 Yr (Entry Level)", "min_experience_years": 1, "seniority_level": "entry"}

    # 2. Targeted Requirement Pattern Extraction from Description
    req_patterns = [
        r'(?:require[sd]?|requirement[s]?|qualification[s]?|experience|minimum|at\s+least|with)\s*(?:of)?\s*(\d+)(?:\s*(?:to|-)\s*(\d+))?\s*\+?\s*(?:years?|yrs?)\b',
        r'(\d+)\s*\+\s*(?:years?|yrs?)\s*(?:of)?\s*(?:relevant|hands-on|industry|work)?\s*experience\b',
        r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*(?:relevant|hands-on|industry|work)?\s*experience\b'
    ]

    found_min_years = []
    for pat in req_patterns:
        matches = re.findall(pat, desc_l)
        for m in matches:
            if isinstance(m, tuple):
                val_str = m[0]
            else:
                val_str = m
            try:
                val = int(val_str)
                if 0 <= val <= 20:
                    found_min_years.append(val)
            except Exception:
                pass

    if found_min_years:
        # If a core overall requirement (>= 3 years) is found, do not let secondary 1-2 yr tool mentions downgrade it
        higher_years = [y for y in found_min_years if y >= 3]
        if higher_years:
            min_y = min(higher_years)
        else:
            min_y = min(found_min_years)

        if min_y == 0:
            return {"experience_required": "🌱 0 Yrs (Fresher / Intern)", "min_experience_years": 0, "seniority_level": "intern"}
        elif min_y == 1:
            return {"experience_required": "🚀 0–1 Yr (Entry Level)", "min_experience_years": 1, "seniority_level": "entry"}
        elif min_y == 2:
            return {"experience_required": "⚡ 1–2 Yrs (Junior)", "min_experience_years": 2, "seniority_level": "junior"}
        elif 3 <= min_y <= 4:
            return {"experience_required": f"💼 {min_y}–4 Yrs (Mid-Level)", "min_experience_years": min_y, "seniority_level": "mid"}
        elif 5 <= min_y <= 7:
            return {"experience_required": f"👑 {min_y}+ Yrs (Senior)", "min_experience_years": min_y, "seniority_level": "senior"}
        elif min_y >= 8:
            return {"experience_required": f"🏆 {min_y}+ Yrs (Lead / Principal)", "min_experience_years": min_y, "seniority_level": "lead"}

    return {"experience_required": "💼 2–4 Yrs (Mid-Level)", "min_experience_years": 2, "seniority_level": "mid"}
