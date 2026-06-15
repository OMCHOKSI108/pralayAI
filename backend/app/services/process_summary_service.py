from typing import List, Optional

from app.schemas.enhanced_chat_schema import CitationInfo, ProcessSummary


def build_process_summary(
    skill: str,
    query: str,
    memory_used: bool = False,
    rag_used: bool = False,
    web_used: bool = False,
    num_sources: int = 0,
    assumptions: Optional[List[str]] = None,
    limitations: Optional[List[str]] = None,
    confidence: str = "high",
) -> ProcessSummary:
    reasoning = _build_reasoning_summary(skill, query, rag_used, web_used, memory_used)

    return ProcessSummary(
        skill=skill,
        memory_used=memory_used,
        rag_used=rag_used,
        web_used=web_used,
        num_sources=num_sources,
        assumptions=assumptions or [],
        limitations=limitations or [],
        confidence=confidence,
        reasoning_summary=reasoning,
    )


def _build_reasoning_summary(skill: str, query: str, rag_used: bool,
                              web_used: bool, memory_used: bool) -> str:
    parts = [f"Selected skill: {skill}"]
    parts.append(f"Understood user asked about: {query[:100]}")

    if memory_used:
        parts.append("Relevant user memory was retrieved and considered")
    if rag_used:
        parts.append("Retrieved context from uploaded documents")
    if web_used:
        parts.append("Searched web sources for current information")

    if not rag_used and not web_used:
        parts.append("Answered from general knowledge")

    return ". ".join(parts) + "."


def format_process_summary_for_sss(summary: ProcessSummary) -> dict:
    return {
        "skill": summary.skill,
        "memory_used": summary.memory_used,
        "rag_used": summary.rag_used,
        "web_used": summary.web_used,
        "num_sources": summary.num_sources,
        "assumptions": summary.assumptions,
        "limitations": summary.limitations,
        "confidence": summary.confidence,
        "reasoning_summary": summary.reasoning_summary,
    }
