from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Use SQLite with check_same_thread=False for local dev / testing.
# Switch to PostgreSQL (psycopg2) in production by setting DATABASE_URL.
if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        settings.database_url, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
