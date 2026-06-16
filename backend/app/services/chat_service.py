import time
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.model_run import ModelRun
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.inference_client import InferenceClientError, call_inference_api
from app.services.pregen_classifier import classify_input
from app.services.safety_service import is_unsafe_prompt, safe_refusal_response


def make_title(message: str) -> str:
    cleaned = " ".join(message.strip().split())
    if len(cleaned) <= 60:
        return cleaned
    return cleaned[:60] + "..."


def create_or_get_conversation(
    db: Session, request: ChatRequest, user_id: Optional[str] = None
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
        title=make_title(request.message),
        user_id=user_id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def handle_chat(
    db: Session, request: ChatRequest, user_id: Optional[str] = None
) -> ChatResponse:
    conversation = create_or_get_conversation(db, request, user_id)

    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    started = time.time()

    if is_unsafe_prompt(request.message):
        assistant_text = safe_refusal_response()
        latency_seconds = round(time.time() - started, 3)

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=assistant_text,
        )
        db.add(assistant_message)

        model_run = ModelRun(
            conversation_id=conversation.id,
            provider="safety_filter",
            model_name="local_safety_filter",
            status="blocked",
            latency_ms=int(latency_seconds * 1000),
            error_message=None,
        )
        db.add(model_run)

        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            conversation_id=conversation.id,
            user_message_id=user_message.id,
            assistant_message_id=assistant_message.id,
            assistant_message=assistant_text,
            status="blocked",
            latency_seconds=latency_seconds,
            source="safety_filter",
        )

    classification = classify_input(request.message)
    if classification.skip_model and classification.safe_response:
        assistant_text = classification.safe_response
        latency_seconds = round(time.time() - started, 3)

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=assistant_text,
        )
        db.add(assistant_message)

        model_run = ModelRun(
            conversation_id=conversation.id,
            provider="classifier",
            model_name="pregen_classifier",
            status="success",
            latency_ms=int(latency_seconds * 1000),
            error_message=None,
        )
        db.add(model_run)

        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            conversation_id=conversation.id,
            user_message_id=user_message.id,
            assistant_message_id=assistant_message.id,
            assistant_message=assistant_text,
            status="success",
            latency_seconds=latency_seconds,
            source="classifier",
        )

    try:
        result = call_inference_api(
            message=request.message,
            max_new_tokens=request.max_new_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
        )

        assistant_text = result["response"]
        latency_seconds = result["latency_seconds"]

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=assistant_text,
        )
        db.add(assistant_message)

        model_run = ModelRun(
            conversation_id=conversation.id,
            provider="inference_api",
            model_name=result.get("model", "unknown"),
            status="success",
            latency_ms=int(latency_seconds * 1000),
            error_message=None,
        )
        db.add(model_run)

        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            conversation_id=conversation.id,
            user_message_id=user_message.id,
            assistant_message_id=assistant_message.id,
            assistant_message=assistant_text,
            status="success",
            latency_seconds=latency_seconds,
            source=result.get("source", "inference_api"),
        )

    except InferenceClientError as error:
        latency_seconds = round(time.time() - started, 3)
        error_text = str(error)

        model_run = ModelRun(
            conversation_id=conversation.id,
            provider="inference_api",
            model_name="unknown",
            status="error",
            latency_ms=int(latency_seconds * 1000),
            error_message=error_text,
        )
        db.add(model_run)

        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=(
                "The inference service is currently unavailable. "
                "Please try again later."
            ),
        )
        db.add(assistant_message)

        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            conversation_id=conversation.id,
            user_message_id=user_message.id,
            assistant_message_id=assistant_message.id,
            assistant_message=assistant_message.content,
            status="error",
            latency_seconds=latency_seconds,
            source="inference_api",
        )
