"""
Response formatter for PralayAI.

Post-processes raw LLM output to:
  1. Strip model-added generic disclaimers
  2. Add intent-appropriate heading when output has no structure
  3. Apply consistent refusal format for blocked requests
  4. Append a Sources section when citations are present
"""
import re
from typing import List, Union

# ── Disclaimer patterns to remove ─────────────────────────────────────────────
_DISCLAIMER_PATTERNS = [
    r"(?i)note:\s+this\s+(answer|information|response)\s+is\s+based\s+on\s+general\s+knowledge[^.]*\.",
    r"(?i)please\s+(note|be\s+aware)\s+that\s+this\s+information\s+may\s+not\s+be\s+up[\-\s]to[\-\s]date[^.]*\.",
    r"(?i)important\s+disclaimer[^:]*:[^.]*\.",
    r"(?i)for\s+critical\s+decisions?,?\s+please\s+verify[^.]*\.",
    r"(?i)this\s+(is\s+)?for\s+educational\s+purposes\s+only[^.]*\.",
    r"(?i)as\s+an\s+ai\s+(language\s+)?model[,\s][^.]*\.",
    r"(?i)i\s+(am\s+)?just\s+an\s+ai[^.]*\.",
    r"(?i)\*\*note:\*\*\s+this\s+(content|information|answer)[^.]*\.",
    r"(?i)>\s+\*\*note:\*\*\s+this\s+answer\s+is\s+based\s+on\s+general\s+knowledge[^\n]*\n?",
    r"(?i)>\s+\*\*note:\*\*\s+i\s+have\s+limited\s+information[^\n]*\n?",
]

# ── Intent → heading prefix ───────────────────────────────────────────────────
_INTENT_HEADERS = {
    "cybersecurity_concept": "## Cybersecurity Explanation",
    "normal_chat":            "",
    "personal_memory_read":   "## From This Conversation",
    "company_or_person_query": "## Verified Source Required",
    "current_info_query":      "## Live Information Needed",
    "unsafe_cyber_request":    "## I Can't Help With That",
    "prompt_injection":        "## Request Not Allowed",
    "assistant_identity":      "## About PralayAI",
}

# ── Safe-alternative footer for blocked responses ─────────────────────────────
_BLOCKED_FOOTER = """\

### What I Can Help With
- Detecting and preventing attacks
- Incident response and forensics
- Security hardening and best practices
- Log analysis and threat hunting
- OWASP guidance and secure coding
- Testing **your own** systems in a legal lab"""

# ── Response mode instructions injected into the prompt ──────────────────────
RESPONSE_MODE_INSTRUCTIONS = {
    "short": (
        "Keep your answer to 3-5 bullet points only. "
        "No long explanations. Start with the answer directly."
    ),
    "medium": (
        "Use 2-3 short paragraphs or a brief bulleted list. "
        "Include one practical example. "
        "Use markdown headings only if the answer has distinct parts."
    ),
    "detailed": (
        "Structure your answer with these markdown sections where relevant: "
        "## Definition, ## How It Works, ## Real-World Example, "
        "## Practical Steps, ## Common Mistakes, ## Summary. "
        "Be thorough but keep each section concise."
    ),
    "step-by-step": (
        "Explain as a numbered sequence of steps. "
        "Each step must be a clear, actionable instruction. "
        "Add a one-sentence intro and a brief summary at the end."
    ),
    "table": (
        "Organise information into a Markdown table with clear column headers. "
        "Add a one-sentence explanation before and after the table."
    ),
}


def _strip_disclaimers(text: str) -> str:
    for pat in _DISCLAIMER_PATTERNS:
        text = re.sub(pat, "", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _has_structure(text: str) -> bool:
    """True if text already contains markdown headings, bullets, or numbered lists."""
    return bool(re.search(r"^(#{1,4}\s|\*\s|-\s|\d+\.\s)", text, re.MULTILINE))


def _build_sources_section(sources: list) -> str:
    lines = ["\n\n## Sources"]
    for i, src in enumerate(sources, 1):
        if isinstance(src, dict):
            title = src.get("title", f"Source {i}")
            url = src.get("url", "")
        else:
            title = getattr(src, "title", f"Source {i}")
            url = getattr(src, "url", "")
        lines.append(f"{i}. [{title}]({url})" if url else f"{i}. {title}")
    return "\n".join(lines)


def format_response(
    text: str,
    intent: str,
    sources: Union[list, None] = None,
    blocked: bool = False,
    mode: str = "medium",
) -> str:
    """
    Post-process raw model output into clean structured Markdown.

    Parameters
    ----------
    text    : Raw LLM output string.
    intent  : Intent category from pregen_classifier.
    sources : List of CitationInfo objects or dicts with 'title' / 'url'.
    blocked : True for safety-refusal responses.
    mode    : Response style hint (short / medium / detailed / step-by-step / table).
              Informational only at this stage — mode instruction is injected at
              prompt build time.  Formatter uses it for structural decisions.

    Returns
    -------
    Clean Markdown string ready to stream to the frontend.
    """
    sources = sources or []
    cleaned = _strip_disclaimers(text)

    # ── Blocked / refusal ──────────────────────────────────────────────────────
    if blocked:
        if not cleaned.startswith("#"):
            cleaned = f"## I Can't Help With That\n\n{cleaned}"
        if _BLOCKED_FOOTER.strip() not in cleaned:
            cleaned += _BLOCKED_FOOTER
        return cleaned

    # ── Add intent header if output has no markdown structure ──────────────────
    if not _has_structure(cleaned):
        header = _INTENT_HEADERS.get(intent, "")
        if header:
            cleaned = f"{header}\n\n{cleaned}"

    # ── Sources section ────────────────────────────────────────────────────────
    already_has_sources = any(
        marker in cleaned for marker in ("## Sources", "## References")
    )
    if sources and not already_has_sources:
        cleaned += _build_sources_section(sources)

    return cleaned


def get_mode_instruction(mode: str) -> str:
    """Return the prompt injection string for the requested response mode."""
    return RESPONSE_MODE_INSTRUCTIONS.get(mode, RESPONSE_MODE_INSTRUCTIONS["medium"])


# ── Auto-detection ────────────────────────────────────────────────────────────

_KEYWORD_MODES: list = [
    ("table", [
        "difference between", " vs ", " versus ", "compare ", "comparison between",
        "which is better", "pros and cons", "advantages and disadvantages",
        "similarities between",
    ]),
    ("step-by-step", [
        "how to ", "how do i ", "steps to ", "guide to ", "walkthrough",
        "tutorial for", "set up ", "setup ", "install ", "configure ",
        "implement ", "deploy ", "create a ", "build a ", "write a ",
    ]),
    ("short", [
        "in one word", "in 1 word", "briefly", "in brief", "one sentence",
        "short answer", "tldr", "tl;dr", "summarize in", "quick answer",
        "just tell me", "only answer",
    ]),
    ("detailed", [
        "what is ", "what are ", "explain ", "describe ", "how does ",
        "why is ", "why are ", "what does ", "teach me ",
        "help me understand ", "elaborate ", "deep dive", "in depth",
    ]),
]

_INTENT_DEFAULT_MODES: dict = {
    "cybersecurity_concept": "detailed",
    "normal_chat":            "medium",
    "personal_memory_read":   "short",
    "personal_memory_write":  "short",
    "company_or_person_query": "medium",
    "current_info_query":     "medium",
    "unsafe_cyber_request":   "short",
    "prompt_injection":       "short",
    "assistant_identity":     "short",
}


_INTENT_OVERRIDES = {
    # These intents have deterministic format — skip keyword detection
    "personal_memory_read":  "short",
    "personal_memory_write": "short",
    "unsafe_cyber_request":  "short",
    "prompt_injection":      "short",
    "assistant_identity":    "short",
}


def detect_format_mode(query: str, intent: str) -> str:
    """
    Auto-detect the best response format from the query text and intent.

    Priority order:
      1. Intent override (memory / safety intents — format is fixed)
      2. Keyword match in query text (table / step-by-step / short / detailed)
      3. Intent-based default
      4. Fallback → medium
    """
    if intent in _INTENT_OVERRIDES:
        return _INTENT_OVERRIDES[intent]

    q = query.lower().strip()
    for mode, keywords in _KEYWORD_MODES:
        if any(kw in q for kw in keywords):
            return mode

    return _INTENT_DEFAULT_MODES.get(intent, "medium")
