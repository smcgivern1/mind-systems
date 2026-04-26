from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import Action, Day, UserProgress, ProgramVersion
from ..schemas import ActionIn, ActionPatchIn, ActionOut
from ..auth import get_current_user

router = APIRouter()

@router.post("", response_model=ActionOut)
def create_action(action_in: ActionIn, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Verify day belongs to active program
    day = db.query(Day).join(ProgramVersion).filter(
        Day.id == action_in.day_id,
        ProgramVersion.is_active == True
    ).first()
    if not day:
        raise HTTPException(404, "Day not found")
    # Check if day is completed
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.program_version_id == day.program_version_id
    ).first()
    if progress and day.day_number in progress.completed_days:
        raise HTTPException(403, "Day is completed")
    action = Action(
        user_id=user.id,
        day_id=action_in.day_id,
        text=action_in.text
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return ActionOut(
        id=action.id,
        day_id=action.day_id,
        text=action.text,
        completed=action.completed,
        completed_at=action.completed_at,
        created_at=action.created_at
    )

@router.patch("/{action_id}", response_model=ActionOut)
def patch_action(action_id: str, patch: ActionPatchIn, db: Session = Depends(get_db), user = Depends(get_current_user)):
    action = db.query(Action).filter(Action.id == action_id, Action.user_id == user.id).first()
    if not action:
        raise HTTPException(404, "Action not found")
    # Check if day is completed
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.program_version_id == action.day.program_version_id
    ).first()
    if progress and action.day.day_number in progress.completed_days:
        raise HTTPException(403, "Day is completed")
    if patch.text is not None:
        action.text = patch.text
    if patch.completed is not None:
        action.completed = patch.completed
        if patch.completed:
            action.completed_at = func.now()
        else:
            action.completed_at = None
    db.commit()
    db.refresh(action)
    return ActionOut(
        id=action.id,
        day_id=action.day_id,
        text=action.text,
        completed=action.completed,
        completed_at=action.completed_at,
        created_at=action.created_at
    )

@router.delete("/{action_id}")
def delete_action(action_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    action = db.query(Action).filter(Action.id == action_id, Action.user_id == user.id).first()
    if not action:
        raise HTTPException(404, "Action not found")
    # Check if day is completed
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == user.id,
        UserProgress.program_version_id == action.day.program_version_id
    ).first()
    if progress and action.day.day_number in progress.completed_days:
        raise HTTPException(403, "Day is completed")
    db.delete(action)
    db.commit()
    return {"ok": True}