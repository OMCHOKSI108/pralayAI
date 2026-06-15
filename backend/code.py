from pathlib import Path
import textwrap

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
APP_DIR = BACKEND_DIR / "app"


def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")
    print(f"Created: {path}")


def main():
    # ============================================================
    # __init__.py files
    # ============================================================

    for folder in [
        APP_DIR,
        APP_DIR / "models",
        APP_DIR / "schemas",
        APP_DIR / "routes",
        APP_DIR / "services",
    ]:
        write_file(folder / "__init__.py", "")

    # ============================================================
    # backend/requirements.txt
    # ============================================================

    write_file(
        BACKEND_DIR / "requirements.txt",
        """
        fastapi
        uvicorn[standard]
        sqlalchemy
        psycopg2-binary
        pydantic
        pydantic-settings
        python-dotenv
        requests
        """,
    )

    # ============================================================
    # backend/run.sh
    # ============================================================

    write_file(
        BACKEND_DIR / "run.sh",
        """
        #!/usr/bin/env bash
        set -e

        cd "$(dirname "$0")"
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
        """,
    )

    # ============================================================
    # backend/README.md
    # ============================================================

    write_file(
        BACKEND_DIR / "README.md",
        """
        # PralayAI Backend

        FastAPI backend for PralayAI.

        ## Features

        - PostgreSQL database
        - Conversation storage
        - Message storage
        - Inference API client
        - Basic cybersecurity safety filter
        - Feedback endpoint
        - Health endpoint

        ## Run

        From project root:

        ```bash
        source .venv/bin/activate
        uv pip install -r backend/requirements.txt
        cd backend
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
        ```

        ## Docs

        ```txt
        http://localhost:8000/docs
        ```

        ## Required root .env

        ```env
        APP_NAME=PralayAI Backend
        APP_ENV=local
        APP_HOST=0.0.0.0
        APP_PORT=8000

        DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pralayai_db

        INFERENCE_API_URL=http://localhost:5000/generate
        # INFERENCE_API_URL=https://omchoksi108-pralayai-inference-api.hf.space/generate

        CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
        REQUEST_TIMEOUT_SECONDS=180
        ```
        """,
    )

    # ============================================================
    # app/config.py
    # ============================================================

    write_file(
        APP_DIR / "config.py",
        """
        from pathlib import Path
        from typing import List

        from pydantic_settings import BaseSettings, SettingsConfigDict


        PROJECT_ROOT = Path(__file__).resolve().parents[2]


        class Settings(BaseSettings):
            APP_NAME: str = "PralayAI Backend"
            APP_ENV: str = "local"
            APP_HOST: str = "0.0.0.0"
            APP_PORT: int = 8000

            DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/pralayai_db"

            INFERENCE_API_URL: str = "http://localhost:5000/generate"
            REQUEST_TIMEOUT_SECONDS: int = 180

            CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

            model_config = SettingsConfigDict(
                env_file=str(PROJECT_ROOT / ".env"),
                env_file_encoding="utf-8",
                extra="ignore",
            )

            @property
            def cors_origin_list(self) -> List[str]:
                return [
                    origin.strip()
                    for origin in self.CORS_ORIGINS.split(",")
                    if origin.strip()
                ]


        settings = Settings()
        """,
    )

    # ============================================================
    # app/database.py
    # ============================================================

    write_file(
        APP_DIR / "database.py",
        """
        from sqlalchemy import create_engine
        from sqlalchemy.orm import DeclarativeBase, sessionmaker

        from app.config import settings


        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
        )

        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine,
        )


        class Base(DeclarativeBase):
            pass


        def get_db():
            db = SessionLocal()
            try:
                yield db
            finally:
                db.close()
        """,
    )

    # ============================================================
    # models/conversation.py
    # ============================================================

    write_file(
        APP_DIR / "models" / "conversation.py",
        """
        import uuid
        from datetime import datetime

        from sqlalchemy import DateTime, String
        from sqlalchemy.orm import Mapped, mapped_column, relationship

        from app.database import Base


        class Conversation(Base):
            __tablename__ = "conversations"

            id: Mapped[str] = mapped_column(
                String(36),
                primary_key=True,
                default=lambda: str(uuid.uuid4()),
            )

            title: Mapped[str] = mapped_column(String(255), nullable=False)

            created_at: Mapped[datetime] = mapped_column(
                DateTime,
                default=datetime.utcnow,
                nullable=False,
            )

            updated_at: Mapped[datetime] = mapped_column(
                DateTime,
                default=datetime.utcnow,
                onupdate=datetime.utcnow,
                nullable=False,
            )

            messages = relationship(
                "Message",
                back_populates="conversation",
                cascade="all, delete-orphan",
                order_by="Message.created_at",
            )

            model_runs = relationship(
                "ModelRun",
                back_populates="conversation",
                cascade="all, delete-orphan",
            )
        """,
    )

    # ============================================================
    # models/message.py
    # ============================================================

    write_file(
        APP_DIR / "models" / "message.py",
        """
        import uuid
        from datetime import datetime

        from sqlalchemy import DateTime, ForeignKey, String, Text
        from sqlalchemy.orm import Mapped, mapped_column, relationship

        from app.database import Base


        class Message(Base):
            __tablename__ = "messages"

            id: Mapped[str] = mapped_column(
                String(36),
                primary_key=True,
                default=lambda: str(uuid.uuid4()),
            )

            conversation_id: Mapped[str] = mapped_column(
                String(36),
                ForeignKey("conversations.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            )

            role: Mapped[str] = mapped_column(String(20), nullable=False)
            content: Mapped[str] = mapped_column(Text, nullable=False)

            created_at: Mapped[datetime] = mapped_column(
                DateTime,
                default=datetime.utcnow,
                nullable=False,
            )

            conversation = relationship(
                "Conversation",
                back_populates="messages",
            )

            feedback_items = relationship(
                "Feedback",
                back_populates="message",
                cascade="all, delete-orphan",
            )
        """,
    )

    # ============================================================
    # models/model_run.py
    # ============================================================

    write_file(
        APP_DIR / "models" / "model_run.py",
        """
        import uuid
        from datetime import datetime
        from typing import Optional

        from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
        from sqlalchemy.orm import Mapped, mapped_column, relationship

        from app.database import Base


        class ModelRun(Base):
            __tablename__ = "model_runs"

            id: Mapped[str] = mapped_column(
                String(36),
                primary_key=True,
                default=lambda: str(uuid.uuid4()),
            )

            conversation_id: Mapped[str] = mapped_column(
                String(36),
                ForeignKey("conversations.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            )

            provider: Mapped[str] = mapped_column(String(100), nullable=False)
            model_name: Mapped[str] = mapped_column(String(255), nullable=False)
            status: Mapped[str] = mapped_column(String(50), nullable=False)

            latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
            error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

            created_at: Mapped[datetime] = mapped_column(
                DateTime,
                default=datetime.utcnow,
                nullable=False,
            )

            conversation = relationship(
                "Conversation",
                back_populates="model_runs",
            )
        """,
    )

    # ============================================================
    # models/feedback.py
    # ============================================================

    write_file(
        APP_DIR / "models" / "feedback.py",
        """
        import uuid
        from datetime import datetime
        from typing import Optional

        from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
        from sqlalchemy.orm import Mapped, mapped_column, relationship

        from app.database import Base


        class Feedback(Base):
            __tablename__ = "feedback"

            id: Mapped[str] = mapped_column(
                String(36),
                primary_key=True,
                default=lambda: str(uuid.uuid4()),
            )

            message_id: Mapped[str] = mapped_column(
                String(36),
                ForeignKey("messages.id", ondelete="CASCADE"),
                nullable=False,
                index=True,
            )

            rating: Mapped[int] = mapped_column(Integer, nullable=False)
            comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

            created_at: Mapped[datetime] = mapped_column(
                DateTime,
                default=datetime.utcnow,
                nullable=False,
            )

            message = relationship(
                "Message",
                back_populates="feedback_items",
            )
        """,
    )

    # ============================================================
    # schemas/chat_schema.py
    # ============================================================

    write_file(
        APP_DIR / "schemas" / "chat_schema.py",
        """
        from typing import Optional

        from pydantic import BaseModel, Field


        class ChatRequest(BaseModel):
            message: str = Field(..., min_length=1, max_length=8000)
            conversation_id: Optional[str] = None
            max_new_tokens: int = Field(default=300, ge=1, le=1000)
            temperature: float = Field(default=0.7, ge=0.0, le=2.0)
            top_p: float = Field(default=0.9, ge=0.0, le=1.0)


        class ChatResponse(BaseModel):
            conversation_id: str
            user_message_id: str
            assistant_message_id: str
            assistant_message: str
            status: str
            latency_seconds: float
            source: str
        """,
    )

    # ============================================================
    # schemas/conversation_schema.py
    # ============================================================

    write_file(
        APP_DIR / "schemas" / "conversation_schema.py",
        """
        from datetime import datetime
        from typing import List

        from pydantic import BaseModel


        class MessageOut(BaseModel):
            id: str
            role: str
            content: str
            created_at: datetime

            class Config:
                from_attributes = True


        class ConversationListOut(BaseModel):
            id: str
            title: str
            created_at: datetime
            updated_at: datetime

            class Config:
                from_attributes = True


        class ConversationDetailOut(BaseModel):
            id: str
            title: str
            created_at: datetime
            updated_at: datetime
            messages: List[MessageOut]

            class Config:
                from_attributes = True
        """,
    )

    # ============================================================
    # schemas/feedback_schema.py
    # ============================================================

    write_file(
        APP_DIR / "schemas" / "feedback_schema.py",
        """
        from typing import Optional

        from pydantic import BaseModel, Field


        class FeedbackRequest(BaseModel):
            message_id: str
            rating: int = Field(..., ge=1, le=5)
            comment: Optional[str] = None


        class FeedbackResponse(BaseModel):
            id: str
            message_id: str
            rating: int
            comment: Optional[str]
            status: str
        """,
    )

    # ============================================================
    # services/safety_service.py
    # ============================================================

    write_file(
        APP_DIR / "services" / "safety_service.py",
        """
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
        """,
    )

    # ============================================================
    # services/inference_client.py
    # ============================================================

    write_file(
        APP_DIR / "services" / "inference_client.py",
        """
        import requests

        from app.config import settings


        class InferenceClientError(Exception):
            pass


        def call_inference_api(
            message: str,
            max_new_tokens: int = 300,
            temperature: float = 0.7,
            top_p: float = 0.9,
        ) -> dict:
            payload = {
                "prompt": message,
                "max_new_tokens": max_new_tokens,
                "temperature": temperature,
                "top_p": top_p,
            }

            try:
                response = requests.post(
                    settings.INFERENCE_API_URL,
                    json=payload,
                    timeout=settings.REQUEST_TIMEOUT_SECONDS,
                )

                response.raise_for_status()
                data = response.json()

                return {
                    "response": data.get("response", ""),
                    "latency_seconds": float(data.get("latency_seconds", 0)),
                    "model": data.get("model", "unknown"),
                    "device": data.get("device", "unknown"),
                    "source": settings.INFERENCE_API_URL,
                }

            except requests.exceptions.Timeout as error:
                raise InferenceClientError(
                    f"Inference API timeout after {settings.REQUEST_TIMEOUT_SECONDS} seconds"
                ) from error

            except requests.exceptions.RequestException as error:
                raise InferenceClientError(
                    f"Inference API request failed: {str(error)}"
                ) from error

            except ValueError as error:
                raise InferenceClientError(
                    "Inference API returned invalid JSON"
                ) from error
        """,
    )

    # ============================================================
    # services/chat_service.py
    # ============================================================

    write_file(
        APP_DIR / "services" / "chat_service.py",
        """
        import time
        from datetime import datetime

        from sqlalchemy.orm import Session

        from app.models.conversation import Conversation
        from app.models.message import Message
        from app.models.model_run import ModelRun
        from app.schemas.chat_schema import ChatRequest, ChatResponse
        from app.services.inference_client import InferenceClientError, call_inference_api
        from app.services.safety_service import is_unsafe_prompt, safe_refusal_response


        def make_title(message: str) -> str:
            cleaned = " ".join(message.strip().split())
            if len(cleaned) <= 60:
                return cleaned
            return cleaned[:60] + "..."


        def create_or_get_conversation(db: Session, request: ChatRequest) -> Conversation:
            if request.conversation_id:
                conversation = (
                    db.query(Conversation)
                    .filter(Conversation.id == request.conversation_id)
                    .first()
                )

                if conversation:
                    return conversation

            conversation = Conversation(title=make_title(request.message))
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            return conversation


        def handle_chat(db: Session, request: ChatRequest) -> ChatResponse:
            conversation = create_or_get_conversation(db, request)

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

                conversation.updated_at = datetime.utcnow()
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

                conversation.updated_at = datetime.utcnow()
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

                conversation.updated_at = datetime.utcnow()
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
        """,
    )

    # ============================================================
    # routes/health_routes.py
    # ============================================================

    write_file(
        APP_DIR / "routes" / "health_routes.py",
        """
        from fastapi import APIRouter

        from app.config import settings


        router = APIRouter(tags=["Health"])


        @router.get("/health")
        def health():
            return {
                "status": "ok",
                "app": settings.APP_NAME,
                "env": settings.APP_ENV,
                "inference_api_url": settings.INFERENCE_API_URL,
            }


        @router.get("/")
        def root():
            return {
                "name": settings.APP_NAME,
                "status": "running",
                "docs": "/docs",
            }
        """,
    )

    # ============================================================
    # routes/chat_routes.py
    # ============================================================

    write_file(
        APP_DIR / "routes" / "chat_routes.py",
        """
        from fastapi import APIRouter, Depends
        from sqlalchemy.orm import Session

        from app.database import get_db
        from app.schemas.chat_schema import ChatRequest, ChatResponse
        from app.services.chat_service import handle_chat


        router = APIRouter(prefix="/api", tags=["Chat"])


        @router.post("/chat", response_model=ChatResponse)
        def chat(request: ChatRequest, db: Session = Depends(get_db)):
            return handle_chat(db, request)
        """,
    )

    # ============================================================
    # routes/conversation_routes.py
    # ============================================================

    write_file(
        APP_DIR / "routes" / "conversation_routes.py",
        """
        from fastapi import APIRouter, Depends, HTTPException
        from sqlalchemy.orm import Session, joinedload

        from app.database import get_db
        from app.models.conversation import Conversation
        from app.schemas.conversation_schema import ConversationDetailOut, ConversationListOut


        router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


        @router.get("", response_model=list[ConversationListOut])
        def list_conversations(db: Session = Depends(get_db)):
            return (
                db.query(Conversation)
                .order_by(Conversation.updated_at.desc())
                .all()
            )


        @router.get("/{conversation_id}", response_model=ConversationDetailOut)
        def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
            conversation = (
                db.query(Conversation)
                .options(joinedload(Conversation.messages))
                .filter(Conversation.id == conversation_id)
                .first()
            )

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            return conversation


        @router.delete("/{conversation_id}")
        def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
            conversation = (
                db.query(Conversation)
                .filter(Conversation.id == conversation_id)
                .first()
            )

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            db.delete(conversation)
            db.commit()

            return {
                "status": "deleted",
                "conversation_id": conversation_id,
            }
        """,
    )

    # ============================================================
    # routes/feedback_routes.py
    # ============================================================

    write_file(
        APP_DIR / "routes" / "feedback_routes.py",
        """
        from fastapi import APIRouter, Depends, HTTPException
        from sqlalchemy.orm import Session

        from app.database import get_db
        from app.models.feedback import Feedback
        from app.models.message import Message
        from app.schemas.feedback_schema import FeedbackRequest, FeedbackResponse


        router = APIRouter(prefix="/api", tags=["Feedback"])


        @router.post("/feedback", response_model=FeedbackResponse)
        def create_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
            message = (
                db.query(Message)
                .filter(Message.id == request.message_id)
                .first()
            )

            if not message:
                raise HTTPException(status_code=404, detail="Message not found")

            feedback = Feedback(
                message_id=request.message_id,
                rating=request.rating,
                comment=request.comment,
            )

            db.add(feedback)
            db.commit()
            db.refresh(feedback)

            return FeedbackResponse(
                id=feedback.id,
                message_id=feedback.message_id,
                rating=feedback.rating,
                comment=feedback.comment,
                status="saved",
            )
        """,
    )

    # ============================================================
    # app/main.py
    # ============================================================

    write_file(
        APP_DIR / "main.py",
        """
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware

        from app.config import settings
        from app.database import Base, engine

        # Import models so SQLAlchemy registers them before create_all
        from app.models.conversation import Conversation
        from app.models.message import Message
        from app.models.model_run import ModelRun
        from app.models.feedback import Feedback

        from app.routes.health_routes import router as health_router
        from app.routes.chat_routes import router as chat_router
        from app.routes.conversation_routes import router as conversation_router
        from app.routes.feedback_routes import router as feedback_router


        def create_tables():
            Base.metadata.create_all(bind=engine)


        create_tables()


        app = FastAPI(
            title=settings.APP_NAME,
            version="1.0.0",
            description="PralayAI main backend with PostgreSQL and inference API integration.",
        )

        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origin_list or ["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        app.include_router(health_router)
        app.include_router(chat_router)
        app.include_router(conversation_router)
        app.include_router(feedback_router)
        """,
    )

    print("\nDONE.")
    print("Backend files generated successfully.")
    print("\nNext commands:")
    print("source .venv/bin/activate")
    print("uv pip install -r backend/requirements.txt")
    print("cd backend")
    print("uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")


if __name__ == "__main__":
    main()