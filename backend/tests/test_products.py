import pytest

from app.models.product import Product
from datetime import datetime, timezone


@pytest.fixture(scope="function")
def seeded_products(db_session):
    product = Product(
        product_id="0x" + "a" * 64,
        name="Test Product",
        description="A test product",
        metadata_uri="ipfs://test",
        manufacturer_address="0x1234567890123456789012345678901234567890",
        registered_at=datetime.now(timezone.utc),
        block_number=100,
        tx_hash="0xtesttx",
    )
    db_session.add(product)
    db_session.commit()
    return db_session


def test_post_product_creates_product_successfully(client_fixture, seeded_products):
    """Regression test: POST /products must not return 405 Method Not Allowed."""
    payload = {
        "name": "Organic Coffee Beans",
        "manufacturer_address": "0x0987654321098765432109876543210987654321",
        "description": "Premium organic coffee",
        "metadata_uri": "https://example.com/coffee",
    }
    response = client_fixture.post("/products", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["manufacturer_address"] == payload["manufacturer_address"]
    assert data["description"] == payload["description"]
    assert data["metadata_uri"] == payload["metadata_uri"]
    assert data["block_number"] == 0
    assert data["tx_hash"] == "0x"


def test_post_product_returns_created_product_with_generated_id(client_fixture, seeded_products):
    payload = {
        "name": "New Product",
        "manufacturer_address": "0x1234567890123456789012345678901234567890",
    }
    response = client_fixture.post("/products", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "product_id" in data
    assert data["product_id"].startswith("PROD-")
    assert len(data["product_id"]) == len("PROD-") + 8
    assert data["id"] is not None
    assert data["created_at"] is not None


def test_put_product_updates_existing_product(client_fixture, seeded_products):
    update_payload = {
        "name": "Updated Product Name",
        "description": "Updated description",
    }
    response = client_fixture.put("/products/0x" + "a" * 64, json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Product Name"
    assert data["description"] == "Updated description"
    assert data["manufacturer_address"] == "0x1234567890123456789012345678901234567890"


def test_put_product_returns_404_for_nonexistent_product(client_fixture, seeded_products):
    response = client_fixture.put("/products/0xnonexistent", json={"name": "New"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_get_products_returns_paginated_list_with_items_and_total(client_fixture, seeded_products):
    response = client_fixture.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


def test_get_product_detail(client_fixture, seeded_products):
    response = client_fixture.get("/products/0x" + "a" * 64)
    assert response.status_code == 200
    data = response.json()
    assert "product" in data
    assert data["product"]["name"] == "Test Product"
    assert "history" in data
    assert "transfers" in data


def test_get_product_verify(client_fixture, seeded_products):
    response = client_fixture.get("/products/0x" + "a" * 64 + "/verify")
    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == "0x" + "a" * 64
    assert data["is_registered"] is True
    assert data["checkpoint_count"] == 0
    assert data["is_delivered"] is False


def test_get_product_detail_404(client_fixture, seeded_products):
    response = client_fixture.get("/products/0xnonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_get_product_verify_404(client_fixture, seeded_products):
    response = client_fixture.get("/products/0xnonexistent/verify")
    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"
