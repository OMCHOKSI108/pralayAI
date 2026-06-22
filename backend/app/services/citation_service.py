from typing import Optional, Sequence
from app.schemas.enhanced_chat_schema import CitationInfo

def create_citation(
    title: str, 
    url: Optional[str] = None,
    snippet: Optional[str] = None,
    relevance: float = 0.5,
    source_type: str = "web"
) -> CitationInfo:
    """
    Factory function to create a CitationInfo object with sanitized inputs.
    """
    # Clamp relevance between 0.0 and 1.0 to ensure valid percentage outputs later
    clamped_relevance = max(0.0, min(1.0, relevance))
    
    return CitationInfo(
        title=title.strip() if title else "Untitled Source",
        url=url.strip() if url else None,
        snippet=snippet.strip() if snippet else None,
        relevance=clamped_relevance,
        source_type=source_type,
    )

def format_citations_as_text(citations: Sequence[CitationInfo]) -> str:
    """
    Formats a sequence of citations into a plain text numbered list.
    """
    if not citations:
        return ""
        
    lines = ["\n\n**References:**"]
    
    for i, c in enumerate(citations, 1):
        # Fallback for missing titles
        display_title = c.title.strip() if c.title else "Untitled Source"
        url_part = f" ({c.url.strip()})" if c.url else ""
        
        lines.append(f"{i}. {display_title}{url_part}")
        
    return "\n".join(lines)

def format_citations_as_footer(citations: Sequence[CitationInfo]) -> str:
    """
    Formats a sequence of citations into a Markdown footer with clickable links 
    and formatted confidence scores.
    """
    if not citations:
        return ""
        
    lines = ["\n\n---", "**Sources:**"]
    
    for c in citations:
        display_title = c.title.strip() if c.title else "Untitled Source"
        
        # Idiomatic Markdown: Make the title itself the clickable link
        if c.url:
            line_content = f"- [{display_title}]({c.url.strip()})"
        else:
            line_content = f"- {display_title}"
            
        # Append confidence score if it exists and is greater than 0
        if c.relevance is not None and c.relevance > 0:
            line_content += f" (confidence: {c.relevance:.0%})"
            
        lines.append(line_content)
        
    return "\n".join(lines)
