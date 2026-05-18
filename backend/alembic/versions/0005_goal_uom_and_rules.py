"""Add uom fields to goals

Revision ID: 0005
Revises: 0004
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("goals", sa.Column("uom_type", sa.String(), nullable=True))
    op.add_column("goals", sa.Column("target_value", sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column("goals", "target_value")
    op.drop_column("goals", "uom_type")
