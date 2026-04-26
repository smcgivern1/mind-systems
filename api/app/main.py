from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import (
    actions,
    answers,
    auth,
    day,
    journal,
    nudges,
    physical,
    program,
    progress,
    progress_summary,
    thought,
    weekly,
)

app = FastAPI(title="Mind Systems API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(program.router, prefix="/program", tags=["program"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(day.router, prefix="/day", tags=["day"])
app.include_router(answers.router, prefix="/answers", tags=["answers"])
app.include_router(actions.router, prefix="/actions", tags=["actions"])
app.include_router(journal.router, prefix="/journal", tags=["journal"])
app.include_router(physical.router, prefix="/physical", tags=["physical"])
app.include_router(nudges.router, tags=["nudges"])
app.include_router(thought.router, prefix="/thought", tags=["thought"])
app.include_router(progress_summary.router, prefix="/progress", tags=["progress"])
app.include_router(weekly.router, prefix="/weekly", tags=["weekly"])

@app.get("/healthz")
def healthz():
    return {"ok": True}