from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..data.nudges import pick_acknowledgement, select_nudge
from ..db import get_db
from ..models import JournalEntry
from ..schemas import FeedbackIn, NudgeOut, NudgeRequest

router = APIRouter()


@router.post("/journal/{entry_id}/nudge", response_model=NudgeOut)
def get_nudge(
    entry_id: str,
    body: NudgeRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user.id)
        .first()
    )
    if not entry:
        raise HTTPException(404, "Entry not found")

    nudge = select_nudge(entry.content, body.exclude_ids, str(entry.id))

    if entry.shown_nudge_id is None:
        entry.shown_nudge_id = nudge["id"]
        db.commit()

    return NudgeOut(
        id=nudge["id"],
        category=nudge["category"],
        name=nudge["name"],
        prompt=nudge["prompt"],
        why=nudge["why"],
        acknowledgement=pick_acknowledgement(str(entry.id)),
    )


@router.patch("/journal/{entry_id}/intervention-feedback", status_code=204)
def submit_feedback(
    entry_id: str,
    body: FeedbackIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == user.id)
        .first()
    )
    if not entry:
        raise HTTPException(404, "Entry not found")
    entry.feedback = {
        "nudge_id": body.nudge_id,
        "helpful": body.helpful,
        "at": datetime.now(timezone.utc).isoformat(),
    }
    db.commit()
    return Response(status_code=204)
