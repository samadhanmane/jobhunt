import sys
import os
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src.config import settings
from src.api.routes import search, jobs, health, alerts, auth, admin
from src.models.database import init_and_migrate_db, SessionLocal
from src.services.scheduler_service import scheduler_service

# Automatically initialize and auto-migrate database schema + seed superadmin
init_and_migrate_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Run 3-day data retention cleanup
    try:
        db = SessionLocal()
        scheduler_service.cleanup_old_jobs(db, days=3)
        db.close()
    except Exception as e:
        print(f"Notice: Startup cleanup notice: {e}")
    yield

app = FastAPI(
    title="AI-Powered Job Aggregator Backend",
    description="Aggregates, deduplicates, and ranks jobs from free job APIs based on resume structure and preferences.",
    version="2.0.0",
    lifespan=lifespan
)

# Configure Dynamic CORS to connect Render Backend with Vercel Frontend
cors_origins = set()
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

if "*" in cors_origins or not cors_origins:
    allow_origins_list = ["*"]
else:
    # Always include common dev origins
    cors_origins.update([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ])
    allow_origins_list = list(cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins_list,
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
app.include_router(alerts.router, tags=["Email Alerts"])
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
