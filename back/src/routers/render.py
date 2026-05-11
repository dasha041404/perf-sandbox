"""HTTP endpoints for server-side template rendering.

Currently the only engine that requires server-side execution is Pug — the
reference Node ``pug`` package cannot run in the browser (it bundles ``fs`` /
``assert`` / ``acorn``). All other engines render directly in the frontend.
"""

from fastapi import APIRouter, HTTPException, status

from src.pug_renderer import PugRenderError, render_pug
from src.schemas import PugRenderRequest, PugRenderResponse

router = APIRouter(prefix="/render", tags=["render"])


@router.post("/pug", response_model=PugRenderResponse)
def render_pug_endpoint(payload: PugRenderRequest) -> PugRenderResponse:
    """Render a Pug template with the supplied context.

    Returns ``422`` if the template cannot be parsed or rendered, with the
    underlying error message in ``detail`` for easier client-side surfacing.
    """
    try:
        rendered = render_pug(payload.template, payload.data)
    except PugRenderError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        ) from e

    return PugRenderResponse(output=rendered)
