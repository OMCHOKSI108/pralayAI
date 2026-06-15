import asyncio
import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.user import User
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.schemas.enhanced_chat_schema import EnhancedChatRequest
from app.services.auth_dependency import get_current_user
from app.services.chat_service import handle_chat
from app.services.chat_stream_service import orchestrate_chat_stream


router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return handle_chat(db, request, user_id=current_user.id)


@router.post("/chat/stream")
async def chat_stream(
    request: EnhancedChatRequest,
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    user_settings = {
        "preferred_language": current_user.preferred_language,
        "answer_style": current_user.answer_style,
        "thinking_level": current_user.thinking_level,
        "theme": current_user.theme,
    }

    async def generate():
        db = SessionLocal()
        try:
            async for event in orchestrate_chat_stream(db, request, user_id, user_settings):
                yield event
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'error': str(exc)})}\n\n"
            yield "data: [DONE]\n\n"
        finally:
            db.close()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
