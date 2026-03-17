from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GenerationJobBase(BaseModel):
    prompt: Optional[str] = None # Make prompt optional since Face Swap doesn't strictly need text prompt
    media_type: str = "video"
    provider: str = "piapi"
    model_used: str = "kling3"
    extra_inputs: Optional[dict] = None # For image_url, face_image_url, audio_url, etc.


class GenerationJobCreate(GenerationJobBase):
    pass


class GenerationJob(GenerationJobBase):
    id: int
    user_id: int
    status: str
    provider_job_id: Optional[str] = None
    result_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
