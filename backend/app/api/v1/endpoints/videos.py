from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.schemas import VideoCreate, Video
from app.services.services import VideoService
from app.core.dependencies import get_current_user
from app.models.models import User

router = APIRouter(prefix="/videos", tags=["videos"])


@router.post("", response_model=Video)
async def create_video(
    video: VideoCreate,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Create a new video"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token, db)
    service = VideoService(db)
    return await service.create_video(video, user.id)


@router.get("/{video_id}", response_model=Video)
async def get_video(
    video_id: int,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Get video details"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token, db)
    service = VideoService(db)
    video = await service.get_video(video_id)
    
    if not video or video.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    
    return video


@router.get("")
async def list_videos(
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """List user's videos"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token, db)
    service = VideoService(db)
    return await service.get_user_videos(user.id)


@router.patch("/{video_id}/status")
async def update_video_status(
    video_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(None),
):
    """Update video status (admin only)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )
    token = authorization.replace("Bearer ", "")
    user = await get_current_user(token, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    
    service = VideoService(db)
    try:
        return await service.update_video_status(video_id, status)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
