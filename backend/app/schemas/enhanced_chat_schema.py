from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CitationInfo(BaseModel):
    title: str
    url: Optional[str] = None
    snippet: Optional[str] = None
    relevance: float = 0.0
    source_type: str = "web"


class ProcessSummary(BaseModel):
    skill: str = "general_chat"
    memory_used: bool = False
    rag_used: bool = False
    web_used: bool = False
    num_sources: int = 0
    assumptions: List[str] = []
    limitations: List[str] = []
    confidence: str = "high"
    reasoning_summary: str = ""


class EnhancedChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    conversation_id: Optional[str] = None
    max_new_tokens: int = Field(default=300, ge=1, le=2000)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    skill_override: Optional[str] = None


class EnhancedChatResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    assistant_message: str
    status: str
    latency_seconds: float
    source: str
    skill: str = "general_chat"
    process: Optional[ProcessSummary] = None
    citations: List[CitationInfo] = []
    memories_used: List[Dict[str, Any]] = []
