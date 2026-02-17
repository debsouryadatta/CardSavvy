import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

from fastapi import Header, HTTPException

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return f"{base64.b64encode(salt).decode()}:{base64.b64encode(pwd_hash).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt_b64, hash_b64 = encoded.split(":", 1)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
    except Exception:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return hmac.compare_digest(candidate, expected)


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def b64url_decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def sign_jwt(payload: dict[str, Any]) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64url(json.dumps(header, separators=(",", ":")).encode())
    p = b64url(json.dumps(payload, separators=(",", ":")).encode())
    msg = f"{h}.{p}".encode()
    sig = hmac.new(JWT_SECRET.encode(), msg, hashlib.sha256).digest()
    return f"{h}.{p}.{b64url(sig)}"


def verify_jwt(token: str) -> dict[str, Any] | None:
    try:
        h, p, s = token.split(".")
        msg = f"{h}.{p}".encode()
        expected = hmac.new(JWT_SECRET.encode(), msg, hashlib.sha256).digest()
        if not hmac.compare_digest(expected, b64url_decode(s)):
            return None
        payload = json.loads(b64url_decode(p))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def require_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    payload = verify_jwt(authorization.replace("Bearer ", "", 1))
    if not payload:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return payload
