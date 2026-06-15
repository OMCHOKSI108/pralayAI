import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, List, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.models.agent_run import AgentRun

logger = logging.getLogger("pralayai.chat_stream")
from app.models.chat_context import ChatContext
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.model_run import ModelRun
from app.schemas.enhanced_chat_schema import (
    CitationInfo,
    EnhancedChatRequest,
    ProcessSummary,
)
from app.services.answer_style_service import apply_style_instruction, extract_answer_style
from app.services.citation_service import format_citations_as_footer
from app.services.guardrail_service import verify_citation_integrity
from app.services.code_skill_service import detect_language, format_code_response, is_debug_request
from app.services.guardrail_service import (
    add_uncertainty_disclaimer,
    check_hallucination_risk,
    get_confidence_level,
)
from app.services.inference_client import InferenceClientError, call_inference_api
from app.services.intent_router import route_intent
from app.services.memory_service import (
    extract_and_store_memories,
    format_memories_for_prompt,
    get_relevant_memories,
)
from app.services.process_summary_service import build_process_summary, format_process_summary_for_sss
from app.services.rag_service import rag_answer
from app.services.reasoning_service import build_reasoning_summary
from app.services.safety_service import is_unsafe_prompt, safe_refusal_response
from app.services.skill_router import route_skill
from app.services.web_research_service import simple_web_lookup

STATUS_MESSAGES = {
    "thinking": "Analyzing your query...",
    "routing": "Selecting the best skill for this request...",
    "tool_calling": "Searching for relevant information...",
    "responding": "Generating response...",
    "completed": "Ready",
    "error": "An error occurred",
}

SKILL_STATUS = {
    "web_research": "Searching the web for relevant information...",
    "deep_research": "Conducting deep research across multiple sources...",
    "code_writer": "Writing code based on your request...",
    "code_debugger": "Analyzing your code for issues...",
    "rag_answer": "Reading uploaded files for context...",
    "general_chat": "Generating answer using cybersecurity knowledge...",
    "memory_manager": "Checking session memory...",
}

def _make_title(message: str) -> str:
    cleaned = " ".join(message.strip().split())
    if len(cleaned) <= 60:
        return cleaned
    return cleaned[:60] + "..."


def _create_or_get_conversation(
    db: Session, request: EnhancedChatRequest, user_id: Optional[str] = None
) -> Conversation:
    if request.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == request.conversation_id)
            .first()
        )
        if conversation:
            return conversation

    conversation = Conversation(
        title=_make_title(request.message),
        user_id=user_id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


async def orchestrate_chat_stream(
    db: Session,
    request: EnhancedChatRequest,
    user_id: str,
    user_settings: Optional[Dict] = None,
) -> AsyncGenerator[str, None]:
    conversation = _create_or_get_conversation(db, request, user_id)
    logger.info("Chat stream start: user_id=%s conv_id=%s msg_len=%s",
                user_id, conversation.id, len(request.message))
    yield _sse("conversation", {"conversation_id": conversation.id})

    yield _sse("status", {"message": STATUS_MESSAGES["thinking"]})

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    yield _sse("user_message", {"user_message_id": user_message.id})

    started = time.time()

    if is_unsafe_prompt(request.message):
        logger.warning("Safety filter blocked: user_id=%s msg_preview=%s", user_id, request.message[:80])
        assistant_text = safe_refusal_response()
        process = build_process_summary(
            skill="safety_filter",
            query=request.message,
            confidence="high",
            assumptions=["Query matched safety blocklist"],
        )
        yield _sse("process", format_process_summary_for_sss(process))
        yield _sse("delta", {"delta": assistant_text})
        latency_seconds = round(time.time() - started, 3)
        assistant_message = _save_assistant_response(db, conversation, assistant_text, status="blocked", skill_used="safety_filter")
        _save_model_run(db, conversation.id, "safety_filter", "blocked", latency_seconds)
        yield _sse("done", {
            "conversation_id": conversation.id,
            "assistant_message_id": assistant_message.id,
            "status": "blocked",
            "latency_seconds": latency_seconds,
            "skill": "safety_filter",
        })
        return

    yield _sse("status", {"message": STATUS_MESSAGES["routing"]})

    language = "english"
    thinking_level = "medium"
    answer_style_str = "{}"
    if user_settings:
        language = user_settings.get("preferred_language", "english")
        thinking_level = user_settings.get("thinking_level", "medium")
        answer_style_str = user_settings.get("answer_style", "{}")

    skill = request.skill_override or route_skill(request.message)
    intent = route_intent(request.message, preferred_skill=skill)
    style = extract_answer_style(request.message, answer_style_str)
    if language and language != "english" and language != "auto-detect":
        style["language"] = language

    logger.info("Intent routed: user_id=%s skill=%s mode=%s thinking=%s style=%s",
                user_id, skill, intent["mode"], thinking_level, style.get("format"))

    yield _sse("skill", {"skill": skill})
    yield _sse("intent", {
        "mode": intent["mode"],
        "reason": intent.get("reason", ""),
        "thinking_level": thinking_level,
    })

    memory_used = False
    rag_used = False
    web_used = False
    rag_context = ""
    rag_citations: List[CitationInfo] = []
    all_citations: List[CitationInfo] = []
    assumptions: List[str] = []
    limitations: List[str] = []

    memory_context = ""
    if settings.MEMORY_ENABLED:
        relevant_memories = get_relevant_memories(db, user_id, request.message)
        if relevant_memories:
            memory_context = format_memories_for_prompt(relevant_memories)
            memory_used = True
            yield _sse("memory", {
                "used": True,
                "count": len(relevant_memories),
                "keys": [m.key for m in relevant_memories],
            })
            assumptions.append(f"Used {len(relevant_memories)} relevant memories")

    agent_run = AgentRun(
        user_id=user_id,
        conversation_id=conversation.id,
        skill=skill,
        reason=f"Intent: {intent['mode']}. Router: {skill} for: {request.message[:100]}",
    )
    db.add(agent_run)
    db.commit()
    db.refresh(agent_run)

    if skill in ("web_research", "deep_research") or intent["needs_web"]:
        web_used = True
        yield _sse("status", {"message": SKILL_STATUS.get("web_research", "Searching the web...")})

        if skill == "deep_research":
            from app.services.deep_research_service import deep_research
            async for event in deep_research(request.message):
                if event["type"] == "status":
                    yield _sse("status", {"message": event["message"]})
                elif event["type"] == "source_found":
                    yield _sse("source", {"title": event["title"], "url": event["url"]})
                elif event["type"] == "report":
                    report_text = event["report"]
                    all_citations.extend(event.get("citations", []))
                    yield _sse("citations", [{"title": c.title, "url": c.url, "snippet": c.snippet} for c in all_citations])
                    yield _sse("delta", {"delta": report_text})
                    assistant_text = report_text + format_citations_as_footer(all_citations)
                    latency_seconds = round(time.time() - started, 3)
                    assistant_message = _save_assistant_response(db, conversation, assistant_text, status="completed", skill_used="deep_research")
                    _save_model_run(db, conversation.id, "deep_research", "success", latency_seconds)
                    process = build_process_summary(
                        skill="deep_research",
                        query=request.message,
                        web_used=True,
                        num_sources=len(all_citations),
                        confidence=get_confidence_level(all_citations, False, True, False),
                        limitations=[f"Based on {len(all_citations)} sources"],
                    )
                    reasoning = build_reasoning_summary(intent, skill, memory_used, rag_used, web_used, len(all_citations), assumptions, limitations, thinking_level)
                    yield _sse("reasoning", {"summary": reasoning})
                    yield _sse("process", format_process_summary_for_sss(process))
                    yield _sse("done", {
                        "conversation_id": conversation.id,
                        "assistant_message_id": assistant_message.id,
                        "status": "success",
                        "latency_seconds": latency_seconds,
                        "skill": "deep_research",
                    })
                    return
        else:
            try:
                yield _sse("status", {"message": "Searching the web..."})
                await asyncio.sleep(0.3)
                _, citations, num_sources = await simple_web_lookup(request.message)
                all_citations.extend(citations)
                if citations:
                    yield _sse("status", {"message": f"Found {len(citations)} relevant sources"})
                    yield _sse("sources", [{"title": c.title, "url": c.url} for c in citations])
                    limitations.append(f"Based on {len(citations)} web sources")
                else:
                    yield _sse("status", {"message": "No web results found, using general knowledge"})
            except Exception:
                yield _sse("status", {"message": "Web search failed, using general knowledge"})

    elif skill in ("code_writer", "code_debugger") or intent["mode"] == "code_agent":
        yield _sse("status", {"message": SKILL_STATUS.get(skill, "Analyzing code request...")})
        lang = detect_language(request.message)
        yield _sse("status", {"message": f"Writing {lang} code..."})
        code_answer = format_code_response(request.message)
        yield _sse("delta", {"delta": code_answer})
        assistant_text = code_answer
        latency_seconds = round(time.time() - started, 3)
        assistant_message = _save_assistant_response(db, conversation, assistant_text, status="completed", skill_used=skill)
        _save_model_run(db, conversation.id, skill, "success", latency_seconds)

        process = build_process_summary(
            skill=skill,
            query=request.message,
            assumptions=[f"Language detected: {lang}"],
            limitations=["Code is a template and may need adjustments"],
            confidence="medium",
        )
        reasoning = build_reasoning_summary(intent, skill, memory_used, rag_used, web_used, 0, assumptions, limitations, thinking_level)
        yield _sse("reasoning", {"summary": reasoning})
        yield _sse("process", format_process_summary_for_sss(process))
        yield _sse("done", {
            "conversation_id": conversation.id,
            "assistant_message_id": assistant_message.id,
            "status": "success",
            "latency_seconds": latency_seconds,
            "skill": skill,
        })
        return

    else:
        if intent["needs_files"] or any(kw in request.message.lower() for kw in ["uploaded file", "in the document", "according to the file", "read the file", "from the pdf", "from the document"]):
            yield _sse("status", {"message": SKILL_STATUS.get("rag_answer", "Reading uploaded files...")})
            rag_context, rag_citations = rag_answer(user_id, request.message)
            if rag_context:
                rag_used = True
                all_citations.extend(rag_citations)
                yield _sse("rag_context", {"found": True, "sources": [c.title for c in rag_citations]})
                assumptions.append("Used uploaded document context")
        else:
            yield _sse("status", {"message": "Using cybersecurity knowledge..."})

    yield _sse("status", {"message": STATUS_MESSAGES["responding"]})

    style_instruction = apply_style_instruction(style)

    system_prompt_parts = [
        "You are PralayAI, a defensive cybersecurity assistant.",
        "Provide accurate, helpful answers about cybersecurity topics.",
    ]
    if style_instruction:
        system_prompt_parts.append(f"\nStyle instructions: {style_instruction}")
    if memory_context:
        system_prompt_parts.append(f"\n{memory_context}")

    reasoning_prefix = (
        "Before answering, think through this step by step:\n"
        "1. UNDERSTAND: What is the user asking? Identify the core question.\n"
        "2. CONTEXT: Consider any provided context (web results, documents, memories).\n"
        "3. REASON: Analyze the information, check for gaps or conflicts.\n"
        "4. ANSWER: Formulate a clear, accurate response based on your reasoning.\n"
        "5. CAVEAT: Note any limitations or uncertainty.\n\n"
        "Now provide your answer:\n"
    )

    prompt = reasoning_prefix + request.message
    if rag_context:
        prompt = f"Context from uploaded documents:\n{rag_context}\n\n{reasoning_prefix}{request.message}"
    if web_used and not rag_context and all_citations:
        web_lines = [f"- {c.title}: {c.snippet[:200]}" for c in all_citations[:5]]
        web_context = "\n".join(web_lines) if web_lines else ""
        if web_context:
            prompt = f"Web search results ({len(all_citations)} sources):\n{web_context}\n\n{reasoning_prefix}{request.message}"

    try:
        result = call_inference_api(
            message=prompt,
            max_new_tokens=request.max_new_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
        )
        assistant_text = result["response"]
        latency_seconds = result["latency_seconds"]

        if all_citations:
            assistant_text += format_citations_as_footer(all_citations)

        citations_valid = verify_citation_integrity(all_citations)
        confidence = get_confidence_level(citations_valid, rag_used, web_used, False)
        has_risk, risk_issues = check_hallucination_risk(
            assistant_text, citations_valid, rag_used, web_used
        )
        if has_risk:
            limitations.extend(risk_issues)
            confidence = "low"

        assistant_text = add_uncertainty_disclaimer(assistant_text, confidence)
        assistant_message = _save_assistant_response(
            db, conversation, assistant_text, status="completed",
            model_used=result.get("model", "unknown"), skill_used=skill,
        )

        _save_model_run(db, conversation.id, "inference_api", "success",
                        latency_seconds, result.get("model", "unknown"))

        if settings.MEMORY_EXTRACTION_ENABLED:
            try:
                extract_and_store_memories(db, user_id, request.message, assistant_text,
                                           conversation.id)
            except Exception:
                pass

        process = build_process_summary(
            skill=skill,
            query=request.message,
            memory_used=memory_used,
            rag_used=rag_used,
            web_used=web_used,
            num_sources=len(all_citations),
            assumptions=assumptions,
            limitations=limitations or None,
            confidence=confidence,
        )

        reasoning = build_reasoning_summary(
            intent, skill, memory_used, rag_used, web_used,
            len(all_citations), assumptions, limitations, thinking_level
        )
        yield _sse("reasoning", {"summary": reasoning})
        yield _sse("process", format_process_summary_for_sss(process))

        if all_citations:
            yield _sse("citations", [
                {"title": c.title, "url": c.url, "snippet": c.snippet, "relevance": c.relevance}
                for c in all_citations
            ])

        words = assistant_text.split()
        if len(words) <= 40:
            yield _sse("delta", {"delta": assistant_text})
        else:
            first_chunk = " ".join(words[:40])
            remaining = words[40:]
            yield _sse("delta", {"delta": first_chunk})
            await asyncio.sleep(0.05)
            for i in range(0, len(remaining), 3):
                chunk = " ".join(remaining[i:i+3])
                yield _sse("delta", {"delta": " " + chunk})
                await asyncio.sleep(0.03)

        yield _sse("status", {"message": STATUS_MESSAGES["completed"]})

        try:
            ctx = db.query(ChatContext).filter(ChatContext.session_id == conversation.id).first()
            if not ctx:
                ctx = ChatContext(
                    session_id=conversation.id,
                    summary=request.message[:200],
                    current_topic=request.message[:255],
                    preferred_style=intent.get("answer_style", "paragraph"),
                    language=user_settings.get("preferred_language", "english") if user_settings else "english",
                    skill_used=skill,
                )
                db.add(ctx)
            else:
                ctx.skill_used = skill
                ctx.current_topic = request.message[:255]
                ctx.updated_at = datetime.now(timezone.utc)
            db.commit()
        except Exception:
            pass

        logger.info("Chat stream success: user_id=%s skill=%s mode=%s latency=%ss",
                    user_id, skill, intent["mode"], latency_seconds)
        yield _sse("done", {
            "conversation_id": conversation.id,
            "assistant_message_id": assistant_message.id,
            "status": "success",
            "latency_seconds": latency_seconds,
            "skill": skill,
        })

    except InferenceClientError as error:
        latency_seconds = round(time.time() - started, 3)
        error_text = str(error)
        assistant_message = _save_assistant_response(
            db, conversation,
            "The inference service is currently unavailable. Please try again later.",
            status="error", skill_used=skill,
        )
        _save_model_run(db, conversation.id, "inference_api", "error",
                        latency_seconds, error_message=error_text)

        logger.error("Chat stream error: user_id=%s error=%s", user_id, error_text)
        yield _sse("error", {"error": error_text})
        yield _sse("done", {
            "conversation_id": conversation.id,
            "status": "error",
            "latency_seconds": latency_seconds,
        })


def _sse(event_type: str, data: Any) -> str:
    payload: dict = {"type": event_type}
    if isinstance(data, dict):
        payload.update(data)
    else:
        payload["data"] = data
    return f"data: {json.dumps(payload, default=str)}\n\n"


def _save_assistant_response(
    db: Session, conversation: Conversation, text: str,
    status: Optional[str] = None, model_used: Optional[str] = None,
    skill_used: Optional[str] = None,
) -> Message:
    msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=text,
        status=status or "completed",
        model_used=model_used,
        skill_used=skill_used,
    )
    db.add(msg)
    conversation.updated_at = datetime.now(timezone.utc)
    conversation.message_count = db.query(Message).filter(
        Message.conversation_id == conversation.id
    ).count() + 1
    db.commit()
    db.refresh(msg)
    return msg


def _save_model_run(db: Session, conversation_id: str, provider: str,
                    status: str, latency_seconds: float,
                    model_name: str = "unknown", error_message: Optional[str] = None):
    run = ModelRun(
        conversation_id=conversation_id,
        provider=provider,
        model_name=model_name,
        status=status,
        latency_ms=int(latency_seconds * 1000),
        error_message=error_message,
    )
    db.add(run)
    db.commit()
