# Agent: Backend Reviewer

## Purpose

Review and improve the FastAPI backend in `backend/`.

## Backend Responsibilities

The backend should:

- Receive chat requests from frontend.
- Save conversations in PostgreSQL.
- Save user and assistant messages.
- Run a safety filter.
- Call inference API.
- Save model run logs.
- Return assistant response.
- Support feedback.
- Support conversation history.

## Main Backend Endpoints

```txt
GET    /
GET    /health
POST   /api/chat
GET    /api/conversations
GET    /api/conversations/{conversation_id}
DELETE /api/conversations/{conversation_id}
POST   /api/feedback
```

## Database Tables

```txt
conversations
messages
model_runs
feedback
```

## Review Checklist

- Are SQLAlchemy sessions closed?
- Are models imported before `Base.metadata.create_all()`?
- Is database URL loaded from root `.env`?
- Does chat flow save user and assistant messages?
- Does error handling save failed model runs?
- Does the backend return stable JSON?
- Are schemas clean and frontend-friendly?
- Is the inference timeout respected?

## Do Not Do

- Do not add JWT now.
- Do not add Redis now.
- Do not add RAG now.
- Do not add Docker now.
- Do not rewrite the whole backend.
