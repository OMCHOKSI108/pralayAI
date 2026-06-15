import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.conversation import Conversation
from app.models.user import User
from app.schemas.conversation_schema import (
    ConversationCreate,
    ConversationDetailOut,
    ConversationListOut,
    ConversationUpdate,
)
from app.services.auth_dependency import get_current_user

logger = logging.getLogger("pralayai.conversation_routes")

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("", response_model=list[ConversationListOut])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    search: str = Query("", max_length=100),
    pinned_only: bool = Query(False),
):
    q = db.query(Conversation).filter(Conversation.user_id == current_user.id)
    if pinned_only:
        q = q.filter(Conversation.pinned == True)
    if search:
        q = q.filter(Conversation.title.ilike(f"%{search}%"))
    return q.order_by(Conversation.pinned.desc(), Conversation.updated_at.desc()).all()


@router.post("", response_model=ConversationListOut)
def create_conversation(
    body: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conv = Conversation(title=body.title, user_id=current_user.id)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/{conversation_id}", response_model=ConversationListOut)
def update_conversation(
    conversation_id: str,
    body: ConversationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    update_data = body.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(conversation, key, value)

    db.commit()
    db.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conversation)
    db.commit()
    return {"status": "deleted", "conversation_id": conversation_id}
