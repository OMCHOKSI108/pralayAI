from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.user_session import UserSession

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    session = (
        db.query(UserSession)
        .filter(
            UserSession.token == token,
            UserSession.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
        )
    return session.user
