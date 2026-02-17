import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


CATEGORY_KEYS = [
    "dining",
    "groceries",
    "shopping",
    "travel",
    "fuel",
    "utilities",
    "entertainment",
    "others",
]


def _api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


def _model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()


def _extract_text(response_json: dict[str, Any]) -> str:
    candidates = response_json.get("candidates", [])
    if not candidates:
        return ""
    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    text_parts = [p.get("text", "") for p in parts if isinstance(p, dict)]
    return "\n".join([p for p in text_parts if p]).strip()


def _extract_grounding_urls(response_json: dict[str, Any]) -> list[str]:
    candidates = response_json.get("candidates", [])
    if not candidates:
        return []
    grounding = candidates[0].get("groundingMetadata", {})
    chunks = grounding.get("groundingChunks", [])
    urls: list[str] = []
    for chunk in chunks:
        web = chunk.get("web", {}) if isinstance(chunk, dict) else {}
        uri = web.get("uri")
        if isinstance(uri, str) and uri not in urls:
            urls.append(uri)
    return urls[:8]


def _call_gemini(prompt: str, tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    key = _api_key()
    if not key:
        raise ValueError("GEMINI_API_KEY is not configured")

    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{urllib.parse.quote(_model())}:generateContent?key={urllib.parse.quote(key)}"
    )

    payload: dict[str, Any] = {
        "contents": [{"parts": [{"text": prompt}]}],
    }
    if tools:
        payload["tools"] = tools

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini HTTP error: {error.code} {detail}") from error


def generate_chat_reply(message: str, verified_wallet_cards: list[dict[str, Any]]) -> str:
    prompt = (
        "You are CardWise AI for credit card rewards optimization. "
        "Recommend cards only from the user's VERIFIED wallet cards below.\n\n"
        f"VERIFIED WALLET CARDS:\n{json.dumps(verified_wallet_cards, indent=2)}\n\n"
        f"USER MESSAGE:\n{message}\n\n"
        "Rules:\n"
        "- Do not invent cards.\n"
        "- Keep response concise and actionable.\n"
        "- Mention category and reward percentage when possible.\n"
    )

    response_json = _call_gemini(prompt)
    text = _extract_text(response_json)
    if not text:
        return "I could not generate a recommendation right now."
    return text


def extract_card_from_web(card_name: str, issuer: str, network: str | None = None) -> dict[str, Any]:
    prompt = (
        "Find rewards details for this credit card using web search and return ONLY JSON.\n"
        f"card_name: {card_name}\nissuer: {issuer}\nnetwork: {network or ''}\n\n"
        "Required JSON shape:\n"
        "{\n"
        '  "card_name": "string",\n'
        '  "issuer": "string",\n'
        '  "network": "string",\n'
        '  "reward_rules": {\n'
        '    "dining": 0.00,\n'
        '    "groceries": 0.00,\n'
        '    "shopping": 0.00,\n'
        '    "travel": 0.00,\n'
        '    "fuel": 0.00,\n'
        '    "utilities": 0.00,\n'
        '    "entertainment": 0.00,\n'
        '    "others": 0.00\n'
        "  },\n"
        '  "confidence": 0.0,\n'
        '  "notes": "string"\n'
        "}\n\n"
        "Use decimal rates from 0 to 1 where 0.05 means 5%. "
        "If exact category value is unknown, use a conservative estimate and mention uncertainty in notes."
    )

    response_json = _call_gemini(prompt, tools=[{"google_search": {}}])
    text = _extract_text(response_json)
    urls = _extract_grounding_urls(response_json)

    match = re.search(r"\{.*\}", text, flags=re.DOTALL)
    raw_json = match.group(0) if match else text
    parsed = json.loads(raw_json)

    reward_rules = parsed.get("reward_rules", {}) if isinstance(parsed, dict) else {}
    sanitized_rules: dict[str, float] = {}
    for key in CATEGORY_KEYS:
        value = reward_rules.get(key, 0.01)
        try:
            number = float(value)
        except (TypeError, ValueError):
            number = 0.01
        sanitized_rules[key] = max(0.0, min(1.0, number))

    confidence = parsed.get("confidence", 0.5) if isinstance(parsed, dict) else 0.5
    try:
        confidence_value = max(0.0, min(1.0, float(confidence)))
    except (TypeError, ValueError):
        confidence_value = 0.5

    return {
        "card_name": str(parsed.get("card_name") or card_name),
        "issuer": str(parsed.get("issuer") or issuer),
        "network": str(parsed.get("network") or (network or "")) or None,
        "reward_rules": sanitized_rules,
        "confidence": confidence_value,
        "evidence": {
            "urls": urls,
            "notes": str(parsed.get("notes") or "Extracted from web search using Gemini."),
        },
    }
