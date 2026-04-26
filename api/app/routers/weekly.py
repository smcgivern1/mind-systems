from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from ..auth import get_current_user
from ..db import get_db
from ..models import WeeklyReflection
from ..schemas import WeeklyReflectionIn, WeeklyReflectionOut

router = APIRouter()


def _monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


@router.get("/current", response_model=WeeklyReflectionOut)
def get_current(db: Session = Depends(get_db), user=Depends(get_current_user)):
    week_start = _monday_of(date.today())
    entry = (
        db.query(WeeklyReflection)
        .filter(
            WeeklyReflection.user_id == user.id,
            WeeklyReflection.week_start == week_start,
        )
        .first()
    )
    if entry is None:
        return WeeklyReflectionOut(week_start=week_start, answers={})
    return entry


@router.get("", response_model=list[WeeklyReflectionOut])
def list_reflections(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return (
        db.query(WeeklyReflection)
        .filter(WeeklyReflection.user_id == user.id)
        .order_by(WeeklyReflection.week_start.desc())
        .limit(26)
        .all()
    )


@router.put("/answer", response_model=WeeklyReflectionOut)
def upsert_answer(
    body: WeeklyReflectionIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if not body.field_key:
        raise HTTPException(400, "field_key required")
    week_start = _monday_of(date.today())
    entry = (
        db.query(WeeklyReflection)
        .filter(
            WeeklyReflection.user_id == user.id,
            WeeklyReflection.week_start == week_start,
        )
        .first()
    )
    if entry is None:
        entry = WeeklyReflection(
            user_id=user.id,
            week_start=week_start,
            answers={body.field_key: body.value},
        )
        db.add(entry)
    else:
        answers = dict(entry.answers or {})
        answers[body.field_key] = body.value
        entry.answers = answers
        flag_modified(entry, "answers")
        entry.updated_at = func.now()
    db.commit()
    db.refresh(entry)
    return entry
