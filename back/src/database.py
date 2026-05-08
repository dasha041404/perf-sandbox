from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from src.config import ensure_sqlite_parent_dir, get_settings

Base = declarative_base()


def _make_engine() -> Engine:
    settings = get_settings()
    ensure_sqlite_parent_dir(settings.database_url)
    connect_args = (
        {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
    )
    kwargs: dict[str, Any] = {}
    if settings.database_url.startswith("sqlite") and ":memory:" in settings.database_url:
        kwargs["poolclass"] = StaticPool
    return create_engine(settings.database_url, connect_args=connect_args, **kwargs)


engine = _make_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
