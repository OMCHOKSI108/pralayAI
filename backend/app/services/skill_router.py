import re


SKILL_KEYWORDS = {
    "web_research": [
        "latest", "current", "news", "today", "recent", "search for",
        "what is the latest", "find online", "web search", "internet",
        "google", "according to", "website", "reference", "source",
        "link to", "url", "article", "blog post",
    ],
    "deep_research": [
        "deep research", "full report", "compare sources", "market research",
        "research paper", "comprehensive analysis", "in-depth",
        "detailed report", "thorough investigation", "literature review",
        "find companies", "competitive analysis", "industry analysis",
        "write a report", "research report",
    ],
    "code_writer": [
        "write code", "implement", "create a function", "create function",
        "code for", "program to", "script to", "python code", "javascript code",
        "typescript code", "react component", "api endpoint", "sql query",
        "write a program", "generate code", "code snippet", "implementation",
        "debug", "fix bug", "error in", "not working", "refactor",
        "unit test", "test case", "code review",
    ],
    "code_debugger": [
        "debug", "fix this", "error in", "not working", "why is",
        "help me debug", "bug in", "issue with", "stack trace",
        "exception", "failed", "broken",
    ],
    "rag_answer": [
        "uploaded file", "in the document", "according to the file",
        "read the file", "check the document", "what does the file say",
        "from the pdf", "from the document", "uploaded document",
    ],
    "memory_manager": [
        "remember", "what do you know about me", "what do you remember",
        "show my memories", "forget", "delete memory", "clear memory",
        "save this", "from now on",
    ],
    "general_chat": [],
}


def _word_in_query(word: str, query: str) -> bool:
    """Check if word appears as a whole word (not substring of another word)."""
    return bool(re.search(rf"\b{re.escape(word)}\b", query, re.IGNORECASE))


def _is_definition_question(query: str) -> bool:
    """Check if query is asking for a definition/explanation (not code request)."""
    starts = query.lower().startswith
    return (
        starts(("what is", "what are", "what does", "what do", "what was", "what were",
                "define", "explain", "tell me about", "tell me what",
                "describe", "meaning of", "what's", "whats",
                "who is", "who was", "who are"))
    )


def _is_code_request(query: str) -> bool:
    """Check if query is actually asking to write/fix code (not just mentioning a term)."""
    query_lower = query.lower()
    # Must have a code-related whole word AND be an actionable code request
    has_code_word = any(
        _word_in_query(kw, query) for kw in
        ["code", "function", "script", "program", "debug", "api", "sql", "implementation"]
    )
    if not has_code_word:
        return False
    # If it's a definition question, it's asking about a concept, not writing code
    if _is_definition_question(query):
        return False
    # Must start with a code-action verb or contain code-action keywords
    code_action_patterns = [
        "write", "create", "implement", "generate", "build", "make",
        "fix", "debug", "refactor", "optimize", "convert", "transform",
        "show code", "code for", "example of", "how to code",
    ]
    return any(p in query_lower for p in code_action_patterns)


def route_skill(query: str) -> str:
    query_lower = query.lower().strip()

    for skill, keywords in SKILL_KEYWORDS.items():
        if not keywords:
            continue
        for kw in keywords:
            if kw in query_lower:
                return skill

    is_question = query_lower.startswith(("what", "how", "why", "when", "where", "who", "can", "is", "are", "do", "does", "explain", "describe", "define"))
    is_code_request = _is_code_request(query)
    is_research = len(query.split()) > 15

    if is_code_request:
        return "code_writer"
    if is_research:
        return "deep_research"
    if is_question:
        return "web_research"

    return "general_chat"
