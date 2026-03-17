from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.repositories import UserRepository, GenerationJobRepository
from app.schemas.schemas import UserCreate, GenerationJobCreate, User, GenerationJob
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


class GenerationJobService:
    def __init__(self, db: AsyncSession):
        self.repository = GenerationJobRepository(db)

    async def create_job(self, job: GenerationJobCreate, user_id: int) -> GenerationJob:
        return await self.repository.create(job, user_id)

    async def get_job(self, job_id: int) -> Optional[GenerationJob]:
        return await self.repository.get_by_id(job_id)

    async def get_user_jobs(self, user_id: int):
        return await self.repository.get_user_jobs(user_id)

    async def update_job_status(self, job_id: int, status: str, result_url: str = None, provider_job_id: str = None) -> Optional[GenerationJob]:
        valid_statuses = ["pending", "processing", "completed", "failed"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of {valid_statuses}")
        return await self.repository.update_status(job_id, status, result_url, provider_job_id)
