import logging
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.memory import Memory

logger = logging.getLogger("pralayai.memory")


# ── Structured family/personal fact extraction ────────────────────────────────

def extract_family_facts(message: str) -> Dict[str, str]:
    """
    Extract structured family/personal facts from a user message.

    Handles simple forms ("my sister is Tisha") and complex multi-fact
    sentences ("my father have two children one is Om i am Male and
    Another is Tisha she is Female").

    Returns a dict of {fact_key: value}, e.g.:
        {
            "father_name": "Chirag",
            "user_name": "Om",
            "user_gender": "male",
            "sister_name": "Tisha",
        }
    """
    facts: Dict[str, str] = {}
    lower = message.lower()

    # ── Father / mother ───────────────────────────────────────────────────
    m = re.search(
        r"\bmy\s+(?:father|dad|papa|baba)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["father_name"] = m.group(1).strip().capitalize()

    m = re.search(
        r"\bmy\s+(?:mother|mom|mummy|maa|mama)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["mother_name"] = m.group(1).strip().capitalize()

    # ── Direct sibling names ──────────────────────────────────────────────
    m = re.search(
        r"\bmy\s+sister(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["sister_name"] = m.group(1).strip().capitalize()

    m = re.search(
        r"\bmy\s+brother(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["brother_name"] = m.group(1).strip().capitalize()

    # ── Spouse ────────────────────────────────────────────────────────────
    m = re.search(
        r"\bmy\s+(?:wife|husband|spouse|partner)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["spouse_name"] = m.group(1).strip().capitalize()

    # ── Children ─────────────────────────────────────────────────────────
    m = re.search(
        r"\bmy\s+(?:son|daughter|child|kid)(?:'s)?\s+(?:name\s+)?(?:is|=|was)\s*([A-Za-z]+)",
        message, re.IGNORECASE,
    )
    if m:
        facts["child_name"] = m.group(1).strip().capitalize()

    # ── "one is X i am Male" → user name + gender ─────────────────────────
    # Handles "one is Om i am Male and Another is Tisha she is Female"
    m = re.search(
        r"\bone\s+is\s+([A-Za-z]+)\s+i\s+am\s+(male|female|man|woman|boy|girl)\b",
        message, re.IGNORECASE,
    )
    if m:
        candidate = m.group(1).strip().capitalize()
        gender_str = m.group(2).lower()
        if candidate.lower() not in {"male", "female", "man", "woman", "boy", "girl", "a", "an"}:
            if "user_name" not in facts:
                facts["user_name"] = candidate
        facts["user_gender"] = "female" if gender_str in {"female", "woman", "girl"} else "male"

    # ── "another/other is X she/he is Female/Male" → sibling ─────────────
    m = re.search(
        r"\b(?:another|other|second)\s+is\s+([A-Za-z]+)\s+(?:she|he|they)\s+is\s+(male|female|man|woman|boy|girl)\b",
        message, re.IGNORECASE,
    )
    if m:
        sibling_name = m.group(1).strip().capitalize()
        sibling_gender_str = m.group(2).lower()
        sibling_gender = "female" if sibling_gender_str in {"female", "woman", "girl"} else "male"
        if sibling_gender == "female" and "sister_name" not in facts:
            facts["sister_name"] = sibling_name
        elif sibling_gender == "male" and "brother_name" not in facts:
            facts["brother_name"] = sibling_name

    # ── User name from "my name is X" ────────────────────────────────────
    m = re.search(
        r"\bmy\s+(?:full\s+)?name\s+is\s+([A-Za-z]+)\b",
        message, re.IGNORECASE,
    )
    if m and "user_name" not in facts:
        candidate = m.group(1).strip().capitalize()
        if candidate.lower() not in {"male", "female", "man", "woman", "boy", "girl"}:
            facts["user_name"] = candidate

    # ── "i am X" → name (if X looks like a proper name, not a gender) ────
    m = re.search(
        r"\bi\s+(?:am|'m)\s+([A-Z][a-z]{1,20})\b",
        message,
    )
    if m and "user_name" not in facts:
        candidate = m.group(1).strip()
        if candidate.lower() not in {"male", "female", "man", "woman", "boy", "girl",
                                      "a", "an", "the", "not", "also", "just"}:
            facts["user_name"] = candidate

    # ── User gender ───────────────────────────────────────────────────────
    if "user_gender" not in facts:
        m = re.search(
            r"\bi\s+(?:am|'m)\s+(male|female|boy|girl|man|woman)\b",
            message, re.IGNORECASE,
        )
        if m:
            g = m.group(1).lower()
            facts["user_gender"] = "female" if g in {"female", "girl", "woman"} else "male"

    # ── Generic "my <thing> is <value>" for non-family keys ───────────────
    _family_keys = {"father", "dad", "mother", "mom", "sister", "brother",
                    "wife", "husband", "son", "daughter", "name", "full name"}
    for gm in re.finditer(r"\bmy\s+(\w+(?:\s+\w+)?)\s+is\s+([A-Za-z0-9\s]+?)(?:\s+and|\.|!|,|$)",
                          message, re.IGNORECASE):
        key = gm.group(1).strip().lower()
        value = gm.group(2).strip()
        if key not in _family_keys and key not in facts and len(value) < 50:
            facts[key] = value.capitalize()

    if facts:
        logger.info("Family facts extracted: %s", {k: v for k, v in facts.items()})

    return facts


def generate_memory_confirmation(facts: Dict[str, str], original_message: str) -> str:
    """Build a natural confirmation response after storing personal facts."""
    if not facts:
        return (
            "I've noted that. If you'd like me to remember specific details "
            "for our conversation, feel free to share them."
        )

    user_name = facts.get("user_name", "")
    greeting = f"Got it{', ' + user_name if user_name else ''}."

    lines = [greeting, "I'll remember for our conversation:"]
    _labels = {
        "user_name": "Your name",
        "user_gender": "Your gender",
        "father_name": "Your father's name",
        "mother_name": "Your mother's name",
        "sister_name": "Your sister's name",
        "brother_name": "Your brother's name",
        "spouse_name": "Your spouse's name",
        "child_name": "Your child's name",
    }
    for key, value in facts.items():
        label = _labels.get(key, f"Your {key.replace('_', ' ')}")
        lines.append(f"- {label}: {value}")

    lines.append(
        "\nFeel free to ask me anything — I'll use this context in our conversation."
    )
    return "\n".join(lines)


def answer_from_memory(memories: "List[Memory]", query: str) -> str:
    """
    Build a factual answer from retrieved memories.
    Returns None-equivalent string if memory is empty.
    """
    if not memories:
        return (
            "I don't have that information from our conversation yet. "
            "Feel free to share it and I'll remember it for you."
        )

    query_lower = query.lower()

    # Try to answer a specific family member question
    _targets = [
        (["sister"], "sister_name", "Your sister's name is {}."),
        (["brother"], "brother_name", "Your brother's name is {}."),
        (["father", "dad", "papa"], "father_name", "Your father's name is {}."),
        (["mother", "mom", "mummy", "maa"], "mother_name", "Your mother's name is {}."),
        (["wife", "husband", "spouse"], "spouse_name", "Your spouse's name is {}."),
        (["son", "daughter", "child", "kid"], "child_name", "Your child's name is {}."),
        (["name"], "user_name", "Your name is {}."),
    ]

    for keywords, memory_key, template in _targets:
        if any(kw in query_lower for kw in keywords):
            for mem in memories:
                if mem.key.lower() == memory_key or memory_key.replace("_", " ") in mem.key.lower():
                    return template.format(mem.value)

    # Fallback: return all relevant memories
    lines = ["Based on what you've told me:"]
    seen = set()
    for mem in memories[:5]:
        if mem.key not in seen:
            lines.append(f"- {mem.key.replace('_', ' ').capitalize()}: {mem.value}")
            seen.add(mem.key)
    return "\n".join(lines)


EXPLICIT_MEMORY_TRIGGERS = {
    "remember", "save this", "from now on", "keep this",
    "note that", "remember that", "remember this",
    "always", "never", "i prefer", "i like", "i dislike",
    "my name is", "call me", "i am",
}

FORGET_TRIGGERS = {"forget", "delete memory", "remove memory", "erase memory"}


def _extract_memory_from_message(message: str) -> Optional[Tuple[str, str, str]]:
    lowered = message.lower().strip()

    for trigger in FORGET_TRIGGERS:
        if trigger in lowered:
            return ("delete", "intent", "user wants to forget something")

    for trigger in EXPLICIT_MEMORY_TRIGGERS:
        if trigger in lowered:
            key_value_match = re.search(
                r"(?:remember|save this|note that|from now on|always|never|i prefer|i like|i dislike|my name is|call me|i am)\s*[:\-]?\s*(.+?)(?:\.|!|$)",
                message,
                re.IGNORECASE,
            )
            if key_value_match:
                text = key_value_match.group(1).strip()
                parts = text.split(" is ", 1)
                if len(parts) == 2:
                    return ("store", parts[0].strip().lower(), parts[1].strip())
                return ("store", "preference", text)

    # Broader: "my <something> is <value>" — no trigger needed
    my_is_match = re.search(
        r"\bmy\s+(.+?)\s+is\s+(.+?)(?:\.|!|,|$)",
        message,
        re.IGNORECASE,
    )
    if my_is_match:
        key = my_is_match.group(1).strip().lower()
        value = my_is_match.group(2).strip()
        return ("store", key, value)

    return None


def _extract_stable_facts(response: str, query: str) -> List[Dict[str, str]]:
    facts = []
    user_mentions = re.findall(r"(?:my name is|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", query, re.IGNORECASE)
    for name in user_mentions:
        facts.append({"key": "user_name", "value": name.strip(), "confidence": "0.9"})

    pref_mentions = re.findall(r"(?:i prefer|i like|i use)\s+(.+?)(?:\.|,|$)", query, re.IGNORECASE)
    for pref in pref_mentions:
        facts.append({"key": "preference", "value": pref.strip(), "confidence": "0.7"})

    # "my <X> is <Y>" from the response
    my_is_resp = re.findall(r"\bmy\s+(.+?)\s+is\s+(.+?)(?:\.|!|,|$)", response, re.IGNORECASE)
    for key, value in my_is_resp:
        k = key.strip().lower()
        v = value.strip()
        if k not in [f["key"] for f in facts]:
            facts.append({"key": k, "value": v, "confidence": "0.6"})

    return facts


def create_memory(db: Session, user_id: str, key: str, value: str,
                  type: str = "fact", conversation_id: Optional[str] = None,
                  source: str = "explicit", confidence: float = 1.0) -> Memory:
    existing = db.query(Memory).filter(
        Memory.user_id == user_id,
        Memory.key == key,
        Memory.deleted_at.is_(None),
    ).first()
    if existing:
        existing.value = value
        existing.confidence = confidence
        existing.source = source
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        logger.debug("Memory updated: user_id=%s key=%s source=%s", user_id, key, source)
        return existing

    memory = Memory(
        user_id=user_id,
        conversation_id=conversation_id,
        type=type,
        key=key,
        value=value,
        confidence=confidence,
        source=source,
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    logger.info("Memory created: user_id=%s key=%s value=%s source=%s", user_id, key, value[:50], source)
    return memory


def get_user_memories(db: Session, user_id: str, include_deleted: bool = False) -> List[Memory]:
    q = db.query(Memory).filter(Memory.user_id == user_id)
    if not include_deleted:
        q = q.filter(Memory.deleted_at.is_(None))
    return q.order_by(Memory.updated_at.desc()).all()


def get_relevant_memories(db: Session, user_id: str, query: str, max_memories: int = 5, conversation_id: Optional[str] = None) -> List[Memory]:
    memories = get_user_memories(db, user_id)
    if conversation_id:
        memories = [m for m in memories if m.conversation_id == conversation_id]
    query_lower = query.lower()
    query_words = set(query_lower.split())

    scored = []
    for m in memories:
        score = 0
        key_lower = m.key.lower()
        value_lower = m.value.lower()

        if key_lower in query_lower:
            score += 3
        if value_lower in query_lower:
            score += 2

        key_words = set(key_lower.split())
        value_words = set(value_lower.split())
        common_with_key = query_words & key_words
        common_with_value = query_words & value_words
        score += len(common_with_key) * 2.0
        score += len(common_with_value) * 1.5

        for qw in query_words:
            if any(kw.startswith(qw) or qw.startswith(kw) for kw in key_words):
                score += 1.5
            if any(vw.startswith(qw) or qw.startswith(vw) for vw in value_words):
                score += 1.0

        scored.append((score, m))

    scored.sort(key=lambda x: x[0], reverse=True)
    relevant = [m for s, m in scored if s > 0][:max_memories]
    logger.debug("Memory recall: user_id=%s conv=%s query_len=%s total=%s relevant=%s",
                 user_id, conversation_id, len(query), len(memories), len(relevant))
    return relevant


def update_memory(db: Session, memory_id: str, user_id: str,
                  key: Optional[str] = None, value: Optional[str] = None,
                  confidence: Optional[float] = None) -> Optional[Memory]:
    memory = db.query(Memory).filter(
        Memory.id == memory_id,
        Memory.user_id == user_id,
        Memory.deleted_at.is_(None),
    ).first()
    if not memory:
        return None
    if key is not None:
        memory.key = key
    if value is not None:
        memory.value = value
    if confidence is not None:
        memory.confidence = confidence
    memory.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(memory)
    return memory


def delete_memory(db: Session, memory_id: str, user_id: str) -> bool:
    memory = db.query(Memory).filter(
        Memory.id == memory_id,
        Memory.user_id == user_id,
        Memory.deleted_at.is_(None),
    ).first()
    if not memory:
        return False
    memory.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return True


def clear_user_memories(db: Session, user_id: str) -> int:
    count = db.query(Memory).filter(
        Memory.user_id == user_id,
        Memory.deleted_at.is_(None),
    ).update({"deleted_at": datetime.now(timezone.utc)})
    db.commit()
    return count


def extract_and_store_memories(db: Session, user_id: str, query: str,
                                response: str, conversation_id: Optional[str] = None) -> List[Memory]:
    created = []
    extracted = _extract_memory_from_message(query)
    if extracted:
        action, key, value = extracted
        logger.info("Memory extraction triggered: action=%s key=%s", action, key)
        if action == "store":
            mem = create_memory(db, user_id, key, value,
                                conversation_id=conversation_id, source="explicit")
            created.append(mem)

    facts = _extract_stable_facts(response, query)
    for fact in facts:
        mem = create_memory(db, user_id, fact["key"], fact["value"],
                            confidence=float(fact["confidence"]),
                            conversation_id=conversation_id, source="extracted")
        created.append(mem)

    if created:
        logger.info("Memories stored: user_id=%s count=%s", user_id, len(created))
    return created


def format_memories_for_prompt(memories: List[Memory]) -> str:
    if not memories:
        return ""
    lines = ["Relevant user information:"]
    for m in memories:
        lines.append(f"- {m.key}: {m.value}")
    return "\n".join(lines)
