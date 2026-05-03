from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    metadata_uri: Optional[str] = None


class ProductCreate(ProductBase):
    manufacturer_address: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer_address: Optional[str] = None
    description: Optional[str] = None
    metadata_uri: Optional[str] = None

    model_config = ConfigDict(extra='ignore')


class ProductResponse(ProductBase):
    id: int
    product_id: str
    manufacturer_address: str
    registered_at: datetime
    block_number: int
    tx_hash: str

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
