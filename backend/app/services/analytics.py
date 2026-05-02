import pandas as pd
import numpy as np
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer
from app.schemas.analytics import AnomalyResponse


def _get_checkpoint_data(db: Session) -> pd.DataFrame:
    """Query all checkpoints and return as a DataFrame."""
    checkpoints = db.query(Checkpoint).all()
    if not checkpoints:
        return pd.DataFrame()
    data = [
        {
            "product_id": cp.product_id,
            "timestamp": cp.timestamp,
            "location": cp.location,
            "status": cp.status,
        }
        for cp in checkpoints
    ]
    df = pd.DataFrame(data)
    if not df.empty:
        df = df.assign(timestamp=pd.to_datetime(df["timestamp"]))
    return df


def _compute_transit_times(db: Session) -> pd.DataFrame:
    """Compute transit time per product in hours."""
    df = _get_checkpoint_data(db)
    if df.empty:
        return pd.DataFrame()

    grouped = df.groupby("product_id")["timestamp"]
    transit_times = (grouped.max() - grouped.min()).dt.total_seconds() / 3600.0
    result = transit_times.reset_index()
    result.columns = ["product_id", "transit_time_hours"]
    return result


def calculate_avg_transit_time(db: Session) -> Optional[float]:
    """
    Calculate the average transit time between the first and last checkpoint
    for each product, then return the overall average in hours.
    """
    transit_df = _compute_transit_times(db)
    if transit_df.empty:
        return None
    return float(transit_df["transit_time_hours"].mean())


def detect_anomalies(db: Session, z_threshold: float = 2.0) -> List[AnomalyResponse]:
    """
    Detect anomalous transit times using Z-score analysis.
    """
    transit_df = _compute_transit_times(db)
    if transit_df.empty or len(transit_df) < 2:
        return []

    mean_tt = transit_df["transit_time_hours"].mean()
    std_tt = transit_df["transit_time_hours"].std()
    if std_tt == 0 or pd.isna(std_tt):
        return []

    transit_df = transit_df.copy()
    transit_df = transit_df.assign(z_score=(transit_df["transit_time_hours"] - mean_tt) / std_tt)
    anomalies_df = transit_df[transit_df["z_score"].abs() > z_threshold].copy()

    anomalies = []
    now = datetime.now(timezone.utc).isoformat()
    for _, row in anomalies_df.iterrows():
        z = abs(row["z_score"])
        if z > 3.0:
            severity = "high"
        elif z > 2.5:
            severity = "medium"
        else:
            severity = "low"
        anomalies.append(
            AnomalyResponse(
                product_id=row["product_id"],
                transit_time_hours=float(row["transit_time_hours"]),
                z_score=float(row["z_score"]),
                severity=severity,
                flagged_at=now,
            )
        )
    return anomalies


def calculate_on_time_rate(db: Session, expected_hours: float = 72.0) -> Optional[float]:
    """
    Calculate the percentage of shipments delivered within the expected duration.
    """
    transit_df = _compute_transit_times(db)
    if transit_df.empty:
        return None
    on_time = (transit_df["transit_time_hours"] <= expected_hours).sum()
    total = len(transit_df)
    return float((on_time / total) * 100) if total > 0 else None


def get_bottleneck_locations(db: Session, min_dwell_hours: float = 24.0) -> List[Dict]:
    """
    Look at consecutive checkpoints for each product and compute dwell time
    at each location. Return locations where average dwell time exceeds threshold.
    """
    df = _get_checkpoint_data(db)
    if df.empty:
        return []

    df = df.sort_values(["product_id", "timestamp"]).copy()
    df = df.assign(next_timestamp=df.groupby("product_id")["timestamp"].shift(-1))
    df = df.assign(dwell_hours=(df["next_timestamp"] - df["timestamp"]).dt.total_seconds() / 3600.0)
    df = df.dropna(subset=["dwell_hours"])

    if df.empty:
        return []

    location_stats = (
        df.groupby("location")
        .agg(avg_dwell_hours=("dwell_hours", "mean"), incident_count=("dwell_hours", "count"))
        .reset_index()
    )
    bottlenecks = location_stats[location_stats["avg_dwell_hours"] > min_dwell_hours]
    bottlenecks = bottlenecks.sort_values("avg_dwell_hours", ascending=False)

    return [
        {
            "location": row["location"],
            "avg_dwell_hours": float(row["avg_dwell_hours"]),
            "incident_count": int(row["incident_count"]),
        }
        for _, row in bottlenecks.iterrows()
    ]


def get_kpi_summary(db: Session) -> Dict:
    """
    Aggregate all KPIs into a single response dict.
    """
    total_shipments = db.query(Product).count()

    # Products with checkpoints but not delivered = active
    delivered_ids = (
        db.query(Checkpoint.product_id)
        .filter(Checkpoint.status == "3")
        .distinct()
        .subquery()
    )
    delivered_shipments = db.query(Product).filter(Product.product_id.in_(delivered_ids.select())).count()

    products_with_checkpoints = (
        db.query(Checkpoint.product_id).distinct().subquery()
    )
    active_shipments = (
        db.query(Product)
        .filter(Product.product_id.in_(products_with_checkpoints.select()))
        .filter(Product.product_id.notin_(delivered_ids.select()))
        .count()
    )

    avg_transit = calculate_avg_transit_time(db)
    on_time = calculate_on_time_rate(db)

    checkpoint_counts = db.query(Checkpoint).count()
    avg_checkpoints = checkpoint_counts / total_shipments if total_shipments > 0 else 0.0

    bottlenecks = get_bottleneck_locations(db)

    return {
        "avg_transit_time_hours": avg_transit,
        "on_time_rate_percent": on_time,
        "total_shipments": total_shipments,
        "active_shipments": active_shipments,
        "delivered_shipments": delivered_shipments,
        "avg_checkpoints_per_shipment": avg_checkpoints,
        "bottleneck_locations": bottlenecks,
    }
