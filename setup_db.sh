#!/usr/bin/env bash
set -e

DB_USER="pralayai_user"
DB_PASS="pralayai_pass"
DB_NAME="pralayai_db"

echo ""
echo "============================================================"
echo "  PralayAI — PostgreSQL Setup"
echo "============================================================"

# ── Check PostgreSQL is running ────────────────────────────────────────────────
if ! pg_isready -q 2>/dev/null; then
    echo ""
    echo "ERROR: PostgreSQL is not running."
    echo "Start it with:  sudo systemctl start postgresql"
    echo ""
    exit 1
fi
echo "  PostgreSQL is running."

# ── Create user if not exists ──────────────────────────────────────────────────
USER_EXISTS=$(sudo -u postgres psql -tAc \
    "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER';" 2>/dev/null | tr -d '[:space:]')

if [ "$USER_EXISTS" = "1" ]; then
    echo "  User '$DB_USER' already exists. Skipping."
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
    echo "  Created user '$DB_USER'."
fi

# ── Create database if not exists ─────────────────────────────────────────────
DB_EXISTS=$(sudo -u postgres psql -tAc \
    "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null | tr -d '[:space:]')

if [ "$DB_EXISTS" = "1" ]; then
    echo "  Database '$DB_NAME' already exists. Skipping creation."
else
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "  Created database '$DB_NAME'."
fi

# ── Add user_id column to conversations if it doesn't exist ───────────────────
sudo -u postgres psql -d "$DB_NAME" -c "ALTER TABLE IF EXISTS conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);" 2>/dev/null || true
sudo -u postgres psql -d "$DB_NAME" -c "CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);" 2>/dev/null || true
echo "  Schema migrations applied."

# ── Always fix schema + table permissions (covers tables created by any user) ──
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER SCHEMA public OWNER TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
echo "  Permissions granted on all tables and sequences."

# ── Verify connection ──────────────────────────────────────────────────────────
if PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" -h "::1" -p 5432 -c "\q" 2>/dev/null; then
    echo "  Connection verified: $DB_USER@[::1]:5432/$DB_NAME"
else
    echo ""
    echo "WARNING: Could not verify connection as '$DB_USER' via IPv6."
    echo "  Check pg_hba.conf allows host connections for $DB_USER."
    echo ""
fi

echo "============================================================"
echo "  Database setup complete."
echo "============================================================"
echo ""
