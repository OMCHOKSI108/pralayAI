import hashlib
import logging
import secrets

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.user_session import UserSession
from app.schemas.auth_schema import LoginRequest, RegisterRequest

logger = logging.getLogger("pralayai.auth")


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}:{key.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, key_hex = hashed.split(":", 1)
        key = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100_000)
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


def create_user(db: Session, request: RegisterRequest) -> User:
    if db.query(User).filter(User.email == request.email).first():
        logger.warning("Registration failed: email already registered - %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    if db.query(User).filter(User.username == request.username).first():
        logger.warning("Registration failed: username taken - %s", request.username)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken",
        )
    user = User(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("User registered: id=%s username=%s email=%s", user.id, user.username, user.email)
    return user


def authenticate_user(db: Session, request: LoginRequest) -> User:
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        logger.warning("Login failed: invalid credentials for %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    logger.info("User logged in: id=%s email=%s", user.id, user.email)
    return user


def create_session(db: Session, user_id: str) -> UserSession:
    session = UserSession(user_id=user_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    logger.debug("Session created: user_id=%s token=%s...", user_id, session.token[:12])
    return session


def delete_session(db: Session, token: str) -> None:
    db.query(UserSession).filter(UserSession.token == token).delete()
    db.commit()
    logger.debug("Session deleted: token=%s...", token[:12])
