import json
import logging
import secrets
import string
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.password_reset import PasswordReset
from app.models.user import User
from app.schemas.auth_schema import (
    AuthResponse,
    ChangePasswordRequest,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetStatus,
    PasswordResetVerify,
    RegisterRequest,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_dependency import get_current_user, security
from app.services.auth_service import (
    authenticate_user,
    create_session,
    create_user,
    delete_session,
    hash_password,
)
from app.services.email_service import send_otp_email

logger = logging.getLogger("pralayai.auth_routes")

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def _generate_otp(length=6) -> str:
    return "".join(secrets.choice(string.digits) for _ in range(length))


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    user = create_user(db, request)
    session = create_session(db, user.id)
    return AuthResponse(token=session.token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request)
    session = create_session(db, user.id)
    return AuthResponse(token=session.token, user=UserResponse.model_validate(user))


@router.post("/password-reset/request", response_model=PasswordResetStatus)
async def password_reset_request(
    request: PasswordResetRequest, db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        logger.info("Password reset request: email not found (silent) - %s", request.email)
        return PasswordResetStatus(status="ok", message="If the email exists, an OTP has been sent.")

    db.query(PasswordReset).filter(
        PasswordReset.email == request.email,
        PasswordReset.completed == False,
    ).delete()

    otp = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_OTP_EXPIRY_MINUTES)

    reset = PasswordReset(
        email=request.email,
        reset_token=secrets.token_urlsafe(32),
        otp=otp,
        otp_expires_at=expires_at,
    )
    db.add(reset)
    db.commit()

    email_sent = await send_otp_email(request.email, otp)
    if not email_sent:
        logger.error("Password reset request: email send failed for %s", request.email)
        db.delete(reset)
        db.commit()
        raise HTTPException(status_code=502, detail="Failed to send OTP email")

    logger.info("Password reset OTP sent: email=%s", request.email)
    return PasswordResetStatus(status="ok", message="OTP sent to your email.")


@router.post("/password-reset/verify", response_model=AuthResponse)
def password_reset_verify(
    request: PasswordResetVerify, db: Session = Depends(get_db)
):
    reset = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.email == request.email,
            PasswordReset.completed == False,
            PasswordReset.otp == request.otp,
            PasswordReset.otp_expires_at > datetime.now(timezone.utc),
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )
    if not reset:
        logger.warning("Password reset verify: invalid/expired OTP for %s", request.email)
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    reset.completed = True
    db.commit()

    logger.info("Password reset auto-login: user_id=%s email=%s", user.id, user.email)
    session = create_session(db, user.id)
    return AuthResponse(token=session.token, user=UserResponse.model_validate(user))


@router.post("/password-reset/confirm", response_model=AuthResponse)
def password_reset_confirm(
    request: PasswordResetConfirm, db: Session = Depends(get_db)
):
    reset = (
        db.query(PasswordReset)
        .filter(
            PasswordReset.email == request.email,
            PasswordReset.completed == False,
            PasswordReset.otp == request.otp,
            PasswordReset.otp_expires_at > datetime.now(timezone.utc),
        )
        .order_by(PasswordReset.created_at.desc())
        .first()
    )
    if not reset:
        logger.warning("Password reset confirm: invalid/expired OTP for %s", request.email)
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please restart.")

    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.password_hash = hash_password(request.new_password)
    reset.completed = True
    db.commit()

    logger.info("Password reset completed: user_id=%s email=%s", user.id, user.email)
    session = create_session(db, user.id)
    return AuthResponse(token=session.token, user=UserResponse.model_validate(user))


@router.put("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.password_hash = hash_password(request.new_password)
    db.commit()

    logger.info("Password changed: user_id=%s", current_user.id)
    return {"status": "password_changed"}


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    delete_session(db, credentials.credentials)
    return {"status": "logged out"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if (
        db.query(User)
        .filter(User.username == request.username, User.id != current_user.id)
        .first()
    ):
        raise HTTPException(status_code=409, detail="Username already taken")

    current_user.username = request.username
    current_user.preferred_language = request.preferred_language
    current_user.answer_style = request.answer_style
    current_user.thinking_level = request.thinking_level
    current_user.theme = request.theme
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
