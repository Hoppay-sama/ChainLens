import random
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from faker import Faker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer

fake = Faker()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chainlens.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

PRODUCT_NAMES = [
    "Industrial Valve Model X",
    "Organic Coffee Beans",
    "Premium Steel Bolts Grade 8",
    "Medical Syringe Pack 100pc",
    "Lithium Ion Battery Cell",
    "Organic Cotton T-Shirt",
    "Precision CNC Machined Gear",
    "Solar Panel 300W Monocrystalline",
    "Bluetooth Sensor Module",
    "Recycled Plastic Pellets",
    "Pharmaceutical API Batch A",
    "Electric Motor 5HP",
    "Frozen Atlantic Salmon Fillet",
    "Automotive Brake Pad Set",
    "Wheat Flour Organic 25kg",
    "LED Display Panel 55 inch",
    "Hydraulic Pump Assembly",
    "Specialty Chemical Solvent",
    "Smart Thermostat Unit",
    "Recycled Aluminum Ingot",
]

LOCATIONS = [
    "Shanghai Port",
    "Los Angeles Warehouse",
    "Rotterdam Distribution Center",
    "Dubai Logistics Hub",
    "Singapore Free Trade Zone",
    "Hamburg Container Terminal",
    "New York Customs",
    "Mumbai Inland Depot",
    "Santos Port Brazil",
    "Vancouver Cold Storage",
    "Tokyo Transit Hub",
    "Busan Container Yard",
    "Felixstowe UK Port",
    "Long Beach Terminal",
    "Qingdao Port",
]

HANDLERS = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
    "0x4444444444444444444444444444444444444444",
    "0x5555555555555555555555555555555555555555",
]

MANUFACTURERS = [
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "0xcccccccccccccccccccccccccccccccccccccccc",
    "0xdddddddddddddddddddddddddddddddddddddddd",
]


def generate_hex_product_id(index: int) -> str:
    """Generate a deterministic bytes32-like hex string."""
    return "0x" + f"{index:064x}"


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(Checkpoint).delete()
        db.query(CustodyTransfer).delete()
        db.query(Product).delete()
        db.commit()

        num_products = random.randint(50, 100)
        print(f"Seeding {num_products} products...")

        products = []
        for i in range(num_products):
            product_id = generate_hex_product_id(i + 1)
            name = random.choice(PRODUCT_NAMES) + f" - Batch {fake.ean8()}"
            description = fake.sentence(nb_words=10)
            metadata_uri = f"ipfs://Qm{fake.sha1()[:40]}"
            manufacturer = random.choice(MANUFACTURERS)
            registered_at = fake.date_time_between(
                start_date="-90d", end_date="now", tzinfo=timezone.utc
            )

            product = Product(
                product_id=product_id,
                name=name,
                description=description,
                metadata_uri=metadata_uri,
                manufacturer_address=manufacturer,
                registered_at=registered_at,
                block_number=random.randint(1000000, 9999999),
                tx_hash=f"0x{fake.sha1()}{fake.sha1()[:24]}",
            )
            products.append(product)
            db.add(product)

        db.commit()
        print(f"Inserted {len(products)} products")

        # Create checkpoints and transfers
        for product in products:
            num_checkpoints = random.randint(3, 6)
            is_delivered = random.random() < 0.80

            current_time = product.registered_at
            for j in range(num_checkpoints):
                location = random.choice(LOCATIONS)
                if j == 0:
                    status = "0"  # Created
                elif j == num_checkpoints - 1 and is_delivered:
                    status = "3"  # Delivered
                else:
                    status = random.choice(["1", "2"])  # InTransit or AtCheckpoint

                handler = random.choice(HANDLERS)
                notes = fake.sentence(nb_words=6) if random.random() > 0.3 else None
                current_time += timedelta(hours=random.randint(6, 48))

                checkpoint = Checkpoint(
                    product_id=product.product_id,
                    location=location,
                    status=status,
                    handler_address=handler,
                    notes=notes,
                    timestamp=current_time,
                    block_number=product.block_number + j,
                    tx_hash=f"0x{fake.sha1()}{fake.sha1()[:24]}",
                )
                db.add(checkpoint)

            # Add custody transfers
            num_transfers = random.randint(0, 2)
            transfer_time = product.registered_at + timedelta(hours=random.randint(12, 36))
            for k in range(num_transfers):
                from_addr = random.choice(HANDLERS)
                to_addr = random.choice([h for h in HANDLERS if h != from_addr])
                transfer = CustodyTransfer(
                    product_id=product.product_id,
                    from_address=from_addr,
                    to_address=to_addr,
                    timestamp=transfer_time,
                    block_number=product.block_number + k + 10,
                    tx_hash=f"0x{fake.sha1()}{fake.sha1()[:24]}",
                )
                db.add(transfer)
                transfer_time += timedelta(hours=random.randint(12, 48))

        db.commit()
        print("Seeded checkpoints and custody transfers")
        print("Done!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
