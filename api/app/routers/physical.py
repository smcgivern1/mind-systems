from datetime import date as _date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import PhysicalEntry
from ..schemas import PhysicalIn, PhysicalOut

router = APIRouter()


@router.get("/today", response_model=PhysicalOut)
def get_today(db: Session = Depends(get_db), user=Depends(get_current_user)):
    today = _date.today()
    entry = (
        db.query(PhysicalEntry)
        .filter(PhysicalEntry.user_id == user.id, PhysicalEntry.date == today)
        .first()
    )
    if not entry:
        raise HTTPException(404, "No entry today")
    return entry


@router.get("", response_model=list[PhysicalOut])
def list_entries(
    from_: _date | None = Query(None, alias="from"),
    to: _date | None = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(PhysicalEntry).filter(PhysicalEntry.user_id == user.id)
    if from_ is not None:
        q = q.filter(PhysicalEntry.date >= from_)
    if to is not None:
        q = q.filter(PhysicalEntry.date <= to)
    return q.order_by(PhysicalEntry.date.desc()).all()


@router.post("", response_model=PhysicalOut)
def upsert(
    body: PhysicalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    target_date = body.date if body.date is not None else _date.today()
    entry = (
        db.query(PhysicalEntry)
        .filter(PhysicalEntry.user_id == user.id, PhysicalEntry.date == target_date)
        .first()
    )
    if entry is None:
        entry = PhysicalEntry(
            user_id=user.id,
            date=target_date,
            sleep_band=body.sleep_band,
            energy=body.energy,
            moved=body.moved,
            movement_type=body.movement_type,
            duration_minutes=body.duration_minutes,
            note=body.note,
        )
        db.add(entry)
    else:
        if body.sleep_band is not None:
            entry.sleep_band = body.sleep_band
        if body.energy is not None:
            entry.energy = body.energy
        if body.moved is not None:
            entry.moved = body.moved
        if body.movement_type is not None:
            entry.movement_type = body.movement_type
        if body.duration_minutes is not None:
            entry.duration_minutes = body.duration_minutes
        if body.note is not None:
            entry.note = body.note
        entry.updated_at = func.now()
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=PhysicalOut)
def update(
    entry_id: str,
    body: PhysicalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    entry = (
        db.query(PhysicalEntry)
        .filter(PhysicalEntry.id == entry_id, PhysicalEntry.user_id == user.id)
        .first()
    )
    if not entry:
        raise HTTPException(404, "Entry not found")
    if body.sleep_band is not None:
        entry.sleep_band = body.sleep_band
    if body.energy is not None:
        entry.energy = body.energy
    if body.moved is not None:
        entry.moved = body.moved
    if body.movement_type is not None:
        entry.movement_type = body.movement_type
    if body.duration_minutes is not None:
        entry.duration_minutes = body.duration_minutes
    if body.note is not None:
        entry.note = body.note
    entry.updated_at = func.now()
    db.commit()
    db.refresh(entry)
    return entry
