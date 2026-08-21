from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class SalaryRangeSchema(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    currency: Optional[str] = "USD"

class JobSchema(BaseModel):
    id: Optional[str] = None
    title: str
    company: str
    location: Optional[str] = "Remote"
    description: Optional[str] = ""
    url: Optional[str] = ""
    source: Optional[str] = "unknown"
    salary: Optional[SalaryRangeSchema] = None
    match_score: Optional[float] = 0.0
    reason: Optional[str] = ""
