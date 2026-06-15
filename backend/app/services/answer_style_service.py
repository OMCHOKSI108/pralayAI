import json
import re
from typing import Dict, Optional


def extract_answer_style(query: str, user_style_str: Optional[str] = None) -> Dict:
    style = {
        "length": "medium",
        "format": "paragraph",
        "tone": "professional",
        "language": "english",
    }

    if user_style_str:
        try:
            user_style = json.loads(user_style_str) if isinstance(user_style_str, str) else {}
            style.update({k: v for k, v in user_style.items() if v})
        except (json.JSONDecodeError, TypeError):
            pass

    query_lower = query.lower()

    length_patterns = {
        "short": [r"\b(?:short|brief|quick|concise|one\s*word|tl;?dr|summarize|summary)\b"],
        "medium": [r"\b(?:explain|describe|detail|moderate)\b"],
        "long": [r"\b(?:comprehensive|detailed|in[- ]depth|thorough|full|elaborate|extensive)\b"],
    }

    for length, patterns in length_patterns.items():
        if any(re.search(p, query_lower) for p in patterns):
            style["length"] = length
            break

    format_patterns = {
        "points": [r"\b(?:points?|bullet|list|steps?|numbered|enum)\b"],
        "table": [r"\b(?:table|tabular|column|row)\b"],
        "code": [r"\b(?:code|snippet|function|script|program)\b"],
        "step_by_step": [r"\b(?:step\s*by\s*step|steps?|tutorial|guide|walkthrough)\b"],
        "paragraph": [r"\b(?:paragraph|essay|prose|write\s*about)\b"],
    }

    for fmt, patterns in format_patterns.items():
        if any(re.search(p, query_lower) for p in patterns):
            style["format"] = fmt
            break

    tone_patterns = {
        "simple": [r"\b(?:simple|easy|beginner|basic|layman)\b"],
        "friendly": [r"\b(?:friendly|chill|casual|bro|dude)\b"],
        "strict": [r"\b(?:strict|formal|official|precise|exact)\b"],
        "professional": [r"\b(?:professional|technical|expert|advanced)\b"],
    }

    for tone, patterns in tone_patterns.items():
        if any(re.search(p, query_lower) for p in patterns):
            style["tone"] = tone
            break

    return style


def apply_style_instruction(style: Dict) -> str:
    instructions = []
    if style.get("length"):
        length_guide = {
            "short": "Keep the answer very brief — one sentence if possible.",
            "medium": "Provide a balanced answer with moderate detail.",
            "long": "Provide a comprehensive, in-depth answer.",
        }
        instructions.append(length_guide.get(style["length"], ""))

    if style.get("format"):
        fmt_guide = {
            "points": "Use bullet points or numbered lists.",
            "table": "Present the answer in a table format.",
            "code": "Provide the answer as code with explanations.",
            "step_by_step": "Present the answer as step-by-step instructions.",
            "paragraph": "Write in paragraph form.",
        }
        instructions.append(fmt_guide.get(style["format"], ""))

    if style.get("tone"):
        tone_guide = {
            "simple": "Use simple, easy-to-understand language.",
            "friendly": "Use a friendly, approachable tone.",
            "strict": "Use a formal, precise tone.",
            "professional": "Use professional technical language.",
        }
        instructions.append(tone_guide.get(style["tone"], ""))

    if style.get("language") and style["language"] not in ("english", "auto-detect"):
        lang_name = style["language"].title()
        instructions.append(f"Respond primarily in {lang_name}.")

    return " ".join(filter(None, instructions))
