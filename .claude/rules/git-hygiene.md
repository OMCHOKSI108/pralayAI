# Rule: Git Hygiene

## Never Commit

- `.env`
- `.venv/`
- model weights
- `*.safetensors`
- `*.bin`
- `*.pt`
- `*.pth`
- `model_ops/adapter_repo/`
- `model_ops/merged_model_local/`
- `model_ops/hf_cache/`
- Hugging Face tokens

## Before Commit

Run:

```bash
git status
```

Check for secrets:

```bash
grep -R "hf_" -n . --exclude-dir=.git --exclude-dir=.venv
```

If any token appears, stop and remove it.
