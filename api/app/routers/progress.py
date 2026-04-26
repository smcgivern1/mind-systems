from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import UserProgress, ProgramVersion, Day, Step
from ..schemas import ProgressOut, ProgressIn
from ..auth import get_current_user

router = APIRouter()


def _get_or_create_progress(db: Session, user, active_version: ProgramVersion) -> UserProgress:
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user.id,
            UserProgress.program_version_id == active_version.id,
        )
        .first()
    )
    if not progress:
        progress = UserProgress(
            user_id=user.id,
            program_version_id=active_version.id,
            current_day_number=1,
            current_step_number=1,
            completed_days=[],
            completed_at=None,
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress


@router.get("", response_model=ProgressOut)
def get_progress(db: Session = Depends(get_db), user=Depends(get_current_user)):
    active_version = (
        db.query(ProgramVersion).filter(ProgramVersion.is_active.is_(True)).first()
    )
    if not active_version:
        raise HTTPException(404, "No active program")
    progress = _get_or_create_progress(db, user, active_version)
    return ProgressOut(
        current_day_number=progress.current_day_number,
        current_step_number=progress.current_step_number,
        completed_days=progress.completed_days,
        program_completed_at=progress.completed_at,
    )


@router.put("", response_model=ProgressOut)
def put_progress(
    progress_in: ProgressIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    active_version = (
        db.query(ProgramVersion).filter(ProgramVersion.is_active.is_(True)).first()
    )
    if not active_version:
        raise HTTPException(404, "No active program")
    progress = _get_or_create_progress(db, user, active_version)

    total_days = (
        db.query(func.count(Day.id))
        .filter(Day.program_version_id == active_version.id)
        .scalar()
    )
    if not (1 <= progress_in.current_day_number <= total_days):
        raise HTTPException(400, "Invalid day number")

    day = (
        db.query(Day)
        .filter(
            Day.program_version_id == active_version.id,
            Day.day_number == progress_in.current_day_number,
        )
        .first()
    )
    if not day:
        raise HTTPException(400, "Invalid day number")

    total_steps = (
        db.query(func.count(Step.id)).filter(Step.day_id == day.id).scalar()
    )
    if not (1 <= progress_in.current_step_number <= total_steps):
        raise HTTPException(400, "Invalid step number")

    if progress_in.current_day_number > len(progress.completed_days) + 1:
        raise HTTPException(400, "Cannot jump ahead")

    progress.current_day_number = progress_in.current_day_number
    progress.current_step_number = progress_in.current_step_number
    progress.updated_at = func.now()
    db.commit()
    db.refresh(progress)
    return ProgressOut(
        current_day_number=progress.current_day_number,
        current_step_number=progress.current_step_number,
        completed_days=progress.completed_days,
        program_completed_at=progress.completed_at,
    )
