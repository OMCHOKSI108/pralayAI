from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class MemoryCreate(BaseModel):
    key: str
    value: str
    type: str = "fact"
    conversation_id: Optional[str] = None
    source: str = "explicit"


class MemoryUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None
    confidence: Optional[float] = None


class MemoryResponse(BaseModel):
    id: str
    user_id: str
    conversation_id: Optional[str]
    type: str
    key: str
    value: str
    confidence: float
    source: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemoryListResponse(BaseModel):
    memories: List[MemoryResponse]
    total: int


class MemoryUsedResponse(BaseModel):
    used: bool
    memories: List[MemoryResponse]

    class Config:
        from_attributes = True


class MemoryToggleRequest(BaseModel):
    enabled: bool


class MemorySettingsResponse(BaseModel):
    enabled: bool
    total_memories: int
    last_used: Optional[datetime] = None
