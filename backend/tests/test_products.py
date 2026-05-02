import pytest
from fastapi.testclient import TestClient

from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer
from datetime import datetime, timezone


@pytest.fixture(scope="function")
def seeded_db(db_session):
    product = Product(
        product_id="0x" + "a" * 64,
        name="Test Product",
        description="A test product",
        metadata_uri="ipfs://test",
        manufacturer_address="0x1234567890123456789012345678901234567890",
        registered_at=datetime.now(timezone.utc),
        block_number=100,
        tx_hash="0xdeadbeef",
    )
    db_session.add(product)
    db_session.commit()

    checkpoint = Checkpoint(
        product_id=product.product_id,
        location="Test Location",
        status="1",
        handler_address="0xhandler",
        notes="Test note",
        timestamp=datetime.now(timezone.utc),
        block_number=101,
        tx_hash="0xcafebabe",
    )
    db_session.add(checkpoint)
    db_session.commit()
    return db_session


def test_list_products(client_fixture, seeded_db):
    response = client_fixture.get("/products/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_list_products_pagination(client_fixture, seeded_db):
    response = client_fixture.get("/products/?skip=0&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_get_product_exists(client_fixture, seeded_db):
    response = client_fixture.get("/products/0x" + "a" * 64)
    assert response.status_code == 200
    data = response.json()
    assert data["product"]["product_id"] == "0x" + "a" * 64
    assert "history" in data
    assert "transfers" in data


def test_get_product_404(client_fixture, seeded_db):
    response = client_fixture.get("/products/0xnonexistent")
    assert response.status_code == 404


def test_verify_product(client_fixture, seeded_db):
    response = client_fixture.get("/products/0x" + "a" * 64 + "/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["is_registered"] is True
    assert data["checkpoint_count"] == 1
    assert data["is_delivered"] is False


def test_verify_product_404(client_fixture, seeded_db):
    response = client_fixture.get("/products/0xnonexistent/verify")
    assert response.status_code == 404
