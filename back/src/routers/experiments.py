from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database import get_db
from src.models import Experiment
from src.schemas import ExperimentCreate, ExperimentRead

router = APIRouter()


@router.post("", response_model=ExperimentRead, status_code=status.HTTP_201_CREATED)
def create_experiment(body: ExperimentCreate, db: Session = Depends(get_db)) -> Experiment:
    row = Experiment(
        name=body.name,
        template_engine=body.template_engine,
        description=body.description,
        payload=body.payload,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("", response_model=list[ExperimentRead])
def list_experiments(
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> list[Experiment]:
    stmt = select(Experiment).order_by(Experiment.id.desc()).limit(limit).offset(offset)
    return list(db.scalars(stmt))


@router.get("/{experiment_id}", response_model=ExperimentRead)
def get_experiment(experiment_id: int, db: Session = Depends(get_db)) -> Experiment:
    row = db.get(Experiment, experiment_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Experiment not found")
    return row
