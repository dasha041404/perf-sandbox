import os

import pytest
from fastapi.testclient import TestClient

# Must be set before src.database (engine) initializes.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"


@pytest.fixture
def client() -> TestClient:
    database_url = os.environ["DATABASE_URL"]
    assert "memory" in database_url

    from src.database import Base, engine  # noqa: PLC0415
    from src.main import app  # noqa: PLC0415

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as c:
        yield c
