import logging
from typing import Any, Dict, Optional

import httpx
from jose import jwt
from jose.exceptions import JWTError

from app.config import settings

logger = logging.getLogger(__name__)

MICROSOFT_JWKS_URL = (
    "https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys"
)


class EntraIDClient:
    def __init__(self):
        self.client_id = settings.ENTRA_CLIENT_ID or ""
        self.tenant_id = settings.ENTRA_TENANT_ID or ""
        self.authority = f"https://login.microsoftonline.com/{self.tenant_id}"
        self._jwks_cache: Optional[dict] = None

    def _fetch_jwks(self) -> dict:
        if self._jwks_cache:
            return self._jwks_cache
        if not self.tenant_id:
            raise ValueError("ENTRA_TENANT_ID is not configured")
        url = MICROSOFT_JWKS_URL.format(tenant=self.tenant_id)
        response = httpx.get(url, timeout=10.0)
        response.raise_for_status()
        self._jwks_cache = response.json()
        return self._jwks_cache

    def verify_sso_token(self, id_token: str) -> Dict[str, Any]:
        """Validate Entra ID token signature and claims; return decoded payload."""
        if not id_token:
            raise ValueError("Missing id_token")

        if not self.client_id or not self.tenant_id:
            raise ValueError("Entra ID is not configured on the server")

        jwks = self._fetch_jwks()
        unverified_header = jwt.get_unverified_header(id_token)
        kid = unverified_header.get("kid")
        rsa_key = next(
            (key for key in jwks.get("keys", []) if key.get("kid") == kid),
            None,
        )
        if not rsa_key:
            raise ValueError("Unable to find matching JWKS key for token")

        issuer = f"https://login.microsoftonline.com/{self.tenant_id}/v2.0"
        payload = jwt.decode(
            id_token,
            rsa_key,
            algorithms=["RS256"],
            audience=self.client_id,
            issuer=issuer,
            options={"verify_at_hash": False},
        )
        return payload


entra_client = EntraIDClient()
