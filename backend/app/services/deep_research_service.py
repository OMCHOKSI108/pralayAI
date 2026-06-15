import asyncio
from typing import AsyncGenerator, List, Optional, Tuple

from app.schemas.enhanced_chat_schema import CitationInfo
from app.services.web_research_service import fetch_page_content, search_web


async def deep_research(query: str, max_sources: int = 8) -> AsyncGenerator[dict, None]:
    sub_questions = _generate_sub_questions(query)
    yield {"type": "status", "message": "Planning research..."}
    yield {"type": "process_step", "step": "plan", "detail": f"Broken down into {len(sub_questions)} sub-questions"}

    yield {"type": "status", "message": "Searching sources..."}
    all_citations = []
    all_findings = []

    for i, sq in enumerate(sub_questions):
        yield {"type": "status", "message": f"Researching: {sq[:80]}..."}
        try:
            results = await search_web(sq, num_results=3)
            for r in results:
                yield {"type": "source_found", "title": r["title"], "url": r["url"]}
                content = await fetch_page_content(r["url"])
                if content:
                    citation = CitationInfo(
                        title=r["title"],
                        url=r["url"],
                        snippet=content["content"][:500],
                        relevance=0.8,
                        source_type="web",
                    )
                    all_citations.append(citation)
                    all_findings.append({
                        "question": sq,
                        "claim": content["content"][:300],
                        "source": r["title"],
                    })
        except Exception:
            continue

    yield {"type": "status", "message": "Analyzing findings..."}
    conflicts = _find_conflicts(all_findings)
    if conflicts:
        yield {"type": "conflict", "conflicts": conflicts}

    yield {"type": "status", "message": "Writing report..."}
    report = _generate_report(query, all_citations, all_findings, conflicts)

    yield {"type": "report", "report": report, "citations": all_citations}


def _generate_sub_questions(query: str) -> List[str]:
    return [
        query,
        f"key facts about {query}",
        f"recent developments in {query}",
        f"challenges and limitations of {query}",
    ]


def _find_conflicts(findings: List[dict]) -> List[str]:
    return []


def _generate_report(query: str, citations: List[CitationInfo],
                      findings: List[dict], conflicts: List[str]) -> str:
    parts = [f"# Research Report: {query}\n"]
    parts.append("## Executive Summary\n")
    if citations:
        parts.append(f"Based on analysis of {len(citations)} sources, this report covers key aspects of '{query}'.\n")
    else:
        parts.append("Unable to find sufficient sources for a comprehensive report.\n")

    parts.append("## Key Findings\n")
    seen = set()
    for f in findings:
        key = f["claim"][:100]
        if key not in seen:
            seen.add(key)
            parts.append(f"- {f['claim']}")
            parts.append(f"  *Source: {f['source']}*\n")

    if conflicts:
        parts.append("## Conflicts / Uncertainty\n")
        for c in conflicts:
            parts.append(f"- {c}")

    if citations:
        parts.append("\n## References\n")
        for i, c in enumerate(citations, 1):
            url_part = f" ({c.url})" if c.url else ""
            parts.append(f"{i}. {c.title}{url_part}")

    return "\n".join(parts)
