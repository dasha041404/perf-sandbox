import pytest
from fastapi.testclient import TestClient
from src.openrouter_client import OpenRouterConfigurationError
from src.template_transpile import (
    ParseTranspileOutputError,
    build_transpile_prompt,
    parse_transpile_output,
)


def test_build_transpile_prompt_text() -> None:
    p = build_transpile_prompt(
        input_engine_display="Handlebars",
        input_template="Hello {{name}}",
        target_engine_display_names=["Mustache", "EJS"],
    )
    assert "Handlebars" in p
    assert "Hello {{name}}" in p
    assert "Mustache,EJS" in p or "Mustache,EJS" in p.replace(" ", "")
    assert "Выдай ответ в виде" in p


def test_parse_transpile_output_simple() -> None:
    raw = "Handlebars:hello {{x}};Mustache:hello {{x}};"
    out = parse_transpile_output(raw, ["Handlebars", "Mustache"])
    assert out == {"Handlebars": "hello {{x}}", "Mustache": "hello {{x}}"}


def test_parse_transpile_output_value_with_colon() -> None:
    raw = 'EJS:<%= ":" %>;Pug:div plain;'
    out = parse_transpile_output(raw, ["EJS", "Pug"])
    assert out["EJS"] == '<%= ":" %>'
    assert out["Pug"] == "div plain"


def test_parse_transpile_output_fenced() -> None:
    raw = "```\nLiquid:{% echo x %};\n```"
    out = parse_transpile_output(raw, ["Liquid"])
    assert out == {"Liquid": "{% echo x %}"}


def test_parse_transpile_missing_engine() -> None:
    with pytest.raises(ParseTranspileOutputError):
        parse_transpile_output("Handlebars:only;", ["Handlebars", "Pug"])


def test_list_templates_success(monkeypatch, client: TestClient) -> None:
    def fake_chat(msg: str) -> str:
        assert "Handlebars" in msg
        assert "Транспилируй" in msg
        return "Mustache:hi {{a}};EJS:hi <%= a %>;"

    monkeypatch.setattr(
        "src.routers.templates.openrouter_chat_completion",
        fake_chat,
    )

    r = client.get(
        "/list_templates",
        params={
            "engines": "Mustache,EJS",
            "input_engine": "Handlebars",
            "input_template": "hi {{a}}",
        },
    )
    assert r.status_code == 200
    assert r.json() == {"Mustache": "hi {{a}}", "EJS": "hi <%= a %>"}


def test_list_templates_openrouter_config_503(monkeypatch, client: TestClient) -> None:
    def boom(_: str) -> str:
        raise OpenRouterConfigurationError("no key")

    monkeypatch.setattr("src.routers.templates.openrouter_chat_completion", boom)
    r = client.get(
        "/list_templates",
        params={
            "engines": "Liquid",
            "input_engine": "Pug",
            "input_template": "x",
        },
    )
    assert r.status_code == 503


def test_list_templates_invalid_engine_query(client: TestClient) -> None:
    r = client.get(
        "/list_templates",
        params={
            "engines": "FakeEngine",
            "input_engine": "Handlebars",
            "input_template": "x",
        },
    )
    assert r.status_code == 422


def test_list_templates_duplicate_engines(client: TestClient) -> None:
    r = client.get(
        "/list_templates",
        params={
            "engines": "Liquid,Liquid",
            "input_engine": "Pug",
            "input_template": "x",
        },
    )
    assert r.status_code == 422


def test_list_templates_urlencoded_template(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(
        "src.routers.templates.openrouter_chat_completion",
        lambda _: "Nunjucks:{{ y }};",
    )
    tpl = "a&b=c?d"
    r = client.get(
        "/list_templates",
        params={
            "engines": "Nunjucks",
            "input_engine": "Handlebars",
            "input_template": tpl,
        },
    )
    assert r.status_code == 200
    assert r.json() == {"Nunjucks": "{{ y }}"}
