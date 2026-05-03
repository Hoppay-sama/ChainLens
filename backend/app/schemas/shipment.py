from pydantic import BaseModel, ConfigDict
from typing import List, Optional
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


class ShipmentBase(BaseModel):
    product_id: str
    origin: str
    destination: str
    status: str = "0"
    notes: Optional[str] = None


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(extra='ignore')


class ShipmentResponse(ShipmentBase):
    id: int
    shipment_id: str
    created_at: datetime
    updated_at: datetime
    block_number: int
    tx_hash: str

    model_config = ConfigDict(from_attributes=True)


class ShipmentListResponse(BaseModel):
    items: List[ShipmentResponse]
    total: int
