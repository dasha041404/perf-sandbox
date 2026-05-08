"""Build prompts and parse model output for template transpilation."""

import re


def build_transpile_prompt(
    *,
    input_engine_display: str,
    input_template: str,
    target_engine_display_names: list[str],
) -> str:
    engines_csv = ",".join(target_engine_display_names)
    line2 = (
        "Транспилируй данную темплейт строку под следующие варианты "
        f"других шаблонизаторов: {engines_csv}. "
    )
    return (
        f"Для {input_engine_display} имеется следующая строка шаблон: {input_template}. "
        + line2
        + 'Выдай ответ в виде "<название_шаблонизатора>:<полученная строка>;". '
        + "Не добавляй никакого лишнего текста и пояснений."
    )


def strip_optional_markdown_fence(text: str) -> str:
    t = text.strip()
    if not t.startswith("```"):
        return t

    lines = t.splitlines()
    if lines and lines[0].startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip() == "```":
        lines = lines[:-1]
    return "\n".join(lines).strip()


class ParseTranspileOutputError(ValueError):
    """Model output cannot be parsed into engine -> template mappings."""


def parse_transpile_output(raw: str, expected_engine_display_names: list[str]) -> dict[str, str]:
    cleaned = strip_optional_markdown_fence(raw)
    if not cleaned:
        raise ParseTranspileOutputError("Empty model reply")

    expected = list(dict.fromkeys(expected_engine_display_names))
    expected_set = set(expected)
    found: dict[str, str] = {}

    # Split on semicolons; each non-empty piece is "Engine:value" (value may contain ':').
    for piece in cleaned.split(";"):
        chunk = piece.strip()
        if not chunk:
            continue
        idx = chunk.find(":")
        if idx <= 0:
            raise ParseTranspileOutputError(f"Invalid segment (no ':'): {chunk!r}")
        name = re.sub(r"^[`'\"]+|[`'\"]+$", "", chunk[:idx].strip())
        body = re.sub(r"^[`'\"]+|[`'\"]+$", "", chunk[idx + 1 :].strip())
        if name not in expected_set:
            raise ParseTranspileOutputError(f"Unexpected engine name in output: {name!r}")
        if name in found:
            raise ParseTranspileOutputError(f"Duplicate engine in output: {name!r}")
        found[name] = body

    if set(found.keys()) != expected_set:
        missing = sorted(expected_set - set(found.keys()))
        raise ParseTranspileOutputError(f"missing engines: {missing!r}")

    return {name: found[name] for name in expected}
