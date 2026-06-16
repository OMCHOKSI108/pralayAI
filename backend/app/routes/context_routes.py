import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.chat_context import ChatContext
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.context_schema import ContextOut, ContextRefresh, ContextUpdate
from app.services.auth_dependency import get_current_user

logger = logging.getLogger("pralayai.context_routes")

router = APIRouter(prefix="/api/chat/sessions", tags=["Context"])


def _get_or_create_context(db: Session, session_id: str) -> ChatContext:
    ctx = db.query(ChatContext).filter(ChatContext.session_id == session_id).first()
    if not ctx:
        ctx = ChatContext(session_id=session_id, language="english")
        db.add(ctx)
        db.commit()
        db.refresh(ctx)
    return ctx


@router.get("/{session_id}/context", response_model=ContextOut)
def get_context(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == session_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")
    return _get_or_create_context(db, session_id)


@router.patch("/{session_id}/context", response_model=ContextOut)
def update_context(
    session_id: str,
    body: ContextUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == session_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")

    ctx = _get_or_create_context(db, session_id)
    update_data = body.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(ctx, key, value)
    ctx.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ctx)
    return ctx


@router.post("/{session_id}/context/refresh", response_model=ContextOut)
def refresh_context(
    session_id: str,
    body: ContextRefresh,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = db.query(Conversation).filter(
        Conversation.id == session_id,
        Conversation.user_id == current_user.id,
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")

    ctx = _get_or_create_context(db, session_id)
    ctx.skill_used = body.skill or ctx.skill_used
    if body.message:
        ctx.current_topic = body.message[:255]
    ctx.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ctx)
    return ctx
