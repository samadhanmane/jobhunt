import pytest
import datetime
from src.utils.date_utils import format_posted_date_for_csv, parse_relative_posted_date, is_within_days
from src.utils.role_helper import is_title_role_match
from src.utils.location_helper import is_job_location_match, is_foreign_location, is_india_location
from src.config import settings
from src.services.keepalive_service import keepalive_service

def test_relative_date_parsing():
    now = datetime.datetime.utcnow()
    today_str = now.strftime("%Y-%m-%d")
    yesterday_str = (now - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    eleven_days_str = (now - datetime.timedelta(days=11)).strftime("%Y-%m-%d")
    two_weeks_str = (now - datetime.timedelta(days=14)).strftime("%Y-%m-%d")

    assert parse_relative_posted_date("today") == today_str
    assert parse_relative_posted_date("just now") == today_str
    assert parse_relative_posted_date("3h ago") == today_str
    assert parse_relative_posted_date("yesterday") == yesterday_str
    assert parse_relative_posted_date("1d ago") == yesterday_str
    assert parse_relative_posted_date("11d ago") == eleven_days_str
    assert parse_relative_posted_date("2w ago") == two_weeks_str

    assert format_posted_date_for_csv("11d ago") == eleven_days_str
    assert format_posted_date_for_csv("today") == today_str

def test_freshness_within_days_for_relative_dates():
    # 'today' and 'yesterday' should pass a 1-day alert window
    assert is_within_days("today", 1) is True
    assert is_within_days("yesterday", 1) is True
    assert is_within_days("2h ago", 1) is True

    # '11d ago' should fail a 1-day window, but pass a 14-day window
    assert is_within_days("11d ago", 1) is False
    assert is_within_days("11d ago", 14) is True

def test_aiml_role_matching():
    # Compound AIML tokens must match
    assert is_title_role_match("AIML Intern", "AIML") is True
    assert is_title_role_match("AIML Engineer", "AIML") is True
    assert is_title_role_match("Senior AIML Developer", "AIML") is True
    assert is_title_role_match("Cloud AI Engineer", "AIML") is True
    assert is_title_role_match("Junior AI/ML Engineer", "AIML") is True
    assert is_title_role_match("Machine Learning Engineer", "AIML") is True
    assert is_title_role_match("Deep Learning Specialist", "AIML") is True

    # Irrelevant roles must be strictly rejected
    assert is_title_role_match("Frontend React Developer", "AIML") is False
    assert is_title_role_match("WordPress Developer", "AIML") is False
    assert is_title_role_match("Customer Support Executive", "AIML") is False
    assert is_title_role_match("Sales Manager", "AIML") is False

def test_foreign_location_exclusion_for_india():
    # Foreign locations must be recognized
    assert is_foreign_location("Denver, CO") is True
    assert is_foreign_location("Atlanta, Georgia") is True
    assert is_foreign_location("London, UK") is True
    assert is_foreign_location("Berlin, Germany") is True
    assert is_foreign_location("Toronto, Canada") is True
    assert is_foreign_location("San Francisco, CA") is True
    assert is_foreign_location("Remote, US") is True

    # Indian locations must not be marked foreign
    assert is_foreign_location("Pune, Maharashtra") is False
    assert is_foreign_location("Bangalore, India") is False
    assert is_foreign_location("Hinjawadi, Pune") is False
    assert is_foreign_location("Remote, India") is False

    # Location matcher strictly rejects foreign jobs when Indian city/country is targeted
    assert is_job_location_match("Denver, CO", "Pune") is False
    assert is_job_location_match("Atlanta, Georgia", "Pune") is False
    assert is_job_location_match("London, UK", "India") is False
    assert is_job_location_match("Berlin, Germany", "India") is False
    assert is_job_location_match("Remote, US", "India") is False

    # Exact matches for Pune
    assert is_job_location_match("Pune, Maharashtra, India", "Pune") is True
    assert is_job_location_match("Hinjawadi, Pune", "Pune") is True
    assert is_job_location_match("Kharadi, Pune", "Pune") is True

def test_keepalive_enabled_for_scheduler():
    # Ensure KEEPALIVE_ENABLED is True by default so scheduler stays alive on Render
    assert settings.KEEPALIVE_ENABLED is True
    # Stopping keepalive service works without error
    keepalive_service.stop()
    assert keepalive_service._running is False
