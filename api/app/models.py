from datetime import date as _date
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, JSON, CheckConstraint, UniqueConstraint, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user")
    answers: Mapped[list["Answer"]] = relationship(back_populates="user")
    actions: Mapped[list["Action"]] = relationship(back_populates="user")
    journal_entries: Mapped[list["JournalEntry"]] = relationship(back_populates="user")
    physical_entries: Mapped[list["PhysicalEntry"]] = relationship(back_populates="user")
    weekly_reflections: Mapped[list["WeeklyReflection"]] = relationship(back_populates="user")

class Program(Base):
    __tablename__ = "programs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    versions: Mapped[list["ProgramVersion"]] = relationship(back_populates="program")

class ProgramVersion(Base):
    __tablename__ = "program_versions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    program_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("program_id", "version"),
    )

    program: Mapped[Program] = relationship(back_populates="versions")
    days: Mapped[list["Day"]] = relationship(back_populates="program_version", order_by="Day.day_number")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="program_version")

class Day(Base):
    __tablename__ = "days"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    program_version_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("program_versions.id", ondelete="CASCADE"), nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("program_version_id", "day_number"),
    )

    program_version: Mapped[ProgramVersion] = relationship(back_populates="days")
    steps: Mapped[list["Step"]] = relationship(back_populates="day", order_by="Step.step_number")
    actions: Mapped[list["Action"]] = relationship(back_populates="day")

class Step(Base):
    __tablename__ = "steps"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    day_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("days.id", ondelete="CASCADE"), nullable=False)
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    step_type: Mapped[str] = mapped_column(String, nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    helper_text: Mapped[str] = mapped_column(Text, nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=True)
    field_key: Mapped[str] = mapped_column(String, nullable=True)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    __table_args__ = (
        CheckConstraint("step_type IN ('info','list','multi_line','actions_list','action_complete')"),
        UniqueConstraint("day_id", "step_number"),
    )

    day: Mapped[Day] = relationship(back_populates="steps")
    answers: Mapped[list["Answer"]] = relationship(back_populates="step")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    program_version_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("program_versions.id", ondelete="CASCADE"), nullable=False)
    current_day_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    current_step_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    completed_days: Mapped[list[int]] = mapped_column(JSONB, nullable=False, default=list)
    completed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "program_version_id"),
    )

    user: Mapped[User] = relationship(back_populates="progress")
    program_version: Mapped[ProgramVersion] = relationship(back_populates="progress")

class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    step_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("steps.id", ondelete="RESTRICT"), nullable=False)
    field_key: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "step_id", "field_key"),
    )

    user: Mapped[User] = relationship(back_populates="answers")
    step: Mapped[Step] = relationship(back_populates="answers")

class Action(Base):
    __tablename__ = "actions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("days.id", ondelete="CASCADE"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="actions")
    day: Mapped[Day] = relationship(back_populates="actions")

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[_date] = mapped_column(Date, nullable=False, server_default=func.current_date())
    mood: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    shown_nudge_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    feedback: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    __table_args__ = (
        CheckConstraint("mood >= 1 AND mood <= 10", name="ck_journal_mood_range"),
        Index("idx_journal_user_date", "user_id", "date"),
    )

    user: Mapped[User] = relationship(back_populates="journal_entries")


class PhysicalEntry(Base):
    __tablename__ = "physical_entries"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[_date] = mapped_column(Date, nullable=False)
    sleep_band: Mapped[str | None] = mapped_column(Text, nullable=True)
    energy: Mapped[int | None] = mapped_column(Integer, nullable=True)
    moved: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    movement_type: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("sleep_band IN ('lt5','5to6','6to7','7to8','gt8')", name="ck_physical_sleep_band"),
        CheckConstraint("energy IS NULL OR (energy >= 1 AND energy <= 10)", name="ck_physical_energy"),
        CheckConstraint("movement_type IS NULL OR movement_type IN ('walk','workout','sport','other')", name="ck_physical_movement_type"),
        CheckConstraint("duration_minutes IS NULL OR (duration_minutes >= 0 AND duration_minutes <= 600)", name="ck_physical_duration_minutes"),
        UniqueConstraint("user_id", "date", name="uq_physical_user_date"),
        Index("idx_physical_user_date", "user_id", "date"),
    )

    user: Mapped[User] = relationship(back_populates="physical_entries")


class WeeklyReflection(Base):
    __tablename__ = "weekly_reflections"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    week_start: Mapped[_date] = mapped_column(Date, nullable=False)
    answers: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default="{}")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_weekly_user_week"),
        Index("idx_weekly_user_week", "user_id", "week_start"),
    )

    user: Mapped[User] = relationship(back_populates="weekly_reflections")