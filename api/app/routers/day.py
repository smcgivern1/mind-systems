from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from ..db import get_db
from ..models import Day, UserProgress, ProgramVersion, Answer, Action
from ..schemas import DayDataOut, DayCompleteOut
from ..auth import get_current_user
from typing import List

router = APIRouter()

def _string_answer(db: Session, user, day, key: str) -> str | None:
    answer = db.query(Answer).filter(
        Answer.user_id == user.id,
        Answer.step_id.in_([s.id for s in day.steps if s.field_key == key])
    ).first()
    if answer and isinstance(answer.value, str) and answer.value.strip():
        return answer.value
    return None


def _list_answer(db: Session, user, day, key: str, required_len: int) -> bool:
    answer = db.query(Answer).filter(
        Answer.user_id == user.id,
        Answer.step_id.in_([s.id for s in day.steps if s.field_key == key])
    ).first()
    if not answer or not isinstance(answer.value, list):
        return False
    if len(answer.value) < required_len:
        return False
    return all(isinstance(v, str) and v.strip() for v in answer.value)


def list_min_filled(db: Session, user, day, key: str, min_required: int) -> bool:
    """True if the list answer for `key` has at least `min_required` non-empty slots."""
    answer = db.query(Answer).filter(
        Answer.user_id == user.id,
        Answer.step_id.in_([s.id for s in day.steps if s.field_key == key])
    ).first()
    if not answer or not isinstance(answer.value, list):
        return False
    filled = [v for v in answer.value if isinstance(v, str) and v.strip()]
    return len(filled) >= min_required


def _action_counts(db: Session, user, day) -> tuple[int, int]:
    total = db.query(Action).filter(
        Action.user_id == user.id, Action.day_id == day.id
    ).count()
    completed = db.query(Action).filter(
        Action.user_id == user.id, Action.day_id == day.id, Action.completed == True
    ).count()
    return total, completed


def validate_day_complete(db: Session, user, day_number) -> tuple[bool, List[str]]:
    active_version = db.query(ProgramVersion).filter(ProgramVersion.is_active == True).first()
    day = db.query(Day).filter(
        Day.program_version_id == active_version.id,
        Day.day_number == day_number
    ).first()
    missing = []
    if day_number == 1:
        if not _list_answer(db, user, day, "decisions", 2):
            missing.append("decisions")
        total, completed = _action_counts(db, user, day)
        if total < 3:
            missing.append("min_3_actions")
        if completed < 1:
            missing.append("min_1_action_completed")
    elif day_number == 2:
        total, completed = _action_counts(db, user, day)
        if total < 4:
            missing.append("min_4_actions")
        for key in ["pain", "pleasure", "cost", "benefits"]:
            if _string_answer(db, user, day, key) is None:
                missing.append(f"empty:{key}")
        if completed < 1:
            missing.append("min_1_action_completed")
    elif day_number == 3:
        for key in ["positive_associations", "disempowering_associations"]:
            if not _list_answer(db, user, day, key, 3):
                missing.append(key)
        if _string_answer(db, user, day, "identity_statement") is None:
            missing.append("identity_statement")
    elif day_number == 4:
        # All six 10-slot reasons lists must be fully filled.
        for key in [
            "nac_must_change_1", "nac_can_change_1",
            "nac_must_change_2", "nac_can_change_2",
            "nac_must_change_3", "nac_can_change_3",
        ]:
            if not _list_answer(db, user, day, key, 10):
                missing.append(key)
        # Each pattern interrupts list (5 slots) needs at least 4 filled.
        for key in ["nac_pattern_interrupts_1", "nac_pattern_interrupts_2", "nac_pattern_interrupts_3"]:
            if not list_min_filled(db, user, day, key, 4):
                missing.append(key)
        # New associations: all 3 slots filled.
        if not _list_answer(db, user, day, "nac_new_associations", 3):
            missing.append("nac_new_associations")
    elif day_number == 5:
        if _string_answer(db, user, day, "state_experiment_subject") is None:
            missing.append("empty:state_experiment_subject")
    elif day_number == 6:
        if not list_min_filled(db, user, day, "state_biomarkers", 3):
            missing.append("state_biomarkers")
    elif day_number == 7:
        total, completed = _action_counts(db, user, day)
        if total < 3:
            missing.append("min_3_actions")
        if completed < 1:
            missing.append("min_1_action_completed")
    elif day_number == 8:
        if not _list_answer(db, user, day, "morning_questions", 5):
            missing.append("morning_questions")
    elif day_number == 9:
        if not list_min_filled(db, user, day, "values_toward", 3):
            missing.append("values_toward")
        if not list_min_filled(db, user, day, "values_away_from", 3):
            missing.append("values_away_from")
        if not list_min_filled(db, user, day, "rules_to_change", 1):
            missing.append("rules_to_change")
        for key in ["rules_toward", "rules_away_from"]:
            if _string_answer(db, user, day, key) is None:
                missing.append(f"empty:{key}")
    elif day_number == 10:
        if not _list_answer(db, user, day, "beliefs_to_change", 5):
            missing.append("beliefs_to_change")
        if not _list_answer(db, user, day, "new_beliefs", 5):
            missing.append("new_beliefs")
        for key in ["dickens_past_cost", "dickens_future_gain", "new_beliefs_quality_of_life"]:
            if _string_answer(db, user, day, key) is None:
                missing.append(f"empty:{key}")
    return len(missing) == 0, missing

@router.get("/{day_number}", response_model=DayDataOut)
def get_day(day_number: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    active_version = db.query(ProgramVersion).filter(ProgramVersion.is_active == True).first()
    if not active_version:
        raise HTTPException(404, "No active program")
    day = db.query(Day).options(joinedload(Day.steps)).filter(
        Day.program_version_id == active_version.id,
        Day.day_number == day_number
    ).first()
    if not day:
        raise HTTPException(404, "Day not found")
    # Answers
    answers = db.query(Answer).filter(
        Answer.user_id == user.id,
        Answer.step_id.in_([s.id for s in day.steps])
    ).all()
    answers_dict = {}
    for ans in answers:
        if ans.step_id not in answers_dict:
            answers_dict[ans.step_id] = {}
        answers_dict[ans.step_id][ans.field_key] = ans.value
    # Actions
    actions = db.query(Action).filter(
        Action.user_id == user.id,
        Action.day_id == day.id
    ).order_by(Action.created_at).all()
    return DayDataOut(
        day={
            "id": day.id,
            "day_number": day.day_number,
            "title": day.title,
            "steps": [
                {
                    "id": s.id,
                    "step_number": s.step_number,
                    "step_type": s.step_type,
                    "prompt": s.prompt,
                    "helper_text": s.helper_text,
                    "body": s.body,
                    "field_key": s.field_key,
                    "config": s.config
                } for s in day.steps
            ]
        },
        steps=[
            {
                "id": s.id,
                "step_number": s.step_number,
                "step_type": s.step_type,
                "prompt": s.prompt,
                "helper_text": s.helper_text,
                "body": s.body,
                "field_key": s.field_key,
                "config": s.config
            } for s in day.steps
        ],
        answers=answers_dict,
        actions=[
            {
                "id": a.id,
                "day_id": a.day_id,
                "text": a.text,
                "completed": a.completed,
                "completed_at": a.completed_at,
                "created_at": a.created_at
            } for a in actions
        ]
    )

@router.post("/{day_number}/complete", response_model=DayCompleteOut)
def complete_day(day_number: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    active_version = db.query(ProgramVersion).filter(ProgramVersion.is_active == True).first()
    if not active_version:
        raise HTTPException(404, "No active program")
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.program_version_id == active_version.id
    ).first()
    if not progress:
        raise HTTPException(404, "No progress found")
    if progress.current_day_number != day_number and day_number not in progress.completed_days:
        raise HTTPException(400, "Day not current or already completed")
    ok, missing = validate_day_complete(db, user, day_number)
    if not ok:
        return DayCompleteOut(ok=False, next_day_number=None, program_completed_at=None, missing=missing)
    # If already completed, idempotent
    if day_number in progress.completed_days:
        return DayCompleteOut(ok=True, next_day_number=None, program_completed_at=progress.completed_at, missing=None)
    # Append to completed_days
    progress.completed_days = progress.completed_days + [day_number]
    total_days = db.query(Day).filter(Day.program_version_id == active_version.id).count()
    if day_number < total_days:
        progress.current_day_number = day_number + 1
        progress.current_step_number = 1
        next_day = day_number + 1
        completed_at = None
    else:
        progress.completed_at = func.now()
        next_day = None
        completed_at = progress.completed_at
    db.commit()
    db.refresh(progress)
    return DayCompleteOut(ok=True, next_day_number=next_day, program_completed_at=completed_at, missing=None)