from datetime import date
from typing import Any

from sqlalchemy import Date, Float, String, Text
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    #: One of Handlebars, Mustache, EJS, Pug, Nunjucks, Liquid (see TemplateEngine schema).
    engine: Mapped[str] = mapped_column(String(32), nullable=False, index=True)

    input_template: Mapped[str] = mapped_column(Text, nullable=False)
    input_data: Mapped[dict[str, Any] | list[Any]] = mapped_column(SQLiteJSON, nullable=False)

    #: Rendered template output.
    output: Mapped[str] = mapped_column(Text, nullable=False)

    #: Duration of template compilation / render (seconds, monotonic wall time).
    execution_time: Mapped[float] = mapped_column(Float, nullable=False)

    #: Date when the experiment was run (column name `data` per product spec).
    data: Mapped[date] = mapped_column("data", Date, nullable=False, index=True)
