import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from src.models.database import get_db
from src.models.user_account import UserAccount
from src.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_user,
    get_admin_credentials,
    STATIC_ADMIN_ID
)
from src.services.linkedin_service import linkedin_service

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LinkedInCookieRequest(BaseModel):
    linkedin_cookie: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user.
    If credentials match static Admin in .env (ADMIN_EMAIL / ADMIN_PS), authenticates directly without database check.
    Otherwise authenticates regular users against the database.
    """
    email_clean = request.email.strip().lower()
    pass_clean = request.password.strip()
    admin_email, admin_pass = get_admin_credentials()

    # 1. Static Admin Authentication (From .env, Not stored in database)
    if email_clean == admin_email.lower() and pass_clean == admin_pass:
        access_token = create_access_token(data={
            "sub": STATIC_ADMIN_ID,
            "email": admin_email,
            "role": "admin"
        })
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": STATIC_ADMIN_ID,
                "email": admin_email,
                "role": "admin",
                "is_active": True,
                "has_linkedin_cookie": False,
                "linkedin_cookie_status": "unconfigured"
            }
        }

    # 2. Database User Authentication
    user = db.query(UserAccount).filter(UserAccount.email == email_clean).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Only registered users authorized by admin can log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account access has been revoked or deactivated by the administrator.",
        )
        
    access_token = create_access_token(data={
        "sub": user.id,
        "email": user.email,
        "role": user.role
    })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/me")
def get_me(current_user: UserAccount = Depends(get_current_user)):
    """
    Retrieve details of the currently authenticated user.
    """
    return {
        "user": current_user.to_dict()
    }

@router.post("/linkedin-cookie")
def update_linkedin_cookie(
    request: LinkedInCookieRequest,
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves and validates the user's personal LinkedIn `li_at` cookie.
    Validates immediately against LinkedIn servers.
    """
    cookie = request.linkedin_cookie.strip()
    if not cookie:
        raise HTTPException(status_code=400, detail="LinkedIn cookie cannot be empty.")

    # 1. Live Validation
    val_result = linkedin_service.validate_cookie(cookie)
    cookie_status = val_result.get("status", "invalid")
    is_valid = val_result.get("valid", False)

    # 2. Save on UserAccount if user is a DB user
    if current_user.id != STATIC_ADMIN_ID:
        user = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
        if user:
            user.linkedin_cookie = cookie
            user.linkedin_cookie_status = cookie_status
            user.linkedin_cookie_checked_at = datetime.datetime.utcnow()
            db.commit()

    return {
        "status": "success" if is_valid else "warning",
        "valid": is_valid,
        "cookie_status": cookie_status,
        "message": val_result.get("message", "Cookie updated.")
    }

@router.get("/linkedin-cookie-status")
def check_linkedin_cookie_status(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs a live health check on the currently authenticated user's stored LinkedIn cookie.
    """
    if current_user.id == STATIC_ADMIN_ID:
        val = linkedin_service.validate_cookie()
        return {
            "has_cookie": bool(val.get("status") == "active"),
            "cookie_status": val.get("status", "unconfigured"),
            "valid": val.get("valid", False),
            "message": val.get("message")
        }

    user = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
    if not user or not user.linkedin_cookie:
        return {
            "has_cookie": False,
            "cookie_status": "unconfigured",
            "valid": False,
            "message": "No LinkedIn cookie configured."
        }

    val = linkedin_service.validate_cookie(user.linkedin_cookie)
    new_status = val.get("status", "invalid")

    user.linkedin_cookie_status = new_status
    user.linkedin_cookie_checked_at = datetime.datetime.utcnow()
    db.commit()

    return {
        "has_cookie": True,
        "cookie_status": new_status,
        "valid": val.get("valid", False),
        "message": val.get("message"),
        "last_checked_at": user.linkedin_cookie_checked_at.isoformat() if user.linkedin_cookie_checked_at else None
    }

@router.delete("/linkedin-cookie")
def delete_linkedin_cookie(
    current_user: UserAccount = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnects and removes the user's stored LinkedIn cookie.
    """
    if current_user.id != STATIC_ADMIN_ID:
        user = db.query(UserAccount).filter(UserAccount.id == current_user.id).first()
        if user:
            user.linkedin_cookie = None
            user.linkedin_cookie_status = "unconfigured"
            user.linkedin_cookie_checked_at = datetime.datetime.utcnow()
            db.commit()

    return {
        "status": "success",
        "message": "LinkedIn cookie removed. System will use public stealth dorking."
    }
