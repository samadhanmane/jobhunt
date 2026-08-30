from typing import Dict, Any, List
from sqlalchemy.orm import Session
from src.models.job import Job
from src.services.enrichment_service import lead_enricher

class CompanyDossierService:
    """
    Company Intelligence Dossier Service.
    Ported from career-ops company-history.mjs.
    """
    def get_company_dossier(self, company_name: str, db: Session, user_applied_jobs: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        comp_clean = (company_name or "").strip()
        comp_norm = comp_clean.lower()

        # 1. Active openings in jobs.db
        try:
            active_jobs = db.query(Job).filter(Job.company.ilike(f"%{comp_clean}%")).limit(10).all()
            active_list = [{
                "id": j.id,
                "title": j.title,
                "location": j.location,
                "posted_date": j.posted_date,
                "url": j.url,
                "match_score": j.match_score
            } for j in active_jobs]
        except Exception:
            active_list = []

        # 2. Canonical Domain & Email Permutations
        domain = lead_enricher._guess_company_domain(comp_clean)
        contacts = [
            {"role": "Talent Acquisition", "email": f"talent@{domain}", "type": "HR"},
            {"role": "Recruiting Team", "email": f"recruiting@{domain}", "type": "HR"},
            {"role": "Careers Inbound", "email": f"careers@{domain}", "type": "General"},
            {"role": "Engineering Hiring", "email": f"tech-hiring@{domain}", "type": "Engineering"}
        ]

        # 3. User application history for this company
        applied_history = []
        if user_applied_jobs:
            for app in user_applied_jobs:
                if comp_norm in str(app.get("company", "")).lower():
                    applied_history.append(app)

        # 4. Latency & Responsiveness score
        latency_score = "Active Responder (< 5 days)" if len(active_list) > 3 else "Normal Pace (~10 days)"

        return {
            "company_name": comp_clean,
            "canonical_domain": domain,
            "careers_url": f"https://{domain}/careers",
            "active_openings_count": len(active_list),
            "active_openings": active_list,
            "contacts": contacts,
            "application_history": applied_history,
            "hiring_latency": latency_score,
            "ats_provider": "Greenhouse / Ashby" if any("greenhouse" in (j.get("url") or "") for j in active_list) else "Direct ATS"
        }

company_dossier_service = CompanyDossierService()
