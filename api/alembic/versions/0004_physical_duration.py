"""physical duration

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-26 18:27:04.231597

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0004'
down_revision: Union[str, None] = '0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('physical_entries', sa.Column('duration_minutes', sa.Integer(), nullable=True))
    op.create_check_constraint(
        'ck_physical_duration_minutes',
        'physical_entries',
        'duration_minutes IS NULL OR (duration_minutes >= 0 AND duration_minutes <= 600)',
    )


def downgrade() -> None:
    op.drop_constraint('ck_physical_duration_minutes', 'physical_entries', type_='check')
    op.drop_column('physical_entries', 'duration_minutes')
