from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import date, datetime
from uuid import UUID
from typing import Any, Optional

class UserOut(BaseModel):
    id: UUID
    email: str

class LoginIn(BaseModel):
    email: EmailStr

class LoginOut(BaseModel):
    user: UserOut

class StepOut(BaseModel):
    id: UUID
    step_number: int
    step_type: str
    prompt: str
    helper_text: Optional[str]
    body: Optional[str]
    field_key: Optional[str]
    config: dict

class DayOut(BaseModel):
    id: UUID
    day_number: int
    title: str
    steps: list[StepOut]

class ProgramOut(BaseModel):
    id: UUID
    name: str
    version: int
    days: list[DayOut]

class ProgressOut(BaseModel):
    current_day_number: int
    current_step_number: int
    completed_days: list[int]
    program_completed_at: Optional[datetime]

class ProgressIn(BaseModel):
    current_day_number: int
    current_step_number: int

class DayDataOut(BaseModel):
    day: DayOut
    steps: list[StepOut]
    answers: dict[UUID, dict[str, Any]]
    actions: list["ActionOut"]

class AnswerIn(BaseModel):
    step_id: UUID
    field_key: str
    value: Any

class AnswerOut(BaseModel):
    id: UUID
    step_id: UUID
    field_key: str
    value: Any
    updated_at: datetime

class ActionIn(BaseModel):
    day_id: UUID
    text: str

class ActionPatchIn(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None

class ActionOut(BaseModel):
    id: UUID
    day_id: UUID
    text: str
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime

class DayCompleteOut(BaseModel):
    ok: bool
    next_day_number: Optional[int]
    program_completed_at: Optional[datetime]
    missing: Optional[list[str]]


class JournalEntryIn(BaseModel):
    mood: int = Field(ge=1, le=10)
    content: str = ""
    date: Optional[date] = None


class JournalEntryOut(BaseModel):
    id: UUID
    date: date
    mood: int
    content: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class PhysicalIn(BaseModel):
    sleep_band: Optional[str] = None
    energy: Optional[int] = Field(default=None, ge=1, le=10)
    moved: Optional[bool] = None
    movement_type: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, ge=0, le=600)
    note: Optional[str] = None
    date: Optional[date] = None


class PhysicalOut(BaseModel):
    id: UUID
    date: date
    sleep_band: Optional[str]
    energy: Optional[int]
    moved: Optional[bool]
    movement_type: Optional[str]
    duration_minutes: Optional[int]
    note: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class NudgeOut(BaseModel):
    id: str
    category: str
    name: str
    prompt: str
    why: str
    acknowledgement: str


class NudgeRequest(BaseModel):
    exclude_ids: list[str] = []


class FeedbackIn(BaseModel):
    nudge_id: str
    helpful: bool


class ThoughtOut(BaseModel):
    text: str
    attribution: Optional[str]


class ProgressSummaryOut(BaseModel):
    program: dict
    journal: dict
    physical: dict
    streak: int


class WeeklyReflectionIn(BaseModel):
    field_key: str
    value: str


class WeeklyReflectionOut(BaseModel):
    id: Optional[UUID] = None
    week_start: date
    answers: dict[str, str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)