from typing import List, Optional

from app.schemas.enhanced_chat_schema import CitationInfo


def create_citation(title: str, url: Optional[str] = None,
                    snippet: Optional[str] = None,
                    relevance: float = 0.5,
                    source_type: str = "web") -> CitationInfo:
    return CitationInfo(
        title=title,
        url=url,
        snippet=snippet,
        relevance=relevance,
        source_type=source_type,
    )


def format_citations_as_text(citations: List[CitationInfo]) -> str:
    if not citations:
        return ""
    lines = ["\n\n**References:**"]
    for i, c in enumerate(citations, 1):
        url_part = f" ({c.url})" if c.url else ""
        lines.append(f"{i}. {c.title}{url_part}")
    return "\n".join(lines)


def format_citations_as_footer(citations: List[CitationInfo]) -> str:
    if not citations:
        return ""
    lines = ["\n\n---", "**Sources:**"]
    for c in citations:
        parts = [f"- {c.title}"]
        if c.url:
            parts.append(f"[link]({c.url})")
        if c.relevance > 0:
            parts.append(f"(confidence: {c.relevance:.0%})")
        lines.append(" ".join(parts))
    return "\n".join(lines)
