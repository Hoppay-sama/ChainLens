import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.product import Product
from app.models.shipment import Checkpoint
from app.services.analytics import (
    calculate_avg_transit_time,
    detect_anomalies,
    calculate_on_time_rate,
    get_bottleneck_locations,
    get_kpi_summary,
)
from datetime import datetime, timezone, timedelta

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def mock_data(db_session):
    products = []
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
        products.append(product)

        start = datetime(2024, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
        hours = [10, 20, 30, 40, 100][i]
        end = start + timedelta(hours=hours)

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
                status="3",
                handler_address="0xh2",
                notes=None,
                timestamp=end,
                block_number=102 + i,
                tx_hash="0xtx2",
            ),
        ])
        db_session.commit()
    return db_session


def test_calculate_avg_transit_time(mock_data):
    result = calculate_avg_transit_time(mock_data)
    assert result == 40.0


def test_calculate_on_time_rate(mock_data):
    result = calculate_on_time_rate(mock_data, expected_hours=72.0)
    assert result == 80.0


def test_detect_anomalies(mock_data):
    anomalies = detect_anomalies(mock_data, z_threshold=1.5)
    assert len(anomalies) >= 1
    anomaly = anomalies[0]
    assert hasattr(anomaly, "product_id")
    assert hasattr(anomaly, "transit_time_hours")
    assert hasattr(anomaly, "z_score")
    assert hasattr(anomaly, "severity")


def test_get_bottleneck_locations(mock_data):
    bottlenecks = get_bottleneck_locations(mock_data, min_dwell_hours=5.0)
    assert isinstance(bottlenecks, list)


def test_get_kpi_summary(mock_data):
    kpis = get_kpi_summary(mock_data)
    assert kpis["total_shipments"] == 5
    assert kpis["delivered_shipments"] == 5
    assert kpis["active_shipments"] == 0
    assert kpis["avg_transit_time_hours"] == 40.0
    assert kpis["on_time_rate_percent"] == 80.0
    assert kpis["avg_checkpoints_per_shipment"] == 2.0
    assert isinstance(kpis["bottleneck_locations"], list)
