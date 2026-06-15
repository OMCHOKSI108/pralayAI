import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.memory import Memory

logger = logging.getLogger("pralayai.memory")


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
        existing.updated_at = datetime.utcnow()
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


def get_relevant_memories(db: Session, user_id: str, query: str, max_memories: int = 5) -> List[Memory]:
    memories = get_user_memories(db, user_id)
    query_lower = query.lower()
    query_words = set(query_lower.split())

    scored = []
    for m in memories:
        score = 0
        key_lower = m.key.lower()
        value_lower = m.value.lower()

        # Exact key or value found in query
        if key_lower in query_lower:
            score += 3
        if value_lower in query_lower:
            score += 2

        # Any word from key/value overlaps with query words
        key_words = set(key_lower.split())
        value_words = set(value_lower.split())
        common_with_key = query_words & key_words
        common_with_value = query_words & value_words
        score += len(common_with_key) * 2.0
        score += len(common_with_value) * 1.5

        # Partial word match (e.g. "mother" in "mother_age")
        for qw in query_words:
            if any(kw.startswith(qw) or qw.startswith(kw) for kw in key_words):
                score += 1.5
            if any(vw.startswith(qw) or qw.startswith(vw) for vw in value_words):
                score += 1.0

        scored.append((score, m))

    scored.sort(key=lambda x: x[0], reverse=True)
    relevant = [m for s, m in scored if s > 0][:max_memories]
    logger.debug("Memory recall: user_id=%s query_len=%s total_memories=%s relevant=%s",
                 user_id, len(query), len(memories), len(relevant))
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
    memory.updated_at = datetime.utcnow()
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
    memory.deleted_at = datetime.utcnow()
    db.commit()
    return True


def clear_user_memories(db: Session, user_id: str) -> int:
    count = db.query(Memory).filter(
        Memory.user_id == user_id,
        Memory.deleted_at.is_(None),
    ).update({"deleted_at": datetime.utcnow()})
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
