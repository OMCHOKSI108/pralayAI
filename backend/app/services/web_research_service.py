import asyncio
import re
from typing import List, Optional

import httpx
from bs4 import BeautifulSoup

from app.config import settings
from app.schemas.enhanced_chat_schema import CitationInfo


class WebResearchError(Exception):
    pass


CYBERSEC_KEYWORDS = [
    "ransomware", "malware", "phishing", "vulnerability", "cve", "exploit",
    "cyber", "attack", "threat", "intrusion", "firewall", "siem", "soc",
    "incident response", "penetration test", "pen test", "ethical hacking",
    "zero day", "ddos", "breach", "data leak", "security audit",
    "compliance", "gdpr", "hipaa", "pci dss", "iso 27001", "nist",
    "mitre", "att&ck", "tactic", "technique", "indicator of compromise",
    "ioc", "ttp", "threat hunting", "forensic", "log analysis",
]

MAX_WEB_SOURCES = 8
CYBERSEC_SOURCES = 12


def is_cybersecurity_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in CYBERSEC_KEYWORDS)


async def search_web(query: str, num_results: int = 5) -> List[dict]:
    results = []
    search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.WEB_FETCH_TIMEOUT_MS / 1000, follow_redirects=True) as client:
            response = await client.get(search_url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            for result in soup.select(".result")[:num_results]:
                title_el = result.select_one(".result__title a")
                snippet_el = result.select_one(".result__snippet")

                if title_el:
                    url = title_el.get("href", "")
                    actual_url = _extract_actual_url(url)
                    title = title_el.get_text(strip=True)
                    snippet = snippet_el.get_text(strip=True) if snippet_el else ""
                    if actual_url and title:
                        results.append({
                            "title": title,
                            "url": actual_url,
                            "snippet": snippet,
                        })
    except Exception as e:
        raise WebResearchError(f"Web search failed: {str(e)}")

    return results


async def fetch_page_content(url: str, max_chars: int = 5000) -> Optional[dict]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.WEB_FETCH_TIMEOUT_MS / 1000, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()

            title = soup.title.string.strip() if soup.title else ""
            text = soup.get_text(separator=" ", strip=True)
            text = re.sub(r"\s+", " ", text)[:max_chars]

            return {
                "title": title,
                "url": url,
                "content": text,
            }
    except Exception:
        return None


async def web_research(query: str, max_sources: int = 5) -> List[CitationInfo]:
    search_results = await search_web(query, num_results=max_sources)
    citations = []

    for result in search_results:
        content = await fetch_page_content(result["url"])
        snippet = content["content"][:500] if content else result["snippet"]
        citations.append(CitationInfo(
            title=result["title"],
            url=result["url"],
            snippet=snippet,
            relevance=0.8,
            source_type="web",
        ))

    return citations


async def simple_web_lookup(query: str, max_sources: int = None) -> tuple[str, List[CitationInfo], int]:
    if max_sources is None:
        max_sources = CYBERSEC_SOURCES if is_cybersecurity_query(query) else MAX_WEB_SOURCES
    citations = await web_research(query, max_sources=max_sources)
    if not citations:
        return "", [], 0

    answer_parts = [f"Here is what I found about '{query}':\n"]
    for c in citations:
        answer_parts.append(f"**{c.title}**")
        if c.snippet:
            answer_parts.append(f"> {c.snippet[:300]}")
        if c.url:
            answer_parts.append(f"  Source: {c.url}")
        answer_parts.append("")

    return "\n".join(answer_parts), citations, len(citations)


def _extract_actual_url(url: str) -> Optional[str]:
    match = re.search(r"uddg=(https?%3A[^&]+)", url)
    if match:
        from urllib.parse import unquote
        return unquote(match.group(1))
    if url.startswith("http"):
        return url
    return None
