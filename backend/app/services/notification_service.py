import logging

logger = logging.getLogger(__name__)

def send_email_notification(to_email: str, subject: str, body: str):
    """Stub for SMTP or SendGrid/AWS SES integration."""
    logger.info(f"EMAIL SENT TO: {to_email} | SUBJECT: {subject}")
    # TODO: Implement actual email sending logic via aiosmtplib or similar
    pass

def send_teams_webhook(webhook_url: str, message: str):
    """Stub for sending Microsoft Teams actionable messages/notifications."""
    logger.info(f"TEAMS WEBHOOK TRIGGERED: {message}")
    # TODO: Implement requests.post(webhook_url, json={"text": message})
    pass

def notify_manager_sheet_submitted(manager_email: str, employee_name: str):
    """Composite function utilizing the stubs."""
    subject = f"Action Required: {employee_name} has submitted their Goal Sheet"
    body = f"Please log in to the portal to review and approve the goals for {employee_name}."
    send_email_notification(manager_email, subject, body)
