import json
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from auth import require_user
from database import get_db, now_ts, row_to_card
from gemini_service import extract_card_from_web
from schemas import ConfirmReq, LookupReq, WalletReq

router = APIRouter()


def extract_unknown_card(req: LookupReq) -> dict[str, Any]:
    try:
        extracted = extract_card_from_web(req.card_name, req.issuer, req.network)
        return {
            "id": str(uuid.uuid4()),
            "card_name": extracted["card_name"],
            "issuer": extracted["issuer"],
            "network": extracted["network"],
            "reward_rules": extracted["reward_rules"],
            "source": "web_extracted",
            "verification_status": "pending",
            "evidence": extracted["evidence"],
            "confidence": extracted["confidence"],
        }
    except Exception:
        # Fallback for resilience when Gemini is unavailable.
        rules = {
            "dining": 0.01,
            "groceries": 0.01,
            "shopping": 0.01,
            "travel": 0.01,
            "fuel": 0.01,
            "utilities": 0.01,
            "entertainment": 0.01,
            "others": 0.01,
        }
        return {
            "id": str(uuid.uuid4()),
            "card_name": req.card_name,
            "issuer": req.issuer,
            "network": req.network,
            "reward_rules": rules,
            "source": "web_extracted",
            "verification_status": "pending",
            "evidence": {
                "urls": [],
                "notes": "Gemini extraction unavailable. Manual confirmation required.",
            },
            "confidence": 0.2,
        }


@router.get("/api/cards/catalog")
def list_catalog(verification: str = "verified", user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    _ = user
    verification = "pending" if verification == "pending" else "verified"
    conn = get_db()
    rows = conn.execute("SELECT * FROM card_catalog WHERE verification_status = ? ORDER BY updated_at DESC", (verification,)).fetchall()
    conn.close()
    return {"cards": [row_to_card(r) for r in rows]}


@router.get("/api/cards/public")
def list_public_cards() -> dict[str, Any]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM card_catalog WHERE verification_status = 'verified' ORDER BY updated_at DESC"
    ).fetchall()
    conn.close()
    return {"cards": [row_to_card(r) for r in rows]}


@router.get("/api/cards/wallet")
def list_wallet(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT c.* FROM user_cards u
        INNER JOIN card_catalog c ON c.id = u.card_catalog_id
        WHERE u.user_id = ? AND u.is_active = 1
        ORDER BY u.created_at DESC
        """,
        (user["sub"],),
    ).fetchall()
    conn.close()
    return {"cards": [row_to_card(r) for r in rows]}


@router.post("/api/cards/wallet")
def add_wallet(body: WalletReq, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    exists = cur.execute("SELECT id FROM card_catalog WHERE id = ?", (body.card_catalog_id,)).fetchone()
    if not exists:
        conn.close()
        raise HTTPException(status_code=404, detail="Card not found")
    cur.execute(
        """
        INSERT INTO user_cards (id, user_id, card_catalog_id, nickname, last_four, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(user_id, card_catalog_id) DO NOTHING
        """,
        (str(uuid.uuid4()), user["sub"], body.card_catalog_id, body.nickname, body.last_four, now_ts()),
    )
    conn.commit()
    conn.close()
    return {"success": True}


@router.post("/api/cards/lookup")
def lookup(body: LookupReq, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    conn = get_db()
    row = conn.execute(
        """
        SELECT * FROM card_catalog
        WHERE lower(card_name) = lower(?) AND lower(issuer) = lower(?) AND verification_status = 'verified'
        LIMIT 1
        """,
        (body.card_name.strip(), body.issuer.strip()),
    ).fetchone()

    if row:
        conn.execute(
            "INSERT INTO lookup_audit (id, user_id, query_card_name, query_issuer, status, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), user["sub"], body.card_name, body.issuer, "found_verified", json.dumps({"card_id": row["id"]}), now_ts()),
        )
        conn.commit()
        conn.close()
        return {"status": "found_verified", "card": row_to_card(row)}

    candidate = extract_unknown_card(body)
    conn.execute(
        "INSERT INTO lookup_audit (id, user_id, query_card_name, query_issuer, status, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), user["sub"], body.card_name, body.issuer, "lookup_pending", json.dumps(candidate), now_ts()),
    )
    conn.commit()
    conn.close()

    return {
        "status": "needs_confirmation",
        "candidate": {k: v for k, v in candidate.items() if k != "confidence"},
        "confidence": candidate["confidence"],
        "extracted_from": candidate["evidence"]["urls"],
    }


@router.post("/api/cards/confirm")
def confirm(body: ConfirmReq, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()

    row = cur.execute(
        "SELECT id FROM card_catalog WHERE lower(card_name)=lower(?) AND lower(issuer)=lower(?) LIMIT 1",
        (body.card_name, body.issuer),
    ).fetchone()

    if row:
        card_id = row["id"]
    else:
        card_id = str(uuid.uuid4())
        cur.execute(
            """
            INSERT INTO card_catalog
            (id, card_name, issuer, network, reward_rules_json, source, verification_status, evidence_json, created_by_user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'web_extracted', 'pending', ?, ?, ?, ?)
            """,
            (
                card_id,
                body.card_name,
                body.issuer,
                body.network,
                body.reward_rules.model_dump_json(),
                json.dumps(body.evidence) if body.evidence else None,
                user["sub"],
                now_ts(),
                now_ts(),
            ),
        )

    cur.execute(
        """
        INSERT INTO user_cards (id, user_id, card_catalog_id, nickname, last_four, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(user_id, card_catalog_id) DO NOTHING
        """,
        (str(uuid.uuid4()), user["sub"], card_id, body.nickname, body.last_four, now_ts()),
    )

    cur.execute(
        "INSERT INTO lookup_audit (id, user_id, query_card_name, query_issuer, status, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), user["sub"], body.card_name, body.issuer, "confirmed_pending", json.dumps({"card_id": card_id}), now_ts()),
    )

    conn.commit()
    row = cur.execute("SELECT * FROM card_catalog WHERE id = ?", (card_id,)).fetchone()
    conn.close()
    return {"success": True, "card": row_to_card(row)}
