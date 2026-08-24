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
