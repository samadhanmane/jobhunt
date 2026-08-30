from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.models.job_occurrence import JobOccurrence

class RepostDetectorService:
    """
    Ghost Job & Repost Detector.
    Ported from career-ops detect-reposts.mjs.
    Flags postings that companies repeatedly refresh without hiring.
    """
    def record_and_evaluate_repost(self, company: str, title: str, job_url: str, db: Session) -> dict:
        comp_norm = (company or "").lower().strip()
        title_norm = (title or "").lower().strip()

        if not comp_norm or not title_norm:
            return {"is_repost": False, "badge_label": "Standard", "badge_color": "slate"}

        try:
            occ = db.query(JobOccurrence).filter(
                JobOccurrence.company_norm == comp_norm,
                JobOccurrence.title_norm == title_norm
            ).first()

            now = datetime.utcnow()

            if not occ:
                occ = JobOccurrence(
                    company_norm=comp_norm,
                    title_norm=title_norm,
                    job_url=job_url,
                    first_seen_at=now,
                    last_seen_at=now,
                    times_seen=1
                )
                db.add(occ)
                db.commit()
                return {"is_repost": False, "times_seen": 1, "badge_label": "✨ Fresh Role", "badge_color": "emerald"}

            # Update occurrence
            days_span = (now - occ.first_seen_at).days
            occ.times_seen += 1
            occ.last_seen_at = now
            db.commit()

            if occ.times_seen >= 3 or (occ.times_seen >= 2 and days_span >= 25):
                return {
                    "is_repost": True,
                    "times_seen": occ.times_seen,
                    "days_span": days_span,
                    "badge_label": f"⚠️ Reposted {occ.times_seen}x ({days_span}d span)",
                    "badge_color": "amber"
                }

            if days_span <= 3:
                return {"is_repost": False, "times_seen": occ.times_seen, "badge_label": "✨ Fresh Opening", "badge_color": "emerald"}

            return {"is_repost": False, "times_seen": occ.times_seen, "badge_label": "Active Opening", "badge_color": "slate"}

        except Exception as e:
            return {"is_repost": False, "times_seen": 1, "badge_label": "Standard", "badge_color": "slate"}

repost_detector = RepostDetectorService()
