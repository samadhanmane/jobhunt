from typing import List, Dict, Any
from src.integrations.base import BaseJobIntegration

class DailyRemoteClient(BaseJobIntegration):
    """
    Deprecated: DailyRemote scraping connector has been disabled.
    """
    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        return []
