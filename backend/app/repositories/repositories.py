from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, Video
from app.schemas.schemas import UserCreate, VideoCreate
from app.core.security import get_password_hash
from typing import Optional


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=get_password_hash(user.password),
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()


class VideoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, video: VideoCreate, user_id: int) -> Video:
        db_video = Video(
            user_id=user_id,
            title=video.title,
            description=video.description,
        )
        self.db.add(db_video)
        await self.db.commit()
        await self.db.refresh(db_video)
        return db_video

    async def get_by_id(self, video_id: int) -> Optional[Video]:
        result = await self.db.execute(
            select(Video).where(Video.id == video_id)
        )
        return result.scalar_one_or_none()

    async def get_user_videos(self, user_id: int):
        result = await self.db.execute(
            select(Video).where(Video.user_id == user_id)
        )
        return result.scalars().all()

    async def update_status(self, video_id: int, status: str) -> Optional[Video]:
        video = await self.get_by_id(video_id)
        if video:
            video.status = status
            await self.db.commit()
            await self.db.refresh(video)
        return video
