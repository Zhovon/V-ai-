from fastapi import APIRouter
from app.api.v1.endpoints import auth, generations, train, chat

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(generations.router)
api_router.include_router(train.router)
api_router.include_router(chat.router)
