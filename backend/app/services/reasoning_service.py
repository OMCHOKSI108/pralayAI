from typing import Dict, List, Optional


def build_reasoning_summary(
    intent: Dict,
    skill_used: str,
    memory_used: bool = False,
    rag_used: bool = False,
    web_used: bool = False,
    num_sources: int = 0,
    assumptions: Optional[List[str]] = None,
    limitations: Optional[List[str]] = None,
    thinking_level: str = "medium",
) -> str:
    parts = []

    mode_labels = {
        "direct_llm": "Direct LLM response",
        "cybersecurity_model": "Cybersecurity model direct answer",
        "rag_files": "File search + answer",
        "web_research": "Web research",
        "code_agent": "Code generation/debug",
        "multi_agent": "Multi-skill coordination",
    }
    mode_label = mode_labels.get(intent.get("mode", ""), skill_used)
    parts.append(f"I identified this as a {mode_label} request.")

    reason = intent.get("reason", "")
    if reason:
        parts.append(reason)

    if memory_used:
        parts.append("Relevant session memory was used to personalize the response.")

    if rag_used:
        parts.append(f"Uploaded file context was searched ({num_sources} relevant chunks found).")

    if web_used:
        parts.append(f"Web search was performed ({num_sources} sources reviewed).")

    if assumptions:
        parts.extend(f"Assumption: {a}" for a in assumptions)

    if limitations:
        parts.extend(f"Limitation: {l}" for l in limitations)

    if thinking_level == "low":
        if not parts:
            parts.append("Direct answer provided with minimal processing.")
    elif thinking_level == "high":
        parts.insert(0, "I analyzed the query thoroughly, selected the appropriate skill, generated the answer, and reviewed it before finalizing.")

    return " ".join(parts) if parts else "Direct response generated."
