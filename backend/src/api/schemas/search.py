from pydantic import BaseModel
from typing import Optional, List

class PreferencesSchema(BaseModel):
    role: str = "AI/ML Engineer"
    location: str = "India"
    remote: bool = True
    work_mode: Optional[str] = "any"  # remote, hybrid, onsite, any
    role_category: Optional[str] = "AI/ML"
    sub_domain: Optional[str] = "All"
    experience_tier: Optional[str] = "all"  # internship, entry, mid, senior, lead
    experience_years: Optional[float] = 0.0
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    stipend_range: Optional[str] = None
    currency: Optional[str] = "INR"
    posted_within: Optional[str] = "all"  # 24h, 7d, 30d, all
    ai_facets: Optional[List[str]] = []
    skills: Optional[List[str]] = []
