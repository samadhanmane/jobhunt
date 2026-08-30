from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

CADENCE_DAYS = [5, 12, 21]

def calculate_followup_milestone(applied_date_str: str) -> Dict[str, Any]:
    """
    Calculates follow-up cadence checkpoints based on career-ops followup-cadence rules.
    Milestones:
      - Round 1 Follow-up: Day 5 after applying
      - Round 2 Follow-up: Day 12 after applying
      - Round 3 Follow-up: Day 21 after applying
    """
    if not applied_date_str:
        return {"status": "unknown", "days_since": 0, "next_followup_day": 5, "is_due": False}

    try:
        # Handle ISO date or YYYY-MM-DD
        clean_date = applied_date_str[:10]
        applied_dt = datetime.strptime(clean_date, "%Y-%m-%d")
        now = datetime.utcnow()
        days_since = (now - applied_dt).days

        if days_since < 0:
            days_since = 0

        next_milestone = None
        for milestone in CADENCE_DAYS:
            if days_since <= milestone:
                next_milestone = milestone
                break

        if next_milestone is None:
            # Beyond 21 days
            return {
                "status": "completed_cadence",
                "days_since": days_since,
                "label": f"Applied {days_since}d ago (Cadence window closed)",
                "is_due": False,
                "urgency": "low"
            }

        days_until_next = next_milestone - days_since
        if days_until_next == 0:
            status = "due_today"
            label = f"Follow-up Round due TODAY (Day {next_milestone})"
            is_due = True
            urgency = "high"
        elif days_until_next < 0:
            status = "overdue"
            label = f"Follow-up OVERDUE by {abs(days_until_next)} days"
            is_due = True
            urgency = "high"
        else:
            status = "upcoming"
            label = f"Follow-up in {days_until_next} days (Day {next_milestone})"
            is_due = False
            urgency = "medium" if days_until_next <= 2 else "low"

        return {
            "status": status,
            "days_since": days_since,
            "next_followup_day": next_milestone,
            "days_until_next": days_until_next,
            "label": label,
            "is_due": is_due,
            "urgency": urgency
        }

    except Exception:
        return {"status": "unknown", "days_since": 0, "next_followup_day": 5, "is_due": False}
