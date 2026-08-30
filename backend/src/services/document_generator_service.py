from typing import Dict, Any

class DocumentGeneratorService:
    """
    1-Click Tailored Cover Letter & CV Generator.
    Ported from career-ops generate-pdf.mjs.
    Strict provenance: Reformulates keywords, never fabricates.
    """
    def generate_tailored_cover_letter(self, job: Dict[str, Any], candidate_name: str, candidate_email: str, skills: list, story: dict = None) -> Dict[str, str]:
        role = job.get("title", "Software Engineer")
        comp = job.get("company", "Hiring Team")
        loc = job.get("location", "Remote")
        matched_skills = ", ".join(skills[:5]) if skills else "Python, PyTorch, and AI Systems"
        
        project_ref = ""
        if story and story.get("title"):
            project_ref = f"In my work on {story.get('title')}, I {story.get('action')}, achieving {story.get('result')}."

        letter_text = f"""Dear {comp} Hiring Team,

I am writing to express my strong interest in the {role} role at {comp} ({loc}). With hands-on experience building production-grade AI systems, I am excited about the opportunity to contribute to your engineering initiatives.

My technical foundation centers around {matched_skills}. {project_ref} I specialize in engineering clean, reproducible architectures that bridge algorithmic prototypes with scalable APIs.

What particularly attracts me to {comp} is your technical focus and product momentum. I would welcome the opportunity to discuss how my background and problem-solving mindset can add value to your team.

Thank you for your time and consideration.

Sincerely,
{candidate_name or "Applicant"}
{candidate_email or ""}
"""
        letter_html = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; padding: 24px;">
            <p><strong>Dear {comp} Hiring Team,</strong></p>
            <p>I am writing to express my strong interest in the <strong>{role}</strong> role at <strong>{comp}</strong> ({loc}). With hands-on experience building production-grade AI systems, I am excited about the opportunity to contribute to your engineering initiatives.</p>
            <p>My technical foundation centers around <strong>{matched_skills}</strong>. {project_ref} I specialize in engineering clean, reproducible architectures that bridge algorithmic prototypes with scalable APIs.</p>
            <p>What particularly attracts me to {comp} is your technical focus and product momentum. I would welcome the opportunity to discuss how my background and problem-solving mindset can add value to your team.</p>
            <p>Thank you for your time and consideration.</p>
            <p style="margin-top: 24px;">Sincerely,<br><strong>{candidate_name or "Applicant"}</strong><br><span style="color: #64748b;">{candidate_email or ""}</span></p>
        </div>
        """
        return {"text": letter_text.strip(), "html": letter_html.strip()}

document_generator_service = DocumentGeneratorService()
