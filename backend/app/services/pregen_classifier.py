"""
Pre-generation intent classifier.

Runs BEFORE calling the inference model.  Classifies the user message into
one of these intents (in priority order):

  1. prompt_injection       – override / jailbreak attempt
  2. personal_memory_write  – user is sharing personal/family facts
  3. personal_memory_read   – user is asking about something they told us
  4. assistant_identity     – "who are you / tell me about yourself"
  5. unsafe_cyber_request   – operational attack request (flagged, not blocked here)
  6. company_or_person_query – asking about a real-world entity
  7. current_info_query     – asks for live / real-time information
  8. cybersecurity_concept  – legitimate cyber / tech educational question
  9. normal_chat            – everything else

When skip_model=True the classifier short-circuits the inference call and
returns safe_response directly.  For personal memory intents skip_model is
False so that chat_stream_service.py can handle them with DB access.
"""
import re
import logging
from typing import Optional

logger = logging.getLogger("pralayai.pregen_classifier")

# ── Known public figures / companies ─────────────────────────────────────────
COMPANIES = [
    "google", "alphabet", "microsoft", "apple", "amazon", "meta",
    "facebook", "netflix", "tesla", "nvidia", "ibm", "oracle",
    "cisco", "palantir", "crowdstrike", "sentinelone", "cloudflare",
    "infosys", "tcs", "wipro", "accenture", "deloitte", "pwc", "kpmg",
    "openai", "anthropic", "deepmind", "hugging face",
    "samsung", "sony", "intel", "amd", "qualcomm", "broadcom",
    "adobe", "salesforce", "servicenow", "sap", "vmware",
    "mongodb", "databricks", "snowflake", "confluent", "elastic",
    "stripe", "square", "paypal", "shopify", "uber", "lyft",
    "airbnb", "doordash", "pinterest", "snapchat", "twitter", "x",
    "linkedin", "github", "gitlab", "atlassian",
    "fortinet", "palo alto", "check point", "trend micro",
    "sophos", "kaspersky", "mcafee", "norton", "symantec",
    "mandiant", "fireeye", "recorded future", "dragos",
    "nozomi", "claroty", "armis", "zscaler", "okta", "darktrace",
    "juniper", "arista", "dell", "hp", "hewlett packard",
    "lenovo", "asus", "acer", "hcl", "l&t",
]

PERSONS = [
    "elon musk", "jeff bezos", "bill gates", "mark zuckerberg",
    "tim cook", "sundar pichai", "satya nadella", "larry page",
    "sergey brin", "sam altman", "jack dorsey", "warren buffett",
    "mukesh ambani", "ratan tata", "narayana murthy",
    "shiv nadar", "azim premji", "gautam adani", "steve jobs",
    "paul graham", "linus torvalds", "richard stallman",
    "guido van rossum", "brendan eich", "john carmack",
    "ken thompson", "dennis ritchie", "alan turing", "grace hopper",
    "vint cerf", "tim berners-lee", "bruce schneier",
    "kevin mitnick", "edward snowden", "julian assange",
]

# Minimum entity length to avoid false substring matches (e.g. "x" matching inside "explain")
_MIN_ENTITY_LEN = 3
_ENTITY_LOADED = sorted(
    set(c.lower() for c in COMPANIES + PERSONS if len(c) >= _MIN_ENTITY_LEN),
    key=len, reverse=True,
)

# ── Cybersecurity safety keywords (make a query legitimate even with entity) ──
CYBER_SAFETY_KEYWORDS = [
    "security", "cyber", "breach", "hack", "hacker", "hacking",
    "malware", "ransomware", "trojan", "virus", "worm", "rootkit",
    "phishing", "spoof", "vulnerability", "cve", "exploit",
    "firewall", "ids", "ips", "siem", "soc", "incident response",
    "forensic", "log analysis", "threat hunting", "threat intel",
    "zero day", "zero-day", "apt", "ttp", "ioc",
    "penetration test", "pentest", "red team", "blue team",
    "encryption", "cipher", "cryptography", "hash", "hmac",
    "authentication", "authorization", "oauth", "saml", "kerberos",
    "tls", "ssl", "https", "certificate", "pki",
    "ddos", "dos attack", "botnet", "c2",
    "data exfiltration", "lateral movement", "privilege escalation",
    "docker", "kubernetes", "container security", "cloud security",
    "aws", "azure", "gcp", "iam", "vpc", "waf",
    "buffer overflow", "sql injection", "xss", "csrf", "ssrf",
    "secure coding", "owasp", "sdlc", "devsecops",
    "patch management", "compliance", "gdpr", "hipaa", "pci",
    "iso 27001", "nist", "mitre", "att&ck",
    "defensive", "protect", "detect", "respond",
    "appsec", "api security", "network security",
    "vulnerability assessment", "risk assessment",
    "machine learning", "ai", "artificial intelligence",
]

# ── Identity patterns ─────────────────────────────────────────────────────────
_IDENTITY_PATTERNS = [
    r"who\s+are\s+you",
    r"what\s+are\s+you",
    r"tell\s+me\s+about\s+yourself",
    r"who\s+(?:created|made|built|designed|trained)\s+you",
    r"what\s+can\s+you\s+do",
    r"what(?:'s|\s+is)\s+your\s+name",
    r"introduce\s+yourself",
    r"explain\s+yourself",
    r"are\s+you\s+(?:an?\s+)?(?:ai|bot|robot|human|person|pralayai)",
    r"who\s+is\s+pralayai",
]

_IDENTITY_RESPONSE = (
    "I am PralayAI, a defensive cybersecurity assistant created by Om Choksi.\n\n"
    "I can help you with:\n"
    "- Cybersecurity concepts and education (zero trust, incident response, etc.)\n"
    "- Malware defense and log analysis\n"
    "- Cloud security and API security\n"
    "- Secure coding practices and OWASP guidance\n"
    "- Threat modeling and MITRE ATT&CK mapping\n\n"
    "I do not have live internet access by default, so for real-time information "
    "I rely on web search tools when enabled. I do not invent facts about people, "
    "companies, or current events."
)

# ── Personal memory patterns ──────────────────────────────────────────────────
_MEMORY_WRITE_PATTERNS = [
    r"\bmy\s+(?:father|dad|papa|baba|mother|mom|mummy|maa|mama)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\b",
    r"\bmy\s+(?:sister|brother|sibling)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\b",
    r"\bmy\s+(?:wife|husband|spouse|partner)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\b",
    r"\bmy\s+(?:son|daughter|child|kid)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\b",
    r"\bmy\s+name\s+is\b",
    r"\bcall\s+me\s+\w+\b",
    r"\bi\s+(?:am|'m)\s+(?:male|female|man|woman|boy|girl|a\s+(?:boy|girl|man|woman))\b",
    r"\bmy\s+father\s+(?:have|has|had)\b",     # "my father have two children"
    r"\bi\s+have\s+(?:a\s+|one\s+|two\s+|three\s+)?(?:sister|brother|sibling|twin|child|kid|son|daughter)\b",
    r"\bone\s+is\s+\w+\s+(?:i\s+am|she\s+is|he\s+is|they\s+are)\b",
    r"\banother\s+is\s+\w+\s+(?:she|he|they)\s+is\b",
    r"\bmy\s+(?:age|birthday|city|location|hometown|job|profession|occupation|company|employer)\s+is\b",
    r"\bi\s+(?:work|live|study|grew\s+up)\s+(?:at|in|for|near)\b",
    r"\bmy\s+(?:full\s+)?name\s+is\b",
]

_MEMORY_READ_PATTERNS = [
    r"\bwhat(?:'s|\s+is)\s+my\s+(?:sister|brother|father|mother|dad|mom|wife|husband|son|daughter|name|age|job|city|location)(?:'s)?\s*(?:name|details?|info)?\b",
    r"\bwho\s+is\s+my\s+(?:sister|brother|father|mother|dad|mom|wife|husband|son|daughter)\b",
    r"\bwhat\s+(?:is|are|was|were)\s+my\s+(?:sister|brother|father|mother|dad|mom|wife|husband|name|age|sibling)\b",
    r"\bdo\s+you\s+(?:remember|know|recall|have)\s+(?:my|what\s+i\s+told)\b",
    r"\bwhat\s+(?:did\s+i\s+tell\s+you|have\s+i\s+told\s+you)\s+about\s+(?:my|me)\b",
    r"\bwhat\s+do\s+you\s+know\s+about\s+me\b",
    r"\bmy\s+(?:sister|brother|father|mother|dad|mom|wife|husband)(?:'s)?\s+name\b",
    r"\bdo\s+you\s+remember\s+(?:what|who)\s+(?:i\s+said|i\s+told|i\s+shared|my)\b",
    r"\bcan\s+you\s+tell\s+me\s+(?:my|what\s+my)\b",
    r"\bwhat\s+(?:is|was)\s+(?:her|his|their)\s+name\b.*\b(?:sister|brother|sibling|wife|husband)\b",
]

# ── Unknown / generic entity detection ───────────────────────────────────────
# Catches companies/groups NOT in our known list (MSBC, NJ Group, BlueTigerX, etc.)
_COMPANY_STRUCTURAL_SIGNALS = [
    r"\bgroup\s+of\s+companies\b",
    r"\bpvt\s*\.?\s*ltd\b",
    r"\bprivate\s+limited\b",
    r"\bgroup\s+(?:company|companies|corp|ltd|inc|enterprise|enterprises|industries|solutions|technologies)\b",
    r"\b(?:llc|llp|lllp)\b",
    r"\b(?:incorporated|corporation)\b",
]

_ENTITY_ATTRIBUTION_SIGNALS = [
    r"\b(?:linked|associated|connected|affiliated|related)\s+(?:to|with)\s+(?:russia|china|iran|north\s+korea|israel|pakistan|usa|u\.s\.a?|united\s+states|india|uk|united\s+kingdom)\b",
    r"\bis\s+\w+\s+(?:a|an)\s+(?:threat\s+actor|apt\s+group|spy\s+group|hacker\s+group|cyber\s+criminal|state.?sponsored)\b",
    r"\b(?:behind|responsible\s+for)\s+the\s+(?:attack|breach|hack|intrusion|campaign)\b",
]

# ── Standalone entity query starters ─────────────────────────────────────────
_ENTITY_QUERY_STARTS = (
    "who is", "who are", "tell me about", "what is",
    "what are", "describe", "explain who",
)

# ── Current-info keywords ─────────────────────────────────────────────────────
_CURRENT_EVENTS_KEYWORDS = [
    "latest", "breaking", "news", "today", "yesterday",
    "this week", "this month", "current ceo", "current president",
    "recent", "just now", "what happened", "what's new",
    "live", "real-time", "right now", "at the moment",
    "2024", "2025", "2026",
    "job openings", "job opening", "hiring", "vacancies",
]


class PreGenClassification:
    __slots__ = ("category", "reason", "safe_response", "skip_model")

    def __init__(
        self,
        category: str,
        reason: str = "",
        safe_response: Optional[str] = None,
        skip_model: bool = False,
    ):
        self.category = category
        self.reason = reason
        self.safe_response = safe_response
        self.skip_model = skip_model


def _has_memory_write_signal(lower: str) -> bool:
    return any(re.search(p, lower) for p in _MEMORY_WRITE_PATTERNS)


def _has_memory_read_signal(lower: str) -> bool:
    return any(re.search(p, lower) for p in _MEMORY_READ_PATTERNS)


def _has_company_structural_signal(lower: str) -> bool:
    return any(re.search(p, lower) for p in _COMPANY_STRUCTURAL_SIGNALS)


def _has_entity_attribution_signal(lower: str) -> bool:
    return any(re.search(p, lower) for p in _ENTITY_ATTRIBUTION_SIGNALS)


def classify_input(query: str, has_files: bool = False) -> PreGenClassification:
    """
    Classify user input before calling the inference model.

    Priority order (first match wins):
      1. prompt_injection
      2. personal_memory_write
      3. personal_memory_read
      4. assistant_identity
      5. unsafe_cyber_request  (flagged; actual blocking done by safety_service)
      6. company_or_person_query
      7. current_info_query
      8. cybersecurity_concept / defensive_security_help
      9. normal_chat
    """
    from app.services.safety_service import _is_prompt_injection, _is_unsafe_operational

    query_lower = query.lower().strip()

    # ── 1. Prompt injection ───────────────────────────────────────────────────
    if _is_prompt_injection(query_lower):
        return PreGenClassification(
            category="prompt_injection",
            reason="Prompt injection or identity override detected",
            safe_response=(
                "I can't change my safety rules, identity, or behavior based on that instruction. "
                "I remain PralayAI, a defensive cybersecurity assistant created by Om Choksi. "
                "Feel free to ask cybersecurity questions, incident response steps, or security concepts."
            ),
            skip_model=True,
        )

    # ── 2. Personal memory write ──────────────────────────────────────────────
    if _has_memory_write_signal(query_lower):
        logger.info("personal_memory_write detected: %s", query[:80])
        return PreGenClassification(
            category="personal_memory_write",
            reason="User is sharing personal or family information",
            skip_model=False,
        )

    # ── 3. Personal memory read ───────────────────────────────────────────────
    if _has_memory_read_signal(query_lower):
        logger.info("personal_memory_read detected: %s", query[:80])
        return PreGenClassification(
            category="personal_memory_read",
            reason="User is asking about previously shared personal information",
            skip_model=False,
        )

    # ── 4. Assistant identity ─────────────────────────────────────────────────
    for pattern in _IDENTITY_PATTERNS:
        if re.search(pattern, query_lower):
            return PreGenClassification(
                category="assistant_identity",
                reason="User asked about PralayAI identity",
                safe_response=_IDENTITY_RESPONSE,
                skip_model=True,
            )

    # ── 5. Unsafe cyber request (flagged, not skip — safety_service blocks it) ─
    if _is_unsafe_operational(query_lower):
        return PreGenClassification(
            category="unsafe_cyber_request",
            reason="Query matches operational unsafe patterns",
            skip_model=False,
        )

    # ── 6. Current events / live info (checked BEFORE entity to catch "current CEO of X") ──
    if any(kw in query_lower for kw in _CURRENT_EVENTS_KEYWORDS):
        return PreGenClassification(
            category="current_info_query",
            reason="Query asks for current, live, or real-time information",
            skip_model=False,
        )

    # ── 7. Entity query (known list + generic company/attribution signals) ────
    has_cyber_context = any(kw in query_lower for kw in CYBER_SAFETY_KEYWORDS)

    # 6a. Known entity
    matched_entity = None
    for entity in _ENTITY_LOADED:
        if entity in query_lower:
            matched_entity = entity
            break

    if matched_entity:
        is_simple_entity_query = (
            query_lower.startswith(_ENTITY_QUERY_STARTS) or len(query.split()) <= 8
        )
        if not has_cyber_context or is_simple_entity_query:
            logger.info("entity_query (known): entity=%s", matched_entity)
            return PreGenClassification(
                category="company_or_person_query",
                reason=f"Query about known entity '{matched_entity}' without cybersecurity context",
                safe_response=(
                    "I don't have verified up-to-date information about that specific entity in my current context. "
                    "For accurate details, please check the official website, a reputable news source, or provide "
                    "me with a document/URL and I can summarize it."
                ),
                skip_model=True,
            )

    # 6b. Unknown entity — structural company signal
    if _has_company_structural_signal(query_lower) and not has_cyber_context:
        logger.info("entity_query (unknown company signal): %s", query[:80])
        return PreGenClassification(
            category="company_or_person_query",
            reason="Query about an organization without verified context",
            safe_response=(
                "I don't have verified information about that company or organization in my current context. "
                "Please share their official website, LinkedIn page, or a document and I can summarize it accurately. "
                "I won't guess or fabricate details about real organizations."
            ),
            skip_model=True,
        )

    # 6c. Attribution query about unknown entity (BlueTigerX, etc.)
    if _has_entity_attribution_signal(query_lower) and not matched_entity:
        logger.info("entity_attribution_query (unknown entity): %s", query[:80])
        return PreGenClassification(
            category="company_or_person_query",
            reason="Threat attribution query about unknown entity",
            safe_response=(
                "I don't have verified information to attribute that entity to any threat actor, nation-state, "
                "or security incident. Threat attribution requires verified intelligence from trusted sources "
                "(e.g., CISA advisories, Mandiant/CrowdStrike reports). Without that, I won't speculate."
            ),
            skip_model=True,
        )

    # ── 8. Cyber concept / defensive security ─────────────────────────────────
    cyber_starts = (
        "what is", "what are", "define", "explain", "describe",
        "how does", "how do", "how can", "how to",
        "difference between", "compare", "tell me about",
    )
    if query_lower.startswith(cyber_starts) or has_cyber_context:
        return PreGenClassification(
            category="cybersecurity_concept",
            reason="Cybersecurity or general tech concept question",
            skip_model=False,
        )

    # ── 9. Normal chat ────────────────────────────────────────────────────────
    return PreGenClassification(
        category="normal_chat",
        reason="General chat or unrecognized pattern",
        skip_model=False,
    )
