"""Server-side Pug template rendering.

The `pug` reference implementation is JavaScript-only and bundles Node-specific
modules (`fs`, `assert`, `acorn`) that cannot run in a browser. Instead of
shipping a Node runtime, we use ``pypugjs`` — a pure-Python Pug parser that
transpiles Pug source to Jinja2, which Jinja2 then renders.

Behavioural notes / known limitations vs. the Node `pug` package:
- Mixin/inheritance semantics are mapped onto Jinja2's macro/block model;
  exotic compile-time tricks may differ.
- Filters that depend on Node packages (e.g. ``:markdown-it``) are unsupported.
- File-system ``include``/``extends`` are intentionally disabled because the
  HTTP endpoint accepts a single template string with no resolvable basedir.

The renderer is deliberately defensive: any exception from the parser/Jinja2
gets wrapped into :class:`PugRenderError` so the HTTP layer can map it to a
``422 Unprocessable Entity``.
"""

from __future__ import annotations

from typing import Any

from jinja2 import Environment
from pypugjs.ext.jinja import Compiler as JinjaCompiler
from pypugjs.ext.jinja import attrs as pug_attrs
from pypugjs.parser import Parser as PugParser
from pypugjs.runtime import iteration as pug_iteration


class PugRenderError(ValueError):
    """Raised when a Pug template fails to parse or render."""


def _build_environment() -> Environment:
    env = Environment(autoescape=False)
    # pypugjs's Jinja2 compiler emits references to two globals: an attribute
    # serialiser and an iteration helper that yields ``(value,)`` / ``(key,
    # value)`` tuples depending on arity. Registering them here keeps the
    # generated Jinja2 source self-contained.
    env.globals["__pypugjs_iter"] = pug_iteration
    env.globals["__pypugjs_attrs"] = pug_attrs
    return env


# A single Environment is safe to reuse — Jinja2 environments are thread-safe
# for ``from_string`` rendering once configured.
_ENV = _build_environment()


def _compile_to_jinja(template: str) -> str:
    """Parse Pug source and return the equivalent Jinja2 template string."""
    parser = PugParser(template)
    block = parser.parse()
    return JinjaCompiler(block).compile()


def render_pug(template: str, data: dict[str, Any] | list[Any]) -> str:
    """Render a Pug template string with the given context.

    Lists are exposed under the conventional ``items`` key, matching the
    behaviour of the frontend in-browser runners for the other engines.
    """
    context: dict[str, Any] = {"items": data} if isinstance(data, list) else dict(data)

    try:
        jinja_source = _compile_to_jinja(template)
    except Exception as e:  # noqa: BLE001 — pypugjs raises bare Exception subclasses
        raise PugRenderError(f"Pug parse error: {e}") from e

    try:
        return _ENV.from_string(jinja_source).render(**context)
    except Exception as e:  # noqa: BLE001 — Jinja2 surfaces many error types
        raise PugRenderError(f"Pug render error: {e}") from e
