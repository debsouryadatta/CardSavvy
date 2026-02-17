import time
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from auth import hash_password, require_user, sign_jwt, verify_password
from database import get_db, now_ts
from schemas import RegisterReq

router = APIRouter()


@router.post("/api/auth/register")
def register(body: RegisterReq) -> dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    email = body.email.lower().strip()
    exists = cur.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_id = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (user_id, email, hash_password(body.password), now_ts()),
    )
    conn.commit()
    conn.close()
    token = sign_jwt({"sub": user_id, "email": email, "exp": int(time.time()) + 7 * 24 * 3600})
    return {"token": token, "user": {"id": user_id, "email": email}}


@router.post("/api/auth/login")
def login(body: RegisterReq) -> dict[str, Any]:
    conn = get_db()
    row = conn.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (body.email.lower().strip(),)).fetchone()
    conn.close()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = sign_jwt({"sub": row["id"], "email": row["email"], "exp": int(time.time()) + 7 * 24 * 3600})
    return {"token": token, "user": {"id": row["id"], "email": row["email"]}}


@router.get("/api/auth/me")
def me(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {"user": {"id": user["sub"], "email": user["email"]}}
