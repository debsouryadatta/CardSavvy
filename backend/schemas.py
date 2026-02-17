from typing import Any

from pydantic import BaseModel, EmailStr, Field


class RewardRules(BaseModel):
    dining: float = Field(ge=0, le=1)
    groceries: float = Field(ge=0, le=1)
    shopping: float = Field(ge=0, le=1)
    travel: float = Field(ge=0, le=1)
    fuel: float = Field(ge=0, le=1)
    utilities: float = Field(ge=0, le=1)
    entertainment: float = Field(ge=0, le=1)
    others: float = Field(ge=0, le=1)


class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class LookupReq(BaseModel):
    card_name: str
    issuer: str
    network: str | None = None


class WalletReq(BaseModel):
    card_catalog_id: str
    last_four: str | None = None
    nickname: str | None = None


class ConfirmReq(BaseModel):
    card_name: str
    issuer: str
    network: str | None = None
    reward_rules: RewardRules
    evidence: dict[str, Any] | None = None
    last_four: str | None = None
    nickname: str | None = None


class AnalyzeReq(BaseModel):
    merchant: str
    amount: float


class ChatReq(BaseModel):
    message: str
