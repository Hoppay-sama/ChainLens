from fastapi import APIRouter, HTTPException, Request

from app.core.auth import (
    build_siwe_message,
    create_access_token,
    extract_address_from_siwe,
    extract_nonce_from_siwe,
    nonce_store,
    verify_signature,
)
from app.core.limiter import limiter
from app.schemas.auth import NonceResponse, VerifyRequest, VerifyResponse

router = APIRouter()


@router.post("/nonce", response_model=NonceResponse)
@limiter.limit("5/minute")
def get_nonce(request: Request):
    """Generate a random nonce for SIWE authentication."""
    nonce = nonce_store.create()
    return {"nonce": nonce}


@router.post("/verify", response_model=VerifyResponse)
@limiter.limit("5/minute")
def verify(request: Request, body: VerifyRequest):
    """Verify a SIWE signature and return a JWT access token."""
    try:
        nonce = extract_nonce_from_siwe(body.message)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid SIWE message: nonce not found"
        )

    if not nonce_store.verify(nonce):
        raise HTTPException(status_code=401, detail="Invalid or expired nonce")

    try:
        address = extract_address_from_siwe(body.message)
    except ValueError:
        raise HTTPException(
            status_code=400, detail="Invalid SIWE message: address not found"
        )

    if not verify_signature(body.message, body.signature, address):
        raise HTTPException(status_code=401, detail="Invalid signature")

    token = create_access_token(address)
    return {"access_token": token, "token_type": "bearer"}
