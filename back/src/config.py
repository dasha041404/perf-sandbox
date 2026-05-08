from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./data/local.db"


def ensure_sqlite_parent_dir(url_str: str) -> None:
    u = make_url(url_str)
    if u.drivername != "sqlite" or u.database is None:
        return
    if u.database in (":memory:", "", "/:memory:"):
        return
    db_path = Path(u.database)
    if not db_path.is_absolute():
        db_path = (Path.cwd() / db_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
        ensure_sqlite_parent_dir(_settings.database_url)
    return _settings
