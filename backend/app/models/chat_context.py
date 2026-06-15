import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ChatContext(Base):
    __tablename__ = "chat_contexts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    user_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_topic: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    important_facts: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_style: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="english")
    skill_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
