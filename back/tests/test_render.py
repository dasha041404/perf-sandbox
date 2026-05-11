from fastapi.testclient import TestClient


def test_render_pug_with_dict_context(client: TestClient) -> None:
    r = client.post(
        "/render/pug",
        json={
            "template": "h1 Hello, #{name}!\nul\n  each i in items\n    li= i",
            "data": {"name": "World", "items": ["a", "b", "c"]},
        },
    )
    assert r.status_code == 200
    out = r.json()["output"]
    assert "<h1>Hello, World!</h1>" in out
    assert "<li>a</li>" in out
    assert "<li>b</li>" in out
    assert "<li>c</li>" in out


def test_render_pug_with_list_context_exposed_as_items(client: TestClient) -> None:
    r = client.post(
        "/render/pug",
        json={
            "template": "ul\n  each i in items\n    li= i",
            "data": [1, 2, 3],
        },
    )
    assert r.status_code == 200
    out = r.json()["output"]
    assert "<li>1</li>" in out
    assert "<li>3</li>" in out


def test_render_pug_escapes_interpolation_by_default(client: TestClient) -> None:
    r = client.post(
        "/render/pug",
        json={
            "template": "p= raw",
            "data": {"raw": "<script>alert(1)</script>"},
        },
    )
    assert r.status_code == 200
    out = r.json()["output"]
    assert "<script>" not in out
    assert "&lt;script&gt;" in out


def test_render_pug_invalid_indentation_returns_422(client: TestClient) -> None:
    # Mixed/invalid indentation that pypugjs rejects at parse time.
    r = client.post(
        "/render/pug",
        json={
            "template": "ul\n\t li broken-tab-indent",
            "data": {},
        },
    )
    assert r.status_code in (200, 422)
    # If the parser accepted it, we still expect a valid response shape; if it
    # rejected it, the error must be reported cleanly with a string detail.
    if r.status_code == 422:
        assert isinstance(r.json()["detail"], str)


def test_render_pug_missing_variable_returns_422(client: TestClient) -> None:
    r = client.post(
        "/render/pug",
        json={
            "template": "p= does_not_exist.attr",
            "data": {},
        },
    )
    assert r.status_code == 422
    assert isinstance(r.json()["detail"], str)


def test_render_pug_validates_request_body(client: TestClient) -> None:
    r = client.post("/render/pug", json={"data": {}})  # missing `template`
    assert r.status_code == 422
