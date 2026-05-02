from sqlalchemy import Column, Integer, String, DateTime, BigInteger
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, index=True, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    metadata_uri = Column(String, nullable=True)
    manufacturer_address = Column(String, nullable=False)
    registered_at = Column(DateTime, nullable=False)
    block_number = Column(BigInteger, nullable=False)
    tx_hash = Column(String, nullable=False)
