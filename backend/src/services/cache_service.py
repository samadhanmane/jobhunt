import time
from typing import Any, Optional, Dict, Tuple

class CacheService:
    """
    Fast, self-contained in-memory TTL cache without external Redis dependencies.
    """
    def __init__(self):
        # Key -> (value, expire_timestamp)
        self._cache: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            value, expire_time = self._cache[key]
            if time.time() < expire_time:
                return value
            else:
                # Expired
                del self._cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        expire_time = time.time() + ttl
        self._cache[key] = (value, expire_time)
        # Periodic cleanup if cache gets very large
        if len(self._cache) > 2000:
            self._cleanup_expired()
        return True

    def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            return True
        return False

    def clear(self):
        self._cache.clear()

    def _cleanup_expired(self):
        now = time.time()
        expired_keys = [k for k, (v, exp) in self._cache.items() if now >= exp]
        for k in expired_keys:
            del self._cache[k]

cache_service = CacheService()
