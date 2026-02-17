import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import init_db
from routes import api_router

app = FastAPI(title="CardSavvy Backend (Python)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def startup() -> None:
    db_path = os.getenv("DB_PATH", "backend/cardsavvy.db")
    if not (db_path.startswith("postgres://") or db_path.startswith("postgresql://")):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
    init_db()
