from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import Experiment
from src.schemas import ExperimentCreate, ExperimentListPage, ExperimentRead

router = APIRouter()

_MAX_PAGE_SIZE = 500


@router.post("", response_model=ExperimentRead, status_code=status.HTTP_201_CREATED)
def create_experiment(body: ExperimentCreate, db: Session = Depends(get_db)) -> Experiment:
    row = Experiment(
        engine=body.engine.value,
        input_template=body.input_template,
        input_data=body.input_data,
        output=body.output,
        execution_time=body.execution_time,
        data=body.data,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=ExperimentListPage)
def list_experiments(
    db: Session = Depends(get_db),
    limit: int = Query(default=100, ge=1, le=_MAX_PAGE_SIZE),
    offset: int = Query(default=0, ge=0),
) -> ExperimentListPage:
    total = db.scalar(select(func.count(Experiment.id))) or 0
    stmt = select(Experiment).order_by(Experiment.id.desc()).limit(limit).offset(offset)
    rows = list(db.scalars(stmt))
    items = [ExperimentRead.model_validate(r) for r in rows]
    return ExperimentListPage(items=items, total=total, limit=limit, offset=offset)
