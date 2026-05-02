from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer

router = APIRouter()


@router.get("/")
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """List all registered products with pagination."""
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a single product by its product_id, including history and custody transfers."""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    history = db.query(Checkpoint).filter(Checkpoint.product_id == product_id).all()
    transfers = db.query(CustodyTransfer).filter(CustodyTransfer.product_id == product_id).all()

    return {
        "product": product,
        "history": history,
        "transfers": transfers
    }
