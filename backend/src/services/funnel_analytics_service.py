from typing import Dict, Any, List
from datetime import datetime

class FunnelAnalyticsService:
    """
    Pipeline Funnel Velocity & Calibration Analytics.
    Ported from career-ops funnel-velocity.mjs and stats.mjs.
    """
    def calculate_funnel_metrics(self, applied_jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_applied = len(applied_jobs)
        if total_applied == 0:
            return {
                "total_applied": 0,
                "interviewing": 0,
                "offers": 0,
                "rejected": 0,
                "interview_rate": 0.0,
                "offer_rate": 0.0,
                "market_interview_benchmark": 12.0,
                "market_offer_benchmark": 25.0,
                "avg_response_days": 6.5,
                "status_counts": {"applied": 0, "interviewing": 0, "offer": 0, "rejected": 0}
            }

        counts = {"applied": 0, "interviewing": 0, "offer": 0, "rejected": 0}
        days_sum = 0
        dated_count = 0
        now = datetime.utcnow()

        for j in applied_jobs:
            st = str(j.get("status", "applied")).lower()
            if "offer" in st:
                counts["offer"] += 1
            elif "interview" in st or "round" in st or "screening" in st:
                counts["interviewing"] += 1
            elif "reject" in st:
                counts["rejected"] += 1
            else:
                counts["applied"] += 1

            app_date_str = str(j.get("applied_date", ""))[:10]
            if app_date_str:
                try:
                    dt = datetime.strptime(app_date_str, "%Y-%m-%d")
                    days_sum += (now - dt).days
                    dated_count += 1
                except Exception:
                    pass

        interview_rate = round((counts["interviewing"] + counts["offer"]) / total_applied * 100, 1)
        offer_rate = round(counts["offer"] / (counts["interviewing"] + counts["offer"]) * 100, 1) if (counts["interviewing"] + counts["offer"]) > 0 else 0.0
        avg_days = round(days_sum / dated_count, 1) if dated_count > 0 else 6.5

        return {
            "total_applied": total_applied,
            "interviewing": counts["interviewing"],
            "offers": counts["offer"],
            "rejected": counts["rejected"],
            "interview_rate": interview_rate,
            "offer_rate": offer_rate,
            "market_interview_benchmark": 12.0,
            "market_offer_benchmark": 25.0,
            "avg_response_days": avg_days,
            "status_counts": counts
        }

funnel_analytics_service = FunnelAnalyticsService()
