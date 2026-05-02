from pydantic import BaseModel, ConfigDict
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
    product_id: str
    transit_time_hours: float
    z_score: float
    severity: str
    flagged_at: str

    model_config = ConfigDict(from_attributes=True)


class ExportRequest(BaseModel):
    format: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
