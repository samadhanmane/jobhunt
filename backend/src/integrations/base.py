from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseJobIntegration(ABC):
    @abstractmethod
    async def search(self, query: str, location: str, remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        """
        Search for jobs on the platform.
        Returns a list of dictionaries with standard job attributes:
        - title: str
        - company: str
        - location: str
        - description: str
        - url: str
        - source: str
        - posted_date: Optional[str]
        - salary_range: Optional[Dict]
        """
        pass
