import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )

    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    skill_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False,
    )

    conversation = relationship("Conversation", back_populates="messages")

    feedback_items = relationship(
        "Feedback", back_populates="message", cascade="all, delete-orphan",
    )
