from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Use SQLite for development (no PostgreSQL dependencies needed)
db_url = "sqlite+aiosqlite:///./videosaas.db"

engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    future=True,
    pool_size=5,
    max_overflow=0,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
