import re
import secrets
import time
from datetime import datetime, timedelta, timezone
from threading import Lock

from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify", auto_error=False)


class NonceStore:
    """Simple in-memory nonce store with TTL. Consider Redis for multi-instance deployments."""

    def __init__(self, ttl_seconds: int = 300):
        self._store: dict[str, float] = {}
        self._ttl = ttl_seconds
        self._lock = Lock()

    def create(self) -> str:
        nonce = secrets.token_hex(16)
        with self._lock:
            self._store[nonce] = time.time() + self._ttl
        return nonce

    def verify(self, nonce: str) -> bool:
        with self._lock:
            expires_at = self._store.pop(nonce, None)
            if expires_at is None:
                return False
            return time.time() <= expires_at


nonce_store = NonceStore()


def build_siwe_message(address: str, nonce: str) -> str:
    """Build a SIWE-compliant message for the given address and nonce."""
    now = datetime.now(timezone.utc).isoformat()
    return (
        f"veritras.io wants you to sign in with your Ethereum account:\n"
        f"{address}\n\n"
        f"Sign in to Veritras\n\n"
        f"URI: https://veritras.io\n"
        f"Version: 1\n"
        f"Chain ID: 11155111\n"
        f"Nonce: {nonce}\n"
        f"Issued At: {now}"
    )


def extract_address_from_siwe(message: str) -> str:
    lines = message.strip().splitlines()
    if len(lines) < 2:
        raise ValueError("Invalid SIWE message format")
    return lines[1].strip()


def extract_nonce_from_siwe(message: str) -> str:
    match = re.search(r"Nonce:\s*(\S+)", message, re.IGNORECASE)
    if not match:
        raise ValueError("Nonce not found in SIWE message")
    return match.group(1)


def create_access_token(address: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiration_hours)
    to_encode = {"sub": address.lower(), "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> str:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        address: str | None = payload.get("sub")
        if not address:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return address
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return verify_access_token(token)


def verify_signature(message: str, signature: str, address: str) -> bool:
    try:
        message_hash = encode_defunct(text=message)
        recovered = Account.recover_message(message_hash, signature=signature)
        return recovered.lower() == address.lower()
    except Exception:
        return False
