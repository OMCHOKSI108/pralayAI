# Skill: Connect Frontend Chat

## Purpose

Connect Gemini clone React frontend to PralayAI backend.

## Backend Endpoint

```txt
POST http://localhost:8000/api/chat
```

## Request

```json
{
  "message": "user text",
  "conversation_id": null,
  "max_new_tokens": 300,
  "temperature": 0.7,
  "top_p": 0.9
}
```

## Response Field To Render

```txt
assistant_message
```

## Frontend Requirements

- Show loading spinner.
- Disable send button while loading.
- Preserve `conversation_id`.
- Render assistant response.
- Show error message if API fails.
- Keep API base URL in env.
