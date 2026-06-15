# Claude Workspace Guide — PralayAI

This `.claude/` folder contains project-specific agents, rules, hooks, and skills for working on **PralayAI**.

Claude must read:

1. Root `CLAUDE.md`
2. `.claude/README.md`
3. Relevant `.claude/rules/*.md`
4. Relevant `.claude/agents/*.md`
5. Relevant `.claude/skills/*/README.md`

before making meaningful code changes.

## Project Summary

**PralayAI** is a defensive cybersecurity AI chatbot project created by **Om Choksi**.

It includes:

- React Gemini-clone frontend inside `frontend/`
- Main FastAPI backend inside `backend/`
- PostgreSQL database persistence
- Local CUDA inference API
- Public Hugging Face Space CPU inference API
- Fine-tuned merged model on Hugging Face
- Model operation utilities inside `model_ops/`

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
Defensive Cybersecurity Assistant Response
```

## Important Links

LoRA adapter model:

```txt
OMCHOKSI108/Paralay1.1
```

Merged model:

```txt
OMCHOKSI108/Paralay1.1-Merged
```

Public inference API:

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

Local inference API:

```txt
http://localhost:5000/generate
```

Main backend API:

```txt
http://localhost:8000/api/chat
```

## Claude Working Rules

Claude should:

- Keep the project architecture stable.
- Make small, focused, testable changes.
- Never expose secrets.
- Never commit `.env`.
- Never commit model weights.
- Keep frontend calling backend only.
- Keep backend calling inference API.
- Keep model behavior defensive and safe.
- Prefer practical working code over over-engineered architecture.

## Current Priority

Current priority is:

1. Stabilize PostgreSQL backend.
2. Connect Gemini clone frontend to `POST /api/chat`.
3. Build proper project README.
4. Keep local and HF Space inference working.
5. Avoid unnecessary rewrites.
