from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from auth import require_user
from database import get_db, row_to_card
from schemas import AnalyzeReq

router = APIRouter()


@router.post("/api/analyze")
def analyze(body: AnalyzeReq, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT c.* FROM user_cards u
        INNER JOIN card_catalog c ON c.id = u.card_catalog_id
        WHERE u.user_id = ? AND u.is_active = 1 AND c.verification_status = 'verified'
        """,
        (user["sub"],),
    ).fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=400, detail="No verified cards found in wallet")

    merchant = body.merchant.lower()
    category = "others"
    if any(k in merchant for k in ["swiggy", "zomato", "restaurant", "cafe"]):
        category = "dining"
    elif any(k in merchant for k in ["amazon", "flipkart", "myntra"]):
        category = "shopping"
    elif any(k in merchant for k in ["dmart", "grocery", "bigbasket"]):
        category = "groceries"

    cards = [row_to_card(r) for r in rows]
    best = max(cards, key=lambda x: x["reward_rules"].get(category, 0.0))
    rate = best["reward_rules"].get(category, 0.0)
    value = body.amount * rate

    return {
        "category": category,
        "confidence": 0.7,
        "recommendedCard": {
            "id": best["id"],
            "name": best["card_name"],
            "bank": best["issuer"],
        },
        "estimatedReward": {
            "value": f"{value:.2f}",
            "unit": "INR",
            "percentage": round(rate * 100, 2),
        },
        "explanation": f"{best['card_name']} gives the highest verified reward for {category}.",
    }
