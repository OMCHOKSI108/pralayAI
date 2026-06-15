# Rule: Model Inference

## Model

```txt
OMCHOKSI108/Paralay1.1-Merged
```

## APIs

Local CUDA:

```txt
http://localhost:5000/generate
```

Public HF Space:

```txt
https://omchoksi108-pralayai-inference-api.hf.space/generate
```

## Rules

- Do not load model in main backend.
- Main backend calls inference API.
- Local inference is preferred for dev.
- HF Space is public but slow.
- Keep max token limits reasonable.
- Keep defensive system prompt.
