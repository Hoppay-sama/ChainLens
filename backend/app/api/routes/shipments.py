from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.shipment import Checkpoint, CustodyTransfer
from app.schemas.shipment import CheckpointResponse, CustodyTransferResponse

router = APIRouter()


@router.get("/", response_model=List[CheckpointResponse])
def get_all_shipments(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all checkpoints with pagination."""
    return (
        db.query(Checkpoint)
        .order_by(Checkpoint.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{product_id}/history", response_model=List[CheckpointResponse])
def get_checkpoint_history(product_id: str, db: Session = Depends(get_db)):
    """Get checkpoint history for a given product."""
    return (
        db.query(Checkpoint)
        .filter(Checkpoint.product_id == product_id)
        .order_by(Checkpoint.timestamp.asc())
        .all()
    )


@router.get("/{product_id}/transfers", response_model=List[CustodyTransferResponse])
def get_custody_transfers(product_id: str, db: Session = Depends(get_db)):
    """Get custody transfer history for a given product."""
    return (
        db.query(CustodyTransfer)
        .filter(CustodyTransfer.product_id == product_id)
        .order_by(CustodyTransfer.timestamp.asc())
        .all()
    )