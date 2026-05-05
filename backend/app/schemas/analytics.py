from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List


class KPIResponse(BaseModel):
    avg_transit_time_hours: Optional[float]
    on_time_rate_percent: Optional[float]
    total_shipments: int
    active_shipments: int
    delivered_shipments: int
    avg_checkpoints_per_shipment: float
    bottleneck_locations: List[dict]

    model_config = ConfigDict(from_attributes=True)


class AnomalyResponse(BaseModel):
    product_id: str = Field(..., max_length=100)
    transit_time_hours: float
    z_score: float
    severity: str = Field(..., max_length=50)
    flagged_at: str = Field(..., max_length=50)

    model_config = ConfigDict(from_attributes=True)


class ExportRequest(BaseModel):
    format: str = Field(..., max_length=10)
    start_date: Optional[str] = Field(default=None, max_length=50)
    end_date: Optional[str] = Field(default=None, max_length=50)

    model_config = ConfigDict(from_attributes=True)


class DailyVolumeItem(BaseModel):
    name: str = Field(..., max_length=50)  # day name like "Mon", "Tue"
    date: str = Field(..., max_length=50)  # ISO date like "2024-01-15"
    shipments: int
    products: int

    model_config = ConfigDict(from_attributes=True)


class DailyVolumeResponse(BaseModel):
    items: List[DailyVolumeItem]

    model_config = ConfigDict(from_attributes=True)
