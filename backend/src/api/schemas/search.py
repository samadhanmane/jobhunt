from pydantic import BaseModel
from typing import Optional

class PreferencesSchema(BaseModel):
    role: str = "Python Developer"
    location: str = "Bangalore"
    remote: bool = True
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    experience_years: Optional[float] = 0.0
