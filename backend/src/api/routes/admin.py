from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.models.database import get_db
from src.models.user_account import UserAccount
from src.services.auth_service import require_admin, get_current_user, hash_password

router = APIRouter(prefix="/api/v1/admin", tags=["Admin User Management"])

class CreateUserRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = "user"  # "admin" or "user"
    is_active: Optional[bool] = True

class ResetPasswordRequest(BaseModel):
    new_password: str

@router.get("/users")
def list_all_users(
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    List all registered user accounts with their roles and active status (Admin only).
    """
    users = db.query(UserAccount).order_by(UserAccount.created_at.desc()).all()
    return [u.to_dict() for u in users]

@router.post("/users")
def create_user(
    request: CreateUserRequest,
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin creates a new user account with email, password, and assigned role.
    """
    email_clean = request.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
        
    if not request.password or len(request.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    # Check if user already exists
    existing = db.query(UserAccount).filter(UserAccount.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User with email '{email_clean}' already exists.")

    assigned_role = "admin" if request.role == "admin" else "user"
    new_user = UserAccount(
        email=email_clean,
        password_hash=hash_password(request.password),
        role=assigned_role,
        is_active=request.is_active if request.is_active is not None else True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "status": "success",
        "message": f"User account '{email_clean}' created successfully with role '{assigned_role}'.",
        "user": new_user.to_dict()
    }

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: str,
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Toggle active / deactivated status for a user (Admin only).
    """
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own admin account.")
        
    user.is_active = not user.is_active
    db.commit()
    
    status_text = "activated" if user.is_active else "deactivated"
    return {
        "status": "success",
        "message": f"User '{user.email}' has been {status_text}.",
        "user": user.to_dict()
    }

@router.patch("/users/{user_id}/password")
def reset_user_password(
    user_id: str,
    request: ResetPasswordRequest,
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Reset a user's password (Admin only).
    """
    if not request.new_password or len(request.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = hash_password(request.new_password)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Password for user '{user.email}' updated successfully."
    }

@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user account and all associated email automations (Admin only).
    """
    user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account.")
        
    # Delete all associated email alerts and automations for this user
    from src.models.email_alert import EmailAlert
    db.query(EmailAlert).filter(
        (EmailAlert.user_id == user.id) | (EmailAlert.email == user.email)
    ).delete(synchronize_session=False)

    db.delete(user)
    db.commit()
    
    return {
        "status": "success",
        "message": f"User '{user.email}' and all associated automations deleted successfully."
    }

class ToggleBackgroundCheckRequest(BaseModel):
    enabled: Optional[bool] = None

@router.get("/settings/background-check")
def get_background_check_status(
    db: Session = Depends(get_db)
):
    """
    Get the global background check (continuous job discovery) status.
    """
    from src.services.scheduler_service import scheduler_service
    from src.models.system_setting import SystemSetting
    from src.config import settings

    enabled = scheduler_service.is_background_discovery_enabled()
    interval = getattr(settings, "BACKGROUND_DISCOVERY_INTERVAL_MINUTES", 60)
    setting = db.query(SystemSetting).filter(SystemSetting.key == "background_discovery_enabled").first()

    return {
        "enabled": enabled,
        "interval_minutes": interval,
        "status_text": "ACTIVE" if enabled else "STOPPED",
        "description": "Continuous background crawler crawls platforms every 1 hour and persists fresh jobs to database." if enabled else "Background check is STOPPED for everyone. Results will only be fetched when users actively search on-demand.",
        "updated_at": setting.updated_at.isoformat() if setting and setting.updated_at else None,
        "updated_by": setting.updated_by if setting else "system_default"
    }

@router.post("/settings/background-check/toggle")
def toggle_background_check(
    request: Optional[ToggleBackgroundCheckRequest] = None,
    admin: UserAccount = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin control to STOP or START background check (continuous job discovery) for everyone.
    When STOPPED:
    - Periodic background crawler is completely disabled.
    - Zero background bandwidth and instance hours consumed.
    - Jobs are ONLY fetched when a user actively searches on the website.
    """
    from src.services.scheduler_service import scheduler_service

    current_val = scheduler_service.is_background_discovery_enabled()
    new_val = not current_val if (request is None or request.enabled is None) else request.enabled

    scheduler_service.set_background_discovery_enabled(new_val, updated_by=admin.email)

    msg = (
        "Background job crawler has been STOPPED. Continuous platform scraping is paused to conserve resources. Scheduled daily email automation and on-demand user searches remain fully functional."
        if not new_val else
        "Background job crawler has been ENABLED. Continuous platform job discovery will run periodically in the background."
    )

    return {
        "status": "success",
        "enabled": new_val,
        "status_text": "ACTIVE" if new_val else "STOPPED",
        "message": msg
    }

