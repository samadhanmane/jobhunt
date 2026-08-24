"""
Integration test for:
1. User LinkedIn Cookie Management APIs
2. Cookie Validation & Expiration Detection
3. Pre-Automation Cookie Health Sentinel & Notification Trigger
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.services.linkedin_service import linkedin_service
from src.services.scheduler_service import scheduler_service
from src.models.database import SessionLocal, init_and_migrate_db
from src.models.user_account import UserAccount
from src.models.email_alert import EmailAlert


async def test_cookie_system():
    print("\n--- 1. Testing LinkedInService Multi-Tenant Cookie Validation ---")

    # Unconfigured cookie
    val_none = linkedin_service.validate_cookie(None)
    print(f"Unconfigured cookie validation: status='{val_none.get('status')}', valid={val_none.get('valid')}")
    assert val_none.get('status') == 'unconfigured' or val_none.get('status') == 'active'

    # Dummy expired cookie
    val_dummy = linkedin_service.validate_cookie("dummy_invalid_cookie_123456789")
    print(f"Dummy cookie validation: status='{val_dummy.get('status')}', valid={val_dummy.get('valid')}")
    assert val_dummy.get('valid') is False
    assert val_dummy.get('status') in ['expired', 'invalid']
    print("[PASSED] LinkedInService Cookie Validation Unit Test Passed!")

    print("\n--- 2. Testing Database Migration & User Cookie Persistence ---")
    init_and_migrate_db()
    db = SessionLocal()

    try:
        # Create or update a test user
        test_user = db.query(UserAccount).filter(UserAccount.email == "test_cookie_user@example.com").first()
        if not test_user:
            test_user = UserAccount(
                email="test_cookie_user@example.com",
                password_hash="test_hash",
                role="user",
                linkedin_cookie="dummy_expired_cookie_token",
                linkedin_cookie_status="expired"
            )
            db.add(test_user)
        else:
            test_user.linkedin_cookie = "dummy_expired_cookie_token"
            test_user.linkedin_cookie_status = "expired"
        db.commit()

        user_dict = test_user.to_dict()
        print(f"UserAccount to_dict(): has_linkedin_cookie={user_dict.get('has_linkedin_cookie')}, status='{user_dict.get('linkedin_cookie_status')}'")
        assert user_dict.get('has_linkedin_cookie') is True
        assert user_dict.get('linkedin_cookie_status') == 'expired'
        print("[PASSED] UserAccount Model Persistence Passed!")

        print("\n--- 3. Testing Pre-Automation Cookie Health Sentinel ---")
        # Create an active email alert for this user
        test_alert = db.query(EmailAlert).filter(EmailAlert.email == "test_cookie_user@example.com").first()
        if not test_alert:
            test_alert = EmailAlert(
                user_id=test_user.id,
                email="test_cookie_user@example.com",
                role="Backend Engineer",
                location="Remote",
                preferred_time="09:00",
                is_active=True
            )
            db.add(test_alert)
            db.commit()

        # Run cookie health sentinel
        await scheduler_service.check_scheduled_alerts_cookie_health()
        
        # Verify user status was verified
        db.refresh(test_user)
        print(f"Post-Sentinel User Status: '{test_user.linkedin_cookie_status}', Checked At: {test_user.linkedin_cookie_checked_at}")
        assert test_user.linkedin_cookie_checked_at is not None
        print("[PASSED] Pre-Automation Health Sentinel Passed!")

    finally:
        db.close()

    print("\n[SUCCESS] All User LinkedIn Cookie & Sentinel tests passed!")


if __name__ == "__main__":
    asyncio.run(test_cookie_system())
