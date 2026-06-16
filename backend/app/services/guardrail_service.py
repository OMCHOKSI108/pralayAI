import re
from typing import List, Optional, Tuple

from app.schemas.enhanced_chat_schema import CitationInfo, ProcessSummary


_URL_PATTERN = re.compile(r"https?://[^\s<>\"']+|www\.[^\s<>\"']+")
_FILE_REF_PATTERN = re.compile(r"(?:in|from|according to)\s+(?:the\s+)?(?:file|document|upload|pdf)\s+[\"']?([^\"'\s]+)", re.IGNORECASE)

# ── Threat intelligence narrative patterns ──────────────────────────────
# These indicate fabricated threat intel narratives the fine-tuned model
# commonly hallucinates.
_THREAT_INTEL_PATTERNS: List[str] = [
    "state-sponsored", "state sponsored",
    "apt28", "apt29", "apt33", "apt34", "apt38", "apt41",
    "fancy bear", "cozy bear", "lazarus group", "kimsuky",
    "kimsuky", "trickbot", "conti", "lockbit",
    "chinese state-sponsored", "russian state-sponsored",
    "iranian state-sponsored", "north korean state-sponsored",
    "group behind the attack",
    "attributed to",
    "believed to be the work of",
    "widely attributed to",
]

# ── Fabricated breach/incident patterns ────────────────────────────────
_FABRICATED_INCIDENT_PATTERNS: List[str] = [
    "suffered a data breach",
    "was hacked by",
    "experienced a security incident",
    "was breached in",
    "suffered a major security breach",
    "data of .+ was exposed",
    "leaked .+ records",
]


def contains_threat_intel_narrative(text: str) -> bool:
    """Check if the text contains fabricated threat intelligence narrative."""
    lower = text.lower()
    for pattern in _THREAT_INTEL_PATTERNS:
        if pattern in lower:
            return True
    return False


def contains_fabricated_incident(text: str) -> bool:
    """Check if text describes a breach/incident without source support."""
    lower = text.lower()
    for pattern in _FABRICATED_INCIDENT_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False


def has_fabricated_attribution(text: str, query: str) -> bool:
    """
    Check if the answer attributes a threat to an entity that was merely
    mentioned in the query (not a known threat actor).
    """
    query_lower = query.lower()
    text_lower = text.lower()

    known_threat_actors = [
        "apt28", "apt29", "apt33", "apt34", "apt38", "apt41",
        "fancy bear", "cozy bear", "lazarus group", "kimsuky",
        "trickbot", "conti", "lockbit", "wizard spider", "ta505",
        "silent librarian", "stonefly", "muddywater", "oilrig",
    ]

    for actor in known_threat_actors:
        if actor in text_lower and actor not in query_lower:
            if "are groups that" in text_lower or "types of threat actors" in text_lower:
                continue
            return True

    return False


def check_hallucination_risk(answer: str,
                              citations: List[CitationInfo],
                              rag_context_used: bool,
                              web_sources_used: bool,
                              query: str = "") -> Tuple[bool, List[str]]:
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

    if contains_threat_intel_narrative(answer) and not web_sources_used and not rag_context_used:
        issues.append("Answer contains threat intelligence narrative without verified sources")
        return True, issues

    if has_fabricated_attribution(answer, query):
        issues.append("Answer attributes threat activity to actor not mentioned in query")
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
