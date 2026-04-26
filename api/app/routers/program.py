from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..db import get_db
from ..models import ProgramVersion, Day
from ..schemas import ProgramOut
from ..auth import get_current_user

router = APIRouter()


@router.get("/active", response_model=ProgramOut)
def get_active_program(db: Session = Depends(get_db), user=Depends(get_current_user)):
    active_version = (
        db.query(ProgramVersion)
        .options(
            selectinload(ProgramVersion.program),
            selectinload(ProgramVersion.days).selectinload(Day.steps),
        )
        .filter(ProgramVersion.is_active.is_(True))
        .first()
    )
    if not active_version:
        raise HTTPException(404, "No active program")
    return ProgramOut(
        id=active_version.program.id,
        name=active_version.program.name,
        version=active_version.version,
        days=[
            {
                "id": day.id,
                "day_number": day.day_number,
                "title": day.title,
                "steps": [
                    {
                        "id": step.id,
                        "step_number": step.step_number,
                        "step_type": step.step_type,
                        "prompt": step.prompt,
                        "helper_text": step.helper_text,
                        "body": step.body,
                        "field_key": step.field_key,
                        "config": step.config,
                    }
                    for step in day.steps
                ],
            }
            for day in active_version.days
        ],
    )
