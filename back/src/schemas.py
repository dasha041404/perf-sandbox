from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExperimentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    template_engine: str | None = Field(default=None, max_length=128)
    description: str | None = None
    payload: dict[str, Any] | list[Any] | None = None


class ExperimentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    template_engine: str | None
    description: str | None
    payload: dict[str, Any] | list[Any] | None
    created_at: datetime
