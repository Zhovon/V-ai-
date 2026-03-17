from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

from sqlalchemy import event
from sqlalchemy.engine import Engine

db_url = settings.DATABASE_URL

engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    future=True,
    # SQLite requires these to avoid locking issues in multi-thread
    pool_size=5,
    max_overflow=10,
)

# SQLite hardening: Enable WAL mode for concurrent reads/writes
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

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
