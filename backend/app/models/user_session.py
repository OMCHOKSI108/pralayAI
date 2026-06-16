import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

SESSION_EXPIRE_DAYS = 30


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    token: Mapped[str] = mapped_column(
        String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRE_DAYS),
        nullable=False,
    )

    user = relationship("User", back_populates="sessions")
