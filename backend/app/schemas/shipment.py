from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CheckpointBase(BaseModel):
    product_id: str
    location: str
    status: str
    handler_address: str
    notes: Optional[str] = None
    timestamp: datetime
    block_number: int
    tx_hash: str


class CheckpointResponse(CheckpointBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CustodyTransferBase(BaseModel):
    product_id: str
    from_address: str
    to_address: str
    timestamp: datetime
    block_number: int
    tx_hash: str


class CustodyTransferResponse(CustodyTransferBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
