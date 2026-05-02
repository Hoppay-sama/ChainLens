from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer
from app.schemas.product import ProductResponse
from app.schemas.shipment import CheckpointResponse, CustodyTransferResponse

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """List all registered products with pagination."""
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=dict)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a single product by its product_id, including history and custody transfers."""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    history = db.query(Checkpoint).filter(Checkpoint.product_id == product_id).order_by(Checkpoint.timestamp.asc()).all()
    transfers = db.query(CustodyTransfer).filter(CustodyTransfer.product_id == product_id).order_by(CustodyTransfer.timestamp.asc()).all()

    return {
        "product": ProductResponse.model_validate(product),
        "history": [CheckpointResponse.model_validate(cp) for cp in history],
        "transfers": [CustodyTransferResponse.model_validate(ct) for ct in transfers],
    }


@router.get("/{product_id}/verify", response_model=dict)
def verify_product(product_id: str, db: Session = Depends(get_db)):
    """Return verification status for a product."""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    checkpoint_count = db.query(Checkpoint).filter(Checkpoint.product_id == product_id).count()
    is_delivered = (
        db.query(Checkpoint)
        .filter(Checkpoint.product_id == product_id, Checkpoint.status == "3")
        .first()
        is not None
    )

    return {
        "product_id": product_id,
        "is_registered": True,
        "is_delivered": is_delivered,
        "checkpoint_count": checkpoint_count,
    }
