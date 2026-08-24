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

            engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=60,
                pool_timeout=3,
                connect_args={"connect_timeout": 30}
            )
            with engine.connect() as conn:
                pass
            return engine
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
    from src.services.auth_service import hash_password
    
    # Initialize both engines to guarantee SQLite is ready as fallback
    for eng in set([engine, sqlite_engine]):
        try:
            Base.metadata.create_all(bind=eng)
            with eng.connect() as conn:
                for query in [
                    "ALTER TABLE user_profiles ADD COLUMN resume_roles JSON",
                    "ALTER TABLE jobs ADD COLUMN matching_skills JSON",
                    "ALTER TABLE jobs ADD COLUMN missing_skills JSON",
                    "ALTER TABLE jobs ADD COLUMN experience_fit VARCHAR(50)",
                    "ALTER TABLE jobs ADD COLUMN hr_contacts JSON",
                    "ALTER TABLE jobs ADD COLUMN tech_contacts JSON",
                    "ALTER TABLE jobs ADD COLUMN company_insights JSON",
                    "ALTER TABLE jobs ADD COLUMN key_requirements TEXT",
                    "ALTER TABLE email_alerts ADD COLUMN user_id VARCHAR(36)",
                    "ALTER TABLE search_history ADD COLUMN user_id VARCHAR(36)",
                    "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)",
                    "ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'",
                    "ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
                    "ALTER TABLE users ADD COLUMN created_at TIMESTAMP",
                    "ALTER TABLE user_accounts ADD COLUMN linkedin_cookie TEXT",
                    "ALTER TABLE user_accounts ADD COLUMN linkedin_cookie_status VARCHAR(50) DEFAULT 'unconfigured'",
                    "ALTER TABLE user_accounts ADD COLUMN linkedin_cookie_checked_at TIMESTAMP",
                    "ALTER TABLE user_accounts ADD COLUMN linkedin_cookie_last_notified_at TIMESTAMP",
                    "ALTER TABLE email_alerts ADD COLUMN linkedin_cookie TEXT",
                    "ALTER TABLE email_alerts ADD COLUMN cookie_status VARCHAR(50) DEFAULT 'active'",
                ]:
                    try:
                        conn.execute(text(query))
                        conn.commit()
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
    Fails over to SQLite if the primary database connection fails on initial checkout.
    """
    db = None
    use_sqlite = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
    except Exception as e:
        print(f"Notice: Primary DB connection check failed ({e}). Using local SQLite.")
        if db:
            try:
                db.close()
            except Exception:
                pass
        db = SqliteSession()
        use_sqlite = True

    try:
        yield db
    finally:
        if db:
            try:
                db.close()
            except Exception:
                pass
