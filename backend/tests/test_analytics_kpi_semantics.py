from datetime import datetime, timezone

from app.models.product import Product
from app.models.shipment import Shipment
from app.services.analytics import get_kpi_summary


def test_kpi_total_shipments_counts_shipments_not_products(db_session):
    for i in range(3):
        db_session.add(
            Product(
                product_id=f"PROD-{i}",
                name=f"Product {i}",
                description=None,
                metadata_uri=None,
                manufacturer_address="0x1234567890123456789012345678901234567890",
                registered_at=datetime.now(timezone.utc),
                block_number=0,
                tx_hash="0x",
            )
        )
    db_session.commit()

    db_session.add(
        Shipment(
            shipment_id="SHIP-1",
            product_id="PROD-0",
            origin="NYC",
            destination="LA",
            status="1",
            notes=None,
        )
    )
    db_session.commit()

    summary = get_kpi_summary(db_session)

    assert summary["total_shipments"] == 1
