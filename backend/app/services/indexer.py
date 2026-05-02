import json
import logging
import os
import threading
import time
from pathlib import Path
from typing import Dict, Optional

from web3 import Web3
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.product import Product
from app.models.shipment import Checkpoint, CustodyTransfer

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
INDEXER_STATE_FILE = BACKEND_DIR / "indexer_state.json"

# Status mapping from uint8 to string
STATUS_MAP = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
}


def bytes32_to_hex(value) -> str:
    """Convert bytes32 to hex string (0x...)."""
    return Web3.to_hex(value)


def timestamp_to_datetime(ts) -> datetime:
    """Convert uint256 timestamp to Python datetime (UTC)."""
    return datetime.fromtimestamp(ts, tz=timezone.utc)


def load_abi(contract_name: str) -> list:
    """Load contract ABI from the blockchain artifacts directory."""
    artifact_path = (
        BACKEND_DIR.parent
        / "blockchain"
        / "artifacts"
        / "contracts"
        / f"{contract_name}.sol"
        / f"{contract_name}.json"
    )
    with open(artifact_path, "r") as f:
        artifact = json.load(f)
    return artifact["abi"]


def load_indexer_state() -> Dict:
    """Load the last processed block from the state file."""
    if INDEXER_STATE_FILE.exists():
        with open(INDEXER_STATE_FILE, "r") as f:
            return json.load(f)
    return {"last_processed_block": 0}


def save_indexer_state(state: Dict):
    """Save the last processed block to the state file."""
    with open(INDEXER_STATE_FILE, "w") as f:
        json.dump(state, f)


class EventIndexer:
    """
    Web3.py-based blockchain event indexer for ChainLens.
    Polls the configured Ethereum RPC for ProductRegistered, CheckpointRecorded,
    CustodyTransferred, and DeliveryCompleted events, then persists them to the database.
    """

    def __init__(
        self,
        rpc_url: Optional[str] = None,
        product_registry_address: Optional[str] = None,
        shipment_tracker_address: Optional[str] = None,
        poll_interval: Optional[int] = None,
    ):
        self.rpc_url = rpc_url or settings.sepolia_rpc_url
        self.product_registry_address = product_registry_address or settings.product_registry_contract
        self.shipment_tracker_address = shipment_tracker_address or settings.shipment_tracker_contract
        self.poll_interval = poll_interval or settings.indexer_poll_interval

        self.w3: Optional[Web3] = None
        self.product_registry = None
        self.shipment_tracker = None
        self.running = False
        self._thread: Optional[threading.Thread] = None

    def _connect(self):
        """Initialize Web3 connection and contract instances."""
        if not self.rpc_url:
            raise RuntimeError("RPC URL is not configured")
        if not self.product_registry_address or not self.shipment_tracker_address:
            raise RuntimeError("Contract addresses are not configured")

        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to RPC: {self.rpc_url}")

        product_registry_abi = load_abi("ProductRegistry")
        shipment_tracker_abi = load_abi("ShipmentTracker")

        self.product_registry = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.product_registry_address),
            abi=product_registry_abi,
        )
        self.shipment_tracker = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.shipment_tracker_address),
            abi=shipment_tracker_abi,
        )
        logger.info("Indexer connected to RPC and contracts initialized")

    def start(self):
        """Start the indexer in a background thread."""
        if self.running:
            logger.warning("Indexer is already running")
            return

        self.running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info("Indexer background thread started")

    def stop(self):
        """Gracefully stop the indexer loop."""
        self.running = False
        if self._thread:
            self._thread.join(timeout=self.poll_interval + 5)
            logger.info("Indexer stopped")

    def _run(self):
        """Main polling loop."""
        try:
            self._connect()
        except Exception as e:
            logger.error(f"Indexer connection failed: {e}")
            self.running = False
            return

        state = load_indexer_state()
        last_processed = state.get("last_processed_block", 0)

        while self.running:
            try:
                latest_block = self.w3.eth.block_number
                from_block = last_processed + 1

                if from_block > latest_block:
                    time.sleep(self.poll_interval)
                    continue

                logger.info(f"Indexing blocks {from_block} to {latest_block}")

                # Fetch ProductRegistered events
                product_events = self.product_registry.events.ProductRegistered().get_logs(
                    fromBlock=from_block, toBlock=latest_block
                )
                for event in product_events:
                    self._process_product_registered(event)

                # Fetch CheckpointRecorded events
                checkpoint_events = self.shipment_tracker.events.CheckpointRecorded().get_logs(
                    fromBlock=from_block, toBlock=latest_block
                )
                for event in checkpoint_events:
                    self._process_checkpoint_recorded(event)

                # Fetch CustodyTransferred events
                custody_events = self.shipment_tracker.events.CustodyTransferred().get_logs(
                    fromBlock=from_block, toBlock=latest_block
                )
                for event in custody_events:
                    self._process_custody_transferred(event)

                # Fetch DeliveryCompleted events
                delivery_events = self.shipment_tracker.events.DeliveryCompleted().get_logs(
                    fromBlock=from_block, toBlock=latest_block
                )
                for event in delivery_events:
                    self._process_delivery_completed(event)

                last_processed = latest_block
                save_indexer_state({"last_processed_block": last_processed})
                time.sleep(self.poll_interval)

            except Exception as e:
                logger.error(f"Indexer polling error: {e}")
                time.sleep(5)

    def _process_product_registered(self, event: Dict):
        """Persist a ProductRegistered event to the database."""
        args = event["args"]
        product_id = bytes32_to_hex(args["productId"])
        manufacturer = args["manufacturer"]
        name = args["name"]
        timestamp = timestamp_to_datetime(args["timestamp"])
        block_number = event["blockNumber"]
        tx_hash = event["transactionHash"].hex()

        db = SessionLocal()
        try:
            existing = db.query(Product).filter(Product.product_id == product_id).first()
            if existing:
                logger.debug(f"Product {product_id} already exists, skipping")
                return

            # Try to fetch additional product info from the contract
            description = ""
            metadata_uri = ""
            try:
                product_info = self.product_registry.functions.getProduct(args["productId"]).call()
                description = product_info[3] if len(product_info) > 3 else ""
                metadata_uri = product_info[4] if len(product_info) > 4 else ""
            except Exception as e:
                logger.warning(f"Could not fetch product details for {product_id}: {e}")

            product = Product(
                product_id=product_id,
                name=name,
                description=description or None,
                metadata_uri=metadata_uri or None,
                manufacturer_address=manufacturer,
                registered_at=timestamp,
                block_number=block_number,
                tx_hash=tx_hash,
            )
            db.add(product)
            db.commit()
            logger.info(f"Indexed ProductRegistered: {product_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing ProductRegistered: {e}")
        finally:
            db.close()

    def _process_checkpoint_recorded(self, event: Dict):
        """Persist a CheckpointRecorded event to the database."""
        args = event["args"]
        product_id = bytes32_to_hex(args["productId"])
        location = args["location"]
        status = STATUS_MAP.get(args["status"], str(args["status"]))
        handler = args["handler"]
        timestamp = timestamp_to_datetime(args["timestamp"])
        notes = args.get("notes", "")
        block_number = event["blockNumber"]
        tx_hash = event["transactionHash"].hex()

        db = SessionLocal()
        try:
            checkpoint = Checkpoint(
                product_id=product_id,
                location=location,
                status=status,
                handler_address=handler,
                notes=notes or None,
                timestamp=timestamp,
                block_number=block_number,
                tx_hash=tx_hash,
            )
            db.add(checkpoint)
            db.commit()
            logger.info(f"Indexed CheckpointRecorded: {product_id} at {location}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing CheckpointRecorded: {e}")
        finally:
            db.close()

    def _process_custody_transferred(self, event: Dict):
        """Persist a CustodyTransferred event to the database."""
        args = event["args"]
        product_id = bytes32_to_hex(args["productId"])
        from_addr = args["from"]
        to_addr = args["to"]
        timestamp = timestamp_to_datetime(args["timestamp"])
        block_number = event["blockNumber"]
        tx_hash = event["transactionHash"].hex()

        db = SessionLocal()
        try:
            transfer = CustodyTransfer(
                product_id=product_id,
                from_address=from_addr,
                to_address=to_addr,
                timestamp=timestamp,
                block_number=block_number,
                tx_hash=tx_hash,
            )
            db.add(transfer)
            db.commit()
            logger.info(f"Indexed CustodyTransferred: {product_id} from {from_addr} to {to_addr}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing CustodyTransferred: {e}")
        finally:
            db.close()

    def _process_delivery_completed(self, event: Dict):
        """
        Process DeliveryCompleted event by recording a final checkpoint
        with status '3' (Delivered).
        """
        args = event["args"]
        product_id = bytes32_to_hex(args["productId"])
        handler = args["handler"]
        timestamp = timestamp_to_datetime(args["timestamp"])
        block_number = event["blockNumber"]
        tx_hash = event["transactionHash"].hex()

        db = SessionLocal()
        try:
            checkpoint = Checkpoint(
                product_id=product_id,
                location="Delivery",
                status="3",
                handler_address=handler,
                notes="Delivery completed",
                timestamp=timestamp,
                block_number=block_number,
                tx_hash=tx_hash,
            )
            db.add(checkpoint)
            db.commit()
            logger.info(f"Indexed DeliveryCompleted: {product_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Error processing DeliveryCompleted: {e}")
        finally:
            db.close()
