# Agent: Test Reviewer

## Purpose

Ensure changes are tested with practical commands.

## Required Test Commands

Backend health:

```bash
curl http://localhost:8000/health
```

Main chat:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 250
  }'
```

Conversation list:

```bash
curl http://localhost:8000/api/conversations
```

Local inference:

```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 300
  }'
```

Public HF Space inference:

```bash
curl -X POST https://omchoksi108-pralayai-inference-api.hf.space/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain incident response in 5 defensive steps.",
    "max_new_tokens": 300
  }'
```

## Review Checklist

- Did the backend start?
- Did database connect?
- Did `/health` return ok?
- Did `/api/chat` return assistant message?
- Was conversation saved?
- Was model run saved?
- Does unsafe prompt get blocked?
- Does frontend receive expected JSON?
