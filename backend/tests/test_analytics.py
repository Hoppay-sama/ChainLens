import pytest

from app.models.product import Product
from app.models.shipment import Checkpoint
from datetime import datetime, timezone, timedelta


@pytest.fixture(scope="function")
def seeded_db(db_session):
    for i in range(5):
        product = Product(
            product_id=f"0x{i:064x}",
            name=f"Product {i}",
            description="desc",
            metadata_uri="ipfs://test",
            manufacturer_address="0x1234567890123456789012345678901234567890",
            registered_at=datetime.now(timezone.utc),
            block_number=100 + i,
            tx_hash="0xtx",
        )
        db_session.add(product)
        db_session.commit()

        start = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        end = start + timedelta(hours=(i + 1) * 10)

        db_session.add_all([
            Checkpoint(
                product_id=product.product_id,
                location="Origin",
                status="0",
                handler_address="0xh1",
                notes=None,
                timestamp=start,
                block_number=101 + i,
                tx_hash="0xtx1",
            ),
            Checkpoint(
                product_id=product.product_id,
                location="Destination",
                status="3" if i < 4 else "1",
                handler_address="0xh2",
                notes=None,
                timestamp=end,
                block_number=102 + i,
                tx_hash="0xtx2",
            ),
        ])
        db_session.commit()
    return db_session


def test_get_kpis_structure(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "avg_transit_time_hours" in data
    assert "on_time_rate_percent" in data
    assert "total_shipments" in data
    assert "active_shipments" in data
    assert "delivered_shipments" in data
    assert "avg_checkpoints_per_shipment" in data
    assert "bottleneck_locations" in data
    assert isinstance(data["bottleneck_locations"], list)


def test_get_anomalies_default(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_anomalies_custom_threshold(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/anomalies?z_threshold=1.0")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_get_bottlenecks(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/bottlenecks")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_export_csv(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/export?format=csv")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "veritras_export.csv" in response.headers["content-disposition"]
    body = response.text
    assert "product_id" in body or body == ""


def test_export_pdf(client_fixture, seeded_db):
    response = client_fixture.get("/analytics/export?format=pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "veritras_export.pdf" in response.headers["content-disposition"]
