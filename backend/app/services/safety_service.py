"""
Safety classifier for PralayAI.

Classifies every message into one of five safety labels before it reaches
the inference model.  The key fix over the old version is context-awareness:

  OLD: `"credential theft" in text` → blocks "prevent credential theft"
  NEW: `"steal/dump credentials"` (operational) is blocked;
       "how to prevent credential theft" (defensive prefix) is allowed.
"""
import re
from enum import Enum
from typing import Tuple


class SafetyLabel(str, Enum):
    SAFE = "safe"
    DEFENSIVE_ALLOWED = "defensive_allowed"
    DUAL_USE_ALLOWED = "dual_use_allowed"
    UNSAFE_BLOCKED = "unsafe_blocked"
    PROMPT_INJECTION = "prompt_injection"


# ── Prompt injection ──────────────────────────────────────────────────────────
# Any of these patterns → PROMPT_INJECTION regardless of other context.
_INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|your|prior|above)\s+(?:instructions?|prompts?|rules?|directions?)",
    r"forget\s+(?:all\s+)?(?:your|the|previous|prior)\s+(?:\w+\s+)?(?:instructions?|rules?|guidelines?|training|identity|system\s*prompt)",
    r"your\s+system\s*prompt\s+is\s+(?:wrong|bad|incorrect|broken|fake|outdated|not\s+right)",
    r"(?:you\s+are\s+(?:not|no\s+longer)|stop\s+being)\s+pralayai",
    r"from\s+now\s+on\s+(?:you\s+(?:are|will)|act\s+as|answer|respond|treat|say|call\s+every)",
    r"(?:pretend|roleplay|act)\s+(?:you\s+are|as)\s+(?:a\s+different|not\s+an?\s+ai|an?\s+evil|an?\s+unrestricted|if\s+you\s+were)",
    r"(?:you\s+are|act\s+as|you\s+are\s+now)\s+(?:dan|jailbreak|evil|uncensored|unrestricted|free\s+mode|dude\s+mode)",
    r"override\s+(?:your|the)\s+(?:safety|security|rules?|guidelines?|restrictions?|filters?)",
    r"disregard\s+(?:your|all|any)\s+(?:safety|rules?|guidelines?|restrictions?|instructions?)",
    r"bypass\s+(?:your|all|any)\s+(?:safety|rules?|restrictions?|filters?|training)",
    r"(?:safety|security)\s+(?:rules?|filters?|guidelines?)\s+(?:are\s+)?(?:wrong|bad|off|disabled|removed|changed|not\s+needed)",
    r"answer\s+every\s+(?:company|person|question|query|entity)\s+as\s+(?:a\s+)?(?:threat\s+actor|hacker|malicious|enemy|spy|criminal|apt\s+group)",
    r"you\s+are\s+(?:om\s+choksi|the\s+user|the\s+admin|a\s+hacker|an\s+attacker|not\s+an?\s+ai)",
    r"confirm\s+(?:you\s+are|that\s+you\s+are)\s+(?:now|no\s+longer)\s+pralayai",
    r"new\s+persona.{0,30}(?:no\s+restrictions|no\s+limits|no\s+rules|unrestricted)",
    r"(?:enable|turn\s+on|activate)\s+(?:jailbreak|dev\s+mode|god\s+mode|unrestricted\s+mode)",
    r"(?:your\s+)?(?:real|true|hidden|actual)\s+(?:instructions?|system\s+prompt|rules?)\s+(?:are|say|tell)",
]

# ── Operational unsafe patterns (always blocked) ──────────────────────────────
# These represent clear attack intent; no amount of defensive framing makes them OK.
_UNSAFE_PATTERNS = [
    # Hacking someone else's account
    r"\bhack\b.{0,60}\b(friend|sister|brother|ex|girlfriend|boyfriend|someone(?:'s)?|his|her|their|account|instagram|facebook|whatsapp|gmail|twitter|snapchat|tiktok|phone|device|laptop|computer)\b",
    r"\bbreak\s+into\b.{0,40}\b(account|email|device|phone|instagram|facebook|someone)\b",
    r"\bgain\s+(?:unauthorized|illegal|unpermitted)\s+access\b",
    r"\bget\s+into\s+(?:someone|my\s+(?:friend|sister|brother|ex|girlfriend|boyfriend))\b",
    # Generating attack payloads (give/write/create payloads → operational)
    r"\b(?:give|provide|write|generate|create|make|show)\s+(?:me\s+)?(?:some\s+)?(?:sql\s+injection|sqli|xss|csrf|rce|lfi|rfi|command\s+injection)\s+(?:payload|exploit|bypass)s?\b",
    r"\bsql\s+injection\s+payloads?\s+(?:to\s+)?bypass\b",
    r"\bsql\s+injection\s+(?:to\s+)?bypass\s+(?:login|authentication|admin\s+panel)\b",
    # Creating phishing artifacts
    r"\b(?:write|create|make|generate|build|code|design)\s+(?:a\s+)?(?:phishing\s+(?:email|page|website|form|template|campaign)|fake\s+login\s+page|credential\s+harvesting\s+page)\b",
    # Creating malware/attack tools
    r"\b(?:write|create|make|generate|code|build)\s+(?:a\s+)?(?:malware|ransomware|keylogger|trojan|spyware|rootkit|worm\b|rat\b|botnet|cryptominer|stealer)\b",
    # Stealing credentials
    r"\b(?:steal|dump|harvest|extract|grab)\s+(?:credentials?|passwords?|ntlm\s+hashes?|tokens?|session\s+cookies?)\b",
    r"\bpassword\s+dump(?:ing)?\b",
    r"\bcredential\s+(?:harvesting|dumping|theft\s+(?:code|tool|script|method|technique))\b",
    # Reverse shells
    r"\breverse\s+shell\s+(?:payload|code|script|command|one.?liner|listener)\b",
    r"\b(?:create|generate|make|write|give)\s+(?:me\s+)?(?:a\s+)?reverse\s+shell\b",
    # AV/EDR bypass
    r"\b(?:bypass|evade|avoid)\s+(?:antivirus|av\b|edr\b|endpoint\s+detection|windows\s+defender|security\s+software|security\s+tools?)\b",
    r"\b(?:make|render|encode)\s+(?:malware|payload|code|file)\s+(?:undetectable|fud|fully\s+undetectable|crypted)\b",
    # Authentication bypass
    r"\bbypass\s+(?:login|authentication|admin\s+panel|otp\b|2fa\b|mfa\b|captcha)\b",
    # Persistence mechanisms
    r"\b(?:create|add|install|set\s+up)\s+(?:malware\s+)?(?:persistence|backdoor)\s+(?:mechanism|script|hook|task|entry|on|in)\b",
    # Exfiltration
    r"\b(?:exfiltrate|siphon|secretly\s+(?:send|upload|transmit))\s+(?:data|files?|database|credentials?|records?)\b",
]

# ── Defensive/educational context prefixes ────────────────────────────────────
# If the message STARTS with one of these, dual-use topics are allowed.
_DEFENSIVE_PREFIXES = (
    "what is ", "what are ", "what does ", "what do ", "what was ", "what were ",
    "define ", "explain ", "describe ", "tell me about ", "how does ", "how do ",
    "how can ", "how to ", "how would ", "why does ", "why do ",
    "help me understand ", "teach me ", "can you explain ",
    "difference between ", "compare ", "contrast ",
    "how to prevent ", "how to detect ", "how to protect ", "how to defend ",
    "how to stop ", "how to block ", "how to mitigate ", "how to secure ",
    "how to harden ", "how to respond to ", "how to investigate ",
    "how can a company prevent ", "how can an organization prevent ",
    "how can i prevent ", "how can we prevent ", "how do i detect ",
    "best practices for ", "incident response for ", "malware analysis ",
    "secure coding ", "security awareness ", "threat modeling ",
    "help me learn ", "i want to learn about ", "i'm studying ",
)


def _is_prompt_injection(lower: str) -> bool:
    for pattern in _INJECTION_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False


def _is_unsafe_operational(lower: str) -> bool:
    for pattern in _UNSAFE_PATTERNS:
        if re.search(pattern, lower):
            return True
    return False


def _has_defensive_prefix(lower: str) -> bool:
    stripped = lower.lstrip()
    return any(stripped.startswith(prefix) for prefix in _DEFENSIVE_PREFIXES)


# Patterns that are NEVER allowed regardless of defensive framing.
# "How do I hack my friend's Instagram" is not defensive even though it starts with "how do I".
_ALWAYS_BLOCKED_PATTERNS = [
    r"\bhack\b.{0,60}\b(friend|sister|brother|ex|girlfriend|boyfriend|someone(?:'s)?|his|her|their|account|instagram|facebook|whatsapp|gmail|twitter|snapchat|tiktok|phone|device|laptop|computer)\b",
    r"\bbreak\s+into\b.{0,40}\b(account|email|device|phone|instagram|facebook|someone)\b",
    r"\b(?:write|create|make|generate|code|build)\s+(?:a\s+)?(?:malware|ransomware|keylogger|trojan|spyware|rootkit|worm\b|rat\b|botnet|cryptominer)\b",
    r"\b(?:write|create|make|generate|build|code|design)\s+(?:a\s+)?(?:phishing\s+(?:email|page|website|form|template)|fake\s+login\s+page)\b",
    r"\b(?:steal|dump|harvest|extract|grab)\s+(?:credentials?|passwords?|ntlm\s+hashes?|tokens?|session\s+cookies?)\b",
    r"\breverse\s+shell\s+(?:payload|code|script|command|one.?liner|listener)\b",
    r"\b(?:give|provide|write|generate|create|make|show)\s+(?:me\s+)?(?:some\s+)?(?:sql\s+injection|sqli|xss|csrf|rce|lfi|rfi)\s+(?:payload|exploit)s?\b",
    r"\bsql\s+injection\s+payloads?\s+(?:to\s+)?bypass\b",
    r"\bbypass\s+(?:login|authentication|admin\s+panel|otp\b|2fa\b|mfa\b)\b",
    r"\b(?:bypass|evade|avoid)\s+(?:antivirus|av\b|edr\b|endpoint\s+detection|windows\s+defender)\b",
]


def _is_always_blocked(lower: str) -> bool:
    return any(re.search(p, lower) for p in _ALWAYS_BLOCKED_PATTERNS)


def classify_safety(text: str) -> Tuple[SafetyLabel, str]:
    """
    Return (SafetyLabel, reason_string).

    Priority:
      1. Prompt injection       → PROMPT_INJECTION
      2. Always-blocked actions → UNSAFE_BLOCKED  (no defensive framing overrides these)
      3. Unsafe + defensive     → DUAL_USE_ALLOWED (educational framing present)
      4. Unsafe only            → UNSAFE_BLOCKED
      5. Defensive prefix       → DEFENSIVE_ALLOWED
      6. Otherwise              → SAFE
    """
    lower = text.lower()

    if _is_prompt_injection(lower):
        return SafetyLabel.PROMPT_INJECTION, "Prompt injection or identity override attempt"

    # Always-blocked patterns: no defensive framing can override these
    if _is_always_blocked(lower):
        return SafetyLabel.UNSAFE_BLOCKED, "Operational attack request (always blocked)"

    if _is_unsafe_operational(lower):
        # For remaining operational patterns, defensive framing CAN make them DUAL_USE.
        # Example: "how to prevent reverse shells on my server" — the unsafe pattern
        # matches (reverse shell) but the intent is clearly defensive.
        if _has_defensive_prefix(lower):
            return SafetyLabel.DUAL_USE_ALLOWED, "Dual-use topic with defensive framing"
        return SafetyLabel.UNSAFE_BLOCKED, "Operational attack request detected"

    if _has_defensive_prefix(lower):
        return SafetyLabel.DEFENSIVE_ALLOWED, "Defensive/educational cybersecurity question"

    return SafetyLabel.SAFE, "Safe query"


def is_unsafe_prompt(text: str) -> bool:
    label, _ = classify_safety(text)
    return label == SafetyLabel.UNSAFE_BLOCKED


def is_prompt_injection(text: str) -> bool:
    label, _ = classify_safety(text)
    return label == SafetyLabel.PROMPT_INJECTION


def safe_refusal_response(reason: str = "unsafe") -> str:
    if reason == "prompt_injection":
        return (
            "I can't change my safety rules, identity, or behavior based on that instruction. "
            "I remain PralayAI, a defensive cybersecurity assistant created by Om Choksi.\n\n"
            "Feel free to ask about cybersecurity concepts, incident response, log analysis, "
            "threat modeling, or security education."
        )
    return (
        "I can't help with hacking accounts, creating malware or phishing content, "
        "credential theft, bypass payloads, or unauthorized exploitation.\n\n"
        "I can help with:\n"
        "- Detecting and preventing these attacks\n"
        "- Incident response and forensics\n"
        "- Security hardening and best practices\n"
        "- Log analysis and threat hunting\n"
        "- OWASP guidance and secure coding\n"
        "- Testing your own systems in a legal lab environment"
    )
