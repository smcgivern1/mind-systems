from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User, UserProgress, ProgramVersion
from ..schemas import LoginIn, LoginOut, UserOut
from ..auth import make_session_token, get_current_user

router = APIRouter()

@router.post("/login", response_model=LoginOut)
def login(login: LoginIn, response: Response, db: Session = Depends(get_db)):
    # Upsert user
    user = db.query(User).filter(User.email == login.email).first()
    if not user:
        user = User(email=login.email)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Check if user has progress for active program
    active_version = db.query(ProgramVersion).filter(ProgramVersion.is_active == True).first()
    if active_version:
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user.id,
            UserProgress.program_version_id == active_version.id
        ).first()
        if not progress:
            progress = UserProgress(
                user_id=user.id,
                program_version_id=active_version.id,
                current_day_number=1,
                current_step_number=1,
                completed_days=[],
                completed_at=None
            )
            db.add(progress)
            db.commit()

    # Set cookie
    token = make_session_token(str(user.id))
    response.set_cookie(
        "ms_session",
        token,
        httponly=True,
        samesite="lax",
        secure=False,  # dev
        max_age=60*60*24*30
    )
    return LoginOut(user=UserOut(id=user.id, email=user.email))

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("ms_session")
    return {"ok": True}

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, email=user.email)