# Skill: Deploy Hugging Face Space

## Purpose

Deploy the public free CPU inference API.

## Current Space

```txt
https://huggingface.co/spaces/OMCHOKSI108/pralayai-inference-api
```

## Public API

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

## Deploy Command

```bash
source .venv/bin/activate
python model_ops/deploy_space.py
```

## Test

```bash
curl -X POST https://omchoksi108-pralayai-inference-api.hf.space/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Explain incident response in 5 defensive steps.","max_new_tokens":300}'
```
