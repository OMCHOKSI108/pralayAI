BLOCKED_PATTERNS = [
    "write phishing email",
    "create phishing email",
    "make phishing page",
    "steal password",
    "dump password",
    "credential theft",
    "keylogger code",
    "create keylogger",
    "write malware",
    "create malware",
    "ransomware code",
    "reverse shell payload",
    "bypass antivirus",
    "evade detection",
    "persistence malware",
    "unauthorized access",
]


def is_unsafe_prompt(text: str) -> bool:
    lowered = text.lower()
    return any(pattern in lowered for pattern in BLOCKED_PATTERNS)


def safe_refusal_response() -> str:
    return (
        "I can’t help with creating phishing, malware, credential theft, evasion, "
        "or unauthorized exploitation content. I can help with defensive alternatives "
        "such as detection logic, incident response steps, log analysis, hardening, "
        "security awareness, or threat prevention."
    )
