from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str = "VideoSaaS API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Professional video generation SaaS API"

    # API
    API_V1_PREFIX: str = "/api/v1"
    
    # Database (SQLite for development / hardened local)
    DATABASE_URL: str = "sqlite+aiosqlite:///./videosaas.db"
    
    # Redis (optional)
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    FRONTEND_URL: str | None = None
    
    @property
    def allowed_origins_list(self) -> List[str]:
        origins = ["http://localhost:3000", "http://localhost:8000"]
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL)
        return origins
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
