import time
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects essential production security headers on all HTTP responses
    to defend against clickjacking, MIME sniffing, XSS, and downgrade attacks.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Only attach HSTS if running over HTTPS or in production
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
            
        return response

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Anti-DDoS: Protects application memory from oversized payloads and buffer exhaustion.
    Rejects requests exceeding max_size_bytes with HTTP 413.
    """
    def __init__(self, app, max_size_bytes: int = 15 * 1024 * 1024):  # 15 MB
        super().__init__(app)
        self.max_size_bytes = max_size_bytes

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                if length > self.max_size_bytes:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "error": "Payload Too Large",
                            "detail": f"Request size ({length / (1024*1024):.1f}MB) exceeds the maximum limit of {self.max_size_bytes / (1024*1024):.0f}MB."
                        }
                    )
            except ValueError:
                pass

        return await call_next(request)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding-Window Rate Limiter & Flood Guard:
    Defends the API against spamming, brute-force attempts, and automated DDoS.
    """
    def __init__(self, app):
        super().__init__(app)
        # Structure: { client_ip: [(timestamp, route_category)] }
        self._ip_history: Dict[str, List[Tuple[float, str]]] = {}
        self._last_clean_time = time.time()

        # Limits (Requests per 60-second window)
        self.LIMITS = {
            "login": 10,        # Anti-credential stuffing
            "heavy": 25,        # Heavy AI search & recruiter discovery
            "general": 120      # Standard read / UI polling
        }

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        return request.client.host if request.client else "127.0.0.1"

    def _classify_route(self, path: str) -> str:
        p = path.lower()
        if "/api/v1/auth/login" in p:
            return "login"
        if any(h in p for h in ["/search", "/find-company", "/fetch-hr-contacts", "/test-send", "/query"]):
            return "heavy"
        return "general"

    def _cleanup_old_records(self, now: float):
        if now - self._last_clean_time < 30:
            return
        self._last_clean_time = now
        cutoff = now - 60.0
        
        stale_ips = []
        for ip, logs in self._ip_history.items():
            valid_logs = [entry for entry in logs if entry[0] > cutoff]
            if valid_logs:
                self._ip_history[ip] = valid_logs
            else:
                stale_ips.append(ip)

        for ip in stale_ips:
            del self._ip_history[ip]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip health check & docs from rate limiting
        if path in ["/", "/docs", "/openapi.json", "/api/v1/health"]:
            return await call_next(request)

        now = time.time()
        self._cleanup_old_records(now)

        client_ip = self._get_client_ip(request)
        category = self._classify_route(path)
        limit = self.LIMITS.get(category, 120)

        # Get existing timestamps within the last 60 seconds
        cutoff = now - 60.0
        if client_ip not in self._ip_history:
            self._ip_history[client_ip] = []

        history = [entry for entry in self._ip_history[client_ip] if entry[0] > cutoff]
        self._ip_history[client_ip] = history

        # Count requests in current category
        matching_count = sum(1 for entry in history if entry[1] == category)

        if matching_count >= limit:
            retry_after = int(60 - (now - history[0][0])) if history else 30
            retry_after = max(1, retry_after)
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry_after)},
                content={
                    "error": "Too Many Requests",
                    "detail": f"Rate limit exceeded for '{category}' operations ({limit} requests/min). Please wait {retry_after} seconds.",
                    "retry_after_seconds": retry_after
                }
            )

        # Record this request
        self._ip_history[client_ip].append((now, category))

        return await call_next(request)
