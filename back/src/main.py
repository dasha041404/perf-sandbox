from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.database import Base, engine
from src.routers.experiments import router as experiments_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="perf-backend", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(experiments_router, prefix="/experiments")
