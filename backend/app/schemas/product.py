from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    metadata_uri: Optional[str] = None


class ProductCreate(ProductBase):
    product_id: str
    manufacturer_address: str
    registered_at: datetime
    block_number: int
    tx_hash: str


class ProductResponse(ProductBase):
    id: int
    product_id: str
    manufacturer_address: str
    registered_at: datetime
    block_number: int
    tx_hash: str

    model_config = ConfigDict(from_attributes=True)
