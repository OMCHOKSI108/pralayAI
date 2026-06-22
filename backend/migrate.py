"""
Migration script for PralayAI v1.1.0 schema changes.

Run:  python backend/migrate.py
"""

import logging
import sys

from app.database import engine
from app.models.chat_context import ChatContext
from sqlalchemy import inspect, text

# Set up basic logging to output INFO level messages and above to the console.
# The format includes the log level (e.g., [INFO]) followed by the message.
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
log = logging.getLogger("migrate")

# List of raw SQL migration statements and their descriptions.
# Each tuple contains: (SQL Command string, Description string)
# Note: "IF NOT EXISTS" prevents errors if the column was added in a previous run.
MIGRATIONS = [
    # --- Users table updates ---
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(20) NOT NULL DEFAULT 'english'",
     "Add preferred_language to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS answer_style VARCHAR(255) NOT NULL DEFAULT '{}'",
     "Add answer_style to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS thinking_level VARCHAR(10) NOT NULL DEFAULT 'medium'",
     "Add thinking_level to users"),
    ("ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'dark'",
     "Add theme to users"),
     
    # --- Conversations table updates ---
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE",
     "Add pinned to conversations"),
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE",
     "Add archived to conversations"),
    ("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS message_count INTEGER NOT NULL DEFAULT 0",
     "Add message_count to conversations"),
     
    # --- Messages table updates ---
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
    """
    Executes the defined SQL migrations and creates any new tables required for v1.1.0.
    """
    # Use SQLAlchemy's inspector to get a list of currently existing tables in the database
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    # Step 1: Run ALTER TABLE statements to add new columns to existing tables
    for sql, desc in MIGRATIONS:
        try:
            # Open a connection to the database
            with engine.connect() as conn:
                # Execute the raw SQL query
                conn.execute(text(sql))
                # Explicitly commit the transaction to save changes to the database
                conn.commit()
                log.info("OK: %s", desc)
        except Exception as e:
            # Catch any exceptions (e.g., syntax errors, connection drops) and log them as warnings
            # We skip the failing migration and continue with the rest
            log.warning("SKIP %s: %s", desc, e)

    # Step 2: Create new tables that don't exist yet
    # Check if the 'chat_contexts' table is already in the database
    if "chat_contexts" not in existing_tables:
        try:
            # Use SQLAlchemy's model metadata to automatically generate and execute the CREATE TABLE statement
            ChatContext.__table__.create(engine)
            log.info("OK: Created chat_contexts table")
        except Exception as e:
            log.warning("SKIP create chat_contexts: %s", e)
    else:
        log.info("OK: chat_contexts table already exists")

    log.info("Migration complete.")

if __name__ == "__main__":
    # Ensure the current directory is in the Python path so local modules (like 'app') can be imported correctly
    sys.path.insert(0, ".")
    # Execute the migration function when the script is run directly
    run_migrations()
