# Rule: Frontend

## Frontend Role

The frontend is a Gemini clone React UI.

## API Usage

Frontend must call:

```txt
POST http://localhost:8000/api/chat
```

It must not call Hugging Face directly.

## Required State

- user input
- loading state
- assistant response
- error state
- current conversation id

## Rules

- Keep Gemini-like UI.
- Do not expose secrets.
- Keep API base URL configurable.
- Handle slow responses from HF Space.
- Preserve `conversation_id` for chat continuity.
