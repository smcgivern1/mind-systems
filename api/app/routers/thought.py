from datetime import date

from fastapi import APIRouter, Depends

from ..auth import get_current_user
from ..data.thoughts import thought_for
from ..schemas import ThoughtOut

router = APIRouter()


@router.get("/today", response_model=ThoughtOut)
def get_today(user=Depends(get_current_user)):
    today_iso = date.today().isoformat()
    t = thought_for(str(user.id), today_iso)
    return ThoughtOut(text=t["text"], attribution=t["attribution"])
