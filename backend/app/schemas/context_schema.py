from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ContextOut(BaseModel):
    id: str
    session_id: str
    summary: Optional[str] = None
    user_goal: Optional[str] = None
    current_topic: Optional[str] = None
    important_facts: Optional[str] = None
    preferred_style: Optional[str] = None
    language: str = "english"
    skill_used: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContextUpdate(BaseModel):
    summary: Optional[str] = None
    user_goal: Optional[str] = None
    current_topic: Optional[str] = None
    important_facts: Optional[str] = None
    preferred_style: Optional[str] = None
    language: Optional[str] = None
    skill_used: Optional[str] = None


class ContextRefresh(BaseModel):
    message: str
    response: str
    skill: Optional[str] = None
