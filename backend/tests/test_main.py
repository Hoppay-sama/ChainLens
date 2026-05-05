from fastapi.testclient import TestClient
from sqlalchemy import inspect
from unittest.mock import MagicMock

from app.main import app, w3 as original_w3
import app.main as main_module

client = TestClient(app)


def test_database_schema_matches_models(db_session):
    """Verify that all expected model tables exist in the database."""
    inspector = inspect(db_session.bind)
    table_names = set(inspector.get_table_names())
    expected = {"products", "checkpoints", "custody_transfers", "shipments"}
    assert expected.issubset(table_names), f"Missing tables: {expected - table_names}"


def test_health_check_degraded():
    response = client.get("/health")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"] == "connected"
    assert data["web3"] == "disconnected"


def test_health_check_ok():
    mock_w3 = MagicMock()
    mock_w3.is_connected.return_value = True
    main_module.w3 = mock_w3
    try:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["database"] == "connected"
        assert data["web3"] == "connected"
    finally:
        main_module.w3 = original_w3
