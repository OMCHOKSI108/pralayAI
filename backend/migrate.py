"""
Migration script for PralayAI v1.1.0 schema changes.

Run:  python backend/migrate.py
"""

import logging
import sys

from app.database import engine
from app.models.chat_context import ChatContext
from sqlalchemy import inspect, text

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
log = logging.getLogger("migrate")

MIGRATIONS = [
    # Users table
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(20) NOT NULL DEFAULT 'english'",
     "Add preferred_language to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS answer_style VARCHAR(255) NOT NULL DEFAULT '{}'",
     "Add answer_style to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS thinking_level VARCHAR(10) NOT NULL DEFAULT 'medium'",
     "Add thinking_level to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'dark'",
     "Add theme to users"),
    # Conversations table
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE",
     "Add pinned to conversations"),
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE",
     "Add archived to conversations"),
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS message_count INTEGER NOT NULL DEFAULT 0",
     "Add message_count to conversations"),
    # Messages table
    ("ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(30)",
     "Add status to messages"),
    ("ALTER TABLE messages ADD COLUMN IF NOT EXISTS model_used VARCHAR(100)",
     "Add model_used to messages"),
    ("ALTER TABLE messages ADD COLUMN IF NOT EXISTS skill_used VARCHAR(100)",
     "Add skill_used to messages"),
    ("ALTER TABLE messages ADD COLUMN IF NOT EXISTS tokens_used INTEGER",
     "Add tokens_used to messages"),
]


def run_migrations():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    # Run ALTER TABLE statements
    for sql, desc in MIGRATIONS:
        try:
            with engine.connect() as conn:
                conn.execute(text(sql))
                conn.commit()
                log.info("OK: %s", desc)
        except Exception as e:
            log.warning("SKIP %s: %s", desc, e)

    # Create new tables
    if "chat_contexts" not in existing_tables:
        try:
            ChatContext.__table__.create(engine)
            log.info("OK: Created chat_contexts table")
        except Exception as e:
            log.warning("SKIP create chat_contexts: %s", e)
    else:
        log.info("OK: chat_contexts table already exists")

    log.info("Migration complete.")


if __name__ == "__main__":
    sys.path.insert(0, ".")
    run_migrations()
