import os
import hashlib
import hmac
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.models.database import get_db
from src.models.user_account import UserAccount
from src.config import settings

STATIC_ADMIN_ID = "admin-static-jobhunt"

import secrets

def get_admin_credentials() -> Tuple[str, str]:
    """
    Fetch static admin credentials dynamically from .env settings.
    """
    admin_email = getattr(settings, "ADMIN_EMAIL", None) or os.getenv("ADMIN_EMAIL", "jobhuntadmin@gmail.com")
    admin_pass = getattr(settings, "ADMIN_PS", None) or getattr(settings, "ADMIN_PASSWORD", None) or os.getenv("ADMIN_PS") or os.getenv("ADMIN_PASSWORD", "")
    return str(admin_email).lower().strip(), str(admin_pass).strip()

# JWT configuration
_configured_jwt = getattr(settings, "JWT_SECRET", None) or os.getenv("JWT_SECRET")
if not _configured_jwt:
    _runtime_key = os.environ.get("_RUNTIME_JWT_SECRET") or secrets.token_urlsafe(32)
    os.environ["_RUNTIME_JWT_SECRET"] = _runtime_key
    SECRET_KEY = _runtime_key
else:
    SECRET_KEY = _configured_jwt

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """
    Hash a password securely using PBKDF2-HMAC-SHA256 with a unique random salt.
    """
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}:{key}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against the stored PBKDF2 salt:hash.
    """
    if not hashed_password or ":" not in hashed_password:
        return False
    try:
        salt, stored_key = hashed_password.split(":", 1)
        computed_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return hmac.compare_digest(stored_key, computed_key)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> UserAccount:
    """
    FastAPI dependency to retrieve the authenticated user from the Bearer JWT token.
    Supports static superadmin loaded from .env without querying database.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    email = payload.get("email")
    admin_email, _ = get_admin_credentials()

    # Static Admin Check (Bypasses Database for designated static superadmin)
    if user_id == STATIC_ADMIN_ID:
        return UserAccount(
            id=STATIC_ADMIN_ID,
            email=admin_email,
            password_hash="",
            role="admin",
            is_active=True
        )

    user = db.query(UserAccount).filter(UserAccount.id == user_id, UserAccount.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def require_admin(
    current_user: UserAccount = Depends(get_current_user)
) -> UserAccount:
    """
    FastAPI dependency to verify that the authenticated user has the 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to access this resource."
        )
    return current_user
