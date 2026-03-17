from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, GenerationJob
from app.schemas.schemas import UserCreate, GenerationJobCreate
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


class GenerationJobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, job: GenerationJobCreate, user_id: int) -> GenerationJob:
        db_job = GenerationJob(
            user_id=user_id,
            prompt=job.prompt,
            media_type=job.media_type,
            provider=job.provider,
            model_used=job.model_used,
        )
        self.db.add(db_job)
        await self.db.commit()
        await self.db.refresh(db_job)
        return db_job

    async def get_by_id(self, job_id: int) -> Optional[GenerationJob]:
        result = await self.db.execute(
            select(GenerationJob).where(GenerationJob.id == job_id)
        )
        return result.scalar_one_or_none()

    async def get_user_jobs(self, user_id: int):
        result = await self.db.execute(
            select(GenerationJob).where(GenerationJob.user_id == user_id)
        )
        return result.scalars().all()

    async def update_status(self, job_id: int, status: str, result_url: str = None, provider_job_id: str = None) -> Optional[GenerationJob]:
        job = await self.get_by_id(job_id)
        if job:
            job.status = status
            if result_url:
                job.result_url = result_url
            if provider_job_id:
                job.provider_job_id = provider_job_id
            await self.db.commit()
            await self.db.refresh(job)
        return job
