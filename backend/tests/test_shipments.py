import pytest

from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer
from datetime import datetime, timezone


@pytest.fixture(scope="function")
def seeded_db(db_session):
    product = Product(
        product_id="0x" + "b" * 64,
        name="Shipment Test Product",
        description="For shipment tests",
        metadata_uri="ipfs://shipment",
        manufacturer_address="0x1234567890123456789012345678901234567890",
        registered_at=datetime.now(timezone.utc),
        block_number=200,
        tx_hash="0xshipmenttx",
    )
    db_session.add(product)
    db_session.commit()

    cp1 = Checkpoint(
        product_id=product.product_id,
        location="Origin",
        status="0",
        handler_address="0xhandler1",
        notes=None,
        timestamp=datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc),
        block_number=201,
        tx_hash="0xcp1",
    )
    cp2 = Checkpoint(
        product_id=product.product_id,
        location="Midpoint",
        status="1",
        handler_address="0xhandler2",
        notes="In transit",
        timestamp=datetime(2024, 1, 2, 10, 0, 0, tzinfo=timezone.utc),
        block_number=202,
        tx_hash="0xcp2",
    )
    db_session.add_all([cp1, cp2])

    transfer = CustodyTransfer(
        product_id=product.product_id,
        from_address="0xhandler1",
        to_address="0xhandler2",
        timestamp=datetime(2024, 1, 2, 10, 0, 0, tzinfo=timezone.utc),
        block_number=203,
        tx_hash="0xtransfer1",
    )
    db_session.add(transfer)
    db_session.commit()
    return db_session


def test_get_history(client_fixture, seeded_db):
    response = client_fixture.get("/shipments/0x" + "b" * 64 + "/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["location"] == "Origin"
    assert data[1]["location"] == "Midpoint"


def test_get_history_empty(client_fixture, seeded_db):
    response = client_fixture.get("/shipments/0xnonexistent/history")
    assert response.status_code == 200
    data = response.json()
    assert data == []


def test_get_transfers(client_fixture, seeded_db):
    response = client_fixture.get("/shipments/0x" + "b" * 64 + "/transfers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["from_address"] == "0xhandler1"


def test_get_transfers_empty(client_fixture, seeded_db):
    response = client_fixture.get("/shipments/0xnonexistent/transfers")
    assert response.status_code == 200
    data = response.json()
    assert data == []
