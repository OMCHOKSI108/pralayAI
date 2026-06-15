# Skill: Fix PostgreSQL Auth

## Symptom

```txt
password authentication failed for user "postgres"
```

## Preferred Fix

Create dedicated DB user:

```bash
sudo -u postgres psql
```

```sql
DROP DATABASE IF EXISTS pralayai_db;
DROP USER IF EXISTS pralayai_user;

CREATE USER pralayai_user WITH PASSWORD 'pralayai_pass';
CREATE DATABASE pralayai_db OWNER pralayai_user;

GRANT ALL PRIVILEGES ON DATABASE pralayai_db TO pralayai_user;

\c pralayai_db

GRANT ALL ON SCHEMA public TO pralayai_user;
ALTER SCHEMA public OWNER TO pralayai_user;

\q
```

## Env

```env
DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
```
