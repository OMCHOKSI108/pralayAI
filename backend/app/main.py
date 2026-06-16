import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
log = logging.getLogger("pralayai")

from app.models.user import User
from app.models.user_session import UserSession
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.model_run import ModelRun
from app.models.feedback import Feedback
from app.models.memory import Memory
from app.models.agent_run import AgentRun
from app.models.tool_call import ToolCall
from app.models.research_source import ResearchSource
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.password_reset import PasswordReset
from app.models.chat_context import ChatContext

from app.routes.health_routes import router as health_router
from app.routes.auth_routes import router as auth_router
from app.routes.chat_routes import router as chat_router
from app.routes.conversation_routes import router as conversation_router
from app.routes.feedback_routes import router as feedback_router
from app.routes.memory_routes import router as memory_router
from app.routes.document_routes import router as document_router
from app.routes.context_routes import router as context_router
from app.routes.token_routes import router as token_router


def create_tables():
    Base.metadata.create_all(bind=engine)

create_tables()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.1.0",
    description="PralayAI main backend with auth, PostgreSQL and inference API integration.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(conversation_router)
app.include_router(feedback_router)
app.include_router(memory_router)
app.include_router(document_router)
app.include_router(context_router)
app.include_router(token_router)


@app.on_event("startup")
def on_startup():
    log.info("PralayAI backend starting up (v1.1.0)")
    log.info("App env: %s", settings.APP_ENV)
    log.info("Database: %s", settings.DATABASE_URL.replace(settings.DATABASE_URL.split("@")[0], "***"))
    log.info("CORS origins: %s", settings.cors_origin_list)
    log.info("Web search: %s | Memory: %s | Deep research: %s | Code skill: %s",
             settings.WEB_SEARCH_ENABLED, settings.MEMORY_ENABLED,
             settings.DEEP_RESEARCH_ENABLED, settings.CODE_SKILL_ENABLED)
    log.info("Email service: %s", "enabled" if settings.RESEND_API_KEY else "disabled")
    log.info("All routes registered")


@app.on_event("shutdown")
def on_shutdown():
    log.info("PralayAI backend shutting down")
