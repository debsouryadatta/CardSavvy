from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}
