from collections import Counter
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import (
    Action,
    Answer,
    Day,
    JournalEntry,
    PhysicalEntry,
    ProgramVersion,
    Step,
    UserProgress,
)
from ..schemas import ProgressSummaryOut

router = APIRouter()


SLEEP_DISPLAY = {
    "lt5": "<5h",
    "5to6": "5–6h",
    "6to7": "6–7h",
    "7to8": "7–8h",
    "gt8": "8h+",
}


@router.get("/summary", response_model=ProgressSummaryOut)
def summary(db: Session = Depends(get_db), user=Depends(get_current_user)):
    active_version = (
        db.query(ProgramVersion).filter(ProgramVersion.is_active.is_(True)).first()
    )
    if not active_version:
        raise HTTPException(404, "No active program")

    total_days = (
        db.query(func.count(Day.id))
        .filter(Day.program_version_id == active_version.id)
        .scalar()
    ) or 0

    user_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user.id,
            UserProgress.program_version_id == active_version.id,
        )
        .first()
    )
    completed_days = len(user_progress.completed_days) if user_progress else 0

    actions_completed = (
        db.query(func.count(Action.id))
        .filter(Action.user_id == user.id, Action.completed.is_(True))
        .scalar()
    ) or 0

    identity_row = (
        db.query(Answer.value)
        .join(Step, Answer.step_id == Step.id)
        .filter(Answer.user_id == user.id, Step.field_key == "identity_statement")
        .first()
    )
    identity_statement = None
    if identity_row is not None:
        val = identity_row[0]
        if isinstance(val, str) and val.strip():
            identity_statement = val

    today = date.today()
    week_start = today - timedelta(days=6)

    journal_rows = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id, JournalEntry.date >= week_start)
        .order_by(JournalEntry.date.asc(), JournalEntry.created_at.asc())
        .all()
    )

    entries_this_week = len(journal_rows)
    if journal_rows:
        avg = sum(j.mood for j in journal_rows) / len(journal_rows)
        avg_mood_this_week = round(avg, 1)
    else:
        avg_mood_this_week = None

    latest_by_day: dict[date, int] = {}
    for j in journal_rows:
        latest_by_day[j.date] = j.mood
    mood_strip: list[int | None] = []
    for i in range(7):
        d = week_start + timedelta(days=i)
        mood_strip.append(latest_by_day.get(d))

    physical_rows = (
        db.query(PhysicalEntry)
        .filter(PhysicalEntry.user_id == user.id, PhysicalEntry.date >= week_start)
        .all()
    )
    checkins_this_week = len(physical_rows)
    sleep_bands = [p.sleep_band for p in physical_rows if p.sleep_band]
    if sleep_bands:
        most_common = Counter(sleep_bands).most_common(1)[0][0]
        avg_sleep_band = SLEEP_DISPLAY.get(most_common, most_common)
    else:
        avg_sleep_band = None
    movement_days = sum(1 for p in physical_rows if p.moved is True)
    total_minutes_this_week = sum(p.duration_minutes or 0 for p in physical_rows)

    journal_dates = {row[0] for row in db.query(JournalEntry.date).filter(JournalEntry.user_id == user.id).all()}
    physical_dates = {row[0] for row in db.query(PhysicalEntry.date).filter(PhysicalEntry.user_id == user.id).all()}
    action_dates: set[date] = set()
    for (completed_at,) in db.query(Action.completed_at).filter(
        Action.user_id == user.id, Action.completed_at.isnot(None)
    ).all():
        if completed_at is not None:
            action_dates.add(completed_at.date())

    activity_dates = journal_dates | physical_dates | action_dates
    streak = 0
    cursor = today
    while cursor in activity_dates and streak < 365:
        streak += 1
        cursor = cursor - timedelta(days=1)

    return ProgressSummaryOut(
        program={
            "total_days": total_days,
            "completed_days": completed_days,
            "actions_completed": actions_completed,
            "identity_statement": identity_statement,
        },
        journal={
            "entries_this_week": entries_this_week,
            "avg_mood_this_week": avg_mood_this_week,
            "mood_strip": mood_strip,
        },
        physical={
            "checkins_this_week": checkins_this_week,
            "avg_sleep_band": avg_sleep_band,
            "movement_days": movement_days,
            "total_minutes_this_week": total_minutes_this_week,
        },
        streak=streak,
    )
