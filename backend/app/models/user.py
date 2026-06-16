import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(20), nullable=False, default="english")
    answer_style: Mapped[str] = mapped_column(String(255), nullable=False, default="{}")
    thinking_level: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")
    theme: Mapped[str] = mapped_column(String(10), nullable=False, default="dark")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    sessions = relationship(
        "UserSession", back_populates="user", cascade="all, delete-orphan"
    )
