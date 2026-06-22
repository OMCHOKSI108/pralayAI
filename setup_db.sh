#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status to prevent cascading failures.
set -e

# ==============================================================================
# PralayAI Database Setup Script
# 
# This script automates the setup of the PostgreSQL database for the local
# development environment. It ensures the database server is running, creates 
# the required user and database, applies necessary schema adjustments, 
# and sets appropriate permissions to avoid access issues during development.
# ==============================================================================

# Define database credentials and configuration
DB_USER="pralayai_user"
DB_PASS="pralayai_pass"
DB_NAME="pralayai_db"

echo ""
echo "============================================================"
echo "  PralayAI — PostgreSQL Setup"
echo "============================================================"

# ── 1. Check PostgreSQL Service ────────────────────────────────────────────────
# Use pg_isready to verify that the PostgreSQL server is actively accepting connections.
# Output is routed to /dev/null to keep the console output clean.
if ! pg_isready -q 2>/dev/null; then
    echo ""
    echo "ERROR: PostgreSQL is not running."
    echo "Start it with:  sudo systemctl start postgresql"
    echo ""
    exit 1
fi
echo "  PostgreSQL is running."

# ── 2. Create Database User ────────────────────────────────────────────────────
# Check if the user already exists by querying the pg_roles system catalog.
# 'tr -d' removes whitespace to ensure clean string comparison.
USER_EXISTS=$(sudo -u postgres psql -tAc \
    "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER';" 2>/dev/null | tr -d '[:space:]')

if [ "$USER_EXISTS" = "1" ]; then
    echo "  User '$DB_USER' already exists. Skipping."
else
    # Create the user with the specified password.
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
    echo "  Created user '$DB_USER'."
fi

# ── 3. Create Database ─────────────────────────────────────────────────────────
# Check if the database already exists by querying the pg_database system catalog.
DB_EXISTS=$(sudo -u postgres psql -tAc \
    "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null | tr -d '[:space:]')

if [ "$DB_EXISTS" = "1" ]; then
    echo "  Database '$DB_NAME' already exists. Skipping creation."
else
    # Create the database and assign ownership to our newly created user.
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    
    # Explicitly grant all privileges on the database to the user.
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "  Created database '$DB_NAME'."
fi

# ── 4. Apply Initial Schema Migrations ─────────────────────────────────────────
# Add the user_id column to the conversations table if it exists. 
# The '|| true' at the end ensures the script doesn't crash if the table hasn't been created yet.
sudo -u postgres psql -d "$DB_NAME" -c "ALTER TABLE IF EXISTS conversations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);" 2>/dev/null || true

# Create an index on the user_id column to optimize query performance when fetching user histories.
sudo -u postgres psql -d "$DB_NAME" -c "CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);" 2>/dev/null || true
echo "  Schema migrations applied."

# ── 5. Standardize Permissions ─────────────────────────────────────────────────
# This block ensures that DB_USER has full read/write access to all current
# and future tables and sequences within the public schema. This prevents
# "permission denied" errors when the backend ORM attempts to insert data.
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER SCHEMA public OWNER TO $DB_USER;"

# Grant privileges for tables and sequences that currently exist.
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# Set default privileges so tables/sequences created in the future automatically inherit these grants.
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
echo "  Permissions granted on all tables and sequences."

# ── 6. Verify Connection ───────────────────────────────────────────────────────
# Attempt to connect to the database using the new user credentials via IPv6 loopback (::1).
# PGPASSWORD is used to securely pass the password inline without prompting the user.
if PGPASSWORD="$DB_PASS" psql -U "$DB_USER" -d "$DB_NAME" -h "::1" -p 5432 -c "\q" 2>/dev/null; then
    echo "  Connection verified: $DB_USER@[::1]:5432/$DB_NAME"
else
    # If verification fails, it usually indicates that PostgreSQL's pg_hba.conf is not 
    # configured to allow password authentication (md5/scram-sha-256) for local connections.
    echo ""
    echo "WARNING: Could not verify connection as '$DB_USER' via IPv6."
    echo "  Check pg_hba.conf allows host connections for $DB_USER."
    echo ""
fi

echo "============================================================"
echo "  Database setup complete."
echo "============================================================"
echo ""
