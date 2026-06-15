# Rule: Database PostgreSQL

This project uses PostgreSQL, not SQLite.

## Required DB

```txt
pralayai_db
```

## Recommended User

```txt
pralayai_user
```

## Tables

```txt
conversations
messages
model_runs
feedback
```

## Rules

- Use SQLAlchemy ORM.
- Use root `.env` for `DATABASE_URL`.
- Do not hardcode database password in code.
- Do not use SQLite fallback unless Om asks.
- Do not add PostGIS. The old file name may say postgis, but PralayAI currently does not need PostGIS.
- Keep table creation simple with `Base.metadata.create_all()` during development.
