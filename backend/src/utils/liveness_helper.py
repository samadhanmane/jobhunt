import httpx
import re
from typing import Tuple

EXPIRED_SIGNALS = [
    "this job is no longer available",
    "this position has been filled",
    "the job posting has expired",
    "this job posting is no longer active",
    "no longer accepting applications",
    "this listing has expired",
    "job closed",
    "page not found",
    "404 not found",
    "this role has been closed"
]

async def check_job_liveness(url: str, timeout: float = 4.0) -> Tuple[bool, str]:
    """
    Checks if a job URL is live and accepting applications.
    Ported from career-ops/check-liveness.mjs.
    Returns (is_live: bool, status_reason: str).
    """
    if not url or not url.startswith("http"):
        return True, "No URL to test"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/json"
    }

    try:
        async with httpx.AsyncClient(headers=headers, timeout=timeout, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code in [404, 410, 403, 500]:
                return False, f"HTTP status {resp.status_code}"

            if resp.status_code == 200:
                body_lower = resp.text[:4000].lower()
                for signal in EXPIRED_SIGNALS:
                    if signal in body_lower:
                        return False, f"Expired signal: '{signal}'"
                return True, "Active and accepting applications"

            return True, f"HTTP status {resp.status_code}"
    except Exception as e:
        # Network timeout or temporary failure — do not drop job on transient errors
        return True, f"Transient network check: {str(e)}"
