import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.message import Message
from app.models.user import User
from app.services.auth_dependency import get_current_user

logger = logging.getLogger("pralayai.token_routes")

router = APIRouter(prefix="/api/tokens", tags=["Tokens"])


@router.get("/usage")
def token_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            cast(Message.created_at, Date).label("date"),
            func.sum(Message.tokens_used).label("total_tokens"),
            func.count(Message.id).label("message_count"),
        )
        .filter(
            Message.role == "assistant",
            Message.tokens_used.isnot(None),
        )
        .group_by(cast(Message.created_at, Date))
        .order_by(cast(Message.created_at, Date))
        .all()
    )
    data = [
        {
            "date": str(r.date),
            "total_tokens": int(r.total_tokens),
            "message_count": int(r.message_count),
        }
        for r in rows
    ]
    return {"usage": data}
