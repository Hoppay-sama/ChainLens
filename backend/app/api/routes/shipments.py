from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.shipment import Checkpoint, CustodyTransfer

router = APIRouter()


@router.get("/{product_id}/history")
def get_checkpoint_history(product_id: str, db: Session = Depends(get_db)):
    """Get checkpoint history for a given product."""
    checkpoints = (
        db.query(Checkpoint)
        .filter(Checkpoint.product_id == product_id)
        .order_by(Checkpoint.timestamp.asc())
        .all()
    )
    if not checkpoints:
        raise HTTPException(status_code=404, detail="No history found for this product")
    return checkpoints


@router.get("/{product_id}/transfers")
def get_custody_transfers(product_id: str, db: Session = Depends(get_db)):
    """Get custody transfer history for a given product."""
    transfers = (
        db.query(CustodyTransfer)
        .filter(CustodyTransfer.product_id == product_id)
        .order_by(CustodyTransfer.timestamp.asc())
        .all()
    )
    if not transfers:
        raise HTTPException(status_code=404, detail="No transfers found for this product")
    return transfers
