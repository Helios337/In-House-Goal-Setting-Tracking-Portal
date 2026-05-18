from sqlalchemy.orm import Session

from app import models
from app.events.types import channel_user, channel_team, channel_goal


def get_user_channels(db: Session, user_id: int) -> list[str]:
    channels = {channel_user(user_id)}

    has_reports = (
        db.query(models.OrgHierarchy)
        .filter(models.OrgHierarchy.manager_id == user_id)
        .count()
        > 0
    )
    if has_reports:
        channels.add(channel_team(user_id))

    shared_links = (
        db.query(models.SharedGoal).filter(models.SharedGoal.user_id == user_id).all()
    )
    for link in shared_links:
        channels.add(channel_goal(link.goal_id))

    owned_goals = db.query(models.Goal).filter(models.Goal.owner_id == user_id).all()
    for goal in owned_goals:
        channels.add(channel_goal(goal.id))

    return list(channels)
