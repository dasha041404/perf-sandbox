import os

import pytest
from fastapi.testclient import TestClient

# conftest.py sets DATABASE_URL before this module imports the app.


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


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_experiments_crud(client: TestClient) -> None:
    r = client.post(
        "/experiments",
        json={"name": "bench-1", "template_engine": "jinja2", "payload": {"runs": 3}},
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "bench-1"
    assert data["template_engine"] == "jinja2"
    assert data["payload"] == {"runs": 3}
    eid = data["id"]

    r = client.get("/experiments")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    assert rows[0]["id"] == eid

    r = client.get(f"/experiments/{eid}")
    assert r.status_code == 200
    assert r.json()["id"] == eid


def test_get_experiment_missing(client: TestClient) -> None:
    r = client.get("/experiments/999")
    assert r.status_code == 404
