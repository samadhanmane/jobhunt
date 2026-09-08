import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Point directly to backend/.env
env_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_file_path,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Google Gemini AI Settings (Configured via .env)
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-3.5-flash"
    GEMINI_MODEL: Optional[str] = "gemini-3.5-flash"
    LLM_API_KEY: Optional[str] = None
    LLM_TEMPERATURE: float = 0.3
    LLM_BASE_URL: Optional[str] = None

    # Provider-specific key aliases
    MISTRAL_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Embedding Settings
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    HUGGINGFACE_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None

    # Database Settings (Supabase / PostgreSQL cloud)
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/jobs"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    STORAGE_BUCKET: Optional[str] = "jobhunt"
    JWT_SECRET: str = "super-secret-jwt-key-jobagent-ai-2026-secure-random"

    # Pinecone Vector Database Settings
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_INDEX_NAME: Optional[str] = "jobhunt"

    # Job Board Tokens & Outreach
    FREEHIRE_TOKEN: Optional[str] = None
    RAPIDAPI_KEY: Optional[str] = None
    LINKEDIN_COOKIE: Optional[str] = None

    # Nodemailer Credentials (Gmail)
    EMAIL_FROM: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None

    # Server & Port Settings (Render dynamically sets PORT)
    PORT: int = 8000

    # Frontend & CORS Settings (connects Render backend with Vercel frontend)
    FRONTEND_URL: Optional[str] = "http://localhost:3000,http://localhost:5173,http://localhost:8000"
    ALLOWED_ORIGINS: Optional[str] = "*"

    # Static Admin Access Credentials (from .env)
    ADMIN_EMAIL: Optional[str] = "jobhuntadmin@gmail.com"
    ADMIN_PS: Optional[str] = "123456"
    ADMIN_PASSWORD: Optional[str] = None

settings = Settings()
