import time
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from auth import require_user
from database import get_db, row_to_card
from gemini_service import generate_chat_reply
from schemas import ChatReq

router = APIRouter()


@router.post("/api/chat")
def chat(body: ChatReq, user: dict[str, Any] = Depends(require_user)) -> StreamingResponse:
    conn = get_db()
    rows = conn.execute(
        """
        SELECT c.* FROM user_cards u
        INNER JOIN card_catalog c ON c.id = u.card_catalog_id
        WHERE u.user_id = ? AND u.is_active = 1 AND c.verification_status = 'verified'
        ORDER BY u.created_at DESC
        """,
        (user["sub"],),
    ).fetchall()
    conn.close()
    cards = [row_to_card(r) for r in rows]

    def event_stream() -> Any:
        try:
            answer = generate_chat_reply(body.message, cards)
        except Exception:
            answer = (
                "I could not reach Gemini right now. "
                "Please try again in a moment."
            )
        for chunk in answer.split(" "):
            yield f"data: {chunk} \n\n"
            time.sleep(0.02)
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
