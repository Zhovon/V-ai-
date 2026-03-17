from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.services.ai_providers import NovitaAIProvider

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str = "meta/meta-llama-3-8b-instruct"

class ChatResponse(BaseModel):
    content: str

@router.post("", response_model=ChatResponse)
async def create_chat_completion(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Create a new chat completion for prompt enhancement or chatting"""
    token = authorization.replace("Bearer ", "") if authorization else ""
    user = await get_current_user(token, db)
    
    try:
        # Convert Pydantic messages to dicts for the provider
        message_dicts = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Call the LLM Provider
        content = await NovitaAIProvider.submit_chat(
            messages=message_dicts,
            model=request.model
        )
        return ChatResponse(content=content)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
