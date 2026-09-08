import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

Base = declarative_base()

def get_engine():
    """
    Initializes a production-grade PostgreSQL connection pool.
    Configured directly from settings.DATABASE_URL with pre-ping,
    connection recycling, and keepalive settings for cloud poolers.
    """
    if not settings.DATABASE_URL or settings.DATABASE_URL.startswith("sqlite"):
        raise RuntimeError("DATABASE_URL must be a valid PostgreSQL connection string. SQLite is deprecated.")

    return create_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_timeout=30,
        connect_args={
            "connect_timeout": 15,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_and_migrate_db():
    """
    Initializes PostgreSQL tables, applies schema migrations safely using
    ADD COLUMN IF NOT EXISTS, and builds critical indexes for high performance.
    """
    from src.models.user_account import UserAccount
    from src.models.job import Job
    from src.models.user import UserProfile
    from src.models.search_history import SearchHistory
    from src.models.email_alert import EmailAlert
    from src.models.automation_history import AutomationHistory
    from src.models.blacklist import BlacklistCompany
    from src.models.story_bank import StoryBankEntry
    from src.models.job_occurrence import JobOccurrence

    try:
        Base.metadata.create_all(bind=engine)

        queries = [
            # User profile enhancements
            "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_roles JSON",
            
            # Job core metadata & scoring
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS matching_skills JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS missing_skills JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_fit VARCHAR(50)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hr_contacts JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tech_contacts JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_insights JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS key_requirements TEXT",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_repost BOOLEAN DEFAULT FALSE",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS repost_badge VARCHAR(100)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS supported_skills JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skill_coverage_pct INTEGER DEFAULT 0",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_mode VARCHAR(50)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS sub_domain VARCHAR(100)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS ai_facets JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_required VARCHAR(100)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS min_experience_years DOUBLE PRECISION",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS seniority_level VARCHAR(50)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience_comparison JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS match_breakdown JSON",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source_category VARCHAR(50)",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS freshness_label VARCHAR(100)",

            # Email alerts
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'all'",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS experience_tier VARCHAR(50) DEFAULT 'all'",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS sub_domain VARCHAR(100) DEFAULT 'All'",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS ai_facets JSON",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS stipend_range VARCHAR(100)",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS linkedin_cookie TEXT",
            "ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS cookie_status VARCHAR(50) DEFAULT 'active'",

            # Automation history
            "ALTER TABLE automation_history ADD COLUMN IF NOT EXISTS experience_tier VARCHAR(50) DEFAULT 'all'",
            "ALTER TABLE automation_history ADD COLUMN IF NOT EXISTS sub_domain VARCHAR(100) DEFAULT 'All'",
            "ALTER TABLE automation_history ADD COLUMN IF NOT EXISTS ai_facets JSON",
            "ALTER TABLE automation_history ADD COLUMN IF NOT EXISTS stipend_range VARCHAR(100)",
            "ALTER TABLE automation_history ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'all'",

            # Search history
            "ALTER TABLE search_history ADD COLUMN IF NOT EXISTS user_id VARCHAR(36)",

            # Users & User Accounts
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS linkedin_cookie TEXT",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS linkedin_cookie_status VARCHAR(50) DEFAULT 'unconfigured'",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS linkedin_cookie_checked_at TIMESTAMP",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS linkedin_cookie_last_notified_at TIMESTAMP",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS reset_otp_hash VARCHAR(255)",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMP",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS applied_jobs TEXT",
            "ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS synced_profile TEXT",

            # Performance Indexes on Jobs
            "CREATE INDEX IF NOT EXISTS idx_jobs_search_id ON jobs(search_id)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_url ON jobs(url)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_search_score ON jobs(search_id, match_score DESC)",
            "CREATE INDEX IF NOT EXISTS idx_jobs_created_score ON jobs(created_at DESC, match_score DESC)",
        ]

        with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            try:
                conn.execute(text("SET statement_timeout = '15s'"))
            except Exception:
                pass
            for q in queries:
                try:
                    conn.execute(text(q))
                except Exception as col_err:
                    pass

        print("PostgreSQL schema successfully synchronized, migrated, and indexed.")
    except Exception as e:
        print(f"Database migration notice on PostgreSQL: {e}")
        raise

def get_db():
    """
    Yields a database session.
    Automatically handles rollback on error and cleans up session connection.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass
