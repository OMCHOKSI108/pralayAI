import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    reset_token: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    otp: Mapped[str] = mapped_column(String(6), nullable=True)
    new_password_hash: Mapped[str] = mapped_column(String(255), nullable=True)
    otp_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
