# Rule: Backend

## Backend Role

The backend is the application layer, not the model layer.

It should:

- receive frontend requests
- save chat data
- run safety checks
- call inference API
- return JSON response

## Do Not Add Without Permission

- JWT auth
- Redis
- RAG
- Celery
- Docker
- Alembic
- Kubernetes
- microservices

## Required Backend Flow

```txt
POST /api/chat
    ↓
create/get conversation
    ↓
save user message
    ↓
safety filter
    ↓
call inference API
    ↓
save assistant message
    ↓
save model run
    ↓
return response
```
