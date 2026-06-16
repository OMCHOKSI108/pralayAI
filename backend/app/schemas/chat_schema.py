from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    conversation_id: Optional[str] = None
    max_new_tokens: int = Field(default=512, ge=1, le=1000)
    temperature: float = Field(default=0.1, ge=0.0, le=2.0)
    top_p: float = Field(default=0.8, ge=0.0, le=1.0)


class ChatResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    assistant_message: str
    status: str
    latency_seconds: float
    source: str
