# CardSavvy

## Inspiration
Many people own multiple credit cards but still use the wrong one for purchases. Rewards are confusing, category-based, and hard to track. Most users only realize they missed cashback after the transaction is complete.

We wanted to build a system that brings decision intelligence before spending, not after redemption.

## What It Does
CardSavvy recommends the best credit card for every purchase.

Users can:
- Add their credit cards to their wallet
- Enter a merchant name and transaction amount
- Instantly see the optimal card
- View estimated cashback and a clear reward explanation

## Project Structure
- `frontend/` - React + Vite app
- `backend/` - FastAPI service (auth, wallet, lookup, analyze, chat)

## Run Locally

### 1) Backend
```bash
cd backend
python -m venv beenvt
.\beenvt\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend env file: `backend/.env`
```env
JWT_SECRET=replace-with-strong-secret
DB_PATH=postgresql://<your-neon-or-postgres-url>
GEMINI_API_KEY=<your-gemini-key>
GEMINI_MODEL=gemini-2.5-flash
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend env file: `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
```

Open: `http://localhost:5173`

## API Notes
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/cards/wallet`, `POST /api/cards/wallet`
- `POST /api/cards/lookup`, `POST /api/cards/confirm`
- `POST /api/analyze`, `POST /api/chat`

Unknown card flow:
- If card is found in verified catalog: add directly.
- If card is not found: Gemini web extraction returns candidate details.
- Card is stored only after confirmation and marked:
  - `source = "web_extracted"`
  - `verification_status = "pending"`

## Deploy Backend on Render
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add env vars in Render:
  - `JWT_SECRET`
  - `DB_PATH`
  - `GEMINI_API_KEY`
  - `GEMINI_MODEL` (optional)
