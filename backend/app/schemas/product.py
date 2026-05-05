from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    metadata_uri: Optional[str] = Field(default=None, max_length=500)


class ProductCreate(ProductBase):
    manufacturer_address: str = Field(..., pattern=r"^0x[a-fA-F0-9]{40}$")


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=200)
    manufacturer_address: Optional[str] = Field(default=None, pattern=r"^0x[a-fA-F0-9]{40}$")
    description: Optional[str] = Field(default=None, max_length=1000)
    metadata_uri: Optional[str] = Field(default=None, max_length=500)

    model_config = ConfigDict(extra='ignore')


class ProductResponse(ProductBase):
    id: int
    product_id: str = Field(..., max_length=100)
    manufacturer_address: str = Field(..., max_length=42)
    registered_at: datetime
    block_number: int
    tx_hash: str = Field(..., max_length=100)

    model_config = ConfigDict(from_attributes=True, extra='forbid')


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
