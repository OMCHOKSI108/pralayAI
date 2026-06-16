import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    message_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    message = relationship(
        "Message",
        back_populates="feedback_items",
    )
