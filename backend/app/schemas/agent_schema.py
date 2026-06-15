from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ToolCallOut(BaseModel):
    id: str
    tool_name: str
    input_data: Optional[str]
    output_data: Optional[str]
    status: str
    latency_ms: Optional[int]

    class Config:
        from_attributes = True


class ResearchSourceOut(BaseModel):
    id: str
    url: str
    title: Optional[str]
    snippet: Optional[str]
    relevance: float
    source_type: str

    class Config:
        from_attributes = True


class AgentRunOut(BaseModel):
    id: str
    skill: str
    reason: Optional[str]
    confidence: Optional[float]
    limitations: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AgentRunDetailOut(BaseModel):
    id: str
    skill: str
    reason: Optional[str]
    confidence: Optional[float]
    limitations: Optional[str]
    status: str
    created_at: datetime
    tool_calls: List[ToolCallOut] = []
    research_sources: List[ResearchSourceOut] = []

    class Config:
        from_attributes = True
