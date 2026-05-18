"""Full schema and realtime tables

Revision ID: 0004
Revises: 0003
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_roles_id"), "roles", ["id"], unique=False)
    op.create_index(op.f("ix_roles_name"), "roles", ["name"], unique=True)

    op.add_column("users", sa.Column("role_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_users_role_id", "users", "roles", ["role_id"], ["id"])

    op.create_table(
        "org_hierarchy",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("manager_id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["employee_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "checkin_cycles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "phase_windows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cycle_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["cycle_id"], ["checkin_cycles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "thrust_areas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "goal_sheets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("cycle_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["cycle_id"], ["checkin_cycles.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("goals", sa.Column("weightage", sa.Integer(), nullable=True))
    op.add_column("goals", sa.Column("goal_sheet_id", sa.Integer(), nullable=True))
    op.add_column("goals", sa.Column("thrust_area_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_goals_goal_sheet_id", "goals", "goal_sheets", ["goal_sheet_id"], ["id"]
    )
    op.create_foreign_key(
        "fk_goals_thrust_area_id", "goals", "thrust_areas", ["thrust_area_id"], ["id"]
    )

    op.create_table(
        "quarterly_achievements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("goal_id", sa.Integer(), nullable=False),
        sa.Column("quarter", sa.String(), nullable=False),
        sa.Column("progress_percentage", sa.Float(), nullable=True),
        sa.Column("narrative", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "manager_checkins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("goal_sheet_id", sa.Integer(), nullable=False),
        sa.Column("manager_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["goal_sheet_id"], ["goal_sheets.id"]),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("checkin_id", sa.Integer(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["checkin_id"], ["manager_checkins.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("resource_type", sa.String(), nullable=True),
        sa.Column("resource_id", sa.Integer(), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_status", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"])

    op.create_table(
        "escalation_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("rule_type", sa.String(), nullable=False),
        sa.Column("target_user_id", sa.Integer(), nullable=False),
        sa.Column("resource_type", sa.String(), nullable=True),
        sa.Column("resource_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["target_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("escalation_records")
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_table("notifications")
    op.drop_table("comments")
    op.drop_table("manager_checkins")
    op.drop_table("quarterly_achievements")
    op.drop_constraint("fk_goals_thrust_area_id", "goals", type_="foreignkey")
    op.drop_constraint("fk_goals_goal_sheet_id", "goals", type_="foreignkey")
    op.drop_column("goals", "thrust_area_id")
    op.drop_column("goals", "goal_sheet_id")
    op.drop_column("goals", "weightage")
    op.drop_table("goal_sheets")
    op.drop_table("thrust_areas")
    op.drop_table("phase_windows")
    op.drop_table("checkin_cycles")
    op.drop_table("org_hierarchy")
    op.drop_constraint("fk_users_role_id", "users", type_="foreignkey")
    op.drop_column("users", "role_id")
    op.drop_index(op.f("ix_roles_name"), table_name="roles")
    op.drop_index(op.f("ix_roles_id"), table_name="roles")
    op.drop_table("roles")
