from datetime import date as _date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import JournalEntry
from ..schemas import JournalEntryIn, JournalEntryOut

router = APIRouter()


@router.get("", response_model=list[JournalEntryOut])
def list_entries(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.date.desc(), JournalEntry.created_at.desc())
        .limit(100)
        .all()
    )


@router.post("", response_model=JournalEntryOut)
def create_entry(
    body: JournalEntryIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    entry = JournalEntry(
        user_id=user.id,
        mood=body.mood,
        content=body.content,
        date=body.date if body.date is not None else _date.today(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
