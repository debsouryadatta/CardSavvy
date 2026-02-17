from fastapi import APIRouter

from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.cards import router as cards_router
from routes.analyze import router as analyze_router
from routes.chat import router as chat_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(cards_router)
api_router.include_router(analyze_router)
api_router.include_router(chat_router)
