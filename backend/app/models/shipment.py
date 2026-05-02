from sqlalchemy import Column, Integer, String, DateTime, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False, index=True)
    location = Column(String, nullable=False)
    status = Column(String, nullable=False)
    handler_address = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, nullable=False)
    block_number = Column(BigInteger, nullable=False)
    tx_hash = Column(String, nullable=False)

    product = relationship("Product", backref="checkpoints")


class CustodyTransfer(Base):
    __tablename__ = "custody_transfers"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"), nullable=False, index=True)
    from_address = Column(String, nullable=False)
    to_address = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    block_number = Column(BigInteger, nullable=False)
    tx_hash = Column(String, nullable=False)

    product = relationship("Product", backref="custody_transfers")
