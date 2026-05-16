"""SharedGoal linkage

Revision ID: 0003
Revises: 0002
Create Date: 2024-05-16 10:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0003'
down_revision: Union[str, None] = '0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table('shared_goals',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('goal_id', sa.Integer(), nullable=False),
        sa.Column('permission_level', sa.String(), nullable=True), # e.g., 'viewer', 'editor'
        sa.ForeignKeyConstraint(['goal_id'], ['goals.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('user_id', 'goal_id') # Composite primary key
    )

def downgrade() -> None:
    op.drop_table('shared_goals')
