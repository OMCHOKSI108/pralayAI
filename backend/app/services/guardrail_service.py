import re
from typing import List, Optional, Tuple

from app.schemas.enhanced_chat_schema import CitationInfo, ProcessSummary


_URL_PATTERN = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+")
_FILE_REF_PATTERN = re.compile(r"(?:in|from|according to)\s+(?:the\s+)?(?:file|document|upload|pdf)\s+[\"']?([^\"'\s]+)", re.IGNORECASE)


def check_hallucination_risk(answer: str,
                              citations: List[CitationInfo],
                              rag_context_used: bool,
                              web_sources_used: bool) -> Tuple[bool, List[str]]:
    issues = []
    has_urls = bool(_URL_PATTERN.search(answer))
    has_file_refs = bool(_FILE_REF_PATTERN.search(answer))

    if has_urls and not web_sources_used:
        issues.append("Answer contains URLs but no web research was performed")
        return True, issues

    if has_file_refs and not rag_context_used:
        issues.append("Answer references documents but no RAG context was provided")
        return True, issues

    if "according to my research" in answer.lower() and not web_sources_used and not rag_context_used:
        issues.append("Claims research was done but no sources were used")
        return True, issues

    if citations and not rag_context_used and not web_sources_used:
        issues.append("Citations present but no sources were retrieved")
        return True, issues

    return False, issues


def get_confidence_level(citations: List[CitationInfo],
                          rag_context_used: bool,
                          web_sources_used: bool,
                          is_safety_blocked: bool) -> str:
    if is_safety_blocked:
        return "high"
    if rag_context_used or web_sources_used:
        if citations:
            return "high"
        return "medium"
    return "medium"


def add_uncertainty_disclaimer(answer: str, confidence: str) -> str:
    if confidence == "low":
        disclaimer = (
            "\n\n> **Note:** I have limited information to answer this accurately. "
            "Please verify with additional sources or provide more context."
        )
        if disclaimer not in answer:
            answer += disclaimer
    elif confidence == "medium":
        disclaimer = (
            "\n\n> **Note:** This answer is based on general knowledge. "
            "For critical decisions, please verify with authoritative sources."
        )
        if disclaimer not in answer:
            answer += disclaimer
    return answer


def verify_citation_integrity(citations: List[CitationInfo]) -> List[CitationInfo]:
    verified = []
    for c in citations:
        if c.url and not c.url.startswith("http"):
            continue
        if not c.title and not c.snippet:
            continue
        verified.append(c)
    return verified
