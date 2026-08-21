from pydantic import BaseModel
from typing import List, Optional

class EducationSchema(BaseModel):
    degree: str
    institution: str
    year: Optional[int] = None

class ResumeProfileSchema(BaseModel):
    skills: List[str] = []
    experience_years: float = 0.0
    roles: List[str] = []
    education: List[EducationSchema] = []
