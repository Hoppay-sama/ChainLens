from pydantic import BaseModel


class NonceResponse(BaseModel):
    nonce: str


class VerifyRequest(BaseModel):
    message: str
    signature: str


class VerifyResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
