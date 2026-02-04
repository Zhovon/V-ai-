from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.schemas import UserCreate, User, TokenResponse
from app.services.services import UserService
from app.core.security import create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=User)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    service = UserService(db)
    try:
        return await service.register(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    username: str = Form(...), 
    password: str = Form(...), 
    db: AsyncSession = Depends(get_db)
):
    """Login user and get tokens"""
    service = UserService(db)
    user = await service.authenticate(username, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=30),
    )
    refresh_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=7),
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.get("/me", response_model=User)
async def get_current_user(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile"""
    from app.core.dependencies import get_current_user
    return await get_current_user(token, db)
