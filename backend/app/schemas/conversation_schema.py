from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    status: Optional[str] = None
    model_used: Optional[str] = None
    skill_used: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationListOut(BaseModel):
    id: str
    title: str
    pinned: bool = False
    archived: bool = False
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetailOut(BaseModel):
    id: str
    title: str
    pinned: bool = False
    archived: bool = False
    message_count: int = 0
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut]

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    title: str = "New Chat"


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None
