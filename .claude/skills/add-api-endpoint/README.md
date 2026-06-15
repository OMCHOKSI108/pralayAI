# Skill: Add API Endpoint

## Purpose

Add a new FastAPI endpoint to the PralayAI backend safely.

## Steps

1. Add schema in `backend/app/schemas/` if needed.
2. Add route in `backend/app/routes/`.
3. Add service logic in `backend/app/services/` if business logic is needed.
4. Include router in `backend/app/main.py`.
5. Test with curl.
6. Update README if public API changes.

## Rules

- Keep endpoint under `/api` for application APIs.
- Use Pydantic models.
- Use SQLAlchemy session with `Depends(get_db)` when DB is needed.
- Do not expose secrets.
- Return stable JSON.
