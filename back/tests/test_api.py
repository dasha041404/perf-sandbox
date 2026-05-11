from datetime import date

from fastapi.testclient import TestClient


def _sample_payload() -> dict:
    return {
        "engine": "Handlebars",
        "input_template": "Hello {{name}}",
        "input_data": {"name": "world"},
        "output": "Hello world",
        "execution_time": 0.0012,
        "data": "2026-05-03",
    }


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_create_experiment(client: TestClient) -> None:
    body = _sample_payload()
    r = client.post("/experiments", json=body)
    assert r.status_code == 201
    data = r.json()
    assert data["id"] >= 1
    assert data["engine"] == "Handlebars"
    assert data["input_template"] == body["input_template"]
    assert data["input_data"] == body["input_data"]
    assert data["output"] == body["output"]
    assert abs(data["execution_time"] - body["execution_time"]) < 1e-9
    assert data["data"] == body["data"]


def test_create_experiment_invalid_engine(client: TestClient) -> None:
    body = _sample_payload()
    body["engine"] = "FakeEngine"
    r = client.post("/experiments", json=body)
    assert r.status_code == 422


def test_list_experiments_pagination_empty(client: TestClient) -> None:
    r = client.get("/experiments", params={"limit": 10, "offset": 0})
    assert r.status_code == 200
    page = r.json()
    assert page == {"items": [], "total": 0, "limit": 10, "offset": 0}


def test_list_experiments_pagination(client: TestClient) -> None:
    for i in range(3):
        r = client.post(
            "/experiments",
            json={
                "engine": "Mustache",
                "input_template": f"t{i}",
                "input_data": {"i": i},
                "output": f"o{i}",
                "execution_time": float(i) * 0.01,
                "data": date(2026, 5, 1 + i).isoformat(),
            },
        )
        assert r.status_code == 201

    r = client.get("/experiments", params={"limit": 2, "offset": 0})
    assert r.status_code == 200
    page = r.json()
    assert page["total"] == 3
    assert page["limit"] == 2
    assert page["offset"] == 0
    assert len(page["items"]) == 2
    assert page["items"][0]["input_template"] == "t2"
    assert page["items"][1]["input_template"] == "t1"

    r = client.get("/experiments", params={"limit": 2, "offset": 2})
    page = r.json()
    assert page["total"] == 3
    assert len(page["items"]) == 1
    assert page["items"][0]["input_template"] == "t0"


def test_list_experiments_limit_validation(client: TestClient) -> None:
    r = client.get("/experiments", params={"limit": 0, "offset": 0})
    assert r.status_code == 422
    r = client.get("/experiments", params={"limit": 501, "offset": 0})
    assert r.status_code == 422


def test_delete_experiment(client: TestClient) -> None:
    create_response = client.post("/experiments", json=_sample_payload())
    assert create_response.status_code == 201
    experiment_id = create_response.json()["id"]

    delete_response = client.delete(f"/experiments/{experiment_id}")
    assert delete_response.status_code == 204
    assert delete_response.content == b""

    list_response = client.get("/experiments")
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 0


def test_delete_experiment_not_found(client: TestClient) -> None:
    r = client.delete("/experiments/999999")
    assert r.status_code == 404
    assert r.json()["detail"] == "Experiment with id=999999 not found"
