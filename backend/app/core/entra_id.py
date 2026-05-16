import msal
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class EntraIDClient:
    def __init__(self):
        # Assume these are added to app.config.settings
        self.client_id = getattr(settings, "ENTRA_CLIENT_ID", "your_client_id")
        self.tenant_id = getattr(settings, "ENTRA_TENANT_ID", "your_tenant_id")
        self.client_secret = getattr(settings, "ENTRA_CLIENT_SECRET", "your_client_secret")
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        
        self.app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=self.authority,
            client_credential=self.client_secret,
        )

    def verify_sso_token(self, access_token: str):
        """
        In a real scenario, you decode and verify the JWT signature against 
        Microsoft's public keys. Alternatively, use it to fetch the user profile.
        """
        try:
            # For OBO (On-Behalf-Of) flow or token inspection:
            accounts = self.app.get_accounts()
            # Implement detailed MSAL validation/Graph API fetching here
            return {"status": "success", "token": access_token}
        except Exception as e:
            logger.error(f"Entra ID Token Verification Failed: {e}")
            raise

entra_client = EntraIDClient()
