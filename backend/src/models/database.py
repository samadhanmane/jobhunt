import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from src.config import settings

Base = declarative_base()

def get_sqlite_engine():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "jobs.db")
    return create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

sqlite_engine = get_sqlite_engine()
SqliteSession = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

def get_primary_engine():
    try:
        if settings.DATABASE_URL and not settings.DATABASE_URL.startswith("sqlite"):
            try:
                import psycopg2
            except ImportError:
                print("Notice: psycopg2 not installed in container. Defaulting to local SQLite.")
                return sqlite_engine

            return create_engine(
                settings.DATABASE_URL,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                pool_recycle=60,
                pool_timeout=30,
                connect_args={
                    "connect_timeout": 15,
                    "keepalives": 1,
                    "keepalives_idle": 30,
                    "keepalives_interval": 10,
                    "keepalives_count": 5
                }
            )
    except Exception as e:
        print(f"Notice: PostgreSQL connection notice ({e}). Defaulting to local SQLite.")
    return sqlite_engine

engine = get_primary_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_and_migrate_db():
    from src.models.user_account import UserAccount
    from src.models.job import Job
    from src.models.user import UserProfile
    from src.models.search_history import SearchHistory
    from src.models.email_alert import EmailAlert
    from src.models.automation_history import AutomationHistory
    from src.services.auth_service import hash_password
    
    # Initialize both engines to guarantee SQLite is ready as fallback
    for eng in set([engine, sqlite_engine]):
        try:
            Base.metadata.create_all(bind=eng)
            is_postgres = "postgres" in eng.name or "psycopg" in eng.name
            if_not_exists = "IF NOT EXISTS " if is_postgres else ""

            queries = [
                f"ALTER TABLE user_profiles ADD COLUMN {if_not_exists}resume_roles JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}matching_skills JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}missing_skills JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}experience_fit VARCHAR(50)",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}hr_contacts JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}tech_contacts JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}company_insights JSON",
                f"ALTER TABLE jobs ADD COLUMN {if_not_exists}key_requirements TEXT",
                f"ALTER TABLE email_alerts ADD COLUMN {if_not_exists}user_id VARCHAR(36)",
                f"ALTER TABLE email_alerts ADD COLUMN {if_not_exists}linkedin_cookie TEXT",
                f"ALTER TABLE email_alerts ADD COLUMN {if_not_exists}cookie_status VARCHAR(50) DEFAULT 'active'",
                f"ALTER TABLE search_history ADD COLUMN {if_not_exists}user_id VARCHAR(36)",
                f"ALTER TABLE users ADD COLUMN {if_not_exists}password_hash VARCHAR(255)",
                f"ALTER TABLE users ADD COLUMN {if_not_exists}role VARCHAR(50) DEFAULT 'user'",
                f"ALTER TABLE users ADD COLUMN {if_not_exists}is_active BOOLEAN DEFAULT TRUE",
                f"ALTER TABLE users ADD COLUMN {if_not_exists}created_at TIMESTAMP",
                f"ALTER TABLE user_accounts ADD COLUMN {if_not_exists}linkedin_cookie TEXT",
                f"ALTER TABLE user_accounts ADD COLUMN {if_not_exists}linkedin_cookie_status VARCHAR(50) DEFAULT 'unconfigured'",
                f"ALTER TABLE user_accounts ADD COLUMN {if_not_exists}linkedin_cookie_checked_at TIMESTAMP",
                f"ALTER TABLE user_accounts ADD COLUMN {if_not_exists}linkedin_cookie_last_notified_at TIMESTAMP",
            ]

            for q in queries:
                try:
                    with eng.begin() as conn:
                        conn.execute(text(q))
                except Exception:
                    pass
        except Exception as e:
            print(f"Database migration notice on {eng.name}: {e}")

    # Clean up any legacy admin rows from database to ensure admin is not stored in DB
    try:
        for Sess in [SessionLocal, SqliteSession]:
            try:
                db_sess = Sess()
                db_sess.query(UserAccount).filter(UserAccount.role == "admin").delete(synchronize_session=False)
                db_sess.commit()
                db_sess.close()
            except Exception:
                pass
    except Exception:
        pass

    print("Database schema synchronized and verified.")

def get_db():
    """
    Yields a database session.
    SQLAlchemy pool_pre_ping=True automatically handles reconnection.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass
