# Rule: API Security

## Applies To

- `backend/app/routes/*`
- `backend/app/services/*`
- `backend/inference.py`
- `model_ops/hf_space_inference_api/app.py`

## Rules

- Never expose `HF_TOKEN`.
- Never return raw stack traces to frontend.
- Validate request body using Pydantic.
- Keep prompt length bounded.
- Keep generation token limits bounded.
- Use timeout when calling inference API.
- Apply safety filter before model call.
- Refuse dangerous cyber requests.
- Do not allow frontend to call HF directly.
- Keep CORS explicit for local frontend.

## Unsafe Requests

Block or redirect:

- phishing generation
- keylogger code
- malware creation
- ransomware
- reverse shells
- credential dumping
- AV bypass
- persistence malware
- unauthorized exploitation
