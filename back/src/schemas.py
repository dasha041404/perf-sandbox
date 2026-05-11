from datetime import date
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TemplateEngine(StrEnum):
    HANDLEBARS = "Handlebars"
    MUSTACHE = "Mustache"
    EJS = "EJS"
    PUG = "Pug"
    NUNJUCKS = "Nunjucks"
    LIQUID = "Liquid"


class ExperimentCreate(BaseModel):
    engine: TemplateEngine
    input_template: str
    input_data: dict[str, Any] | list[Any]
    output: str
    execution_time: float = Field(..., ge=0, description="Execution time in seconds")
    data: date


class ExperimentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    engine: TemplateEngine
    input_template: str
    input_data: dict[str, Any] | list[Any]
    output: str
    execution_time: float
    data: date


class ExperimentListPage(BaseModel):
    items: list[ExperimentRead]
    total: int = Field(..., ge=0)
    limit: int = Field(..., ge=1)
    offset: int = Field(..., ge=0)


class PugRenderRequest(BaseModel):
    template: str = Field(..., description="Pug template source")
    data: dict[str, Any] | list[Any] = Field(
        default_factory=dict,
        description="Render context. Lists are exposed under the `items` key.",
    )


class PugRenderResponse(BaseModel):
    output: str
