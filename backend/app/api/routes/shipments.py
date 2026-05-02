from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.shipment import Checkpoint, CustodyTransfer
from app.schemas.shipment import CheckpointResponse, CustodyTransferResponse

router = APIRouter()


@router.get("/{product_id}/history", response_model=List[CheckpointResponse])
def get_checkpoint_history(product_id: str, db: Session = Depends(get_db)):
    """Get checkpoint history for a given product. Returns empty list if none found."""
    checkpoints = (
        db.query(Checkpoint)
        .filter(Checkpoint.product_id == product_id)
        .order_by(Checkpoint.timestamp.asc())
        .all()
    )
    return checkpoints


@router.get("/{product_id}/transfers", response_model=List[CustodyTransferResponse])
def get_custody_transfers(product_id: str, db: Session = Depends(get_db)):
    """Get custody transfer history for a given product. Returns empty list if none found."""
    transfers = (
        db.query(CustodyTransfer)
        .filter(CustodyTransfer.product_id == product_id)
        .order_by(CustodyTransfer.timestamp.asc())
        .all()
    )
    return transfers
