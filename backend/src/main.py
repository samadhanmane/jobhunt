import sys
import os
import asyncio
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.api.routes import search, jobs, health, alerts, auth, admin, contacts, advanced_features
from src.models.database import init_and_migrate_db, SessionLocal
from src.services.scheduler_service import scheduler_service
from src.services.keepalive_service import keepalive_service

async def async_startup_tasks():
    # Yield control immediately to allow Uvicorn port binding without delay
    await asyncio.sleep(0.05)
    
    # 1. Initialize and auto-migrate database schema in worker thread pool
    try:
        await asyncio.to_thread(init_and_migrate_db)
    except Exception as e:
        print(f"Notice: Database init notice: {e}")

    # 2. Run 7-day data retention cleanup in worker thread pool
    try:
        def cleanup():
            db = SessionLocal()
            scheduler_service.cleanup_old_jobs(db, days=7)
            db.close()
        await asyncio.to_thread(cleanup)
    except Exception as e:
        print(f"Notice: Startup cleanup notice: {e}")

    # 3. Start background daily email scheduler
    try:
        asyncio.create_task(scheduler_service.start_background_scheduler())
    except Exception as e:
        print(f"Notice: Scheduler start notice: {e}")

    # 4. Start 60-second KeepAlive self-ping heartbeat
    try:
        keepalive_service.start()
    except Exception as e:
        print(f"Notice: KeepAlive start notice: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_task = asyncio.create_task(async_startup_tasks())
    
    yield
    
    # Shutdown: Cancel tasks & stop keepalive
    try:
        startup_task.cancel()
        keepalive_service.stop()
    except Exception:
        pass

app = FastAPI(
    title="AI-Powered Job Aggregator Backend",
    description="Aggregates, deduplicates, and ranks jobs from free job APIs based on resume structure and preferences.",
    version="2.0.0",
    lifespan=lifespan
)

# Configure Dynamic CORS to connect Render Backend with Vercel Frontend
cors_origins = {
    "https://jobhunt-sigma-three.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000"
}

if getattr(settings, "ALLOWED_ORIGINS", None):
    for origin in settings.ALLOWED_ORIGINS.split(","):
        o = origin.strip()
        if o:
            cors_origins.add(o)

if getattr(settings, "FRONTEND_URL", None):
    for origin in settings.FRONTEND_URL.split(","):
        o = origin.strip()
        if o:
            cors_origins.add(o)

allow_origins_list = list(cors_origins)

from src.middleware.security import (
    SecurityHeadersMiddleware,
    RequestSizeLimitMiddleware,
    RateLimitMiddleware
)

# 1. Add Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Add Request Size Limit (15MB max) Anti-DDoS Middleware
app.add_middleware(RequestSizeLimitMiddleware, max_size_bytes=15 * 1024 * 1024)

# 3. Add Sliding-Window Rate Limiter
app.add_middleware(RateLimitMiddleware)

# 4. Configure CORS with both explicit origin list and Vercel regex matching
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,
    allow_origin_regex=r"^https?://(.*\.)?(vercel\.app|onrender\.com|localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register API routes
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(search.router, tags=["Search"])
app.include_router(jobs.router, tags=["Jobs"])
app.include_router(contacts.router, tags=["Recruiter & HR Contacts"])
app.include_router(alerts.router, tags=["Email Alerts"])
app.include_router(advanced_features.router)
app.include_router(health.router, tags=["Health Check"])

@app.get("/", tags=["Status"])
def root():
    """
    Root status check for Render deployment & health monitoring.
    """
    return {
        "status": "online",
        "service": "JobAgent AI Backend API",
        "version": "2.0.0",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
        "frontend_url": getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=False)
