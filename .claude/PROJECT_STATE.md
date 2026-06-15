# PralayAI Current Project State

## Completed

- Fine-tuned cybersecurity LoRA adapter.
- Pushed adapter to `OMCHOKSI108/Paralay1.1`.
- Merged adapter with Qwen2.5 1.5B base model.
- Pushed merged model to `OMCHOKSI108/Paralay1.1-Merged`.
- Built local CUDA inference API.
- Built public HF Space CPU inference API.
- Generated main FastAPI backend structure.
- Added PostgreSQL persistence design.
- Added Claude project context.

## Working APIs

Local inference:

```txt
http://localhost:5000/generate
```

Public inference:

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

Main backend:

```txt
http://localhost:8000/api/chat
```

## Pending

- Fix PostgreSQL credentials if still failing.
- Run main backend successfully.
- Connect frontend to backend.
- Write final README.
- Clean Git tracking.
- Verify no secrets/model weights are committed.
