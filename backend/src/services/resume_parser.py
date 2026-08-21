import os
import json
import re
import pdfplumber
from pypdf import PdfReader
from docx import Document
from typing import Dict, Any
from src.llm.llm_client import get_llm
from src.llm.prompts.search import RESUME_PARSER_SYSTEM_PROMPT

class ResumeParserService:
    def __init__(self):
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = get_llm()
        return self._llm

    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        # Try pdfplumber first
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    content = page.extract_text()
                    if content:
                        text += content + "\n"
            if text.strip():
                return text
        except Exception as e:
            print(f"pdfplumber notice: {e}")
            
        # Fallback to pypdf
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                content = page.extract_text()
                if content:
                    text += content + "\n"
            return text
        except Exception as e:
            print(f"pypdf notice: {e}")
            return ""

    def extract_text_from_docx(self, file_path: str) -> str:
        try:
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        except Exception as e:
            print(f"python-docx notice: {e}")
            return ""

    def extract_text(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return self.extract_text_from_docx(file_path)
        elif ext in [".txt"]:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception as e:
                print(f"Plain text read notice: {e}")
                return ""
        return ""

    def _extract_json(self, raw_content: str) -> Dict[str, Any]:
        """Extract and parse JSON object from LLM response string."""
        content = raw_content.strip()
        if "```json" in content:
            match = re.search(r"```json\s*(\{.*?\})\s*```", content, re.DOTALL)
            if match:
                content = match.group(1)
        elif "```" in content:
            match = re.search(r"```\s*(\{.*?\})\s*```", content, re.DOTALL)
            if match:
                content = match.group(1)
        else:
            match = re.search(r"(\{.*\})", content, re.DOTALL)
            if match:
                content = match.group(1)
        return json.loads(content)

    async def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from resume and parse structured profile details using the LLM.
        """
        text = self.extract_text(file_path)
        if not text.strip():
            return {
                "skills": [],
                "top_technologies": [],
                "experience_years": 0.0,
                "seniority": "Mid",
                "current_or_recent_role": "",
                "target_roles": [],
                "education": [],
                "summary": "",
                "raw_text": ""
            }
            
        prompt = f"""
Analyze this candidate's resume and extract complete career, skill, and seniority information:

Resume text:
\"\"\"
{text[:8000]}
\"\"\"
"""
        try:
            response = await self.llm.ainvoke([
                {"role": "system", "content": RESUME_PARSER_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ])
            
            parsed = self._extract_json(response.content)
            parsed["raw_text"] = text
            return parsed
        except Exception as e:
            print(f"Notice during resume LLM parsing: {e}")
            # Fallback heuristic extraction from raw text
            return {
                "skills": [],
                "top_technologies": [],
                "experience_years": 0.0,
                "seniority": "Mid",
                "current_or_recent_role": "",
                "target_roles": [],
                "education": [],
                "summary": "",
                "raw_text": text
            }
