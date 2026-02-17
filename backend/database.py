import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Iterable, Mapping

from cards_seed import CURATED_CARDS

try:
    import psycopg
    from psycopg.rows import dict_row
except Exception:  # pragma: no cover - optional until dependency installed
    psycopg = None
    dict_row = None

DB_PATH = os.getenv("DB_PATH", "backend/cardsavvy.db")

CATEGORIES = [
    "dining",
    "groceries",
    "shopping",
    "travel",
    "fuel",
    "utilities",
    "entertainment",
    "others",
]


class DatabaseConnection:
    def __init__(self, driver: str, conn: Any):
        self.driver = driver
        self.conn = conn
        self.cur = conn.cursor()

    def _normalize_query(self, query: str) -> str:
        if self.driver == "postgres":
            return query.replace("?", "%s")
        return query

    def execute(self, query: str, params: Iterable[Any] = ()):
        sql = self._normalize_query(query)
        self.cur.execute(sql, tuple(params))
        return self.cur

    def cursor(self):
        return self

    def fetchone(self):
        return self.cur.fetchone()

    def fetchall(self):
        return self.cur.fetchall()

    def commit(self):
        self.conn.commit()

    def close(self):
        try:
            self.cur.close()
        except Exception:
            pass
        self.conn.close()


def get_db() -> DatabaseConnection:
    db_path = os.getenv("DB_PATH", DB_PATH)

    if db_path.startswith("postgres://") or db_path.startswith("postgresql://"):
        if psycopg is None:
            raise RuntimeError(
                "PostgreSQL DB_PATH configured but psycopg is not installed. "
                "Run: pip install -r requirements.txt"
            )
        conn = psycopg.connect(db_path, row_factory=dict_row)
        return DatabaseConnection("postgres", conn)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return DatabaseConnection("sqlite", conn)


def init_db() -> None:
    conn = get_db()

    ddl = [
        """
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS card_catalog (
          id TEXT PRIMARY KEY,
          card_name TEXT NOT NULL,
          issuer TEXT NOT NULL,
          network TEXT,
          reward_rules_json TEXT NOT NULL,
          source TEXT NOT NULL,
          verification_status TEXT NOT NULL,
          evidence_json TEXT,
          created_by_user_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(card_name, issuer)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_cards (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          card_catalog_id TEXT NOT NULL,
          nickname TEXT,
          last_four TEXT,
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          UNIQUE(user_id, card_catalog_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS lookup_audit (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          query_card_name TEXT NOT NULL,
          query_issuer TEXT,
          status TEXT NOT NULL,
          payload_json TEXT,
          created_at TEXT NOT NULL
        )
        """,
    ]

    for stmt in ddl:
        conn.execute(stmt)

    now = now_ts()
    for item in CURATED_CARDS:
        conn.execute(
            """
            INSERT INTO card_catalog
            (id, card_name, issuer, network, reward_rules_json, source, verification_status, evidence_json, created_by_user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'manual_verified', 'verified', NULL, NULL, ?, ?)
            ON CONFLICT(card_name, issuer) DO NOTHING
            """,
            (
                item["id"],
                item["card_name"],
                item["issuer"],
                item["network"],
                json.dumps(item["reward_rules"]),
                now,
                now,
            ),
        )

    conn.commit()
    conn.close()


def now_ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def row_to_card(row: Mapping[str, Any]) -> dict[str, Any]:
    reward_rules_value = row["reward_rules_json"]
    if isinstance(reward_rules_value, str):
        reward_rules = json.loads(reward_rules_value)
    else:
        reward_rules = reward_rules_value

    evidence_value = row["evidence_json"]
    if isinstance(evidence_value, str):
        evidence = json.loads(evidence_value)
    else:
        evidence = evidence_value

    return {
        "id": row["id"],
        "card_name": row["card_name"],
        "issuer": row["issuer"],
        "network": row.get("network") if hasattr(row, "get") else row["network"],
        "reward_rules": reward_rules,
        "source": row["source"],
        "verification_status": row["verification_status"],
        "evidence": evidence if evidence else None,
    }
