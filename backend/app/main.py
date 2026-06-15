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
