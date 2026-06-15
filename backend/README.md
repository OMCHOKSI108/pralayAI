# PralayAI Backend

FastAPI backend for PralayAI.

## Features

- PostgreSQL database
- Conversation storage
- Message storage
- Inference API client
- Basic cybersecurity safety filter
- Feedback endpoint
- Health endpoint

## Run

From project root:

```bash
source .venv/bin/activate
uv pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Docs

```txt
http://localhost:8000/docs
```

## Required root .env

```env
APP_NAME=PralayAI Backend
APP_ENV=local
APP_HOST=0.0.0.0
APP_PORT=8000

DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pralayai_db

INFERENCE_API_URL=http://localhost:5000/generate
# INFERENCE_API_URL=https://omchoksi108-pralayai-inference-api.hf.space/generate

CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
REQUEST_TIMEOUT_SECONDS=180
```
