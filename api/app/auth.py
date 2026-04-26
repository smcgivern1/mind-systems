from itsdangerous import URLSafeSerializer, BadSignature
from fastapi import Cookie, Depends, HTTPException

from .config import settings
from .db import get_db
from .models import User

SESSION_COOKIE = "ms_session"
serializer = URLSafeSerializer(settings.session_secret, salt="session")

def make_session_token(user_id: str) -> str:
    return serializer.dumps({"uid": str(user_id)})

def read_session_token(token: str) -> str | None:
    try:
        data = serializer.loads(token)
        return data.get("uid")
    except BadSignature:
        return None

def get_current_user(
    db = Depends(get_db),
    ms_session: str | None = Cookie(default=None),
) -> User:
    if not ms_session:
        raise HTTPException(401, "Not authenticated")
    uid = read_session_token(ms_session)
    if not uid:
        raise HTTPException(401, "Invalid session")
    user = db.get(User, uid)
    if not user:
        raise HTTPException(401, "User not found")
    return user