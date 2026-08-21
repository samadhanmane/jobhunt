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

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

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
                "is_active": True
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
