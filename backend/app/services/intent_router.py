import logging
from typing import Dict, Optional

logger = logging.getLogger("pralayai.intent_router")


def route_intent(
    query: str,
    has_files: bool = False,
    preferred_skill: Optional[str] = None,
) -> Dict:
    if preferred_skill:
        mode = _skill_to_mode(preferred_skill)
        return {
            "mode": mode,
            "reason": f"Skill override: {preferred_skill}",
            "skills_needed": [preferred_skill],
            "needs_citations": mode in ("web_research", "rag_files", "multi_agent"),
            "needs_files": mode == "rag_files",
            "needs_web": mode in ("web_research", "multi_agent"),
            "answer_style": "",
            "thinking_level": "medium",
        }

    query_lower = query.lower()
    code_keywords = ["write code", "implement", "create a function", "debug", "code for", "script to"]
    web_keywords = ["latest", "current", "news", "today", "recent", "search", "cve"]
    definition_starts = ("what is", "what are", "define", "explain", "describe", "what's")

    if any(kw in query_lower for kw in code_keywords) and not query_lower.startswith(definition_starts):
        return {
            "mode": "code_agent",
            "reason": "Query contains code-related keywords",
            "skills_needed": ["code_writer"],
            "needs_citations": False,
            "needs_files": False,
            "needs_web": False,
            "answer_style": "code",
            "thinking_level": "low",
        }

    if query_lower.startswith(definition_starts):
        return {
            "mode": "cybersecurity_model",
            "reason": "Definition/explanation question — fine-tuned model has built-in knowledge",
            "skills_needed": ["general_chat"],
            "needs_citations": False,
            "needs_files": False,
            "needs_web": False,
            "answer_style": "educational",
            "thinking_level": "low",
        }

    if has_files:
        return {
            "mode": "rag_files",
            "reason": "Files available for this session",
            "skills_needed": ["rag_answer"],
            "needs_citations": True,
            "needs_files": True,
            "needs_web": False,
            "answer_style": "detailed",
            "thinking_level": "medium",
        }

    if any(kw in query_lower for kw in web_keywords):
        return {
            "mode": "web_research",
            "reason": "Query asks for current/recent information",
            "skills_needed": ["web_research"],
            "needs_citations": True,
            "needs_files": False,
            "needs_web": True,
            "answer_style": "detailed",
            "thinking_level": "medium",
        }

    if len(query.split()) > 20:
        return {
            "mode": "multi_agent",
            "reason": "Long/complex query — may benefit from multiple skills",
            "skills_needed": ["general_chat", "web_research"],
            "needs_citations": True,
            "needs_files": False,
            "needs_web": True,
            "answer_style": "structured",
            "thinking_level": "high",
        }

    return {
        "mode": "cybersecurity_model",
        "reason": "General query — using fine-tuned cybersecurity model directly",
        "skills_needed": ["general_chat"],
        "needs_citations": False,
        "needs_files": False,
        "needs_web": False,
        "answer_style": "conversational",
        "thinking_level": "low",
    }


def _skill_to_mode(skill: str) -> str:
    mapping = {
        "web_research": "web_research",
        "deep_research": "web_research",
        "code_writer": "code_agent",
        "code_debugger": "code_agent",
        "rag_answer": "rag_files",
        "general_chat": "cybersecurity_model",
        "memory_manager": "direct_llm",
    }
    return mapping.get(skill, "cybersecurity_model")
