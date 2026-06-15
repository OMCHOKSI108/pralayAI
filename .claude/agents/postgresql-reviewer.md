# Agent: PostgreSQL Reviewer

## Purpose

Review PostgreSQL setup and database-related backend code.

## Recommended Local DB

```txt
DB name: pralayai_db
User: pralayai_user
Password: pralayai_pass
```

## Recommended URL

```env
DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
```

## Tables

- conversations
- messages
- model_runs
- feedback

## Known Issue

Previous failure:

```txt
password authentication failed for user "postgres"
```

Correct fix is to use dedicated user `pralayai_user`.

## Setup SQL

```sql
DROP DATABASE IF EXISTS pralayai_db;
DROP USER IF EXISTS pralayai_user;

CREATE USER pralayai_user WITH PASSWORD 'pralayai_pass';
CREATE DATABASE pralayai_db OWNER pralayai_user;

GRANT ALL PRIVILEGES ON DATABASE pralayai_db TO pralayai_user;

\c pralayai_db

GRANT ALL ON SCHEMA public TO pralayai_user;
ALTER SCHEMA public OWNER TO pralayai_user;
```

## Review Checklist

- Is `DATABASE_URL` correct?
- Can `psql` connect?
- Does backend create tables?
- Are foreign keys correct?
- Are deletes cascading where needed?
- Are message timestamps preserved?
- Are conversation updates tracked?
