from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import Answer, Step, UserProgress, ProgramVersion, Day
from ..schemas import AnswerIn, AnswerOut
from ..auth import get_current_user

router = APIRouter()

@router.put("", response_model=AnswerOut)
def put_answer(answer_in: AnswerIn, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Find step
    step = db.query(Step).join(Day).join(ProgramVersion).filter(
        Step.id == answer_in.step_id,
        ProgramVersion.is_active.is_(True)
    ).first()
    if not step:
        raise HTTPException(404, "Step not found")
    if step.field_key != answer_in.field_key:
        raise HTTPException(400, "Field key mismatch")
    # Check if day is completed
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.program_version_id == step.day.program_version_id
    ).first()
    if progress and step.day.day_number in progress.completed_days:
        raise HTTPException(403, "Day is completed")
    # Upsert
    answer = db.query(Answer).filter(
        Answer.user_id == user.id,
        Answer.step_id == answer_in.step_id,
        Answer.field_key == answer_in.field_key
    ).first()
    if answer:
        answer.value = answer_in.value
        answer.updated_at = func.now()
    else:
        answer = Answer(
            user_id=user.id,
            step_id=answer_in.step_id,
            field_key=answer_in.field_key,
            value=answer_in.value
        )
        db.add(answer)
    db.commit()
    db.refresh(answer)
    return AnswerOut(
        id=answer.id,
        step_id=answer.step_id,
        field_key=answer.field_key,
        value=answer.value,
        updated_at=answer.updated_at
    )