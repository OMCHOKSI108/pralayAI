import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ResearchSource(Base):
    __tablename__ = "research_sources"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    snippet: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    relevance: Mapped[float] = mapped_column(Float, default=0.0)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, default="web")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
