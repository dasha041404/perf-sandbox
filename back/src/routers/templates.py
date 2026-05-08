from fastapi import APIRouter, HTTPException, Query, status

from src.openrouter_client import (
    OpenRouterBadResponse,
    OpenRouterConfigurationError,
    OpenRouterUpstreamError,
    openrouter_chat_completion,
)
from src.schemas import TemplateEngine
from src.template_transpile import (
    ParseTranspileOutputError,
    build_transpile_prompt,
    parse_transpile_output,
)

router = APIRouter(tags=["templates"])


@router.get("/list_templates")
def list_templates(
    engines: str = Query(
        ...,
        description=(
            "Comma-separated target engines without spaces "
            "(e.g. Handlebars,Mustache). Names must match allowed TemplateEngine values."
        ),
    ),
    input_engine: TemplateEngine = Query(..., description="Source template syntax engine"),
    input_template: str = Query(..., description="Template string written in input_engine syntax"),
) -> dict[str, str]:
    stripped = engines.strip()
    if not stripped:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="engines must list at least one engine",
        )

    target_names_raw = stripped.split(",")
    if any(p.strip() == "" for p in target_names_raw):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="engines must not contain empty entries between commas",
        )

    try:
        parsed_targets = [TemplateEngine(p.strip()) for p in target_names_raw]
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e

    target_labels = [e.value for e in parsed_targets]
    if len(set(target_labels)) != len(target_labels):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="duplicate engine name in engines",
        )

    prompt = build_transpile_prompt(
        input_engine_display=input_engine.value,
        input_template=input_template,
        target_engine_display_names=target_labels,
    )

    try:
        raw_reply = openrouter_chat_completion(prompt)
    except OpenRouterConfigurationError as e:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        ) from e
    except OpenRouterBadResponse as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e
    except OpenRouterUpstreamError as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e

    try:
        return parse_transpile_output(raw_reply, target_labels)
    except ParseTranspileOutputError as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not parse model output: {e}",
        ) from e
