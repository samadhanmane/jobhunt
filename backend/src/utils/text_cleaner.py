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
    title_l = (title or "").lower()
    desc_l = (description or "").lower()
    fit_l = (experience_fit or "").lower()

    if any(w in title_l for w in ["intern", "internship", "trainee", "apprentice", "student", "co-op"]) or "intern" in fit_l:
        return {"experience_required": "🌱 Internship (0 Yrs)", "min_experience_years": 0, "seniority_level": "intern"}

    plus_matches = re.findall(r'(\d+)\s*\+\s*(?:years?|yrs?)\b', desc_l)
    min_matches = re.findall(r'(?:minimum|min\.?|at\s+least|requires?|require|with)\s*(\d+)\s*\+?\s*(?:years?|yrs?)\b', desc_l)
    range_matches = re.findall(r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)\b', desc_l)

    found_years = []
    for m in plus_matches:
        val = int(m)
        if 1 <= val <= 25: found_years.append(val)
    for m in min_matches:
        val = int(m)
        if 1 <= val <= 25: found_years.append(val)
    for m in range_matches:
        val = int(m[0])
        if 1 <= val <= 25: found_years.append(val)

    if found_years:
        req = max(found_years)
        if req == 0:
            return {"experience_required": "🌱 0 Yrs (Fresher)", "min_experience_years": 0, "seniority_level": "intern"}
        elif req == 1:
            return {"experience_required": "🚀 1 Yr (Entry Level)", "min_experience_years": 1, "seniority_level": "entry"}
        elif req == 2:
            return {"experience_required": "⚡ 2 Yrs (Junior)", "min_experience_years": 2, "seniority_level": "junior"}
        elif req <= 5:
            return {"experience_required": f"💼 {req}+ Yrs (Mid-Level)", "min_experience_years": req, "seniority_level": "mid"}
        elif req <= 8:
            return {"experience_required": f"👑 {req}+ Yrs (Senior)", "min_experience_years": req, "seniority_level": "senior"}
        else:
            return {"experience_required": f"🏆 {req}+ Yrs (Lead / Principal)", "min_experience_years": req, "seniority_level": "lead"}

    if any(w in title_l for w in ["entry", "junior", "associate", "graduate"]) or "junior" in fit_l or "entry" in fit_l:
        return {"experience_required": "🚀 0–2 Yrs (Junior)", "min_experience_years": 1, "seniority_level": "junior"}
    if any(w in title_l for w in ["senior", "sr.", "sr ", "lead", "staff", "principal", "architect", "director", "head of"]) or "senior" in fit_l or "lead" in fit_l:
        return {"experience_required": "👑 5+ Yrs (Senior)", "min_experience_years": 5, "seniority_level": "senior"}

    return {"experience_required": "💼 1–3 Yrs (Mid-Level)", "min_experience_years": 2, "seniority_level": "mid"}
