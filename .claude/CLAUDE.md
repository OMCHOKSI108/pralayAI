# CLAUDE.md — PralayAI Project Guide

## Project Identity

Project name: **PralayAI**
Developer: **Om Choksi**
Domain: **Cybersecurity AI Chatbot / Fine-tuned LLM / FastAPI Backend / React Frontend**

PralayAI is a cybersecurity-focused AI assistant built around a fine-tuned Qwen2.5 1.5B model. The project contains:

1. A fine-tuned and merged Hugging Face model.
2. A local CUDA inference API.
3. A public Hugging Face Space CPU inference API.
4. A main FastAPI backend with PostgreSQL chat persistence.
5. A React frontend based on a Gemini clone UI.
6. Model operation utilities inside `model_ops`.

This project is not a generic chatbot. It is specifically a **defensive cybersecurity assistant** that should help with incident response, log analysis, MITRE ATT&CK explanation, cloud security, malware defense, security awareness, and safe cybersecurity learning.

---

## Current Project Status

The model fine-tuning and deployment pipeline is already completed.

### Hugging Face Model Repositories

LoRA adapter repository:

```txt
OMCHOKSI108/Paralay1.1
```

Merged full model repository:

```txt
OMCHOKSI108/Paralay1.1-Merged
```

The merged model was created locally by loading:

```txt
Base model: Qwen/Qwen2.5-1.5B-Instruct
Adapter: OMCHOKSI108/Paralay1.1
```

Then merging LoRA into the base model and pushing the final standalone model to Hugging Face.

---

## Inference APIs

There are two working inference APIs.

### 1. Local CUDA Inference API

Local inference is fast and runs on Om’s Ubuntu machine with NVIDIA GPU.

```txt
http://localhost:5000/generate
```

Example response speed:

```txt
~4.5 seconds
device: cuda
```

Use this during local development.

### 2. Public Hugging Face Space Inference API

Free public Hugging Face Space API:

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

This runs on CPU, so it is slower.

Example response speed:

```txt
~54 seconds
device: cpu
```

Use this for public demos when local machine is not exposed.

---

## Current Folder Structure

Expected project structure:

```txt
PralayAI/
├── frontend/
│   └── React Gemini-clone based frontend UI
│
├── backend/
│   ├── code.py
│   ├── requirements.txt
│   ├── run.sh
│   ├── README.md
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── conversation.py
│       │   ├── message.py
│       │   ├── model_run.py
│       │   └── feedback.py
│       ├── schemas/
│       │   ├── __init__.py
│       │   ├── chat_schema.py
│       │   ├── conversation_schema.py
│       │   └── feedback_schema.py
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── health_routes.py
│       │   ├── chat_routes.py
│       │   ├── conversation_routes.py
│       │   └── feedback_routes.py
│       └── services/
│           ├── __init__.py
│           ├── inference_client.py
│           ├── safety_service.py
│           └── chat_service.py
│
├── model_ops/
│   ├── MergeModel.py
│   ├── code.py
│   ├── deploy_space.py
│   └── hf_space_inference_api/
│       ├── README.md
│       ├── app.py
│       ├── requirements.txt
│       ├── Dockerfile
│       └── .gitignore
│
├── .env
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## Frontend Context

The `frontend/` folder contains a downloaded **Gemini clone React frontend**.

The frontend is currently a UI layer / mock frontend. The goal is to connect it to the main backend chat API.

Frontend should call:

```txt
POST http://localhost:8000/api/chat
```

Payload:

```json
{
  "message": "Explain incident response in 5 defensive steps.",
  "conversation_id": null,
  "max_new_tokens": 300,
  "temperature": 0.7,
  "top_p": 0.9
}
```

Expected response:

```json
{
  "conversation_id": "uuid",
  "user_message_id": "uuid",
  "assistant_message_id": "uuid",
  "assistant_message": "response text",
  "status": "success",
  "latency_seconds": 4.5,
  "source": "http://localhost:5000/generate"
}
```

Do not directly call Hugging Face or the inference API from frontend unless explicitly asked. The frontend should talk to the main backend only.

Correct flow:

```txt
React Frontend
    ↓
Main FastAPI Backend
    ↓
Inference API
    ↓
PralayAI Model
```

---

## Backend Context

The `backend/` folder contains the main FastAPI backend.

The backend is responsible for:

1. Receiving chat requests from the frontend.
2. Saving conversations in PostgreSQL.
3. Saving user and assistant messages.
4. Running a basic cybersecurity safety filter.
5. Calling the inference API.
6. Saving model run logs.
7. Returning assistant response to frontend.
8. Supporting feedback.
9. Supporting conversation history.

The backend should not load the LLM model directly. It should call an inference API.

---

## Backend APIs

The main backend should expose these endpoints:

```txt
GET    /
GET    /health
POST   /api/chat
GET    /api/conversations
GET    /api/conversations/{conversation_id}
DELETE /api/conversations/{conversation_id}
POST   /api/feedback
```

Main chat endpoint:

```txt
POST /api/chat
```

Conversation APIs:

```txt
GET /api/conversations
GET /api/conversations/{conversation_id}
DELETE /api/conversations/{conversation_id}
```

Feedback API:

```txt
POST /api/feedback
```

---

## Database Context

Database: **PostgreSQL**

Local database should be managed through pgAdmin or `psql`.

Recommended DB setup:

```txt
Database name: pralayai_db
User: pralayai_user
Password: pralayai_pass
```

Recommended root `.env` database URL:

```env
DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
```

The backend creates tables automatically using SQLAlchemy `Base.metadata.create_all()` during development.

Tables:

```txt
conversations
messages
model_runs
feedback
```

Do not add Alembic migrations right now unless explicitly asked.

---

## Root `.env` Requirements

Root `.env` should contain:

```env
APP_NAME=PralayAI Backend
APP_ENV=local
APP_HOST=0.0.0.0
APP_PORT=8000

DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db

INFERENCE_API_URL=http://localhost:5000/generate
# INFERENCE_API_URL=https://omchoksi108-pralayai-inference-api.hf.space/generate

CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173

REQUEST_TIMEOUT_SECONDS=180

HF_TOKEN=hf_your_token_here
HF_MODEL_REPO=OMCHOKSI108/Paralay1.1-Merged
HF_SPACE_REPO=OMCHOKSI108/pralayai-inference-api
```

Use local inference during development:

```env
INFERENCE_API_URL=http://localhost:5000/generate
```

Use Hugging Face Space for public demo:

```env
INFERENCE_API_URL=https://omchoksi108-pralayai-inference-api.hf.space/generate
```

Never expose `HF_TOKEN` to frontend.

---

## Model Ops Context

The `model_ops/` folder is for model engineering and deployment utilities.

Important files:

```txt
model_ops/MergeModel.py
```

Used to clone adapter repo, load base model, merge LoRA adapter, test locally, and push merged model.

```txt
model_ops/code.py
```

Generated Hugging Face Space deployment files.

```txt
model_ops/deploy_space.py
```

Uploads the Hugging Face Space Docker API.

```txt
model_ops/hf_space_inference_api/
```

Contains Docker Space files:

```txt
app.py
Dockerfile
requirements.txt
README.md
.gitignore
```

The Hugging Face Space is already deployed and working.

Public Space:

```txt
https://huggingface.co/spaces/OMCHOKSI108/pralayai-inference-api
```

Public API:

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

---

## Safety Requirements

PralayAI must remain defensive.

The assistant should refuse requests involving:

```txt
phishing email generation
credential theft
keylogger code
malware creation
ransomware code
reverse shell payloads
antivirus bypass
evasion
unauthorized exploitation
persistence malware
password dumping
```

Safe alternatives should be offered, such as:

```txt
detection logic
incident response
log analysis
defensive explanation
threat prevention
security hardening
awareness training
MITRE mapping
```

Example safe refusal:

```txt
I can’t help with creating phishing, malware, credential theft, evasion, or unauthorized exploitation content. I can help with defensive alternatives such as detection logic, incident response steps, log analysis, hardening, security awareness, or threat prevention.
```

---

## System Prompt

Use this system prompt wherever needed:

```txt
You are PralayAI, a defensive cybersecurity assistant created by Om Choksi. You help with cybersecurity education, incident response, log analysis, cloud security, malware defense, and safe security learning. Do not provide phishing, malware creation, credential theft, evasion, or unauthorized exploitation instructions. If a request is unsafe, refuse briefly and provide a safe defensive alternative.
```

---

## Local Development Commands

Activate environment:

```bash
cd ~/workspace/projects/MyProjects/PralayAI
source .venv/bin/activate
```

Run local inference API:

```bash
python backend/inference.py
```

or:

```bash
uvicorn backend.inference:app --host 0.0.0.0 --port 5000
```

Run main backend:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend docs:

```txt
http://localhost:8000/docs
```

Inference docs:

```txt
http://localhost:5000/docs
```

---

## Test Commands

Test local inference API:

```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 300,
    "temperature": 0.7,
    "top_p": 0.9
  }'
```

Test public Hugging Face Space inference API:

```bash
curl -X POST https://omchoksi108-pralayai-inference-api.hf.space/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 300
  }'
```

Test main backend chat API:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 250
  }'
```

Test conversation list:

```bash
curl http://localhost:8000/api/conversations
```

Test backend health:

```bash
curl http://localhost:8000/health
```

---

## Current Known Issue

A recent backend run failed because PostgreSQL password authentication failed for user `postgres`.

Error meaning:

```txt
password authentication failed for user "postgres"
```

Fix by creating dedicated DB user:

```bash
sudo -u postgres psql
```

Then:

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

Then root `.env`:

```env
DATABASE_URL=postgresql+psycopg2://pralayai_user:pralayai_pass@localhost:5432/pralayai_db
```

---

## Development Rules for Claude

When editing this project, follow these rules:

1. Do not expose `HF_TOKEN` in frontend.
2. Do not commit `.env`.
3. Do not commit model files such as `.safetensors`, `.bin`, `.pt`, `.pth`.
4. Do not put merged model files inside GitHub repo.
5. Do not make frontend call Hugging Face directly.
6. Main backend should call inference API.
7. Inference API should handle the model.
8. Backend should store conversations and messages in PostgreSQL.
9. Keep safety filtering in backend and inference layer.
10. Do not add JWT auth unless explicitly asked.
11. Do not add Redis unless explicitly asked.
12. Do not add RAG unless explicitly asked.
13. Do not add Docker to main backend unless explicitly asked.
14. Keep implementation simple, working, and production-style.
15. Prefer small incremental changes over rewriting the whole project.

---

## What Is Left To Build

The main missing file is:

```txt
README.md
```

The README should explain:

1. Project overview.
2. Architecture.
3. Model details.
4. Local setup.
5. Backend setup.
6. Frontend setup.
7. PostgreSQL setup.
8. Inference API setup.
9. Hugging Face Space deployment.
10. API examples.
11. Safety policy.
12. Future improvements.

Main backend also needs to be tested after fixing PostgreSQL credentials.

Frontend needs to be connected to:

```txt
POST http://localhost:8000/api/chat
```

---

## Final Architecture

```txt
React Gemini Clone Frontend
        ↓
Main FastAPI Backend
        ↓
PostgreSQL Database
        ↓
Inference API
        ├── Local CUDA API: http://localhost:5000/generate
        └── Public HF Space API: https://omchoksi108-pralayai-inference-api.hf.space/generate
        ↓
PralayAI Merged Model
        ↓
Cybersecurity Assistant Response
```

This is the intended architecture. Do not change it unless Om explicitly requests a new architecture.
