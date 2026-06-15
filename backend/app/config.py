from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    APP_NAME: str = "PralayAI Backend"
    APP_ENV: str = "local"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/pralayai_db"

    INFERENCE_API_URL: str = "http://localhost:5000/generate"
    REQUEST_TIMEOUT_SECONDS: int = 180

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    WEB_SEARCH_ENABLED: bool = True
    WEB_FETCH_TIMEOUT_MS: int = 10000
    MAX_RESEARCH_SOURCES: int = 8
    MAX_UPLOAD_SIZE_MB: int = 20

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.3
    RAG_CHROMA_PATH: str = "data/chromadb"

    MEMORY_ENABLED: bool = True
    MEMORY_EXTRACTION_ENABLED: bool = True
    DEEP_RESEARCH_ENABLED: bool = True
    CODE_SKILL_ENABLED: bool = True

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "PralayAI <noreply@pralayai.com>"
    RESET_OTP_EXPIRY_MINUTES: int = 10

    # ── RAG settings ──────────────────────────────────────────────────────────
    UPLOAD_DIR: str = str(BACKEND_ROOT / "uploads")
    CHROMA_PATH: str = str(BACKEND_ROOT / "chroma_db")
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    MAX_FILE_SIZE_MB: int = 20
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.25   # cosine distance; lower = more similar
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 120

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

# Ensure upload and chroma dirs exist
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.CHROMA_PATH).mkdir(parents=True, exist_ok=True)
