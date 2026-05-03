from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Literal, Optional, List

from app.core.database import get_db
from app.core.limiter import limiter
from app.services.analytics import get_kpi_summary, detect_anomalies, get_bottleneck_locations
from app.services.export import export_to_csv, export_to_pdf
from app.schemas.analytics import KPIResponse, AnomalyResponse

router = APIRouter()


@router.get("/kpis", response_model=KPIResponse)
@limiter.limit("10/minute")
def get_kpis(request: Request, db: Session = Depends(get_db)):
    """Return key performance indicators for the supply chain."""
    return get_kpi_summary(db)


@router.get("/anomalies", response_model=List[AnomalyResponse])
@limiter.limit("10/minute")
def get_anomalies(
    request: Request,
    z_threshold: float = Query(2.0, ge=0.5),
    db: Session = Depends(get_db)
):
    """Detect anomalous shipment transit times using Z-score analysis."""
    return detect_anomalies(db, z_threshold=z_threshold)


@router.get("/bottlenecks")
@limiter.limit("10/minute")
def get_bottlenecks(
    request: Request,
    min_dwell_hours: float = Query(24.0, ge=0.0),
    db: Session = Depends(get_db)
):
    """Identify bottleneck locations based on average dwell time between checkpoints."""
    return get_bottleneck_locations(db, min_dwell_hours=min_dwell_hours)


@router.get("/export")
@limiter.limit("10/minute")
def export_analytics(
    request: Request,
    format: Literal["csv", "pdf"] = Query("csv"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Export analytics data to CSV or PDF."""
    if format == "csv":
        content = export_to_csv(db, start_date, end_date)
        return StreamingResponse(
            iter([content]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=chainlens_export.csv"},
        )
    else:
        content = export_to_pdf(db, start_date, end_date)
        return StreamingResponse(
            iter([content]),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=chainlens_export.pdf"},
        )
