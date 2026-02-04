from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.repositories import UserRepository, VideoRepository
from app.schemas.schemas import UserCreate, VideoCreate, User, Video
from app.core.security import verify_password
from typing import Optional


class UserService:
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)

    async def register(self, user: UserCreate) -> User:
        existing_user = await self.repository.get_by_email(user.email)
        if existing_user:
            raise ValueError("Email already registered")
        return await self.repository.create(user)

    async def authenticate(self, username: str, password: str) -> Optional[User]:
        user = await self.repository.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_user(self, user_id: int) -> Optional[User]:
        return await self.repository.get_by_id(user_id)


class VideoService:
    def __init__(self, db: AsyncSession):
        self.repository = VideoRepository(db)

    async def create_video(self, video: VideoCreate, user_id: int) -> Video:
        return await self.repository.create(video, user_id)

    async def get_video(self, video_id: int) -> Optional[Video]:
        return await self.repository.get_by_id(video_id)

    async def get_user_videos(self, user_id: int):
        return await self.repository.get_user_videos(user_id)

    async def update_video_status(self, video_id: int, status: str) -> Optional[Video]:
        valid_statuses = ["pending", "processing", "completed", "failed"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of {valid_statuses}")
        return await self.repository.update_status(video_id, status)
