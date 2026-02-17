# Backend

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Env

- `JWT_SECRET`
- `GEMINI_API_KEY` (required for Gemini chat + web card extraction)
- `GEMINI_MODEL` (optional, default `gemini-2.5-flash`)
- `DB_PATH`:
  - SQLite path (example: `backend/cardsavvy.db`), or
  - PostgreSQL URL (example: Neon connection string)

## Behavior

- `/api/chat` uses Gemini and only uses **verified** wallet cards for recommendations.
- `/api/cards/lookup`:
  - Returns `found_verified` if card exists in trusted DB.
  - If not found, uses Gemini web search extraction and returns `needs_confirmation`.
- `/api/cards/confirm` stores unknown cards as:
  - `source = "web_extracted"`
  - `verification_status = "pending"`
  - plus extraction evidence URLs/notes.
