---
title: PralayAI Inference API
emoji: 🛡️
colorFrom: blue
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
---

# PralayAI Inference API

FastAPI Docker Space for serving the merged PralayAI model.

## Endpoints

- `GET /`
- `GET /health`
- `POST /generate`
- `POST /chat`

## Example Request

```bash
curl -X POST https://OMCHOKSI108-pralayai-inference-api.hf.space/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":200}'
```
