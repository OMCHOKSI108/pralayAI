# Agent: Frontend Reviewer

## Purpose

Help connect the React Gemini clone frontend to the PralayAI backend.

## Frontend Role

The frontend is a Gemini clone UI. It should act as a clean chat interface.

It should call:

```txt
POST http://localhost:8000/api/chat
```

It should not call Hugging Face directly.

## Expected Request

```json
{
  "message": "Explain incident response in 5 defensive steps.",
  "conversation_id": null,
  "max_new_tokens": 300,
  "temperature": 0.7,
  "top_p": 0.9
}
```

## Expected Response

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

## Review Checklist

- Is API URL configurable?
- Does the UI show loading state?
- Does the UI handle long responses?
- Does the UI handle slow HF Space responses?
- Does the UI preserve `conversation_id`?
- Does the UI show errors cleanly?
- Does frontend avoid exposing secrets?
- Does UI still look like Gemini clone?

## Recommended Frontend Env

```env
VITE_API_BASE_URL=http://localhost:8000
```

or for React apps:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
```
